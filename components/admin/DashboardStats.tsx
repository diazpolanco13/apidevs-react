import { createClient } from '@/utils/supabase/server';
import { Users, ShoppingCart, DollarSign, Zap } from 'lucide-react';

export default async function DashboardStats() {
  const supabase = createClient();

  try {
    // Fetch total legacy users
    const { count: totalLegacyUsers, error: usersError } = await supabase
      .from('legacy_users')
      .select('*', { count: 'exact' });

    // Fetch total purchases
    const { count: totalPurchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('*', { count: 'exact' });

  // Fetch total revenue (sum of order_total_cents for revenue_valid_for_metrics = true)
  const { data: revenueData, error: revenueError } = await supabase
    .from('purchases')
    .select('order_total_cents')
    .eq('revenue_valid_for_metrics', true);

  const totalRevenueCents = revenueData?.reduce((sum: number, purchase: any) => sum + (purchase.order_total_cents || 0), 0) || 0;
    const totalRevenueUSD = (totalRevenueCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Fetch reactivation rate (count reactivated vs total legacy)
    const { count: reactivatedUsers, error: reactivatedError } = await supabase
      .from('legacy_users')
      .select('*', { count: 'exact' })
      .eq('reactivation_status', 'reactivated');

    const reactivationRate = totalLegacyUsers && reactivatedUsers
      ? ((reactivatedUsers / totalLegacyUsers) * 100).toFixed(1)
      : '0.0';

    // Fetch active subscriptions count
    const { count: activeSubscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact' })
      .eq('status', 'active');

    if (usersError || purchasesError || revenueError || reactivatedError || subscriptionsError) {
      console.error('Error fetching dashboard stats:', { usersError, purchasesError, revenueError, reactivatedError, subscriptionsError });
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">Error al cargar estadísticas del dashboard. Revisa la conexión a la base de datos.</p>
        </div>
      );
    }

    const stats = [
      { 
        name: 'Usuarios Legacy', 
        stat: totalLegacyUsers?.toLocaleString() || '0', 
        description: 'Migrados desde WordPress',
        icon: Users,
        change: '+0%'
      },
      { 
        name: 'Compras Históricas', 
        stat: totalPurchases?.toLocaleString() || '0', 
        description: 'Órdenes procesadas',
        icon: ShoppingCart,
        change: totalPurchases?.toString() || '0'
      },
      { 
        name: 'Ingresos Totales', 
        stat: `$${totalRevenueUSD}`, 
        description: 'Revenue válido para métricas',
        icon: DollarSign,
        change: 'USD'
      },
      { 
        name: 'Suscripciones Activas', 
        stat: activeSubscriptions?.toLocaleString() || '0', 
        description: 'Usuarios con planes activos',
        icon: Zap,
        change: `${activeSubscriptions || 0} activos`
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-apidevs-primary/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-8 h-8 text-apidevs-primary" />
                <span className="text-xs text-gray-400">{stat.change}</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.stat}</div>
              <div className="text-sm text-gray-400">{stat.name}</div>
            </div>
          );
        })}
      </div>
    );

  } catch (error) {
    console.error('Unexpected error in DashboardStats:', error);
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">Error inesperado al cargar estadísticas. Contacta al administrador del sistema.</p>
      </div>
    );
  }
}