import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const TRADINGVIEW_API = 'http://185.218.124.241:5001';
const API_KEY = '92a1e4a8c74e1871c658301f3e8ae31c31ed6bfd68629059617fac621932e1ea';

// Next.js 15: Forzar renderizado dinámico porque usa cookies (Supabase)
export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();

    // Verificar autenticación admin
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user || user.email !== 'api@apidevs.io') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const indicatorId = id;
    const body = await req.json();
    const { access_id, tradingview_username, reason } = body;

    // Validaciones
    if (!access_id || !tradingview_username) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Obtener el indicador
    const { data: indicator, error: indicatorError } = await supabase
      .from('indicators')
      .select('pine_id, name')
      .eq('id', indicatorId)
      .single();

    if (indicatorError || !indicator) {
      return NextResponse.json(
        { error: 'Indicador no encontrado' },
        { status: 404 }
      );
    }

    // Type assertion - código funcional existente, solo para compilación
    const validIndicator = indicator as any;

    // Obtener el acceso
    const { data: access, error: accessError } = await supabase
      .from('indicator_access')
      .select('*')
      .eq('id', access_id)
      .single();

    if (accessError || !access) {
      return NextResponse.json(
        { error: 'Acceso no encontrado' },
        { status: 404 }
      );
    }

    // Llamar al microservicio de TradingView para revocar el acceso
    console.log('Revocando acceso en TradingView:', {
      users: [tradingview_username],
      pine_ids: [validIndicator.pine_id]
    });

    const tvResponse = await fetch(
      `${TRADINGVIEW_API}/api/access/bulk-remove`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({
          users: [tradingview_username],
          pine_ids: [validIndicator.pine_id],
          options: {
            preValidateUsers: false
          }
        })
      }
    );

    const tvResult = await tvResponse.json();
    console.log('Respuesta de TradingView:', tvResult);

    // Actualizar el registro de acceso
    const { data: updatedAccess, error: updateError } = await (supabase as any)
      .from('indicator_access')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoked_by: user.id,
        notes: reason || null,
        tradingview_response: tvResult,
        error_message: tvResponse.ok ? null : tvResult.error || 'Error al revocar'
      })
      .eq('id', access_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error actualizando acceso:', updateError);
      throw updateError;
    }

    if (!tvResponse.ok) {
      return NextResponse.json(
        {
          warning: 'Acceso marcado como revocado en BD, pero falló en TradingView',
          details: tvResult,
          access: updatedAccess
        },
        { status: 207 } // 207 Multi-Status
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Acceso revocado exitosamente',
      access: updatedAccess,
      tradingview_response: tvResult
    });
  } catch (error) {
    console.error('Error revocando acceso:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

