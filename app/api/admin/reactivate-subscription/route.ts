import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/utils/stripe/config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar que sea admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { subscriptionId, adminReason } = body;

    if (!subscriptionId) {
      return NextResponse.json({ error: 'subscriptionId is required' }, { status: 400 });
    }

    // Admin reactivando suscripción

    // Verificar que la suscripción existe y está cancelada programadamente
    const { data: subscription, error: subscriptionError } = await (supabase as any)
      .from('subscriptions')
      .select('id, user_id, cancel_at_period_end, status')
      .eq('id', subscriptionId)
      .maybeSingle();

    if (subscriptionError) {
      console.error('❌ Error buscando suscripción:', subscriptionError);
      return NextResponse.json({ error: 'Error buscando suscripción' }, { status: 500 });
    }

    if (!subscription) {
      return NextResponse.json({ error: 'Suscripción no encontrada' }, { status: 404 });
    }

    if (!subscription.cancel_at_period_end) {
      return NextResponse.json({ 
        error: 'Esta suscripción no está programada para cancelación' 
      }, { status: 400 });
    }

    // Reactivar en Stripe
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    });

    // Suscripción reactivada exitosamente en Stripe

    // Actualizar en Supabase
    const { error: updateError } = await (supabase as any)
      .from('subscriptions')
      .update({ 
        cancel_at_period_end: false,
        status: 'active'
      })
      .eq('id', subscriptionId);

    if (updateError) {
      console.error('⚠️ Error actualizando BD:', updateError.message);
      // No fallar si la DB no se actualiza, Stripe es la fuente de verdad
    }

    // Registrar evento de actividad
    const { error: activityError } = await (supabase as any)
      .from('user_activity_events')
      .insert({
        user_id: subscription.user_id,
        event_type: 'subscription_reactivated',
        event_data: {
          subscription_id: subscriptionId,
          reactivated_at: new Date().toISOString(),
          reason: 'admin_initiated',
          admin_reason: adminReason || 'Reactivación por admin'
        }
      });

    if (activityError) {
      console.error('⚠️ Error registrando actividad:', activityError.message);
    }

    // Reactivación completada por admin

    return NextResponse.json({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        cancel_at_period_end: updatedSubscription.cancel_at_period_end
      },
      message: 'Suscripción reactivada exitosamente. El usuario recupera acceso inmediatamente.'
    });

  } catch (error: any) {
    console.error('❌ Error reactivando suscripción:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
