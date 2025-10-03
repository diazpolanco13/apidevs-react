import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const TRADINGVIEW_API = 'http://185.218.124.241:5001';

// POST - Conceder acceso a TODOS los indicadores Premium
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
    const { duration_type = '1Y' } = body; // Por defecto 1 año

    // Validar duration_type
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

    // Obtener TODOS los indicadores Premium activos
    const { data: premiumIndicators, error: indicatorsError } = await supabase
      .from('indicators')
      .select('id, pine_id, name, category')
      .eq('access_tier', 'premium')
      .eq('status', 'activo');

    if (indicatorsError) {
      console.error('Error fetching premium indicators:', indicatorsError);
      return NextResponse.json(
        { error: 'Error obteniendo indicadores Premium' },
        { status: 500 }
      );
    }

    if (!premiumIndicators || premiumIndicators.length === 0) {
      return NextResponse.json(
        { error: 'No hay indicadores Premium disponibles' },
        { status: 404 }
      );
    }

    console.log(
      `💎 Concediendo ${premiumIndicators.length} indicadores PREMIUM a ${targetUser.tradingview_username} (${duration_type})`
    );

    // Preparar array de pine_ids
    const pineIds = premiumIndicators.map((ind) => ind.pine_id);

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
    const tvResponse = await fetch(
      `${TRADINGVIEW_API}/api/access/${targetUser.tradingview_username}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pine_ids: pineIds,
          duration: duration_type
        })
      }
    );

    const tvResult = await tvResponse.json();
    console.log('📡 Respuesta de TradingView (Premium):', tvResult);

    // Procesar resultados
    const results = {
      total: premiumIndicators.length,
      successful: 0,
      failed: 0,
      details: [] as any[]
    };

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

    for (let i = 0; i < premiumIndicators.length; i++) {
      const indicator = premiumIndicators[i];
      const tvResultItem = Array.isArray(tvResult) ? tvResult[i] : null;
      const isSuccess = tvResultItem?.status === 'Success';

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
        expires_at: expiresAt?.toISOString() || null,
        duration_type,
        access_source: 'manual',
        granted_by: user.id,
        tradingview_response: tvResultItem,
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
      message: `Se concedieron ${results.successful} de ${results.total} indicadores PREMIUM`,
      results,
      duration: duration_type,
      expires_at: expiresAt?.toISOString() || null,
      user: {
        email: targetUser.email,
        tradingview_username: targetUser.tradingview_username
      },
      indicators_granted: premiumIndicators.map((i) => i.name)
    });
  } catch (error) {
    console.error('Error concediendo accesos Premium:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

