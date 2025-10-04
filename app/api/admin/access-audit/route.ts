import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/admin/access-audit
 * 
 * Obtiene historial completo de operaciones de acceso a indicadores
 * con paginación y filtros avanzados.
 * 
 * Query params:
 * - page: número de página (default: 1)
 * - limit: registros por página (default: 50, max: 100)
 * - date_from: fecha desde (ISO format)
 * - date_to: fecha hasta (ISO format)
 * - access_source: manual, purchase, trial, bulk, renewal, promo
 * - status: pending, granted, active, expired, revoked, failed
 * - user_id: filtrar por usuario específico
 * - indicator_id: filtrar por indicador específico
 * - granted_by: filtrar por admin que concedió
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

    console.log('🔍 Obteniendo historial de accesos...');

    // Parsear query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = (page - 1) * limit;

    // Filtros opcionales
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const accessSource = searchParams.get('access_source');
    const status = searchParams.get('status');
    const userId = searchParams.get('user_id');
    const indicatorId = searchParams.get('indicator_id');
    const grantedBy = searchParams.get('granted_by');

    // Construir query base (sin foreign keys porque pueden ser usuarios legacy)
    let query = supabase
      .from('indicator_access')
      .select(
        `
        id,
        user_id,
        indicator_id,
        tradingview_username,
        status,
        granted_at,
        expires_at,
        revoked_at,
        duration_type,
        access_source,
        error_message,
        tradingview_response,
        renewal_count,
        last_renewed_at,
        granted_by,
        revoked_by,
        created_at,
        updated_at
      `,
        { count: 'exact' }
      );

    // Aplicar filtros
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    if (accessSource) {
      query = query.eq('access_source', accessSource);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (indicatorId) {
      query = query.eq('indicator_id', indicatorId);
    }

    if (grantedBy) {
      query = query.eq('granted_by', grantedBy);
    }

    // Ordenar por fecha descendente y aplicar paginación
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: records, error, count } = await query;

    if (error) {
      console.error('❌ Error obteniendo historial:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ ${records?.length || 0} registros obtenidos de ${count || 0} totales`);

    // Enriquecer registros con datos de usuarios e indicadores
    const enrichedRecords = await Promise.all(
      (records || []).map(async (record) => {
        // Obtener datos del usuario (puede ser null si es legacy sin registro)
        let user = null;
        if (record.user_id) {
          const { data: userData } = await supabase
            .from('users')
            .select('id, email, full_name, tradingview_username')
            .eq('id', record.user_id)
            .maybeSingle();
          user = userData;
        }

        // Obtener datos del indicador
        let indicator = null;
        if (record.indicator_id) {
          const { data: indicatorData } = await supabase
            .from('indicators')
            .select('id, name, pine_id, category, access_tier')
            .eq('id', record.indicator_id)
            .maybeSingle();
          indicator = indicatorData;
        }

        // Obtener datos del admin que concedió
        let grantedByUser = null;
        if (record.granted_by) {
          const { data: grantedByData } = await supabase
            .from('users')
            .select('id, email, full_name')
            .eq('id', record.granted_by)
            .maybeSingle();
          grantedByUser = grantedByData;
        }

        // Obtener datos del admin que revocó
        let revokedByUser = null;
        if (record.revoked_by) {
          const { data: revokedByData } = await supabase
            .from('users')
            .select('id, email, full_name')
            .eq('id', record.revoked_by)
            .maybeSingle();
          revokedByUser = revokedByData;
        }

        return {
          ...record,
          user,
          indicator,
          granted_by_user: grantedByUser,
          revoked_by_user: revokedByUser
        };
      })
    );

    // Calcular información de paginación
    const totalPages = count ? Math.ceil(count / limit) : 0;
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      success: true,
      page,
      limit,
      total: count || 0,
      totalPages,
      hasNextPage,
      hasPreviousPage,
      records: enrichedRecords
    });
  } catch (error: any) {
    console.error('❌ Error en /api/admin/access-audit:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

