import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/utils/stripe/config';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    
    // Verificar que sea admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obtener el customerId del body
    const body = await req.json();
    const { customerId } = body;

    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 });
    }

    console.log(`🔄 Sincronizando datos de Stripe para customer: ${customerId}`);

    // Obtener todos los payment intents del customer
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 100
    });

    console.log(`📦 ${paymentIntents.data.length} payment intents encontrados`);

    // Obtener todas las invoices del customer
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 100
    });

    console.log(`📄 ${invoices.data.length} invoices encontradas`);

    // Obtener el user_id desde la tabla customers
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (customerError || !customerData) {
      return NextResponse.json({ 
        error: 'Customer not found in Supabase',
        details: customerError?.message 
      }, { status: 404 });
    }

    const userId = (customerData as { id: string }).id;

    // Sincronizar payment intents
    let syncedPaymentIntents = 0;
    for (const pi of paymentIntents.data) {
      const { error } = await (supabase as any)
        .from('payment_intents')
        .upsert({
          id: pi.id,
          user_id: userId,
          customer_id: customerId,
          amount: pi.amount,
          amount_received: pi.amount_received || 0,
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
        syncedPaymentIntents++;
      } else {
        console.error(`❌ Error syncing payment intent ${pi.id}:`, error);
      }
    }

    // Sincronizar invoices
    let syncedInvoices = 0;
    for (const inv of invoices.data) {
      const { error } = await (supabase as any)
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
        syncedInvoices++;
      } else {
        console.error(`❌ Error syncing invoice ${inv.id}:`, error);
      }
    }

    console.log(`✅ Sincronización completada:`);
    console.log(`   - ${syncedPaymentIntents}/${paymentIntents.data.length} payment intents`);
    console.log(`   - ${syncedInvoices}/${invoices.data.length} invoices`);

    return NextResponse.json({
      success: true,
      customerId,
      synced: {
        paymentIntents: syncedPaymentIntents,
        invoices: syncedInvoices
      },
      total: {
        paymentIntents: paymentIntents.data.length,
        invoices: invoices.data.length
      }
    });

  } catch (error: any) {
    console.error('❌ Error en sincronización:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

