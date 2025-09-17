import { toDateTime } from '@/utils/helpers';
import { stripe } from '@/utils/stripe/config';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import type { Database, Tables, TablesInsert } from 'types_db';

type Product = Tables<'products'>;
type Price = Tables<'prices'>;

// Change to control trial period length
const TRIAL_PERIOD_DAYS = 0;

// Note: supabaseAdmin uses the SERVICE_ROLE_KEY which you must only use in a secure server-side context
// as it has admin privileges and overwrites RLS policies!
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const upsertProductRecord = async (product: Stripe.Product) => {
  const productData: Product = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? null,
    image: product.images?.[0] ?? null,
    metadata: product.metadata
  };

  const { error: upsertError } = await supabaseAdmin
    .from('products')
    .upsert([productData]);
  if (upsertError)
    throw new Error(`Product insert/update failed: ${upsertError.message}`);
  console.log(`Product inserted/updated: ${product.id}`);
};

const upsertPriceRecord = async (
  price: Stripe.Price,
  retryCount = 0,
  maxRetries = 3
) => {
  const priceData: Price = {
    id: price.id,
    product_id: typeof price.product === 'string' ? price.product : '',
    active: price.active,
    currency: price.currency,
    description: price.nickname || null,
    type: price.type,
    unit_amount: price.unit_amount ?? null,
    interval: price.recurring?.interval ?? null,
    interval_count: price.recurring?.interval_count ?? null,
    trial_period_days: price.recurring?.trial_period_days ?? TRIAL_PERIOD_DAYS,
    metadata: price.metadata || {}
  };

  const { error: upsertError } = await supabaseAdmin
    .from('prices')
    .upsert([priceData]);

  if (upsertError?.message.includes('foreign key constraint')) {
    if (retryCount < maxRetries) {
      console.log(`Retry attempt ${retryCount + 1} for price ID: ${price.id}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await upsertPriceRecord(price, retryCount + 1, maxRetries);
    } else {
      throw new Error(
        `Price insert/update failed after ${maxRetries} retries: ${upsertError.message}`
      );
    }
  } else if (upsertError) {
    throw new Error(`Price insert/update failed: ${upsertError.message}`);
  } else {
    console.log(`Price inserted/updated: ${price.id}`);
  }
};

const deleteProductRecord = async (product: Stripe.Product) => {
  const { error: deletionError } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', product.id);
  if (deletionError)
    throw new Error(`Product deletion failed: ${deletionError.message}`);
  console.log(`Product deleted: ${product.id}`);
};

const deletePriceRecord = async (price: Stripe.Price) => {
  const { error: deletionError } = await supabaseAdmin
    .from('prices')
    .delete()
    .eq('id', price.id);
  if (deletionError) throw new Error(`Price deletion failed: ${deletionError.message}`);
  console.log(`Price deleted: ${price.id}`);
};

const upsertCustomerToSupabase = async (uuid: string, customerId: string) => {
  const { error: upsertError } = await supabaseAdmin
    .from('customers')
    .upsert([{ id: uuid, stripe_customer_id: customerId }]);

  if (upsertError)
    throw new Error(`Supabase customer record creation failed: ${upsertError.message}`);

  return customerId;
};

const createCustomerInStripe = async (uuid: string, email: string) => {
  const customerData = { metadata: { supabaseUUID: uuid }, email: email };
  const newCustomer = await stripe.customers.create(customerData);
  if (!newCustomer) throw new Error('Stripe customer creation failed.');

  return newCustomer.id;
};

const createOrRetrieveCustomer = async ({
  email,
  uuid
}: {
  email: string;
  uuid: string;
}) => {
  // Check if the customer already exists in Supabase
  const { data: existingSupabaseCustomer, error: queryError } =
    await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', uuid)
      .maybeSingle();

  if (queryError) {
    throw new Error(`Supabase customer lookup failed: ${queryError.message}`);
  }

  // Retrieve the Stripe customer ID using the Supabase customer ID, with email fallback
  let stripeCustomerId: string | undefined;
  if (existingSupabaseCustomer?.stripe_customer_id) {
    const existingStripeCustomer = await stripe.customers.retrieve(
      existingSupabaseCustomer.stripe_customer_id
    );
    stripeCustomerId = existingStripeCustomer.id;
  } else {
    // If Stripe ID is missing from Supabase, try to retrieve Stripe customer ID by email
    const stripeCustomers = await stripe.customers.list({ email: email });
    stripeCustomerId =
      stripeCustomers.data.length > 0 ? stripeCustomers.data[0].id : undefined;
  }

  // If still no stripeCustomerId, create a new customer in Stripe
  const stripeIdToInsert = stripeCustomerId
    ? stripeCustomerId
    : await createCustomerInStripe(uuid, email);
  if (!stripeIdToInsert) throw new Error('Stripe customer creation failed.');

  if (existingSupabaseCustomer && stripeCustomerId) {
    // If Supabase has a record but doesn't match Stripe, update Supabase record
    if (existingSupabaseCustomer.stripe_customer_id !== stripeCustomerId) {
      const { error: updateError } = await supabaseAdmin
        .from('customers')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', uuid);

      if (updateError)
        throw new Error(
          `Supabase customer record update failed: ${updateError.message}`
        );
      console.warn(
        `Supabase customer record mismatched Stripe ID. Supabase record updated.`
      );
    }
    // If Supabase has a record and matches Stripe, return Stripe customer ID
    return stripeCustomerId;
  } else {
    console.warn(
      `Supabase customer record was missing. A new record was created.`
    );

    // If Supabase has no record, create a new record and return Stripe customer ID
    const upsertedStripeCustomer = await upsertCustomerToSupabase(
      uuid,
      stripeIdToInsert
    );
    if (!upsertedStripeCustomer)
      throw new Error('Supabase customer record creation failed.');

    return upsertedStripeCustomer;
  }
};

/**
 * Copies the billing details from the payment method to the customer object.
 */
const copyBillingDetailsToCustomer = async (
  uuid: string,
  payment_method: Stripe.PaymentMethod
) => {
  //Todo: check this assertion
  const customer = payment_method.customer as string;
  const { name, phone, address } = payment_method.billing_details;
  if (!name || !phone || !address) return;
  //@ts-ignore
  await stripe.customers.update(customer, { name, phone, address });
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({
      billing_address: { ...address },
      payment_method: { ...payment_method[payment_method.type] }
    })
    .eq('id', uuid);
  if (updateError) throw new Error(`Customer update failed: ${updateError.message}`);
};

const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction = false
) => {
  // Get customer's UUID from mapping table.
  const { data: customerData, error: noCustomerError } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (noCustomerError)
    throw new Error(`Customer lookup failed: ${noCustomerError.message}`);

  const { id: uuid } = customerData!;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method']
  });
  // Upsert the latest status of the subscription object.
  const subscriptionData: TablesInsert<'subscriptions'> = {
    id: subscription.id,
    user_id: uuid,
    metadata: subscription.metadata,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    //TODO check quantity on subscription
    // @ts-ignore
    quantity: subscription.quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at
      ? toDateTime(subscription.cancel_at).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? toDateTime(subscription.canceled_at).toISOString()
      : null,
    current_period_start: toDateTime(
      subscription.current_period_start
    ).toISOString(),
    current_period_end: toDateTime(
      subscription.current_period_end
    ).toISOString(),
    created: toDateTime(subscription.created).toISOString(),
    ended_at: subscription.ended_at
      ? toDateTime(subscription.ended_at).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? toDateTime(subscription.trial_start).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? toDateTime(subscription.trial_end).toISOString()
      : null
  };

  const { error: upsertError } = await supabaseAdmin
    .from('subscriptions')
    .upsert([subscriptionData]);
  if (upsertError)
    throw new Error(`Subscription insert/update failed: ${upsertError.message}`);
  console.log(
    `Inserted/updated subscription [${subscription.id}] for user [${uuid}]`
  );

  // For a new subscription copy the billing details to the customer object.
  // NOTE: This is a costly operation and should happen at the very end.
  if (createAction && subscription.default_payment_method && uuid)
    //@ts-ignore
    await copyBillingDetailsToCustomer(
      uuid,
      subscription.default_payment_method as Stripe.PaymentMethod
    );
};

// Función para crear registro de compra usando la estructura real de la DB
const createPurchaseRecord = async (
  paymentIntent: Stripe.PaymentIntent,
  customer: Stripe.Customer
) => {
  try {
    // Obtener información del producto desde line items o metadata
    let productName = 'Compra directa Stripe';
    let orderNumber = `PI-${paymentIntent.id.slice(-8)}`;
    let isLifetimePurchase = false;

    // Detectar si es compra Lifetime por el monto ($999.00 = 99900 centavos)
    if (paymentIntent.amount === 99900) {
      productName = 'APIDevs Trading Indicators - Lifetime';
      isLifetimePurchase = true;
    }

    // Si hay metadata del checkout, usar esa información
    if (paymentIntent.metadata?.product_name) {
      productName = paymentIntent.metadata.product_name;
    }
    
    if (paymentIntent.metadata?.order_number) {
      orderNumber = paymentIntent.metadata.order_number;
    }

    if (paymentIntent.metadata?.is_lifetime === 'true') {
      isLifetimePurchase = true;
    }

    // Buscar si existe usuario legacy para vincular
    let legacyUserId = null;
    if (customer.email) {
      try {
        const { data: legacyUser } = await (supabaseAdmin as any)
          .from('legacy_users')
          .select('id')
          .eq('email', customer.email)
          .single();
        
        if (legacyUser) {
          legacyUserId = legacyUser.id;
        }
      } catch (error) {
        console.log('Info: No legacy user found:', error);
        // Continuar sin vincular legacy user
      }
    }

    // Crear registro usando la estructura real de la tabla purchases
    const purchaseData = {
      order_number: orderNumber,
      customer_email: customer.email || 'unknown@stripe.com',
      legacy_user_id: legacyUserId,
      order_date: new Date(paymentIntent.created * 1000).toISOString().slice(0, -1), // Sin 'Z' para timestamp
      completed_date: new Date().toISOString().slice(0, -1),
      order_status: 'completed',
      payment_status: 'paid',
      order_total_cents: paymentIntent.amount,
      subtotal_cents: paymentIntent.amount,
      currency: paymentIntent.currency.toUpperCase(),
      product_name: productName,
      product_category: paymentIntent.metadata?.category || 'subscription',
      quantity: 1,
      payment_method: 'stripe',
      payment_gateway: 'stripe',
      transaction_id: paymentIntent.id,
      gateway_transaction_id: paymentIntent.id,
      billing_country: null, // Se obtendrá del checkout session si está disponible
      billing_state: null,
      billing_city: null,
      billing_address: null,
      billing_postcode: null,
      billing_phone: null,
      is_lifetime_purchase: isLifetimePurchase,
      revenue_impact: 'positive',
      customer_segment: 'regular',
      follow_up_opportunity: 'none',
      revenue_valid_for_metrics: true,
      notes: `Compra automática desde Stripe - ${new Date().toISOString()}`
    };

    const { error } = await (supabaseAdmin as any)
      .from('purchases')
      .insert([purchaseData]);

    if (error) {
      console.error('Error creating purchase record:', error);
      throw new Error(`Purchase record creation failed: ${error.message}`);
    }

    console.log(`✅ Purchase record created: ${orderNumber} for ${customer.email}`);
    
    // Intentar actualizar estado de reactivación si es usuario legacy
    if (legacyUserId) {
      await updateLegacyUserReactivation(customer.email!, paymentIntent.id);
    }
    
  } catch (error) {
    console.error('Error in createPurchaseRecord:', error);
    throw error;
  }
};

// Función para actualizar reactivación de usuario legacy
const updateLegacyUserReactivation = async (email: string, stripePaymentId: string) => {
  try {
    const { data: legacyUser, error } = await (supabaseAdmin as any)
      .from('legacy_users')
      .select('id, reactivation_status')
      .eq('email', email)
      .single();

    if (legacyUser && legacyUser.reactivation_status === 'pending') {
      // Marcar como reactivado si era un usuario legacy pendiente
      await (supabaseAdmin as any)
        .from('legacy_users')
        .update({
          reactivation_status: 'reactivated',
          reactivated_at: new Date().toISOString().slice(0, -1), // Sin 'Z' para timestamp
          first_new_subscription_id: stripePaymentId,
          reactivation_campaign: 'direct_purchase'
        })
        .eq('id', legacyUser.id);

      console.log(`🎉 Legacy user reactivated: ${email}`);
    }
  } catch (error) {
    console.log('Info: No legacy user found or error linking:', error);
    // No fallar el webhook por esto
  }
};

// Función para manejar facturas pagadas (suscripciones)
const handleInvoicePayment = async (invoice: Stripe.Invoice) => {
  try {
    if (!invoice.customer || !invoice.subscription) return;

    const customer = await stripe.customers.retrieve(invoice.customer as string);
    if (!customer || customer.deleted) return;

    // Crear registro de compra para la factura de suscripción
    const orderNumber = `INV-${invoice.number || invoice.id.slice(-8)}`;
    
    const purchaseData = {
      order_number: orderNumber,
      customer_email: customer.email || 'unknown@stripe.com',
      order_total_cents: invoice.amount_paid,
      order_date: new Date(invoice.created * 1000).toISOString(),
      order_status: 'completed',
      product_name: invoice.lines.data[0]?.description || 'Suscripción',
      payment_method: 'stripe',
      revenue_valid_for_metrics: true,
      transaction_id: invoice.payment_intent as string || invoice.id,
      billing_country: invoice.customer_address?.country || null,
      product_category: 'subscription'
    };

    const { error } = await (supabaseAdmin as any)
      .from('purchases')
      .upsert([purchaseData], { onConflict: 'order_number' });

    if (error) {
      console.error('Error creating invoice purchase record:', error);
    } else {
      console.log(`✅ Invoice purchase record created: ${orderNumber}`);
    }

  } catch (error) {
    console.error('Error in handleInvoicePayment:', error);
  }
};

export {
  upsertProductRecord,
  upsertPriceRecord,
  deleteProductRecord,
  deletePriceRecord,
  createOrRetrieveCustomer,
  manageSubscriptionStatusChange,
  createPurchaseRecord,
  handleInvoicePayment
};
