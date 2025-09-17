import { createClient } from '@/utils/supabase/server';

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

    const totalRevenueCents = revenueData?.reduce((sum, purchase) => sum + (purchase.order_total_cents || 0), 0) || 0;
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
        color: 'text-green-500',
        bgColor: 'bg-green-500/10 border-green-500/20'
      },
      { 
        name: 'Compras Históricas', 
        stat: totalPurchases?.toLocaleString() || '0', 
        description: 'Órdenes procesadas',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10 border-blue-500/20'
      },
      { 
        name: 'Ingresos Totales', 
        stat: `$${totalRevenueUSD}`, 
        description: 'Revenue válido para métricas',
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10 border-purple-500/20'
      },
      { 
        name: 'Suscripciones Activas', 
        stat: activeSubscriptions?.toLocaleString() || '0', 
        description: 'Usuarios con planes activos',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10 border-yellow-500/20'
      },
    ];

    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className={`${item.bgColor} backdrop-blur-xl border rounded-lg px-4 py-5 shadow-lg sm:p-6 transition-all duration-200 hover:scale-105`}>
            <dt className="text-sm font-medium text-gray-300 truncate">{item.name}</dt>
            <dd className={`mt-1 text-3xl font-bold ${item.color}`}>{item.stat}</dd>
            <p className="mt-2 text-sm text-gray-400">{item.description}</p>
          </div>
        ))}
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