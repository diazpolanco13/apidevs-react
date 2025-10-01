/**
 * Script de sincronización manual de datos de Stripe a Supabase
 * 
 * Uso: npx tsx scripts/sync-stripe-customer.ts <customer_id>
 * Ejemplo: npx tsx scripts/sync-stripe-customer.ts cus_T2KEXKxIxXlBFXh
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Cargar variables de entorno desde .env
config({ path: resolve(process.cwd(), '.env') });

// Validar variables de entorno
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ Error: STRIPE_SECRET_KEY no está definida');
  console.error('Verifica que el archivo .env existe y contiene la variable STRIPE_SECRET_KEY');
  process.exit(1);
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL no está definida');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no está definida');
  process.exit(1);
}

// Validar argumentos
const customerId = process.argv[2];

if (!customerId) {
  console.error('❌ Error: Debes proporcionar un Customer ID');
  console.log('Uso: npx tsx scripts/sync-stripe-customer.ts <customer_id>');
  process.exit(1);
}

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover' as any
});

// Inicializar Supabase Admin
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function syncStripeCustomer(customerId: string) {
  try {
    console.log(`\n🔄 Iniciando sincronización para customer: ${customerId}\n`);

    // Verificar que el customer existe
    const customer = await stripe.customers.retrieve(customerId);
    
    if (customer.deleted) {
      console.error('❌ Este customer ha sido eliminado en Stripe');
      return;
    }

    console.log(`✅ Customer encontrado: ${customer.email || customer.id}`);

    // Obtener el user_id desde Supabase
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (customerError || !customerData) {
      console.error('❌ Customer no encontrado en Supabase:', customerError?.message);
      return;
    }

    const userId = customerData.id;
    console.log(`✅ User ID en Supabase: ${userId}`);

    // 1. Sincronizar Payment Intents (con refunds)
    console.log('\n📦 Sincronizando Payment Intents (incluyendo refunds)...');
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 100
    });

    let syncedPI = 0;
    for (const pi of paymentIntents.data) {
      // 🚀 FORMA CORRECTA: Usar stripe.refunds.list() con payment_intent filter
      const refundsList = await stripe.refunds.list({
        payment_intent: pi.id,
        limit: 100
      });
      
      const allRefunds = refundsList.data;
      const amountRefunded = allRefunds.reduce((sum, refund) => sum + refund.amount, 0);
      const isFullyRefunded = amountRefunded >= pi.amount;
      
      console.log(`  🔍 PI: ${pi.id} - Refunds: ${allRefunds.length} - Amount Refunded: $${(amountRefunded/100).toFixed(2)}`);

      const { error } = await supabase
        .from('payment_intents')
        .upsert({
          id: pi.id,
          user_id: userId,
          customer_id: customerId,
          amount: pi.amount,
          amount_received: pi.amount_received || 0,
          amount_refunded: amountRefunded,
          refunded: isFullyRefunded,
          refunds: allRefunds.map((refund) => ({
            id: refund.id,
            amount: refund.amount,
            currency: refund.currency,
            reason: refund.reason,
            status: refund.status,
            created: refund.created
          })),
          last_refund_at: allRefunds.length > 0 
            ? new Date(Math.max(...allRefunds.map((r) => r.created)) * 1000).toISOString()
            : null,
          currency: pi.currency,
          status: pi.status,
          payment_method: typeof pi.payment_method === 'string' ? pi.payment_method : null,
          payment_method_types: pi.payment_method_types || [],
          description: pi.description || null,
          receipt_email: pi.receipt_email || null,
          metadata: pi.metadata || {},
          created: new Date(pi.created * 1000).toISOString(),
          updated: new Date().toISOString()
        }, { onConflict: 'id' });

      if (!error) {
        syncedPI++;
        const refundText = amountRefunded > 0 ? ` [💸 ${allRefunds.length} refund(s): $${(amountRefunded / 100).toFixed(2)}]` : '';
        console.log(`  ✓ ${pi.id} - ${pi.status} - $${(pi.amount / 100).toFixed(2)}${refundText}`);
      } else {
        console.error(`  ✗ Error en ${pi.id}:`, error.message);
      }
    }

    // 2. Sincronizar Invoices
    console.log('\n📄 Sincronizando Invoices...');
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 100
    });

    let syncedInv = 0;
    for (const inv of invoices.data) {
      const { error } = await supabase
        .from('invoices')
        .upsert({
          id: inv.id,
          user_id: userId,
          customer_id: customerId,
          subscription_id: typeof (inv as any).subscription === 'string' ? (inv as any).subscription : null,
          status: inv.status || 'draft',
          amount_due: inv.amount_due,
          amount_paid: inv.amount_paid,
          amount_remaining: inv.amount_remaining,
          currency: inv.currency,
          number: inv.number || null,
          invoice_pdf: inv.invoice_pdf || null,
          hosted_invoice_url: inv.hosted_invoice_url || null,
          due_date: inv.due_date ? new Date(inv.due_date * 1000).toISOString() : null,
          paid_at: inv.status_transitions?.paid_at 
            ? new Date(inv.status_transitions.paid_at * 1000).toISOString() 
            : null,
          collection_method: inv.collection_method || null,
          billing_reason: inv.billing_reason || null,
          metadata: inv.metadata || {},
          created: new Date(inv.created * 1000).toISOString(),
          updated: new Date().toISOString()
        }, { onConflict: 'id' });

      if (!error) {
        syncedInv++;
        console.log(`  ✓ ${inv.number || inv.id} - ${inv.status} - $${(inv.amount_paid / 100).toFixed(2)}`);
      } else {
        console.error(`  ✗ Error en ${inv.id}:`, error.message);
      }
    }

    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('✅ SINCRONIZACIÓN COMPLETADA');
    console.log('='.repeat(60));
    console.log(`Payment Intents: ${syncedPI}/${paymentIntents.data.length} sincronizados`);
    console.log(`Invoices:        ${syncedInv}/${invoices.data.length} sincronizados`);
    console.log('='.repeat(60) + '\n');

  } catch (error: any) {
    console.error('\n❌ Error durante la sincronización:', error.message);
    process.exit(1);
  }
}

// Ejecutar sincronización
syncStripeCustomer(customerId);

