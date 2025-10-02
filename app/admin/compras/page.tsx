import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { Package, AlertCircle } from 'lucide-react';
import PurchasesHeader from '@/components/admin/purchases/PurchasesHeader';
import PurchasesTabs from '@/components/admin/purchases/PurchasesTabs';
import OverviewTab from '@/components/admin/purchases/tabs/OverviewTab';
import SubscriptionsTab from '@/components/admin/purchases/tabs/SubscriptionsTab';
import OneTimeTab from '@/components/admin/purchases/tabs/OneTimeTab';
import RefundsTab from '@/components/admin/purchases/tabs/RefundsTab';
import AnalyticsTab from '@/components/admin/purchases/tabs/AnalyticsTab';
import AllPurchasesTab from '@/components/admin/purchases/tabs/AllPurchasesTab';
import { PurchaseMetrics } from '@/types/purchases';

export const metadata: Metadata = {
  title: 'Compras | Admin Dashboard',
  description: 'Gestión completa de compras, suscripciones y analytics'
};

// ==================== TYPES ====================
interface PurchaseRow {
  id: string;
  order_number: string;
  order_total_cents: number;
  refund_amount_cents?: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  order_date: string;
  customer_email: string;
  product_name: string;
  is_lifetime_purchase: boolean;
  legacy_user_id?: string;
  [key: string]: any;
}

// ==================== DATA FETCHING ====================

async function getPurchaseMetrics(): Promise<PurchaseMetrics | null> {
  try {
    const supabase = createClient();

    // Obtener rango de fechas (mes actual)
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Mes anterior para comparación
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Query mes actual con timeout y manejo de errores
    const { data: currentMonthPurchases, error: currentError } = await Promise.race([
      supabase
        .from('purchases')
        .select('*')
        .gte('created_at', firstDayOfMonth.toISOString())
        .lte('created_at', lastDayOfMonth.toISOString())
        .eq('order_status', 'completed'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]) as { data: PurchaseRow[] | null, error: any };

    if (currentError) {
      console.error('Error fetching current month purchases:', currentError);
      return null;
    }

    // Query mes anterior con timeout
    const { data: lastMonthPurchases, error: lastError } = await Promise.race([
      supabase
        .from('purchases')
        .select('*')
        .gte('created_at', firstDayOfLastMonth.toISOString())
        .lte('created_at', lastDayOfLastMonth.toISOString())
        .eq('order_status', 'completed'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]) as { data: PurchaseRow[] | null, error: any };

    if (lastError) {
      console.error('Error fetching last month purchases:', lastError);
    }

    // Calcular métricas mes actual
    const totalRevenue = currentMonthPurchases?.reduce((sum, p) => {
      const amount = p.order_total_cents - (p.refund_amount_cents || 0);
      return sum + amount;
    }, 0) || 0;

    const totalPurchases = currentMonthPurchases?.length || 0;
    const averageTicket = totalPurchases > 0 ? totalRevenue / totalPurchases : 0;

    // MRR (suscripciones activas - solo recurrentes, no lifetime)
    const mrr = currentMonthPurchases?.reduce((sum, p) => {
      if (!p.is_lifetime_purchase && p.order_status === 'completed') {
        return sum + p.order_total_cents;
      }
      return sum;
    }, 0) || 0;

    // Calcular métricas mes anterior
    const lastMonthRevenue = lastMonthPurchases?.reduce((sum, p) => {
      const amount = p.order_total_cents - (p.refund_amount_cents || 0);
      return sum + amount;
    }, 0) || 0;

    const lastMonthPurchasesCount = lastMonthPurchases?.length || 0;
    const lastMonthAvgTicket = lastMonthPurchasesCount > 0 
      ? lastMonthRevenue / lastMonthPurchasesCount 
      : 0;

    const lastMonthMRR = lastMonthPurchases?.reduce((sum, p) => {
      if (!p.is_lifetime_purchase && p.order_status === 'completed') {
        return sum + p.order_total_cents;
      }
      return sum;
    }, 0) || 0;

    // Calcular cambios porcentuales (MoM)
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // Desglose por tipo (usando is_lifetime_purchase)
    const lifetimePurchases = currentMonthPurchases?.filter(p => p.is_lifetime_purchase === true) || [];
    const recurringPurchases = currentMonthPurchases?.filter(p => p.is_lifetime_purchase === false) || [];
    
    const breakdown = {
      subscription: {
        count: recurringPurchases.length,
        revenue: recurringPurchases.reduce((sum, p) => sum + (p.order_total_cents - (p.refund_amount_cents || 0)), 0)
      },
      oneTime: {
        count: 0,
        revenue: 0
      },
      lifetime: {
        count: lifetimePurchases.length,
        revenue: lifetimePurchases.reduce((sum, p) => sum + (p.order_total_cents - (p.refund_amount_cents || 0)), 0)
      }
    };

    const metrics: PurchaseMetrics = {
      totalRevenue: totalRevenue / 100, // Convertir de centavos a dólares
      totalPurchases,
      averageTicket: averageTicket / 100,
      mrr: mrr / 100,
      monthOverMonth: {
        revenue: calculateChange(totalRevenue, lastMonthRevenue),
        purchases: calculateChange(totalPurchases, lastMonthPurchasesCount),
        mrr: calculateChange(mrr, lastMonthMRR),
        averageTicket: calculateChange(averageTicket, lastMonthAvgTicket)
      },
      breakdown: {
        subscription: {
          count: breakdown.subscription.count,
          revenue: breakdown.subscription.revenue / 100
        },
        oneTime: {
          count: breakdown.oneTime.count,
          revenue: breakdown.oneTime.revenue / 100
        },
        lifetime: {
          count: breakdown.lifetime.count,
          revenue: breakdown.lifetime.revenue / 100
        }
      },
      period: {
        from: firstDayOfMonth.toISOString(),
        to: lastDayOfMonth.toISOString()
      }
    };

    return metrics;

  } catch (error) {
    console.error('Error in getPurchaseMetrics:', error);
    return null;
  }
}

// ==================== DATA FOR SUBSCRIPTIONS ====================

async function getSubscriptionsData() {
  try {
    const supabase = createClient();

    // Obtener todas las suscripciones (no lifetime)
    const { data: subscriptions } = await Promise.race([
      supabase
        .from('purchases')
        .select('*')
        .eq('is_lifetime_purchase', false)
        .eq('order_status', 'completed')
        .order('created_at', { ascending: false }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]) as { data: PurchaseRow[] | null };

    const allSubscriptions = subscriptions || [];

    // Fecha actual y mes anterior
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Suscripciones del mes actual
    const currentMonthSubs = allSubscriptions.filter(s => 
      new Date(s.created_at) >= firstDayOfMonth
    );

    // Suscripciones del mes anterior
    const lastMonthSubs = allSubscriptions.filter(s => {
      const date = new Date(s.created_at);
      return date >= firstDayOfLastMonth && date <= lastDayOfLastMonth;
    });

    // Calcular MRR (Monthly Recurring Revenue)
    const mrr = currentMonthSubs.reduce((sum, s) => sum + s.order_total_cents, 0) / 100;
    const lastMonthMRR = lastMonthSubs.reduce((sum, s) => sum + s.order_total_cents, 0) / 100;

    // ARR (Annual Recurring Revenue)
    const arr = mrr * 12;

    // Suscripciones activas (todas las completadas)
    const activeSubscriptions = allSubscriptions.length;

    // Churn Rate (cancelaciones / activas del mes anterior)
    // Por ahora, calculamos basado en la diferencia
    const churnRate = lastMonthSubs.length > 0 
      ? Math.max(0, ((lastMonthSubs.length - currentMonthSubs.length) / lastMonthSubs.length) * 100)
      : 0;

    // AVG LTV (Lifetime Value promedio)
    const avgLTV = allSubscriptions.length > 0
      ? allSubscriptions.reduce((sum, s) => sum + (s.order_total_cents / 100), 0) / allSubscriptions.length
      : 0;

    // Net Revenue Retention (simplificado)
    const netRevenueRetention = lastMonthMRR > 0 ? (mrr / lastMonthMRR) * 100 : 100;

    // Tabla de suscripciones para mostrar
    const subscriptionsTable = allSubscriptions.map(s => ({
      id: s.id,
      order_number: s.order_number,
      customer_id: s.legacy_user_id || s.id,
      customer_email: s.customer_email,
      customer_name: s.customer_email.split('@')[0],
      amount: s.order_total_cents,
      amount_refunded: s.refund_amount_cents,
      currency: 'USD',
      status: s.order_status as any,
      type: 'subscription' as any,
      product_name: s.product_name || 'Suscripción',
      created_at: s.created_at,
      payment_method: (s.payment_method || 'stripe') as any
    }));

    return {
      metrics: {
        mrr,
        arr,
        churnRate,
        avgLTV,
        activeSubscriptions,
        netRevenueRetention,
        monthOverMonth: {
          mrr: lastMonthMRR > 0 ? ((mrr - lastMonthMRR) / lastMonthMRR) * 100 : 0,
          activeSubscriptions: lastMonthSubs.length > 0 
            ? ((currentMonthSubs.length - lastMonthSubs.length) / lastMonthSubs.length) * 100 
            : 0
        }
      },
      subscriptions: subscriptionsTable
    };

  } catch (error) {
    console.error('Error in getSubscriptionsData:', error);
    return {
      metrics: {
        mrr: 0,
        arr: 0,
        churnRate: 0,
        avgLTV: 0,
        activeSubscriptions: 0,
        netRevenueRetention: 100,
        monthOverMonth: {
          mrr: 0,
          activeSubscriptions: 0
        }
      },
      subscriptions: []
    };
  }
}

// ==================== DATA FOR OVERVIEW ====================

async function getOverviewData() {
  try {
    const supabase = createClient();

    // Timeline data (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentPurchases } = await Promise.race([
      supabase
        .from('purchases')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .eq('order_status', 'completed'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]) as { data: PurchaseRow[] | null };

    // Agrupar por día para el gráfico
    const timelineData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const dayPurchases = recentPurchases?.filter(p => 
        p.created_at.split('T')[0] === dateStr
      ) || [];
      
      const revenue = dayPurchases.reduce((sum, p) => 
        sum + (p.order_total_cents - (p.refund_amount_cents || 0)), 0
      ) / 100;

      return {
        date: dateStr,
        revenue,
        purchases: dayPurchases.length
      };
    });

    // Top productos
    const productSales: { [key: string]: { sales: number; revenue: number } } = {};
    recentPurchases?.forEach(p => {
      const productName = p.product_name || 'Producto sin nombre';
      if (!productSales[productName]) {
        productSales[productName] = { sales: 0, revenue: 0 };
      }
      productSales[productName].sales += 1;
      productSales[productName].revenue += (p.order_total_cents - (p.refund_amount_cents || 0)) / 100;
    });

    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    // Desglose por tipo
    const lifetimePurchases = recentPurchases?.filter(p => p.is_lifetime_purchase === true) || [];
    const subscriptionPurchases = recentPurchases?.filter(p => p.is_lifetime_purchase === false) || [];

    const breakdown = {
      subscription: {
        count: subscriptionPurchases.length,
        revenue: subscriptionPurchases.reduce((sum, p) => sum + (p.order_total_cents - (p.refund_amount_cents || 0)), 0) / 100
      },
      oneTime: {
        count: 0,
        revenue: 0
      },
      lifetime: {
        count: lifetimePurchases.length,
        revenue: lifetimePurchases.reduce((sum, p) => sum + (p.order_total_cents - (p.refund_amount_cents || 0)), 0) / 100
      }
    };

    // Todas las compras para la tabla
    const allPurchases = (recentPurchases || []).map(p => ({
      id: p.id,
      order_number: p.order_number,
      customer_id: p.legacy_user_id || p.id,
      customer_email: p.customer_email,
      customer_name: p.customer_email.split('@')[0], // Usar email como nombre temporal
      amount: p.order_total_cents,
      amount_refunded: p.refund_amount_cents,
      currency: 'USD',
      status: p.order_status as any,
      type: p.is_lifetime_purchase ? 'lifetime' : 'subscription' as any,
      product_name: p.product_name || 'Producto sin nombre',
      created_at: p.created_at,
      payment_method: (p.payment_method || 'stripe') as any
    }));

    return {
      timeline: timelineData,
      topProducts,
      breakdown,
      allPurchases
    };
  } catch (error) {
    console.error('Error in getOverviewData:', error);
    return {
      timeline: [],
      topProducts: [],
      breakdown: {
        subscription: { count: 0, revenue: 0 },
        oneTime: { count: 0, revenue: 0 },
        lifetime: { count: 0, revenue: 0 }
      },
      allPurchases: []
    };
  }
}

// ==================== PAGE ====================

export default async function PurchasesPage() {
  // Intentar obtener métricas con manejo de errores
  let metrics: PurchaseMetrics | null = null;
  let overviewData: Awaited<ReturnType<typeof getOverviewData>> = {
    timeline: [],
    topProducts: [],
    breakdown: {
      subscription: { count: 0, revenue: 0 },
      oneTime: { count: 0, revenue: 0 },
      lifetime: { count: 0, revenue: 0 }
    },
    allPurchases: []
  };
  let subscriptionsData: Awaited<ReturnType<typeof getSubscriptionsData>> = {
    metrics: {
      mrr: 0,
      arr: 0,
      churnRate: 0,
      avgLTV: 0,
      activeSubscriptions: 0,
      netRevenueRetention: 100,
      monthOverMonth: {
        mrr: 0,
        activeSubscriptions: 0
      }
    },
    subscriptions: []
  };

  try {
    metrics = await getPurchaseMetrics();
  } catch (error: any) {
    console.error('Error loading metrics:', error?.message || error);
    // No lanzar error, solo continuar con datos vacíos
  }

  try {
    overviewData = await getOverviewData();
  } catch (error: any) {
    console.error('Error loading overview data:', error?.message || error);
    // No lanzar error, solo continuar con datos vacíos
  }

  try {
    subscriptionsData = await getSubscriptionsData();
  } catch (error: any) {
    console.error('Error loading subscriptions data:', error?.message || error);
    // No lanzar error, solo continuar con datos vacíos
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Compras
        </h1>
        <p className="text-gray-400">
          Gestión completa de compras, suscripciones y analytics
        </p>
      </div>

      {/* Tabs */}
      <PurchasesTabs
        metrics={metrics}
        overviewView={<OverviewTab overviewData={overviewData} />}
        allPurchasesView={<AllPurchasesTab purchases={overviewData.allPurchases} />}
        subscriptionsView={<SubscriptionsTab subscriptionsData={subscriptionsData} />}
        oneTimeView={<OneTimeTab />}
        refundsView={<RefundsTab />}
        analyticsView={<AnalyticsTab />}
      />
    </div>
  );
}

