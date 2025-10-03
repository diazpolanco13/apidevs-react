import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const TRADINGVIEW_API = 'http://185.218.124.241:5001';
const API_KEY = '92a1e4a8c74e1871c658301f3e8ae31c31ed6bfd68629059617fac621932e1ea';

// POST - Conceder acceso individual a un indicador
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    // Verificar autenticación admin
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user || user.email !== 'api@apidevs.io') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: userId } = params;
    const body = await req.json();
    const { indicator_id, duration_type } = body;

    // Validaciones
    if (!indicator_id || !duration_type) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: indicator_id, duration_type' },
        { status: 400 }
      );
    }

    if (!['7D', '30D', '1Y', '1L'].includes(duration_type)) {
      return NextResponse.json(
        { error: 'duration_type debe ser: 7D, 30D, 1Y, o 1L' },
        { status: 400 }
      );
    }

    // Obtener usuario
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, tradingview_username')
      .eq('id', userId)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (!targetUser.tradingview_username) {
      return NextResponse.json(
        {
          error:
            'Usuario no tiene TradingView username configurado. Debe completar onboarding primero.'
        },
        { status: 400 }
      );
    }

    // Obtener indicador
    const { data: indicator, error: indicatorError } = await supabase
      .from('indicators')
      .select('id, pine_id, name, access_tier, status')
      .eq('id', indicator_id)
      .single();

    if (indicatorError || !indicator) {
      return NextResponse.json(
        { error: 'Indicador no encontrado' },
        { status: 404 }
      );
    }

    if (indicator.status !== 'activo') {
      return NextResponse.json(
        { error: 'El indicador no está activo' },
        { status: 400 }
      );
    }

    // Verificar si ya existe algún acceso (activo o no)
    const { data: existingAccess } = await supabase
      .from('indicator_access')
      .select('id, status, expires_at')
      .eq('user_id', userId)
      .eq('indicator_id', indicator_id)
      .maybeSingle();

    // Si tiene acceso activo y no ha expirado, rechazar
    if (
      existingAccess &&
      existingAccess.status === 'active' &&
      existingAccess.expires_at &&
      new Date(existingAccess.expires_at) > new Date()
    ) {
      return NextResponse.json(
        {
          error: 'El usuario ya tiene acceso activo y vigente a este indicador',
          existing_access: existingAccess,
          expires_at: existingAccess.expires_at
        },
        { status: 400 }
      );
    }

    // Calcular fecha de expiración
    let expiresAt = null;
    if (duration_type !== '1L') {
      const now = new Date();
      switch (duration_type) {
        case '7D':
          expiresAt = new Date(now.setDate(now.getDate() + 7));
          break;
        case '30D':
          expiresAt = new Date(now.setDate(now.getDate() + 30));
          break;
        case '1Y':
          expiresAt = new Date(now.setFullYear(now.getFullYear() + 1));
          break;
      }
    }

    // Llamar al microservicio de TradingView (endpoint individual - no requiere API key)
    console.log('🚀 Concediendo acceso a TradingView:', {
      user: targetUser.tradingview_username,
      indicator: indicator.name,
      pine_id: indicator.pine_id,
      duration: duration_type
    });

    const tvResponse = await fetch(
      `${TRADINGVIEW_API}/api/access/${targetUser.tradingview_username}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pine_ids: [indicator.pine_id],
          duration: duration_type
        })
      }
    );

    const tvResult = await tvResponse.json();
    console.log('📡 Respuesta de TradingView:', tvResult);

    // Verificar si la respuesta es exitosa (el endpoint retorna un array)
    const isSuccess = Array.isArray(tvResult) && tvResult.length > 0 && tvResult[0].status === 'Success';

    // Preparar datos del acceso
    const accessData = {
      user_id: userId,
      indicator_id: indicator.id,
      tradingview_username: targetUser.tradingview_username,
      status: isSuccess ? 'active' : 'failed',
      granted_at: isSuccess ? new Date().toISOString() : null,
      expires_at: expiresAt?.toISOString() || null,
      duration_type,
      access_source: 'manual',
      granted_by: user.id,
      tradingview_response: tvResult,
      error_message: isSuccess ? null : (tvResult.error || tvResult[0]?.error || 'Error desconocido')
    };

    let savedAccess;

    if (existingAccess) {
      // Actualizar acceso existente
      const { data, error: updateError } = await supabase
        .from('indicator_access')
        .update(accessData)
        .eq('id', existingAccess.id)
        .select(
          `
          *,
          indicators:indicator_id (
            id,
            name,
            pine_id,
            access_tier
          )
        `
        )
        .single();

      if (updateError) {
        console.error('Error actualizando acceso:', updateError);
        return NextResponse.json(
          { error: 'Error actualizando acceso en BD', details: updateError.message },
          { status: 500 }
        );
      }
      savedAccess = data;
    } else {
      // Crear nuevo acceso
      const { data, error: insertError } = await supabase
        .from('indicator_access')
        .insert(accessData)
        .select(
          `
          *,
          indicators:indicator_id (
            id,
            name,
            pine_id,
            access_tier
          )
        `
        )
        .single();

      if (insertError) {
        console.error('Error creando acceso:', insertError);
        return NextResponse.json(
          { error: 'Error guardando acceso en BD', details: insertError.message },
          { status: 500 }
        );
      }
      savedAccess = data;
    }

    if (!isSuccess) {
      return NextResponse.json(
        {
          error: 'Error al conceder acceso en TradingView',
          details: tvResult,
          access: savedAccess,
          saved_in_db: true
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Acceso concedido exitosamente a ${indicator.name}`,
      access: savedAccess,
      tradingview_response: tvResult,
      user: {
        email: targetUser.email,
        full_name: targetUser.full_name,
        tradingview_username: targetUser.tradingview_username
      },
      indicator: {
        name: indicator.name,
        pine_id: indicator.pine_id
      },
      expires_at: expiresAt?.toISOString() || null
    });
  } catch (error) {
    console.error('Error concediendo acceso:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


