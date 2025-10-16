import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { checkAdminPermission, PERMISSIONS } from '@/utils/admin/permissions';

const TRADINGVIEW_API = 'http://185.218.124.241:5001';

type BulkOperationResult = {
  user_id: string;
  indicator_id: string;
  success: boolean;
  error?: string;
  tv_response?: any;
};

// Next.js 15: Forzar renderizado dinámico porque usa cookies (Supabase)
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user: adminUser }
    } = await supabase.auth.getUser();

    if (!adminUser || !(await checkAdminPermission(adminUser.id, PERMISSIONS.USERS_GRANT_ACCESS))) {
      return NextResponse.json({ error: 'No autorizado - Requiere permisos de operaciones masivas' }, { status: 401 });
    }

    const body = await request.json();
    const {
      user_ids,
      indicator_ids,
      duration = '1Y',
      operation_type = 'grant'
    }: {
      user_ids: string[];
      indicator_ids: string[];
      duration: '7D' | '30D' | '1Y' | '1L';
      operation_type: 'grant' | 'revoke';
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

    // Operación masiva iniciada

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
    const validUsers = (users as any[] || []).filter((u: any) => u.tradingview_username);
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

    // 2. Obtener datos de indicadores (status en español)
    const { data: indicators, error: indicatorsError } = await supabase
      .from('indicators')
      .select('id, pine_id, name, access_tier')
      .in('id', indicator_ids)
      .eq('status', 'activo');

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
    const revokeRecords: any[] = [];

    for (const user of validUsers as any[]) {
      for (const indicator of (indicators || []) as any[]) {
        try {
          if (operation_type === 'revoke') {
            // ═══════════════ FLUJO DE REVOCACIÓN ═══════════════
            // 🔍 PASO 1: Verificar si el usuario tiene acceso activo
            const { data: existingAccess } = await supabase
              .from('indicator_access')
              .select('id, duration_type, status')
              .eq('user_id', user.id)
              .eq('indicator_id', indicator.id)
              .eq('status', 'active')
              .maybeSingle();

            // Si NO tiene acceso, simplemente continuar (no es error)
            if (!existingAccess) {
              console.log(`⏭️  Saltando ${user.email} - ${indicator.name}: Sin acceso activo`);
              results.push({
                user_id: user.id,
                indicator_id: indicator.id,
                success: true,
                error: 'Usuario sin acceso activo (omitido)'
              });
              continue;
            }

            // 🗑️ PASO 2: Revocar en TradingView
            const deleteResponse = await fetch(
              `${TRADINGVIEW_API}/api/access/${user.tradingview_username}`,
              {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  pine_ids: [indicator.pine_id]
                })
              }
            );

            const deleteResult = await deleteResponse.json();
            
            // Marcar como exitoso (revocación siempre debería funcionar)
            results.push({
              user_id: user.id,
              indicator_id: indicator.id,
              success: true,
              tv_response: deleteResult
            });

            // Preparar actualización de registro (marcar como revoked)
            revokeRecords.push({
              id: (existingAccess as any).id,
              user_id: user.id,
              indicator_id: indicator.id,
              tradingview_username: user.tradingview_username,
              status: 'revoked',
              revoked_at: new Date().toISOString(),
              revoked_by: adminUser.id
            });

          } else {
            // ═══════════════ FLUJO DE CONCESIÓN ═══════════════
            // 🔍 PASO 1: Verificar si existe acceso previo
            const { data: existingAccess } = await supabase
              .from('indicator_access')
              .select('id, duration_type, status')
              .eq('user_id', user.id)
              .eq('indicator_id', indicator.id)
              .eq('status', 'active')
              .maybeSingle();

            // 🗑️ PASO 2: Si existe acceso, REVOCAR primero (permite degradaciones)
            if (existingAccess) {
              console.log(`🔄 Reemplazando acceso existente: ${(existingAccess as any).duration_type} → ${duration}`);
              
              const deleteResponse = await fetch(
                `${TRADINGVIEW_API}/api/access/${user.tradingview_username}`,
                {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    pine_ids: [indicator.pine_id]
                  })
                }
              );
              
              await deleteResponse.json(); // Esperar respuesta
              console.log(`🗑️ Acceso anterior revocado`);
            }

            // ✨ PASO 3: Conceder nuevo acceso
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
                tradingview_username: user.tradingview_username,
                status: 'active',
                access_source: 'bulk',
                duration_type: duration,
                granted_at: new Date().toISOString(),
                expires_at: expiration,
                granted_by: adminUser.id,
                auto_renew: false,
                tradingview_response: tvResult[0]
              });
            } else {
              results.push({
                user_id: user.id,
                indicator_id: indicator.id,
                success: false,
                error: tvResult.error || 'Error desconocido de TradingView'
              });
            }
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
      const { data: upsertedData, error: insertError } = await supabase
        .from('indicator_access')
        .upsert(accessRecords as any, {
          onConflict: 'user_id,indicator_id',
          ignoreDuplicates: false
        })
        .select();

      if (insertError) {
        console.error('⚠️ Error guardando accesos en Supabase:', insertError);
      } else {
        // 4.1 Guardar en LOG de auditoría (cada operación = nuevo registro)
        const logRecords = accessRecords.map((record: any, index: number) => ({
          user_id: record.user_id,
          indicator_id: record.indicator_id,
          tradingview_username: record.tradingview_username,
          operation_type: 'grant',
          access_source: record.access_source,
          status: record.status,
          granted_at: record.granted_at,
          expires_at: record.expires_at,
          duration_type: record.duration_type,
          tradingview_response: record.tradingview_response,
          performed_by: adminUser.id,
          indicator_access_id: (upsertedData as any)?.[index]?.id || null,
          notes: `Asignación masiva - ${duration}`
        }));
        
        const { error: logError } = await supabase
          .from('indicator_access_log')
          .insert(logRecords as any);
        
        if (logError) {
          console.error('⚠️ Error guardando LOG:', logError);
        }
      }
    }

    // 4.2 Guardar revocaciones en Supabase (update)
    if (revokeRecords.length > 0) {
      // Actualizar registros existentes a status='revoked'
      for (const record of revokeRecords as any[]) {
        const updateData: any = {
          status: 'revoked',
          revoked_at: record.revoked_at,
          revoked_by: record.revoked_by
        };
        
        const { error: updateError } = await (supabase.from('indicator_access') as any)
          .update(updateData)
          .eq('id', record.id);

        if (updateError) {
          console.error(`⚠️ Error actualizando acceso ${record.id}:`, updateError);
        }
      }
      
      console.log(`✅ ${revokeRecords.length} revocaciones guardadas en Supabase`);
      
      // 4.3 Guardar en LOG de auditoría
      const revokeLogRecords = revokeRecords.map((record: any) => ({
        user_id: record.user_id,
        indicator_id: record.indicator_id,
        tradingview_username: record.tradingview_username,
        operation_type: 'revoke',
        access_source: 'bulk',
        status: 'revoked',
        revoked_at: record.revoked_at,
        performed_by: adminUser.id,
        indicator_access_id: record.id,
        notes: `Revocación masiva`
      }));
      
      const { error: revokeLogError } = await supabase
        .from('indicator_access_log')
        .insert(revokeLogRecords as any);
      
      if (revokeLogError) {
        console.error('⚠️ Error guardando LOG de revocaciones:', revokeLogError);
      }
    }

    // 5. Calcular resumen
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

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

