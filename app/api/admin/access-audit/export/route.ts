import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Force dynamic rendering (uses cookies for auth)
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/access-audit/export
 * 
 * Exporta historial de operaciones a CSV con filtros opcionales.
 * 
 * Body (JSON):
 * - date_from: fecha desde (ISO format)
 * - date_to: fecha hasta (ISO format)
 * - access_source: filtrar por fuente
 * - status: filtrar por estado
 * - user_id: filtrar por usuario
 * - indicator_id: filtrar por indicador
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verificar autenticación admin
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user || user.email !== 'api@apidevs.io') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📥 Exportando historial a CSV...');

    // Parsear filtros del body
    const body = await request.json();
    const {
      date_from,
      date_to,
      access_source,
      status,
      user_id,
      indicator_id
    } = body;

    // Construir query - LEER DE indicator_access_log (sin joins, enriquecer después)
    let query = supabase
      .from('indicator_access_log')
      .select('*')
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (date_from) query = query.gte('created_at', date_from);
    if (date_to) query = query.lte('created_at', date_to);
    if (access_source) query = query.eq('access_source', access_source);
    if (status) query = query.eq('access_status', status);
    if (user_id) query = query.eq('user_id', user_id);
    if (indicator_id) query = query.eq('indicator_id', indicator_id);

    const { data: logRecords, error } = await query;

    if (error) {
      console.error('❌ Error obteniendo registros:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ ${logRecords?.length || 0} registros obtenidos del log`);

    // Enriquecer datos: obtener usuarios e indicadores
    const userIds = new Set<string>();
    const performedByIds = new Set<string>();
    const indicatorIds = new Set<string>();

    logRecords?.forEach((record: any) => {
      if (record.user_id) userIds.add(record.user_id);
      if (record.performed_by) performedByIds.add(record.performed_by);
      if (record.indicator_id) indicatorIds.add(record.indicator_id);
    });

    // Obtener usuarios
    const allUserIds = new Set<string>();
    userIds.forEach(id => allUserIds.add(id));
    performedByIds.forEach(id => allUserIds.add(id));
    
    const { data: users } = await supabase
      .from('users')
      .select('id, email, full_name, tradingview_username')
      .in('id', Array.from(allUserIds));

    // Obtener indicadores
    const { data: indicators } = await supabase
      .from('indicators')
      .select('id, name, pine_id, category, access_tier')
      .in('id', Array.from(indicatorIds));

    // Type assertions
    const validUsers = (users || []) as any[];
    const validIndicators = (indicators || []) as any[];

    // Crear mapas para lookup rápido
    const usersMap = new Map(validUsers.map(u => [u.id, u]));
    const indicatorsMap = new Map(validIndicators.map(i => [i.id, i]));

    // Enriquecer registros
    const records = logRecords?.map((record: any) => ({
      ...record,
      user: record.user_id ? usersMap.get(record.user_id) : null,
      indicator: record.indicator_id ? indicatorsMap.get(record.indicator_id) : null,
      performed_by_user: record.performed_by ? usersMap.get(record.performed_by) : null
    }));

    console.log(`✅ ${records?.length || 0} registros enriquecidos para exportar`);

    // Generar CSV
    const headers = [
      'Fecha',
      'Hora',
      'Operación',
      'Usuario Email',
      'Usuario TradingView',
      'Indicador',
      'Pine ID',
      'Categoría',
      'Tier',
      'Estado',
      'Fuente',
      'Duración',
      'Admin Ejecutó',
      'Error',
      'Respuesta TradingView'
    ];

    const csvRows = [headers.join(',')];

    records?.forEach((record: any) => {
      const createdAt = new Date(record.created_at);
      const fecha = createdAt.toLocaleDateString('es-ES');
      const hora = createdAt.toLocaleTimeString('es-ES');

      const row = [
        fecha,
        hora,
        escapeCsvField(record.operation_type || 'N/A'),
        escapeCsvField(record.user?.email || 'N/A'),
        escapeCsvField(record.tradingview_username || record.user?.tradingview_username || 'N/A'),
        escapeCsvField(record.indicator?.name || 'N/A'),
        escapeCsvField(record.indicator?.pine_id || 'N/A'),
        escapeCsvField(record.indicator?.category || 'N/A'),
        escapeCsvField(record.indicator?.access_tier || 'N/A'),
        escapeCsvField(record.access_status || 'N/A'),
        escapeCsvField(record.access_source || 'N/A'),
        escapeCsvField(record.duration_type || 'N/A'),
        escapeCsvField(record.performed_by_user?.email || 'N/A'),
        escapeCsvField(record.error_message || ''),
        escapeCsvField(JSON.stringify(record.tradingview_response || {}))
      ];

      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');

    // Generar nombre de archivo con timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `historial-accesos-${timestamp}.csv`;

    console.log(`✅ CSV generado: ${filename} (${csvRows.length - 1} registros)`);

    // Retornar CSV
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error: any) {
    console.error('❌ Error en /api/admin/access-audit/export:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Función helper para escapar campos CSV
function escapeCsvField(field: string): string {
  if (!field) return '';
  
  // Si el campo contiene comas, comillas o saltos de línea, encerrarlo entre comillas
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    // Escapar comillas duplicándolas
    return `"${field.replace(/"/g, '""')}"`;
  }
  
  return field;
}

// Función helper para formatear fechas
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

