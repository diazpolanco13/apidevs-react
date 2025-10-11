import Stripe from 'stripe';
import { stripe } from '@/utils/stripe/config';
import {
  supabaseAdmin,
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
import { 
  revokeIndicatorAccessOnCancellation,
  getCustomerEmail 
} from '@/utils/tradingview/auto-revoke-access';

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
            event.type === 'customer.subscription.created',
            subscription // 🔧 FIX: Pass full subscription object
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
          
          // 🚫 AUTO-REVOKE: Revocar accesos premium cuando se cancela suscripción
          if (event.type === 'customer.subscription.deleted') {
            try {
              console.log('\n🚫 ========== SUSCRIPCIÓN CANCELADA DETECTADA ==========');
              console.log('🔖 Subscription ID:', subscription.id);
              console.log('👤 Customer ID:', subscription.customer);
              console.log('📅 Cancelled At:', subscription.canceled_at);
              console.log('💰 Status:', subscription.status);
              console.log('======================================================\n');
              
              // Obtener email del customer
              const customerEmail = await getCustomerEmail(subscription.customer as string);
              
              if (customerEmail) {
                console.log('📧 Customer Email:', customerEmail);
                
                const revokeResult = await revokeIndicatorAccessOnCancellation(
                  customerEmail,
                  subscription.id,
                  'subscription_deleted'
                );
                
                console.log('\n✅ AUTO-REVOKE RESULT:');
                console.log('   Success:', revokeResult.success);
                console.log('   Reason:', revokeResult.reason);
                console.log('   Accesses Revoked:', revokeResult.accessesRevoked);
                if (revokeResult.indicatorsAffected) {
                  console.log('   Indicators Affected:', revokeResult.indicatorsAffected);
                }
                console.log('======================================================\n');
              } else {
                console.error('❌ No se pudo obtener email del customer para auto-revoke');
              }
            } catch (revokeError) {
              console.error('⚠️ Error en auto-revoke (subscription deleted):', revokeError);
              // No fallar el webhook por esto
            }
          }
          
          // 🚫 AUTO-REVOKE: También revocar cuando se programa cancelación (cancel_at_period_end)
          if (event.type === 'customer.subscription.updated' && subscription.cancel_at_period_end) {
            try {
              console.log('\n⚠️ ========== CANCELACIÓN PROGRAMADA DETECTADA ==========');
              console.log('🔖 Subscription ID:', subscription.id);
              console.log('👤 Customer ID:', subscription.customer);
              console.log('📅 Cancel At:', subscription.cancel_at);
              console.log('📅 Current Period End:', subscription.items.data[0]?.current_period_end);
              console.log('💰 Status:', subscription.status);
              console.log('========================================================\n');
              
              // Obtener email del customer
              const customerEmail = await getCustomerEmail(subscription.customer as string);
              
              if (customerEmail) {
                console.log('📧 Customer Email:', customerEmail);
                
                // Para cancelaciones programadas, usamos un tipo diferente
                const revokeResult = await revokeIndicatorAccessOnCancellation(
                  customerEmail,
                  subscription.id,
                  'subscription_cancelled' // Diferente de 'subscription_deleted'
                );
                
                console.log('\n✅ AUTO-REVOKE RESULT (programmed):');
                console.log('   Success:', revokeResult.success);
                console.log('   Reason:', revokeResult.reason);
                console.log('   Accesses Revoked:', revokeResult.accessesRevoked);
                if (revokeResult.indicatorsAffected) {
                  console.log('   Indicators Affected:', revokeResult.indicatorsAffected);
                }
                console.log('========================================================\n');
              } else {
                console.error('❌ No se pudo obtener email del customer para auto-revoke programado');
              }
            } catch (revokeError) {
              console.error('⚠️ Error en auto-revoke (subscription updated):', revokeError);
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
            // Manejar compras one-time CON payment_intent (productos pagados)
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
          } else if (checkoutSession.mode === 'payment' && !checkoutSession.payment_intent && checkoutSession.amount_total === 0) {
            // 🆓 CASO ESPECIAL: Compras FREE ($0) - NO tienen payment_intent
            console.log('\n🆓 ========== CHECKOUT FREE ($0) DETECTED ==========');
            console.log('   Checkout Session ID:', checkoutSession.id);
            console.log('   Customer ID:', checkoutSession.customer);
            console.log('   Amount Total:', checkoutSession.amount_total);
            console.log('   Payment Status:', checkoutSession.payment_status);
            
            const customer = await stripe.customers.retrieve(checkoutSession.customer as string);
            
            // ✅ Obtener email del customer
            const customerEmail = customer && !customer.deleted 
              ? customer.email 
              : checkoutSession.customer_details?.email;
            
            if (!customerEmail) {
              console.error('❌ No se pudo obtener customer email para FREE plan');
              break;
            }
            
            console.log('   📧 Customer Email:', customerEmail);
            
            // 📝 Crear registro de "compra" FREE para auditoría
            try {
              const purchaseData = {
                order_number: `FREE-${checkoutSession.id}`,
                customer_email: customerEmail,
                legacy_user_id: null,
                order_date: new Date(checkoutSession.created * 1000).toISOString().slice(0, -1),
                completed_date: new Date().toISOString().slice(0, -1),
                order_status: 'completed',
                payment_status: 'paid', // FREE pero marcado como "paid" para consistencia
                order_total_cents: 0,
                subtotal_cents: 0,
                currency: 'USD',
                product_name: 'APIDevs indicator - FREE Plan',
                product_category: 'free_tier',
                quantity: 1,
                payment_method: 'free',
                payment_gateway: 'stripe',
                transaction_id: checkoutSession.id,
                gateway_transaction_id: checkoutSession.id,
                billing_country: checkoutSession.customer_details?.address?.country || null,
                billing_state: checkoutSession.customer_details?.address?.state || null,
                billing_city: checkoutSession.customer_details?.address?.city || null,
                billing_address: checkoutSession.customer_details?.address?.line1 || null,
                billing_postcode: checkoutSession.customer_details?.address?.postal_code || null,
                is_lifetime_purchase: true, // FREE es lifetime
                notes: 'FREE Plan - No payment required'
              };
              
              const { error: purchaseError } = await (supabaseAdmin as any)
                .from('purchases')
                .upsert(purchaseData, { onConflict: 'order_number' });
              
              if (purchaseError) {
                console.error('⚠️ Error creando registro FREE purchase:', purchaseError);
              } else {
                console.log('✅ Registro FREE purchase creado');
              }
            } catch (error) {
              console.error('⚠️ Error en createPurchaseRecord (FREE):', error);
            }
            
            // 🎯 AUTO-GRANT: Conceder acceso automático a indicadores FREE
            const productIds = extractProductIds(lineItems, checkoutSession.metadata || {});
            const priceId = lineItems[0]?.price?.id;
            
            console.log('   📦 Product IDs:', productIds);
            console.log('   💰 Price ID:', priceId);
            console.log('   📋 Line Items Count:', lineItems.length);
            console.log('=================================================\n');
            
            try {
              const result = await grantIndicatorAccessOnPurchase(
                customerEmail,
                productIds,
                priceId,
                checkoutSession.id,
                'checkout'
              );
              
              console.log('\n✅ AUTO-GRANT RESULT (FREE plan):');
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
              console.log('=================================================\n');
            } catch (error) {
              console.error('⚠️ Error en auto-grant (FREE plan):', error);
              // No fallar el webhook por esto
            }
          }
          break;
        case 'payment_intent.succeeded':
        case 'payment_intent.created':
        case 'payment_intent.processing':
        case 'payment_intent.canceled':
        case 'payment_intent.payment_failed':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(`🎯 [WEBHOOK] ${event.type} - PI: ${paymentIntent.id}, status: ${paymentIntent.status}, amount: ${paymentIntent.amount}`);
          // Sincronizar payment intent con Supabase
          await upsertPaymentIntentRecord(paymentIntent);
          // Crear/actualizar purchase record solo si succeeded
          // ⚠️ NOTA: Stripe envía AMBOS eventos para compras one-time:
          //    1. checkout.session.completed (crea el registro primero)
          //    2. payment_intent.succeeded (actualiza el registro - UPSERT evita duplicados)
          if (event.type === 'payment_intent.succeeded' && paymentIntent.customer) {
            const customer = await stripe.customers.retrieve(paymentIntent.customer as string);
            if (customer && !customer.deleted) {
              await createPurchaseRecord(paymentIntent, customer);  // Usa UPSERT internamente
              
              // ⚠️ NO ejecutar auto-grant aquí - ya se ejecuta en checkout.session.completed
              // Ejecutar auto-grant desde payment_intent causa registros duplicados porque
              // Stripe envía AMBOS eventos (checkout.session.completed + payment_intent.succeeded)
              console.log('ℹ️ Purchase record upserted. Auto-grant already handled by checkout.session.completed event.');
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
            
            // 🎯 AUTO-GRANT: Conceder acceso SOLO para renovaciones automáticas
            // ⚠️ CRÍTICO: NO ejecutar para compras iniciales (billing_reason: 'subscription_create')
            //             ya que checkout.session.completed ya lo maneja
            // ✅ Ejecutar solo para: subscription_cycle, subscription_update, subscription_threshold
            const isRenewalOrUpdate = invoice.billing_reason && [
              'subscription_cycle',       // Renovación automática mensual/anual
              'subscription_update',      // Actualización de suscripción
              'subscription_threshold'    // Billing threshold alcanzado
            ].includes(invoice.billing_reason);
            
            if (isRenewalOrUpdate && invoice.customer) {
              console.log(`\n🔄 ========== RENOVACIÓN DETECTADA ==========`);
              console.log('📧 Invoice ID:', invoice.id);
              console.log('🔖 Billing Reason:', invoice.billing_reason);
              console.log('💰 Amount Paid:', invoice.amount_paid / 100);
              
              const customer = await stripe.customers.retrieve(invoice.customer as string);
              if (customer && !customer.deleted && customer.email) {
                const lineItems = (invoice.lines.data || []) as any[];
                const productIds = extractProductIds(lineItems, invoice.metadata || {});
                const priceId = lineItems[0]?.price?.id;
                
                console.log('📧 Customer Email:', customer.email);
                console.log('📦 Product IDs:', productIds);
                console.log('💰 Price ID:', priceId);
                console.log('============================================\n');
                
                try {
                  const result = await grantIndicatorAccessOnPurchase(
                    customer.email,
                    productIds,
                    priceId,
                    invoice.id,
                    'renewal'  // Cambiar de 'invoice' a 'renewal' para mejor tracking
                  );
                  
                  console.log('\n✅ AUTO-GRANT RESULT (renewal):');
                  console.log('   Success:', result.success);
                  console.log('   Indicators Granted:', result.indicatorsGranted);
                  console.log('============================================\n');
                } catch (error) {
                  console.error('⚠️ Error en auto-grant (renewal):', error);
                  // No fallar el webhook por esto
                }
              }
            } else if (invoice.billing_reason === 'subscription_create') {
              console.log(`ℹ️ Skipping auto-grant for subscription_create (handled by checkout.session.completed)`);
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
