import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { CancellationDetail, CancellationFilters } from '@/types/cancellations';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar que sea admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    
    // Parsear filtros de la URL
    const filters: CancellationFilters = {
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      reason: searchParams.get('reason') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'created_at',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    // Obteniendo cancelaciones con filtros

    // Construir query base - Corregida para usar relaciones correctas
    let query = supabase
      .from('subscription_feedback')
      .select(`
        id,
        subscription_id,
        reason,
        feedback,
        action,
        created_at,
        subscriptions!inner(
          id,
          status,
          created,
          user_id,
          prices(
            unit_amount,
            currency,
            products(
              name
            )
          )
        )
      `)
      .eq('action', 'cancel');

    // Aplicar filtros
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }
    
    if (filters.reason) {
      query = query.eq('reason', filters.reason);
    }
    
    if (filters.search) {
      query = query.or(`subscription_id.ilike.%${filters.search}%`);
    }

    // Aplicar ordenamiento
    const sortColumn = filters.sortBy === 'days_active' ? 'created_at' : filters.sortBy!;
    query = query.order(sortColumn, { ascending: filters.sortOrder === 'asc' });

    // Aplicar paginación
    query = query.range(filters.offset!, filters.offset! + filters.limit! - 1);

    const { data: cancellations, error } = await query;

    // Datos de cancelaciones obtenidos

    if (error) {
      console.error('❌ Error fetching cancellations:', error);
      return NextResponse.json({ error: 'Error fetching cancellations' }, { status: 500 });
    }

    // Obtener emails de usuarios por separado
    const userIds = Array.from(new Set((cancellations || []).map((item: any) => item.subscriptions?.user_id).filter(Boolean)));
    
    let userEmails: { [key: string]: string } = {};
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, email')
        .in('id', userIds);
      
      userEmails = (users || []).reduce((acc: any, user: any) => {
        acc[user.id] = user.email;
        return acc;
      }, {});
    }

    // Transformar datos
    const transformedCancellations: CancellationDetail[] = (cancellations || []).map((item: any) => {
      const subscription = item.subscriptions;
      const subscriptionCreated = new Date(subscription.created);
      const cancelledAt = new Date(item.created_at);
      const daysActive = (cancelledAt.getTime() - subscriptionCreated.getTime()) / (1000 * 60 * 60 * 24);
      const unitAmount = subscription.prices?.unit_amount || 0;
      const revenueLost = unitAmount / 100; // Convertir de centavos

      return {
        id: item.id,
        subscription_id: item.subscription_id,
        reason: item.reason,
        feedback: item.feedback || '',
        action: item.action,
        created_at: item.created_at,
        user_email: userEmails[subscription.user_id] || 'N/A',
        subscription_created: subscription.created,
        subscription_status: subscription.status,
        product_name: subscription.prices?.products?.name || 'N/A',
        unit_amount: unitAmount,
        currency: subscription.prices?.currency || 'USD',
        days_active: Math.round(daysActive * 100) / 100, // Redondear a 2 decimales
        revenue_lost: Math.round(revenueLost * 100) / 100
      };
    });

    // Obtener total para paginación
    const { count: totalCount } = await supabase
      .from('subscription_feedback')
      .select('*', { count: 'exact', head: true })
      .eq('action', 'cancel');

    // Cancelaciones procesadas exitosamente

    return NextResponse.json({
      cancellations: transformedCancellations,
      totalCount: totalCount || 0,
      filters
    });

  } catch (error: any) {
    console.error('❌ Error in cancellations API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
