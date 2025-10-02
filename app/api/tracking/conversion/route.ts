import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'apidevs_session_id';

/**
 * API Route para registrar una conversión (compra)
 * Se llama cuando un usuario completa una compra exitosa
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      user_id,
      purchase_amount_cents,
      product_id,
      subscription_id 
    } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id es requerido' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const cookieStore = cookies();
    
    // Obtener session_id de la cookie
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) {
      // No hay sesión trackeada, no hacer nada
      return NextResponse.json({ 
        success: false, 
        message: 'No session tracked' 
      });
    }

    // Buscar la sesión del visitante
    const { data: session, error: sessionError } = await supabase
      .from('visitor_tracking')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    // Actualizar el registro con la conversión
    const { error: updateError } = await supabase
      .from('visitor_tracking')
      .update({
        purchased: true,
        purchase_amount_cents: purchase_amount_cents || 0,
        product_purchased: product_id,
        subscription_id: subscription_id,
        user_id: user_id,
        updated_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId);

    if (updateError) {
      console.error('Error updating conversion:', updateError);
      return NextResponse.json(
        { error: 'Error actualizando conversión' },
        { status: 500 }
      );
    }

    // Refrescar vistas materializadas de forma async
    refreshAnalyticsViews(supabase).catch(err => {
      console.error('Error refreshing views:', err);
    });

    return NextResponse.json({ 
      success: true,
      message: 'Conversión registrada exitosamente' 
    });

  } catch (error) {
    console.error('Error in conversion tracking:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function refreshAnalyticsViews(supabase: any) {
  // Refrescar las vistas materializadas
  try {
    await supabase.rpc('refresh_geo_analytics_views');
  } catch (error) {
    // Silenciar - no es crítico
    console.error('Error refreshing analytics views:', error);
  }
}

