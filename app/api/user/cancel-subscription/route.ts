import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/utils/stripe/config';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return NextResponse.json({ error: 'subscriptionId is required' }, { status: 400 });
    }

    // Verificar que la suscripción pertenezca al usuario
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('user_id, status')
      .eq('id', subscriptionId)
      .single();

    if (subError || !subscription) {
      return NextResponse.json({ 
        error: 'Subscription not found' 
      }, { status: 404 });
    }

    if ((subscription as any).user_id !== user.id) {
      return NextResponse.json({ 
        error: 'Unauthorized: This subscription does not belong to you' 
      }, { status: 403 });
    }

    if (!['active', 'trialing'].includes((subscription as any).status)) {
      return NextResponse.json({ 
        error: 'Only active or trialing subscriptions can be canceled' 
      }, { status: 400 });
    }

    console.log(`🔄 Usuario ${user.email} cancelando su suscripción: ${subscriptionId}`);

    // Cancelar al final del período (mantiene acceso)
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    const cancelDate = new Date((updatedSubscription as any).current_period_end * 1000);
    
    console.log(`✅ Suscripción se cancelará el: ${cancelDate.toLocaleDateString('es-ES')}`);
    console.log(`   Usuario mantiene acceso hasta esa fecha`);

    // Actualizar en Supabase
    const { error: dbError } = await (supabase as any)
      .from('subscriptions')
      .update({ 
        cancel_at_period_end: true,
        cancel_reason: 'Canceled by user'
      })
      .eq('id', subscriptionId);

    if (dbError) {
      console.error('⚠️ Error actualizando DB:', dbError.message);
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        cancel_at_period_end: true,
        current_period_end: (updatedSubscription as any).current_period_end,
        cancel_date: cancelDate.toISOString()
      },
      message: `Tu suscripción se cancelará el ${cancelDate.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })}. Mantendrás acceso completo hasta esa fecha.`
    });

  } catch (error: any) {
    console.error('❌ Error cancelando suscripción:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

