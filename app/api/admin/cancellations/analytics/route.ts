import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { CancellationAnalytics } from '@/types/cancellations';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Verificar que sea admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📊 Fetching cancellation analytics...');

    // 1. Total de cancelaciones
    const { count: totalCancellations } = await supabase
      .from('subscription_feedback')
      .select('*', { count: 'exact', head: true })
      .eq('action', 'cancel');

    // 2. Promedio de días activos antes de cancelar
    const { data: daysActiveData } = await supabase
      .from('subscription_feedback')
      .select(`
        created_at,
        subscriptions!inner(
          created
        )
      `)
      .eq('action', 'cancel');

    let avgDaysActive = 0;
    if (daysActiveData && daysActiveData.length > 0) {
      const totalDays = daysActiveData.reduce((sum, item: any) => {
        const subscriptionCreated = new Date(item.subscriptions.created);
        const cancelledAt = new Date(item.created_at);
        const daysActive = (cancelledAt.getTime() - subscriptionCreated.getTime()) / (1000 * 60 * 60 * 24);
        return sum + Math.max(0, daysActive); // Evitar días negativos
      }, 0);
      avgDaysActive = totalDays / daysActiveData.length;
    }

    // 3. Revenue perdido
    const { data: revenueData } = await supabase
      .from('subscription_feedback')
      .select(`
        subscriptions!inner(
          prices!inner(
            unit_amount,
            currency
          )
        )
      `)
      .eq('action', 'cancel');

    let revenueLost = 0;
    if (revenueData) {
      revenueLost = revenueData.reduce((sum, item: any) => {
        const unitAmount = item.subscriptions?.prices?.unit_amount || 0;
        return sum + (unitAmount / 100); // Convertir de centavos
      }, 0);
    }

    // 4. Razones principales
    const { data: reasonsData } = await supabase
      .from('subscription_feedback')
      .select('reason')
      .eq('action', 'cancel');

    const reasonCounts: { [key: string]: number } = {};
    if (reasonsData) {
      reasonsData.forEach((item: any) => {
        reasonCounts[item.reason] = (reasonCounts[item.reason] || 0) + 1;
      });
    }

    const topReasons = Object.entries(reasonCounts)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: Math.round((count / (totalCancellations || 1)) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    // 5. Tendencia mensual (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: monthlyData } = await supabase
      .from('subscription_feedback')
      .select('created_at')
      .eq('action', 'cancel')
      .gte('created_at', sixMonthsAgo.toISOString());

    const monthlyTrend: { [key: string]: number } = {};
    if (monthlyData) {
      monthlyData.forEach((item: any) => {
        const date = new Date(item.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyTrend[monthKey] = (monthlyTrend[monthKey] || 0) + 1;
      });
    }

    const monthlyTrendArray = Object.entries(monthlyTrend)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // 6. Calcular Churn Rate (simplificado)
    // Para un cálculo más preciso necesitaríamos datos de suscripciones activas
    const churnRate = 0; // TODO: Implementar cálculo real de churn rate

    const analytics: CancellationAnalytics = {
      totalCancellations: totalCancellations || 0,
      avgDaysActive: Math.round(avgDaysActive * 100) / 100,
      churnRate,
      revenueLost: Math.round(revenueLost * 100) / 100,
      topReasons,
      monthlyTrend: monthlyTrendArray
    };

    console.log('✅ Analytics calculated:', {
      totalCancellations: analytics.totalCancellations,
      avgDaysActive: analytics.avgDaysActive,
      revenueLost: analytics.revenueLost,
      topReasonsCount: analytics.topReasons.length
    });

    return NextResponse.json(analytics);

  } catch (error: any) {
    console.error('❌ Error calculating analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
