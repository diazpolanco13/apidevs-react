import { createClient } from '@/utils/supabase/server';

export default async function DashboardStats() {
  const supabase = createClient();

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

  const totalRevenueCents = revenueData?.reduce((sum, purchase) => sum + purchase.order_total_cents, 0) || 0;
  const totalRevenueUSD = (totalRevenueCents / 100).toFixed(2);

  // Fetch reactivation rate (example: count reactivated vs total legacy)
  const { count: reactivatedUsers, error: reactivatedError } = await supabase
    .from('legacy_users')
    .select('*', { count: 'exact' })
    .eq('reactivation_status', 'reactivated');

  const reactivationRate = totalLegacyUsers && reactivatedUsers
    ? ((reactivatedUsers / totalLegacyUsers) * 100).toFixed(2)
    : '0.00';

  if (usersError || purchasesError || revenueError || reactivatedError) {
    console.error('Error fetching dashboard stats:', usersError || purchasesError || revenueError || reactivatedError);
    return <p className="text-red-500">Error al cargar estadísticas del dashboard.</p>;
  }

  const stats = [
    { name: 'Usuarios Legacy', stat: totalLegacyUsers || 0, description: 'Total de usuarios migrados de WordPress' },
    { name: 'Compras Históricas', stat: totalPurchases || 0, description: 'Total de órdenes procesadas' },
    { name: 'Ingresos Totales (USD)', stat: `$${totalRevenueUSD}`, description: 'Ingresos válidos para métricas' },
    { name: 'Tasa de Reactivación', stat: `${reactivationRate}%`, description: 'Legacy users que se han reactivado' },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((item) => (
        <div key={item.name} className="bg-black/30 backdrop-blur-xl border border-apidevs-primary/20 rounded-lg px-4 py-5 shadow-lg sm:p-6">
          <dt className="text-sm font-medium text-gray-300 truncate">{item.name}</dt>
          <dd className="mt-1 text-3xl font-semibold text-white">{item.stat}</dd>
          <p className="mt-2 text-sm text-gray-400">{item.description}</p>
        </div>
      ))}
    </div>
  );
}