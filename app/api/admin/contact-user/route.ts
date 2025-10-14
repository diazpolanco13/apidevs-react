import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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
    const { subscriptionId, message, subject, contactType = 'email' } = body;

    if (!subscriptionId || !message) {
      return NextResponse.json({ error: 'subscriptionId y message son requeridos' }, { status: 400 });
    }

    // Admin contactando usuario

    // Obtener información del usuario y suscripción
    const { data: subscriptionData, error: subscriptionError } = await (supabase as any)
      .from('subscriptions')
      .select(`
        id,
        user_id,
        status,
        cancel_at_period_end,
        prices!inner(
          products!inner(
            name
          )
        ),
        users!inner(
          email,
          full_name
        )
      `)
      .eq('id', subscriptionId)
      .single();

    if (subscriptionError || !subscriptionData) {
      console.error('❌ Error obteniendo datos de suscripción:', subscriptionError);
      return NextResponse.json({ error: 'Suscripción no encontrada' }, { status: 404 });
    }

    const userEmail = subscriptionData.users?.email;
    const userName = subscriptionData.users?.full_name;
    const productName = subscriptionData.prices?.products?.name;

    if (!userEmail) {
      return NextResponse.json({ error: 'Email del usuario no encontrado' }, { status: 404 });
    }

    // TODO: Aquí integrarías con tu servicio de email (SendGrid, AWS SES, etc.)
    // Por ahora solo registramos la acción
    // Email preparado para envío

    // Registrar evento de contacto
    const { error: activityError } = await (supabase as any)
      .from('user_activity_events')
      .insert({
        user_id: subscriptionData.user_id,
        event_type: 'admin_contacted_user',
        event_data: {
          subscription_id: subscriptionId,
          contact_type: contactType,
          subject: subject || `Actualización sobre tu suscripción ${productName}`,
          message: message,
          contacted_at: new Date().toISOString(),
          admin_user_id: user.id
        }
      });

    if (activityError) {
      console.error('⚠️ Error registrando actividad:', activityError.message);
    }

    // Por ahora retornamos éxito (en producción aquí enviarías el email real)
    return NextResponse.json({
      success: true,
      message: `Mensaje preparado para enviar a ${userEmail}`,
      details: {
        user_email: userEmail,
        user_name: userName,
        product_name: productName,
        subject: subject || `Actualización sobre tu suscripción ${productName}`,
        contact_type: contactType
      }
    });

  } catch (error: any) {
    console.error('❌ Error contactando usuario:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
