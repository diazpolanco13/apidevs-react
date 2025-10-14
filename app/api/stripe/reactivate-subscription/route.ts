import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/utils/stripe/config';
import { getUser } from '@/utils/supabase/queries';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getUser(supabase);

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener suscripción CANCELADA PROGRAMADAMENTE del usuario
    const { data: subscription, error: subscriptionError } = await (supabase as any)
      .from('subscriptions')
      .select('id, cancel_at_period_end')
      .eq('user_id', user.id)
      .eq('cancel_at_period_end', true) // ✅ Buscar suscripciones programadas para cancelar
      .maybeSingle(); // 🔧 FIX: Usar maybeSingle() en lugar de single()

    // 🔧 FIX: Mejorar manejo de errores y casos edge
    if (subscriptionError) {
      console.error('Error buscando suscripción:', subscriptionError);
      return NextResponse.json(
        { error: 'Error al buscar suscripción' },
        { status: 500 }
      );
    }

    if (!subscription || !subscription.id) {
      return NextResponse.json(
        { error: 'No se encontró suscripción cancelada programadamente para reactivar' },
        { status: 404 }
      );
    }

    // Verificar que la suscripción está cancelada pero activa en Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.id
    );

    // Verificación de estado de suscripción en Stripe

    if (!stripeSubscription.cancel_at_period_end) {
      return NextResponse.json(
        { error: 'La suscripción no está programada para cancelación o ya fue reactivada' },
        { status: 400 }
      );
    }

    // 🔄 REACTIVAR SUSCRIPCIÓN EN STRIPE
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.id,
      {
        cancel_at_period_end: false,
        // Opcional: extender el período si es necesario
      }
    );

    // 📝 ACTUALIZAR EN BASE DE DATOS
    const { error: updateError } = await (supabase as any)
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    if (updateError) {
      console.error('❌ Error actualizando suscripción en Supabase:', updateError);
      // No fallar aquí, la reactivación en Stripe ya fue exitosa
    }

    // 📝 REGISTRAR REACTIVACIÓN EN ACTIVIDAD RECIENTE
    const { error: activityError } = await (supabase as any).from('user_activity_events').insert({
      user_id: user.id,
      event_type: 'subscription_reactivated',
      event_data: {
        subscription_id: subscription.id,
        stripe_subscription_id: subscription.id,
        reactivated_at: new Date().toISOString(),
        reason: 'user_initiated',
        product_name: 'APIDevs indicator - Pro',
        current_period_end: (updatedSubscription as any).current_period_end,
      },
    });

    if (activityError) {
      console.error('❌ Error registrando actividad:', activityError);
      // No fallar aquí, la reactivación principal ya fue exitosa
    }

    // Suscripción reactivada exitosamente

    return NextResponse.json({
      success: true,
      message: 'Suscripción reactivada exitosamente',
      subscription: {
        id: updatedSubscription.id,
        cancel_at_period_end: updatedSubscription.cancel_at_period_end,
        current_period_end: (updatedSubscription as any).current_period_end,
      },
    });

  } catch (error: any) {
    console.error('Error reactivando suscripción:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
