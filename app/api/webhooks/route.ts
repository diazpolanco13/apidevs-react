import Stripe from 'stripe';
import { stripe } from '@/utils/stripe/config';
import {
  upsertProductRecord,
  upsertPriceRecord,
  manageSubscriptionStatusChange,
  deleteProductRecord,
  deletePriceRecord,
  createPurchaseRecord,
  handleInvoicePayment,
  upsertPaymentIntentRecord,
  upsertInvoiceRecord
} from '@/utils/supabase/admin';
import { updateReactivationStatus } from '@/data/migration/update_reactivation';
import { 
  grantIndicatorAccessOnPurchase, 
  extractProductIds 
} from '@/utils/tradingview/auto-grant-access';

const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'product.deleted',
  'price.created',
  'price.updated',
  'price.deleted',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'payment_intent.succeeded',
  'payment_intent.created',
  'payment_intent.processing',
  'payment_intent.canceled',
  'payment_intent.payment_failed',
  'invoice.payment_succeeded',
  'invoice.created',
  'invoice.updated',
  'invoice.finalized',
  'invoice.paid',
  'invoice.payment_failed',
  'charge.refunded',
  'charge.refund.updated'
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret)
      return new Response('Webhook secret not found.', { status: 400 });
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log(`🔔  Webhook received: ${event.type}`);
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'product.created':
        case 'product.updated':
          await upsertProductRecord(event.data.object as Stripe.Product);
          break;
        case 'price.created':
        case 'price.updated':
          await upsertPriceRecord(event.data.object as Stripe.Price);
          break;
        case 'price.deleted':
          await deletePriceRecord(event.data.object as Stripe.Price);
          break;
        case 'product.deleted':
          await deleteProductRecord(event.data.object as Stripe.Product);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === 'customer.subscription.created'
          );
          
          // 🏆 TRACKING DE REACTIVACIÓN LEGACY
          if (event.type === 'customer.subscription.created') {
            try {
              // Obtener email del customer de Stripe
              const customer = await stripe.customers.retrieve(subscription.customer as string);
              if (customer && !customer.deleted && customer.email) {
                await updateReactivationStatus(
                  customer.email, 
                  subscription.id,
                  'organic' // Default campaign, se puede personalizar
                );
              }
            } catch (reactivationError) {
              console.log('⚠️ Error en tracking de reactivación:', reactivationError);
              // No fallar el webhook por esto
            }
          }
          break;
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          
          // 🔍 CRÍTICO: Obtener line_items expandidos (no vienen por defecto en webhooks)
          const sessionLineItems = await stripe.checkout.sessions.listLineItems(
            checkoutSession.id,
            { expand: ['data.price.product'] }
          );
          const lineItems = sessionLineItems.data || [];
          
          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription;
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true
            );
            
            // 🎯 AUTO-GRANT: Conceder acceso automático a indicadores
            const customer = await stripe.customers.retrieve(checkoutSession.customer as string);
            
            // ✅ CRÍTICO: Obtener email del customer o de customer_details como fallback
            const customerEmail = customer && !customer.deleted 
              ? customer.email 
              : checkoutSession.customer_details?.email;
            
            if (customerEmail) {
              const productIds = extractProductIds(lineItems, checkoutSession.metadata || {});
              const priceId = lineItems[0]?.price?.id;
              
              console.log('\n🎯 ========== AUTO-GRANT DEBUG (subscription) ==========');
              console.log('📧 Customer Email:', customerEmail);
              console.log('📦 Product IDs:', productIds);
              console.log('💰 Price ID:', priceId);
              console.log('🔖 Subscription ID:', subscriptionId);
              console.log('📋 Line Items Count:', lineItems.length);
              console.log('======================================================\n');
              
              try {
                const result = await grantIndicatorAccessOnPurchase(
                  customerEmail,
                  productIds,
                  priceId,
                  subscriptionId as string,
                  'checkout'
                );
                
                console.log('\n✅ AUTO-GRANT RESULT (subscription):');
                console.log('   Success:', result.success);
                console.log('   User ID:', result.userId);
                console.log('   TradingView Username:', result.tradingviewUsername);
                console.log('   Indicators Granted:', result.indicatorsGranted);
                if (result.errors) {
                  console.log('   Errors:', result.errors);
                }
                if (result.reason) {
                  console.log('   Reason:', result.reason);
                }
                console.log('======================================================\n');
              } catch (error) {
                console.error('⚠️ Error en auto-grant (checkout subscription):', error);
                // No fallar el webhook por esto
              }
            } else {
              console.error('❌ No se pudo obtener customer email para auto-grant');
              console.log('   Customer deleted?:', customer?.deleted);
              console.log('   Customer details:', checkoutSession.customer_details);
            }
          } else if (checkoutSession.mode === 'payment' && checkoutSession.payment_intent) {
            // Manejar compras one-time
            const paymentIntent = await stripe.paymentIntents.retrieve(checkoutSession.payment_intent as string);
            const customer = await stripe.customers.retrieve(checkoutSession.customer as string);
            
            if (customer && !customer.deleted) {
              await createPurchaseRecord(paymentIntent, customer);
            }
            
            // ✅ CRÍTICO: Obtener email del customer o de customer_details como fallback
            const customerEmail = customer && !customer.deleted 
              ? customer.email 
              : checkoutSession.customer_details?.email;
            
            // 🎯 AUTO-GRANT: Conceder acceso automático a indicadores
            if (customerEmail) {
              const productIds = extractProductIds(lineItems, paymentIntent.metadata || {});
              const priceId = lineItems[0]?.price?.id;
              
              console.log('\n🎯 ========== AUTO-GRANT DEBUG (one-time payment) ==========');
              console.log('📧 Customer Email:', customerEmail);
              console.log('📦 Product IDs:', productIds);
              console.log('💰 Price ID:', priceId);
              console.log('🔖 Price Type:', lineItems[0]?.price?.type);
              console.log('💵 Unit Amount:', lineItems[0]?.price?.unit_amount);
              console.log('💳 Payment Intent:', paymentIntent.id);
              console.log('📋 Line Items Count:', lineItems.length);
              console.log('===========================================================\n');
              
              try {
                const result = await grantIndicatorAccessOnPurchase(
                  customerEmail,
                  productIds,
                  priceId,
                  paymentIntent.id,
                  'checkout'
                );
                
                console.log('\n✅ AUTO-GRANT RESULT (one-time payment):');
                console.log('   Success:', result.success);
                console.log('   User ID:', result.userId);
                console.log('   TradingView Username:', result.tradingviewUsername);
                console.log('   Indicators Granted:', result.indicatorsGranted);
                if (result.errors) {
                  console.log('   Errors:', result.errors);
                }
                if (result.reason) {
                  console.log('   Reason:', result.reason);
                }
                console.log('===========================================================\n');
              } catch (error) {
                console.error('⚠️ Error en auto-grant (checkout one-time):', error);
                // No fallar el webhook por esto
              }
            } else {
              console.error('❌ No se pudo obtener customer email para auto-grant');
              console.log('   Customer deleted?:', customer?.deleted);
              console.log('   Customer details:', checkoutSession.customer_details);
            }
          }
          break;
        case 'payment_intent.succeeded':
        case 'payment_intent.created':
        case 'payment_intent.processing':
        case 'payment_intent.canceled':
        case 'payment_intent.payment_failed':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          // Sincronizar payment intent con Supabase
          await upsertPaymentIntentRecord(paymentIntent);
          // Crear purchase record solo si succeeded
          if (event.type === 'payment_intent.succeeded' && paymentIntent.customer) {
            const customer = await stripe.customers.retrieve(paymentIntent.customer as string);
            if (customer && !customer.deleted) {
              await createPurchaseRecord(paymentIntent, customer);
              
              // ⚠️ NO ejecutar auto-grant aquí - ya se ejecuta en checkout.session.completed
              // Ejecutar auto-grant desde payment_intent causa registros duplicados porque
              // Stripe envía AMBOS eventos (checkout.session.completed + payment_intent.succeeded)
              console.log('ℹ️ Purchase record created. Auto-grant will be handled by checkout.session.completed event.');
            }
          }
          break;
        case 'invoice.payment_succeeded':
        case 'invoice.created':
        case 'invoice.updated':
        case 'invoice.finalized':
        case 'invoice.paid':
        case 'invoice.payment_failed':
          const invoice = event.data.object as Stripe.Invoice;
          // Sincronizar invoice con Supabase
          await upsertInvoiceRecord(invoice);
          // Crear purchase record solo si payment_succeeded
          if (event.type === 'invoice.payment_succeeded') {
            await handleInvoicePayment(invoice);
            
            // 🎯 AUTO-GRANT: Conceder acceso automático a indicadores (suscripciones)
            if (invoice.customer) {
              const customer = await stripe.customers.retrieve(invoice.customer as string);
              if (customer && !customer.deleted && customer.email) {
                const lineItems = (invoice.lines.data || []) as any[];
                const productIds = extractProductIds(lineItems, invoice.metadata || {});
                const priceId = lineItems[0]?.price?.id;
                
                try {
                  await grantIndicatorAccessOnPurchase(
                    customer.email,
                    productIds,
                    priceId,
                    invoice.id,
                    'invoice'
                  );
                } catch (error) {
                  console.error('⚠️ Error en auto-grant (invoice):', error);
                  // No fallar el webhook por esto
                }
              }
            }
          }
          break;
        case 'charge.refunded':
        case 'charge.refund.updated':
          const charge = event.data.object as Stripe.Charge;
          console.log(`💸 Refund detected for charge: ${charge.id}`);
          
          // Obtener el payment intent asociado
          if (charge.payment_intent) {
            const piId = typeof charge.payment_intent === 'string' 
              ? charge.payment_intent 
              : charge.payment_intent.id;
            
            // 🚀 Recuperar el payment intent (sin expand, los refunds se obtienen dentro de upsertPaymentIntentRecord)
            const updatedPaymentIntent = await stripe.paymentIntents.retrieve(piId);
            
            // Actualizar el payment intent en Supabase (ahora usa stripe.refunds.list() internamente)
            await upsertPaymentIntentRecord(updatedPaymentIntent);
            
            console.log(`✅ Payment Intent ${piId} updated with refund info`);
          }
          break;
        default:
          throw new Error('Unhandled relevant event!');
      }
    } catch (error) {
      console.log(error);
      return new Response(
        'Webhook handler failed. View your Next.js function logs.',
        {
          status: 400
        }
      );
    }
  } else {
    // Ignorar eventos no relevantes sin fallar
    console.log(`ℹ️ Ignored event type: ${event.type}`);
  }
  return new Response(JSON.stringify({ received: true }));
}
