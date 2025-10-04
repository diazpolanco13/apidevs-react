import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const TRADINGVIEW_API = 'http://185.218.124.241:5001';

// POST - Revocar TODOS los accesos de un usuario
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

    // Type assertion - código funcional existente
    const validTargetUser = targetUser as any;

    if (!validTargetUser.tradingview_username) {
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
        indicators:indicator_id (
          id,
          pine_id,
          name
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

    // Type assertion - código funcional existente
    const validActiveAccesses = (activeAccesses || []) as any[];

    if (validActiveAccesses.length === 0) {
      return NextResponse.json(
        { message: 'El usuario no tiene accesos activos para revocar' },
        { status: 200 }
      );
    }

    // Preparar array de pine_ids
    const pineIds = validActiveAccesses
      .map((access) => access.indicators?.pine_id)
      .filter(Boolean);

    // Llamar al microservicio de TradingView para remover acceso
    const tvResponse = await fetch(
      `${TRADINGVIEW_API}/api/access/${validTargetUser.tradingview_username}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pine_ids: pineIds
        })
      }
    );

    const tvResult = await tvResponse.json();

    // Procesar resultados
    const results = {
      total: validActiveAccesses.length,
      successful: 0,
      failed: 0,
      details: [] as any[]
    };

    // El endpoint DELETE retorna un array de resultados
    if (Array.isArray(tvResult)) {
      for (const result of tvResult) {
        if (result.status === 'Success' || result.hasAccess === false) {
          results.successful++;
        } else {
          results.failed++;
        }
      }
    }

    // Actualizar registros en Supabase
    const now = new Date().toISOString();

    for (let i = 0; i < validActiveAccesses.length; i++) {
      const access = validActiveAccesses[i];
      const tvResultItem = Array.isArray(tvResult) ? tvResult[i] : null;
      const isSuccess =
        tvResultItem?.status === 'Success' || tvResultItem?.hasAccess === false;

      await (supabase as any)
        .from('indicator_access')
        .update({
          status: isSuccess ? 'revoked' : 'failed',
          revoked_at: isSuccess ? now : null,
          revoked_by: user.id,
          tradingview_response: tvResultItem,
          error_message: isSuccess
            ? null
            : tvResultItem?.error || 'Error al revocar'
        })
        .eq('id', access.id);

      results.details.push({
        indicator: access.indicators?.name,
        pine_id: access.indicators?.pine_id,
        status: isSuccess ? 'revoked' : 'failed',
        error: tvResultItem?.error || null
      });
    }

    return NextResponse.json({
      success: true,
      message: `Se revocaron ${results.successful} de ${results.total} accesos`,
      results,
      user: {
        email: validTargetUser.email,
        tradingview_username: validTargetUser.tradingview_username
      },
      indicators_revoked: validActiveAccesses.map((a) => a.indicators?.name)
    });
  } catch (error) {
    console.error('Error revocando accesos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

