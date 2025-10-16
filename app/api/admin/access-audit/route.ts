import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkAdminPermission, PERMISSIONS } from '@/utils/admin/permissions';

// Force dynamic rendering (uses cookies for auth)
export const dynamic = 'force-dynamic';

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

    if (!user || !(await checkAdminPermission(user.id, PERMISSIONS.USERS_VIEW))) {
      return NextResponse.json({ error: 'No autorizado - Requiere permisos de auditoría' }, { status: 401 });
    }

    // Parsear query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
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

    // Enriquecer registros con datos de usuarios e indicadores (OPTIMIZADO: bulk queries)
    // Extraer IDs únicos
    const userIds = Array.from(new Set((records || []).map((r: any) => r.user_id).filter(Boolean)));
    const indicatorIds = Array.from(new Set((records || []).map((r: any) => r.indicator_id).filter(Boolean)));
    const performedByIds = Array.from(new Set((records || []).map((r: any) => r.performed_by).filter(Boolean)));
    const allUserIds = Array.from(new Set([...userIds, ...performedByIds]));

    // Hacer queries bulk
    const [usersData, indicatorsData] = await Promise.all([
      allUserIds.length > 0 
        ? supabase.from('users')
            .select('id, email, full_name, tradingview_username')
            .in('id', allUserIds)
        : Promise.resolve({ data: [] }),
      indicatorIds.length > 0
        ? supabase.from('indicators')
            .select('id, name, pine_id, category, access_tier')
            .in('id', indicatorIds)
        : Promise.resolve({ data: [] })
    ]);

    // Crear maps para lookup rápido
    const usersMap = new Map((usersData.data || []).map((u: any) => [u.id, u]));
    const indicatorsMap = new Map((indicatorsData.data || []).map((i: any) => [i.id, i]));

    // Enriquecer registros (sin queries adicionales)
    const enrichedRecords = (records || []).map((record: any) => ({
      ...record,
      user: record.user_id ? usersMap.get(record.user_id) || null : null,
      indicator: record.indicator_id ? indicatorsMap.get(record.indicator_id) || null : null,
      performed_by_user: record.performed_by ? usersMap.get(record.performed_by) || null : null
    }));

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

