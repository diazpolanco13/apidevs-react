import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/utils/stripe/config';
import { getUser } from '@/utils/supabase/queries';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener suscripción del usuario
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id, stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!subscription || !subscription.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No se encontró suscripción activa' },
        { status: 404 }
      );
    }

    // Verificar que la suscripción está cancelada pero activa
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id
    );

    if (!stripeSubscription.cancel_at_period_end) {
      return NextResponse.json(
        { error: 'La suscripción no está programada para cancelación' },
        { status: 400 }
      );
    }

    // 🔄 REACTIVAR SUSCRIPCIÓN EN STRIPE
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: false,
        // Opcional: extender el período si es necesario
      }
    );

    // 📝 ACTUALIZAR EN BASE DE DATOS
    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    // 📝 REGISTRAR REACTIVACIÓN EN ACTIVIDAD RECIENTE
    await supabase.from('user_activity_events').insert({
      user_id: user.id,
      event_type: 'subscription_reactivated',
      event_data: {
        subscription_id: subscription.stripe_subscription_id,
        stripe_subscription_id: subscription.stripe_subscription_id,
        reactivated_at: new Date().toISOString(),
        reason: 'user_initiated',
        product_name: 'APIDevs indicator - Pro', // Se puede obtener del subscription
      },
    });

    console.log('✅ Suscripción reactivada exitosamente:', subscription.stripe_subscription_id);

    return NextResponse.json({
      success: true,
      message: 'Suscripción reactivada exitosamente',
      subscription: {
        id: updatedSubscription.id,
        cancel_at_period_end: updatedSubscription.cancel_at_period_end,
        current_period_end: updatedSubscription.current_period_end,
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
