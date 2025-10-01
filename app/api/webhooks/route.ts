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
          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription;
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true
            );
          } else if (checkoutSession.mode === 'payment' && checkoutSession.payment_intent) {
            // Manejar compras one-time
            const paymentIntent = await stripe.paymentIntents.retrieve(checkoutSession.payment_intent as string);
            const customer = await stripe.customers.retrieve(checkoutSession.customer as string);
            
            if (customer && !customer.deleted) {
              await createPurchaseRecord(paymentIntent, customer);
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
            
            // Recuperar el payment intent actualizado de Stripe
            // IMPORTANTE: expandir charges para incluir refunds
            const updatedPaymentIntent = await stripe.paymentIntents.retrieve(piId, {
              expand: ['charges.data.refunds']
            });
            
            // Actualizar el payment intent en Supabase con el estado de refund
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
