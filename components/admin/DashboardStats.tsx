import { createClient } from '@/utils/supabase/server';
import { Users, UserPlus, RefreshCw, Zap, DollarSign, Activity, ShoppingCart, TrendingUp, Wallet, CreditCard, Package } from 'lucide-react';
import DashboardTabs from './DashboardTabs';

export default async function DashboardStats() {
  const supabase = await createClient();

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // ⚡ Queries paralelas optimizadas
    const [
      usersData,
      subscriptionsData,
      purchasesData,
      indicatorAccessData,
      legacyReactivatedData,
      legacyPendingData,
      mrrData
    ] = await Promise.all([
      // 1. Usuarios registrados
      supabase
        .from('users')
        .select('customer_since, total_lifetime_spent'),
      
      // 2. Suscripciones activas (mensual/anual)
      supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
      
      // 3. Compras totales y Lifetime
      supabase
        .from('purchases')
        .select('is_lifetime_purchase, payment_status, order_date'),
      
      // 4. Indicadores activos
      supabase
        .from('indicator_access')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
      
      // 5. Legacy reactivados
      supabase
        .from('legacy_users')
        .select('*', { count: 'exact', head: true })
        .eq('reactivation_status', 'reactivated'),
      
      // 6. Legacy pendientes
      supabase
        .from('legacy_users')
        .select('*', { count: 'exact', head: true })
        .eq('reactivation_status', 'pending'),
      
      // 7. MRR: suscripciones activas con precios
      supabase
        .from('subscriptions')
        .select(`
          id,
          status,
          prices (
            unit_amount,
            interval,
            interval_count
          )
        `)
        .eq('status', 'active')
    ]);

    // === PROCESAR DATOS ===
    
    // Usuarios
    const allUsers = (usersData.data || []) as any[];
    const totalUsers = allUsers.length;
    const newUsers30d = allUsers.filter(u => u.customer_since && u.customer_since >= thirtyDaysAgo).length;
    const usersWithLtv = allUsers.filter(u => Number(u.total_lifetime_spent || 0) > 0);
    const totalLtv = usersWithLtv.reduce((sum, u) => sum + Number(u.total_lifetime_spent || 0), 0) / 100;
    const avgLtv = usersWithLtv.length > 0 ? totalLtv / usersWithLtv.length : 0;
    const payingUsers = usersWithLtv.length;

    // Suscripciones
    const activeRecurringSubscriptions = subscriptionsData.count || 0;

    // Compras
    const allPurchases = (purchasesData.data || []) as any[];
    const totalPurchases = allPurchases.filter(p => p.payment_status === 'paid').length;
    const lifetimePurchases = allPurchases.filter(p => p.is_lifetime_purchase === true && p.payment_status === 'paid').length;
    const purchases30d = allPurchases.filter(p => p.payment_status === 'paid' && p.order_date >= thirtyDaysAgo).length;
    
    // Total de suscripciones = recurrentes + Lifetime
    const totalActiveSubscriptions = activeRecurringSubscriptions + lifetimePurchases;

    // Indicadores
    const activeIndicatorAccess = indicatorAccessData.count || 0;

    // Legacy
    const legacyReactivated = legacyReactivatedData.count || 0;
    const legacyPending = legacyPendingData.count || 0;

    // MRR (Monthly Recurring Revenue)
    let mrrCents = 0;
    if (mrrData.data) {
      mrrData.data.forEach((sub: any) => {
        const price = sub.prices;
        if (price && price.unit_amount) {
          if (price.interval === 'month') {
            mrrCents += price.unit_amount;
          } else if (price.interval === 'year') {
            mrrCents += Math.round(price.unit_amount / 12);
          }
        }
      });
    }
    const mrr = mrrCents / 100;

    // === ESTRUCTURAS DE DATOS ===
    
    // FILA 1: 6 Cards Principales
    const mainStats = [
      { 
        name: 'Total Usuarios', 
        stat: totalUsers.toLocaleString(), 
        icon: Users,
        color: 'text-blue-400',
        bgColor: 'from-blue-500/20 to-blue-600/10'
      },
      { 
        name: 'Nuevos (30d)', 
        stat: newUsers30d.toLocaleString(), 
        icon: UserPlus,
        color: 'text-green-400',
        bgColor: 'from-green-500/20 to-green-600/10'
      },
      { 
        name: 'Legacy Reactivados', 
        stat: legacyReactivated.toLocaleString(), 
        icon: RefreshCw,
        color: 'text-purple-400',
        bgColor: 'from-purple-500/20 to-purple-600/10'
      },
      { 
        name: 'Suscripciones', 
        stat: totalActiveSubscriptions.toLocaleString(), 
        icon: Zap,
        color: 'text-yellow-400',
        bgColor: 'from-yellow-500/20 to-yellow-600/10'
      },
      { 
        name: 'MRR', 
        stat: `$${mrr.toFixed(2)}`, 
        icon: DollarSign,
        color: 'text-emerald-400',
        bgColor: 'from-emerald-500/20 to-emerald-600/10'
      },
      { 
        name: 'Accesos TradingView', 
        stat: activeIndicatorAccess.toLocaleString(), 
        icon: Activity,
        color: 'text-cyan-400',
        bgColor: 'from-cyan-500/20 to-cyan-600/10'
      },
    ];

    // Datos para los tabs
    const subscriptionsBreakdown = {
      total: totalActiveSubscriptions,
      recurring: activeRecurringSubscriptions,
      lifetime: lifetimePurchases
    };

    const revenueBreakdown = {
      mrr,
      totalLtv,
      avgLtv,
      payingUsers
    };

    const purchasesBreakdown = {
      total: totalPurchases,
      last30d: purchases30d,
      lifetime: lifetimePurchases
    };

    const legacyBreakdown = {
      reactivated: legacyReactivated,
      pending: legacyPending,
      total: legacyReactivated + legacyPending
    };

    return (
      <div className="space-y-6">
        {/* FILA 1: 6 Cards Compactas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {mainStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className={`bg-gradient-to-br ${stat.bgColor} backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:border-apidevs-primary/50 transition-all`}
              >
                <Icon className={`w-6 h-6 ${stat.color} mb-3`} />
                <div className="text-2xl font-bold text-white mb-1">{stat.stat}</div>
                <div className="text-xs text-gray-400">{stat.name}</div>
              </div>
            );
          })}
        </div>

        {/* FILA 2: Tabs con Desglose Detallado (similar a Gestión de Usuarios) */}
        <DashboardTabs 
          subscriptions={subscriptionsBreakdown}
          revenue={revenueBreakdown}
          purchases={purchasesBreakdown}
          legacy={legacyBreakdown}
        />
      </div>
    );

  } catch (error) {
    console.error('Error en DashboardStats:', error);
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">Error al cargar estadísticas del dashboard.</p>
      </div>
    );
  }
}
