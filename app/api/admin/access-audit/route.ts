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
 * - search: buscar por email o tradingview_username
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
    const search = searchParams.get('search');

    // Si hay búsqueda por email/username, primero obtener user_ids coincidentes
    let userIdsFromSearch: string[] = [];
    if (search && search.trim()) {
      console.log(`🔎 Buscando usuarios con: "${search}"`);
      
      const searchTerm = search.trim().toLowerCase();
      
      // Buscar en tabla users
      const { data: usersData } = await supabase
        .from('users')
        .select('id, email, tradingview_username')
        .or(`email.ilike.%${searchTerm}%,tradingview_username.ilike.%${searchTerm}%`);
      
      if (usersData && usersData.length > 0) {
        userIdsFromSearch = usersData.map((u: any) => u.id);
        console.log(`✅ ${userIdsFromSearch.length} usuarios encontrados`);
      }
      
      // Si no encontramos usuarios, retornar resultado vacío
      if (userIdsFromSearch.length === 0) {
        console.log('⚠️ No se encontraron usuarios con ese criterio');
        return NextResponse.json({
          success: true,
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          records: []
        });
      }
    }

    // Construir query base desde indicator_access_log (tabla de auditoría)
    let query = supabase
      .from('indicator_access_log')
      .select(
        `
        id,
        user_id,
        indicator_id,
        tradingview_username,
        operation_type,
        access_source,
        status,
        granted_at,
        expires_at,
        revoked_at,
        duration_type,
        subscription_id,
        payment_intent_id,
        indicator_access_id,
        tradingview_response,
        error_message,
        performed_by,
        notes,
        metadata,
        created_at
      `,
        { count: 'exact' }
      );

    // Aplicar filtro de búsqueda si hay user_ids encontrados
    if (userIdsFromSearch.length > 0) {
      query = query.in('user_id', userIdsFromSearch);
    }

    // Aplicar filtros de fecha sobre created_at (fecha de la operación en el log)
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
      query = query.eq('performed_by', grantedBy);
    }

    // Ordenar por fecha de creación descendente (más reciente primero) y aplicar paginación
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: records, error, count } = await query;

    if (error) {
      console.error('❌ Error obteniendo historial:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ ${records?.length || 0} registros obtenidos de ${count || 0} totales`);

    // Enriquecer registros con datos de usuarios e indicadores
    const enrichedRecords = await Promise.all(
      (records || []).map(async (record: any) => {
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

        // Obtener datos del usuario que ejecutó la operación
        let performedByUser = null;
        if (record.performed_by) {
          const { data: performedByData } = await supabase
            .from('users')
            .select('id, email, full_name')
            .eq('id', record.performed_by)
            .maybeSingle();
          performedByUser = performedByData;
        }

        return {
          ...record,
          user,
          indicator,
          performed_by_user: performedByUser
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

