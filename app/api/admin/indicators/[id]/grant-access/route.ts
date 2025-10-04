import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const TRADINGVIEW_API = 'http://185.218.124.241:5001';
const API_KEY = '92a1e4a8c74e1871c658301f3e8ae31c31ed6bfd68629059617fac621932e1ea';

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

    const { id: indicatorId } = params;
    const body = await req.json();
    const { tradingview_username, duration_type } = body;

    // Validaciones
    if (!tradingview_username || !duration_type) {
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

    // Type assertion
    const validIndicator = indicator as any;

    // Buscar el usuario por tradingview_username
    const { data: targetUser } = await supabase
      .from('users')
      .select('id, email, tradingview_username')
      .eq('tradingview_username', tradingview_username)
      .single();

    // Type assertion
    const validTargetUser = targetUser as any;

    // Verificar si ya existe un acceso para este usuario e indicador
    const { data: existingAccess } = await supabase
      .from('indicator_access')
      .select('id, status')
      .eq('indicator_id', indicatorId)
      .eq('tradingview_username', tradingview_username)
      .single();

    // Type assertion
    const validExistingAccess = existingAccess as any;

    if (validExistingAccess && validExistingAccess.status === 'active') {
      return NextResponse.json(
        { error: 'Este usuario ya tiene acceso activo a este indicador' },
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

    // Llamar al microservicio de TradingView
    console.log('Concediendo acceso a TradingView:', {
      users: [tradingview_username],
      pine_ids: [validIndicator.pine_id],
      duration: duration_type
    });

    const tvResponse = await fetch(`${TRADINGVIEW_API}/api/access/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        users: [tradingview_username],
        pine_ids: [validIndicator.pine_id],
        duration: duration_type,
        options: {
          preValidateUsers: false,
          onProgress: false
        }
      })
    });

    const tvResult = await tvResponse.json();
    console.log('Respuesta de TradingView:', tvResult);

    // ✅ CRÍTICO: Usar la fecha de expiración QUE TRADINGVIEW RETORNA
    // Esto garantiza sincronización 100% entre TradingView y Supabase
    const isSuccess = tvResponse.ok && Array.isArray(tvResult) && tvResult[0]?.status === 'Success';
    const tvExpiration = isSuccess && tvResult[0]?.expiration 
      ? tvResult[0].expiration 
      : (expiresAt?.toISOString() || null);

    // Crear o actualizar el registro de acceso
    const accessData = {
      user_id: validTargetUser?.id || null,
      indicator_id: indicatorId,
      tradingview_username,
      status: isSuccess ? 'active' : 'failed',
      granted_at: isSuccess ? new Date().toISOString() : null,
      expires_at: tvExpiration, // ✅ Fecha real de TradingView
      duration_type,
      tradingview_response: tvResult, // ✅ Guardamos respuesta completa para auditoría
      error_message: isSuccess ? null : (tvResult.error || tvResult[0]?.error || 'Error desconocido'),
      granted_by: user.id
    };

    let savedAccess;
    if (validExistingAccess) {
      // Actualizar acceso existente
      const { data, error } = await (supabase as any)
        .from('indicator_access')
        .update(accessData)
        .eq('id', validExistingAccess.id)
        .select()
        .single();

      if (error) throw error;
      savedAccess = data;
    } else {
      // Crear nuevo acceso
      const { data, error } = await (supabase as any)
        .from('indicator_access')
        .insert(accessData)
        .select()
        .single();

      if (error) throw error;
      savedAccess = data;
    }

    if (!tvResponse.ok) {
      return NextResponse.json(
        {
          error: 'Error al conceder acceso en TradingView',
          details: tvResult,
          access: savedAccess
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Acceso concedido exitosamente',
      access: savedAccess,
      tradingview_response: tvResult
    });
  } catch (error) {
    console.error('Error concediendo acceso:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

