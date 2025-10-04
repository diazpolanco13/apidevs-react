import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const TRADINGVIEW_API = 'http://185.218.124.241:5001';

// POST - Conceder acceso a TODOS los indicadores Free
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

    // Obtener TODOS los indicadores Free activos
    const { data: freeIndicators, error: indicatorsError } = await supabase
      .from('indicators')
      .select('id, pine_id, name, category')
      .eq('access_tier', 'free')
      .eq('status', 'activo');

    if (indicatorsError) {
      console.error('Error fetching free indicators:', indicatorsError);
      return NextResponse.json(
        { error: 'Error obteniendo indicadores Free' },
        { status: 500 }
      );
    }

    if (!freeIndicators || freeIndicators.length === 0) {
      return NextResponse.json(
        { error: 'No hay indicadores Free disponibles' },
        { status: 404 }
      );
    }

    console.log(
      `🎁 Concediendo ${freeIndicators.length} indicadores FREE a ${targetUser.tradingview_username}`
    );

    // Preparar array de pine_ids
    const pineIds = freeIndicators.map((ind) => ind.pine_id);

    // Llamar al microservicio de TradingView (endpoint individual)
    const tvResponse = await fetch(
      `${TRADINGVIEW_API}/api/access/${targetUser.tradingview_username}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pine_ids: pineIds,
          duration: '1L' // Lifetime para indicadores Free
        })
      }
    );

    const tvResult = await tvResponse.json();
    console.log('📡 Respuesta de TradingView (Free):', tvResult);

    // Procesar resultados
    const results = {
      total: freeIndicators.length,
      successful: 0,
      failed: 0,
      details: [] as any[]
    };

    // El endpoint retorna un array de resultados
    if (Array.isArray(tvResult)) {
      for (const result of tvResult) {
        if (result.status === 'Success') {
          results.successful++;
        } else {
          results.failed++;
        }
      }
    }

    // Guardar/Actualizar registros en Supabase
    const accessRecords = [];
    const now = new Date().toISOString();

    for (let i = 0; i < freeIndicators.length; i++) {
      const indicator = freeIndicators[i];
      const tvResultItem = Array.isArray(tvResult) ? tvResult[i] : null;
      const isSuccess = tvResultItem?.status === 'Success';

      // ✅ CRÍTICO: Para Lifetime, TradingView puede retornar expiration o null
      // Usar lo que TradingView retorna para mantener sincronización perfecta
      const tvExpiration = isSuccess && tvResultItem?.expiration 
        ? tvResultItem.expiration 
        : null; // Lifetime = null

      // Verificar si ya existe acceso
      const { data: existing } = await supabase
        .from('indicator_access')
        .select('id')
        .eq('user_id', userId)
        .eq('indicator_id', indicator.id)
        .maybeSingle();

      const accessData = {
        user_id: userId,
        indicator_id: indicator.id,
        tradingview_username: targetUser.tradingview_username,
        status: isSuccess ? 'active' : 'failed',
        granted_at: isSuccess ? now : null,
        expires_at: tvExpiration, // ✅ Fecha real de TradingView (null para Lifetime)
        duration_type: '1L',
        access_source: 'manual',
        granted_by: user.id,
        tradingview_response: tvResultItem, // ✅ Guardamos respuesta completa para auditoría
        error_message: isSuccess ? null : tvResultItem?.error || 'Error desconocido'
      };

      if (existing) {
        // Actualizar
        await supabase
          .from('indicator_access')
          .update(accessData)
          .eq('id', existing.id);
      } else {
        // Crear
        accessRecords.push(accessData);
      }

      results.details.push({
        indicator: indicator.name,
        pine_id: indicator.pine_id,
        status: isSuccess ? 'success' : 'failed',
        error: tvResultItem?.error || null
      });
    }

    // Insertar nuevos registros si hay
    if (accessRecords.length > 0) {
      const { error: insertError } = await supabase
        .from('indicator_access')
        .insert(accessRecords);

      if (insertError) {
        console.error('Error insertando accesos:', insertError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Se concedieron ${results.successful} de ${results.total} indicadores FREE`,
      results,
      user: {
        email: targetUser.email,
        tradingview_username: targetUser.tradingview_username
      },
      indicators_granted: freeIndicators.map((i) => i.name)
    });
  } catch (error) {
    console.error('Error concediendo accesos Free:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

