import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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

    // Construir query
    let query = supabase
      .from('indicator_access')
      .select(
        `
        id,
        status,
        granted_at,
        expires_at,
        revoked_at,
        duration_type,
        access_source,
        error_message,
        renewal_count,
        created_at,
        user:users!indicator_access_user_id_fkey (
          email,
          full_name,
          tradingview_username
        ),
        indicator:indicators!indicator_access_indicator_id_fkey (
          name,
          pine_id,
          category,
          access_tier
        ),
        granted_by_user:users!indicator_access_granted_by_fkey (
          email,
          full_name
        )
      `
      )
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (date_from) query = query.gte('created_at', date_from);
    if (date_to) query = query.lte('created_at', date_to);
    if (access_source) query = query.eq('access_source', access_source);
    if (status) query = query.eq('status', status);
    if (user_id) query = query.eq('user_id', user_id);
    if (indicator_id) query = query.eq('indicator_id', indicator_id);

    const { data: records, error } = await query;

    if (error) {
      console.error('❌ Error obteniendo registros:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ ${records?.length || 0} registros para exportar`);

    // Generar CSV
    const headers = [
      'Fecha',
      'Hora',
      'Usuario Email',
      'Usuario TradingView',
      'Indicador',
      'Pine ID',
      'Categoría',
      'Tier',
      'Estado',
      'Fuente',
      'Duración',
      'Fecha Concesión',
      'Fecha Expiración',
      'Fecha Revocación',
      'Renovaciones',
      'Admin Concedió',
      'Error'
    ];

    const csvRows = [headers.join(',')];

    records?.forEach((record) => {
      const createdAt = new Date(record.created_at);
      const fecha = createdAt.toLocaleDateString('es-ES');
      const hora = createdAt.toLocaleTimeString('es-ES');

      const row = [
        fecha,
        hora,
        escapeCsvField(record.user?.email || 'N/A'),
        escapeCsvField(record.user?.tradingview_username || 'N/A'),
        escapeCsvField(record.indicator?.name || 'N/A'),
        escapeCsvField(record.indicator?.pine_id || 'N/A'),
        escapeCsvField(record.indicator?.category || 'N/A'),
        escapeCsvField(record.indicator?.access_tier || 'N/A'),
        record.status,
        record.access_source,
        record.duration_type || 'N/A',
        record.granted_at ? formatDate(record.granted_at) : 'N/A',
        record.expires_at ? formatDate(record.expires_at) : 'N/A',
        record.revoked_at ? formatDate(record.revoked_at) : 'N/A',
        record.renewal_count?.toString() || '0',
        escapeCsvField(record.granted_by_user?.email || 'N/A'),
        escapeCsvField(record.error_message || '')
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

