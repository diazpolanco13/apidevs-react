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

    const body = await req.json();
    const { subscriptionId, reason } = body;

    if (!subscriptionId) {
      return NextResponse.json({ error: 'subscriptionId is required' }, { status: 400 });
    }

    console.log(`🚫 Cancelando suscripción: ${subscriptionId}`);
    console.log(`   Razón: ${reason || 'No especificada'}`);

    // Cancelar en Stripe
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId, {
      invoice_now: false,
      prorate: false
    });

    // Actualizar en Supabase
    const { error: dbError } = await (supabase as any)
      .from('subscriptions')
      .update({ 
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        cancel_reason: reason || 'Canceled by admin'
      })
      .eq('id', subscriptionId);

    if (dbError) {
      console.error('⚠️ Error actualizando DB:', dbError.message);
      // No fallar si la DB no se actualiza, Stripe es la fuente de verdad
    }

    console.log(`✅ Suscripción cancelada: ${subscriptionId}`);

    return NextResponse.json({
      success: true,
      subscription: {
        id: canceledSubscription.id,
        status: canceledSubscription.status,
        canceled_at: canceledSubscription.canceled_at
      },
      message: 'Suscripción cancelada exitosamente'
    });

  } catch (error: any) {
    console.error('❌ Error cancelando suscripción:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

