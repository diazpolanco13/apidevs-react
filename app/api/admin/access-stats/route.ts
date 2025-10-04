import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Force dynamic rendering (uses cookies for auth)
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/access-stats
 *
 * Obtiene estadísticas globales del sistema de accesos a indicadores.
 *
 * Query params:
 * - period: número de días a analizar (default: 30)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Verificar autenticación admin
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user || user.email !== 'api@apidevs.io') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parsear query params
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '30');
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - period);

    // Total de operaciones en el período (desde indicator_access_log)
    const { count: totalOperations } = await supabase
      .from('indicator_access_log')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', dateFrom.toISOString());

    // Operaciones exitosas (access_status = active, granted, o success)
    const { count: successfulOperations } = await supabase
      .from('indicator_access_log')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', dateFrom.toISOString())
      .in('access_status', ['active', 'granted', 'success']);

    // Operaciones fallidas
    const { count: failedOperations } = await supabase
      .from('indicator_access_log')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', dateFrom.toISOString())
      .eq('access_status', 'failed');

    // Usuarios únicos afectados
    const { data: uniqueUsersData } = await supabase
      .from('indicator_access_log')
      .select('user_id')
      .gte('created_at', dateFrom.toISOString())
      .not('user_id', 'is', null);

    const uniqueUsers = new Set(uniqueUsersData?.map((r: any) => r.user_id).filter(Boolean) || []).size;

    // Indicadores únicos asignados
    const { data: uniqueIndicatorsData } = await supabase
      .from('indicator_access_log')
      .select('indicator_id')
      .gte('created_at', dateFrom.toISOString())
      .not('indicator_id', 'is', null);

    const uniqueIndicators = new Set(
      uniqueIndicatorsData?.map((r: any) => r.indicator_id).filter(Boolean) || []
    ).size;

    // Accesos activos actualmente
    const { count: activeAccesses } = await supabase
      .from('indicator_access')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString());

    // Accesos expirados (última semana)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const { count: expiredAccesses } = await supabase
      .from('indicator_access')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'expired')
      .gte('expires_at', lastWeek.toISOString());

    // Accesos revocados (última semana)
    const { count: revokedAccesses } = await supabase
      .from('indicator_access')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'revoked')
      .gte('revoked_at', lastWeek.toISOString());

    // Distribución por fuente de acceso
    const { data: sourceDistribution } = await supabase
      .from('indicator_access_log')
      .select('access_source')
      .gte('created_at', dateFrom.toISOString());

    // Type assertion
    const validSourceDistribution = (sourceDistribution || []) as any[];

    const bySource = {
      manual: 0,
      purchase: 0,
      trial: 0,
      bulk: 0,
      renewal: 0,
      promo: 0,
      admin_bulk: 0 // Añadido para compatibilidad con sistema actual
    };

    validSourceDistribution.forEach((record) => {
      const source = record.access_source as keyof typeof bySource;
      if (source in bySource) {
        bySource[source]++;
      }
    });

    // Distribución por tipo de operación (usando operation_type del log)
    const { data: operationDistribution } = await supabase
      .from('indicator_access_log')
      .select('operation_type')
      .gte('created_at', dateFrom.toISOString());

    // Type assertion
    const validOperationDistribution = (operationDistribution || []) as any[];

    const byOperation = {
      grants: 0,
      revokes: 0,
      renewals: 0
    };

    validOperationDistribution.forEach((record: any) => {
      if (record.operation_type === 'grant') {
        byOperation.grants++;
      } else if (record.operation_type === 'revoke') {
        byOperation.revokes++;
      } else if (record.operation_type === 'renew') {
        byOperation.renewals++;
      }
    });

    // Timeline: operaciones por día (últimos N días)
    const { data: timelineData } = await supabase
      .from('indicator_access_log')
      .select('created_at')
      .gte('created_at', dateFrom.toISOString())
      .order('created_at', { ascending: true });

    // Type assertion
    const validTimelineData = (timelineData || []) as any[];

    // Agrupar por día
    const timelineMap = new Map<string, number>();
    validTimelineData.forEach((record) => {
      const date = new Date(record.created_at).toISOString().split('T')[0];
      timelineMap.set(date, (timelineMap.get(date) || 0) + 1);
    });

    const timeline = Array.from(timelineMap.entries()).map(([date, operations]) => ({
      date,
      operations
    }));

    // Calcular tasa de éxito
    const successRate =
      totalOperations && totalOperations > 0
        ? Math.round(((successfulOperations || 0) / totalOperations) * 100)
        : 0;

    return NextResponse.json({
      success: true,
      period_days: period,
      total_operations: totalOperations || 0,
      successful_operations: successfulOperations || 0,
      failed_operations: failedOperations || 0,
      success_rate: successRate,
      unique_users: uniqueUsers,
      unique_indicators: uniqueIndicators,
      active_accesses: activeAccesses || 0,
      expired_accesses: expiredAccesses || 0,
      revoked_accesses: revokedAccesses || 0,
      by_source: bySource,
      by_operation: byOperation,
      timeline
    });
  } catch (error: any) {
    console.error('❌ Error en /api/admin/access-stats:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

