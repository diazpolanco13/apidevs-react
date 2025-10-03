import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const TRADINGVIEW_API = 'http://89.116.30.133:5555';

type BulkOperationResult = {
  user_id: string;
  indicator_id: string;
  success: boolean;
  error?: string;
  tv_response?: any;
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user || user.email !== 'api@apidevs.io') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      user_ids,
      indicator_ids,
      duration = '1Y'
    }: {
      user_ids: string[];
      indicator_ids: string[];
      duration: '7D' | '30D' | '1Y' | '1L';
    } = body;

    // Validaciones
    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json(
        { error: 'user_ids es requerido y debe ser un array no vacío' },
        { status: 400 }
      );
    }

    if (
      !indicator_ids ||
      !Array.isArray(indicator_ids) ||
      indicator_ids.length === 0
    ) {
      return NextResponse.json(
        { error: 'indicator_ids es requerido y debe ser un array no vacío' },
        { status: 400 }
      );
    }

    console.log('🚀 Iniciando operación masiva:', {
      users: user_ids.length,
      indicators: indicator_ids.length,
      total_operations: user_ids.length * indicator_ids.length,
      duration
    });

    // 1. Obtener datos de usuarios
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, tradingview_username')
      .in('id', user_ids);

    if (usersError) {
      console.error('❌ Error obteniendo usuarios:', usersError);
      return NextResponse.json(
        { error: 'Error obteniendo usuarios' },
        { status: 500 }
      );
    }

    // Filtrar usuarios sin tradingview_username
    const validUsers = users?.filter((u) => u.tradingview_username) || [];
    const usersWithoutTV = (users?.length || 0) - validUsers.length;

    if (validUsers.length === 0) {
      return NextResponse.json(
        { error: 'Ningún usuario tiene TradingView username configurado' },
        { status: 400 }
      );
    }

    if (usersWithoutTV > 0) {
      console.log(
        `⚠️ ${usersWithoutTV} usuarios sin TradingView username serán omitidos`
      );
    }

    // 2. Obtener datos de indicadores
    const { data: indicators, error: indicatorsError } = await supabase
      .from('indicators')
      .select('id, pine_id, name, access_tier')
      .in('id', indicator_ids)
      .eq('status', 'active');

    if (indicatorsError) {
      console.error('❌ Error obteniendo indicadores:', indicatorsError);
      return NextResponse.json(
        { error: 'Error obteniendo indicadores' },
        { status: 500 }
      );
    }

    if (!indicators || indicators.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron indicadores activos' },
        { status: 400 }
      );
    }

    // 3. Ejecutar operaciones masivas
    const results: BulkOperationResult[] = [];
    const accessRecords: any[] = [];

    for (const user of validUsers) {
      for (const indicator of indicators) {
        try {
          // Llamar al microservicio de TradingView (endpoint individual)
          const tvResponse = await fetch(
            `${TRADINGVIEW_API}/api/access/${user.tradingview_username}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                pine_ids: [indicator.pine_id],
                duration: duration
              })
            }
          );

          const tvResult = await tvResponse.json();

          // Verificar éxito
          const isSuccess =
            Array.isArray(tvResult) &&
            tvResult.length > 0 &&
            tvResult[0].status === 'Success';

          if (isSuccess) {
            results.push({
              user_id: user.id,
              indicator_id: indicator.id,
              success: true,
              tv_response: tvResult[0]
            });

            // Calcular fecha de expiración
            let expiration: string | null = null;
            if (tvResult[0].expiration) {
              expiration = new Date(tvResult[0].expiration).toISOString();
            } else if (duration !== '1L') {
              const now = new Date();
              if (duration === '7D') now.setDate(now.getDate() + 7);
              else if (duration === '30D') now.setDate(now.getDate() + 30);
              else if (duration === '1Y') now.setFullYear(now.getFullYear() + 1);
              expiration = now.toISOString();
            }

            // Preparar registro de acceso
            accessRecords.push({
              user_id: user.id,
              indicator_id: indicator.id,
              access_status: 'active',
              access_source: 'admin_bulk',
              granted_at: new Date().toISOString(),
              expires_at: expiration,
              granted_by_admin_id: user.id, // El admin actual
              auto_renew: false
            });
          } else {
            results.push({
              user_id: user.id,
              indicator_id: indicator.id,
              success: false,
              error: tvResult.error || 'Error desconocido de TradingView'
            });
          }
        } catch (error: any) {
          console.error(
            `❌ Error procesando ${user.email} - ${indicator.name}:`,
            error
          );
          results.push({
            user_id: user.id,
            indicator_id: indicator.id,
            success: false,
            error: error.message || 'Error de conexión'
          });
        }
      }
    }

    // 4. Guardar accesos exitosos en Supabase (upsert)
    if (accessRecords.length > 0) {
      const { error: insertError } = await supabase
        .from('indicator_access')
        .upsert(accessRecords, {
          onConflict: 'user_id,indicator_id',
          ignoreDuplicates: false
        });

      if (insertError) {
        console.error('⚠️ Error guardando accesos en Supabase:', insertError);
      } else {
        console.log(
          `✅ ${accessRecords.length} accesos guardados en Supabase`
        );
      }
    }

    // 5. Calcular resumen
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log('📊 Operación masiva completada:', {
      total: results.length,
      successful,
      failed,
      skipped_users: usersWithoutTV
    });

    return NextResponse.json({
      success: true,
      summary: {
        total: results.length,
        successful,
        failed,
        users_processed: validUsers.length,
        users_skipped: usersWithoutTV,
        indicators_processed: indicators.length
      },
      results: results.map((r) => ({
        user_id: r.user_id,
        indicator_id: r.indicator_id,
        success: r.success,
        error: r.error
      }))
    });
  } catch (error: any) {
    console.error('❌ Error en operación masiva:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

