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
    const { subscriptionId, reason, cancelType = 'immediate' } = body;

    if (!subscriptionId) {
      return NextResponse.json({ error: 'subscriptionId is required' }, { status: 400 });
    }

    console.log(`🚫 Cancelando suscripción: ${subscriptionId}`);
    console.log(`   Tipo: ${cancelType === 'immediate' ? 'INMEDIATA' : 'AL FINAL DEL PERÍODO'}`);
    console.log(`   Razón: ${reason || 'No especificada'}`);

    let canceledSubscription;

    // Cancelar según el tipo
    if (cancelType === 'end_of_period') {
      // Cancelar al final del período (el usuario mantiene acceso)
      canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
      console.log(`✅ Suscripción se cancelará el: ${new Date((canceledSubscription as any).current_period_end * 1000).toLocaleDateString('es-ES')}`);
    } else {
      // Cancelación inmediata (pierde acceso ahora)
      canceledSubscription = await stripe.subscriptions.cancel(subscriptionId, {
        invoice_now: false,
        prorate: false
      });
      console.log(`⚠️ Acceso revocado inmediatamente`);
    }

    // Actualizar en Supabase
    const updateData: any = {
      cancel_at_period_end: (canceledSubscription as any).cancel_at_period_end,
      cancel_reason: reason || 'Canceled by admin'
    };

    // Solo actualizar status si es cancelación inmediata
    if (cancelType === 'immediate') {
      updateData.status = 'canceled';
      updateData.canceled_at = new Date().toISOString();
    }

    const { error: dbError } = await (supabase as any)
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscriptionId);

    if (dbError) {
      console.error('⚠️ Error actualizando DB:', dbError.message);
      // No fallar si la DB no se actualiza, Stripe es la fuente de verdad
    }

    console.log(`✅ Suscripción procesada: ${subscriptionId}`);

    const message = cancelType === 'end_of_period'
      ? `Suscripción se cancelará el ${new Date((canceledSubscription as any).current_period_end * 1000).toLocaleDateString('es-ES')}. El usuario mantiene acceso hasta esa fecha.`
      : 'Suscripción cancelada inmediatamente. El usuario perdió acceso ahora.';

    return NextResponse.json({
      success: true,
      subscription: {
        id: canceledSubscription.id,
        status: canceledSubscription.status,
        cancel_at_period_end: (canceledSubscription as any).cancel_at_period_end,
        current_period_end: (canceledSubscription as any).current_period_end,
        canceled_at: (canceledSubscription as any).canceled_at
      },
      message,
      cancelType
    });

  } catch (error: any) {
    console.error('❌ Error cancelando suscripción:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

