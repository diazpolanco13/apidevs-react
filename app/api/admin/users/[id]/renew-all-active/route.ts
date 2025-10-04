import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const TRADINGVIEW_API = 'http://185.218.124.241:5001';

// POST - Renovar TODOS los accesos activos usando /api/access/replace
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
          error: 'Usuario no tiene TradingView username configurado'
        },
        { status: 400 }
      );
    }

    // Obtener TODOS los accesos activos del usuario
    const { data: activeAccesses, error: accessError } = await supabase
      .from('indicator_access')
      .select(
        `
        id,
        indicator_id,
        expires_at,
        duration_type,
        indicators:indicator_id (
          id,
          pine_id,
          name,
          access_tier
        )
      `
      )
      .eq('user_id', userId)
      .eq('status', 'active');

    if (accessError) {
      console.error('Error fetching accesses:', accessError);
      return NextResponse.json(
        { error: 'Error obteniendo accesos' },
        { status: 500 }
      );
    }

    if (!activeAccesses || activeAccesses.length === 0) {
      return NextResponse.json(
        { message: 'El usuario no tiene accesos activos para renovar' },
        { status: 200 }
      );
    }

    console.log(
      `🔄 Renovando ${activeAccesses.length} accesos de ${targetUser.tradingview_username} (${duration_type})`
    );

    // Preparar array de pine_ids
    const pineIds = activeAccesses
      .map((access) => access.indicators?.pine_id)
      .filter(Boolean);

    // Calcular nueva fecha de expiración
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
    // Nota: Como no tenemos API key para /replace, usamos el endpoint individual
    // que añade tiempo en lugar de reemplazar
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
    console.log('📡 Respuesta de TradingView (Renew):', tvResult);

    // Procesar resultados
    const results = {
      total: activeAccesses.length,
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

    // Actualizar registros en Supabase
    const now = new Date().toISOString();

    for (let i = 0; i < activeAccesses.length; i++) {
      const access = activeAccesses[i];
      const tvResultItem = Array.isArray(tvResult) ? tvResult[i] : null;
      const isSuccess = tvResultItem?.status === 'Success';

      if (isSuccess) {
        // ✅ CRÍTICO: Usar la fecha de expiración QUE TRADINGVIEW RETORNA
        const tvExpiration = tvResultItem?.expiration || (expiresAt?.toISOString() || null);

        await supabase
          .from('indicator_access')
          .update({
            expires_at: tvExpiration, // ✅ Fecha real de TradingView
            duration_type,
            last_renewed_at: now,
            renewal_count: (access as any).renewal_count
              ? (access as any).renewal_count + 1
              : 1,
            tradingview_response: tvResultItem // ✅ Guardamos respuesta completa
          })
          .eq('id', access.id);
      }

      results.details.push({
        indicator: access.indicators?.name,
        pine_id: access.indicators?.pine_id,
        status: isSuccess ? 'renewed' : 'failed',
        new_expiration: isSuccess
          ? expiresAt?.toISOString() || 'Lifetime'
          : null,
        error: tvResultItem?.error || null
      });
    }

    return NextResponse.json({
      success: true,
      message: `Se renovaron ${results.successful} de ${results.total} accesos`,
      results,
      duration: duration_type,
      new_expiration: expiresAt?.toISOString() || 'Lifetime',
      user: {
        email: targetUser.email,
        tradingview_username: targetUser.tradingview_username
      },
      indicators_renewed: activeAccesses.map((a) => a.indicators?.name)
    });
  } catch (error) {
    console.error('Error renovando accesos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

