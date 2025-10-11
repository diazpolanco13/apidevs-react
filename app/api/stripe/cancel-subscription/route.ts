import { stripe } from '@/utils/stripe/config';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

interface SubscriptionUpdate {
  cancel_at_period_end: boolean;
  canceled_at: string;
}

export async function POST(req: Request) {
  try {
    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID requerido' },
        { status: 400 }
      );
    }

    // Verificar autenticación
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar que la suscripción pertenece al usuario
    const { data: subscription, error: subError } = await (supabase as any)
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      );
    }

    // Cancelar en Stripe al final del período de facturación
    const canceledSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: true
      }
    );

    // Actualizar en Supabase
    const updateData: SubscriptionUpdate = {
      cancel_at_period_end: true,
      canceled_at: new Date().toISOString()
    };
    
    await (supabase as any)
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscriptionId);

    return NextResponse.json({
      success: true,
      subscription: canceledSubscription
    });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Error al cancelar suscripción' },
      { status: 500 }
    );
  }
}

