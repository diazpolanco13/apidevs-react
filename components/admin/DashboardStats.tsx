import { createClient } from '@/utils/supabase/server';
import { Users, UserPlus, RefreshCw, Zap, DollarSign, Activity, AlertCircle, TrendingUp, Eye, Wallet } from 'lucide-react';

export default async function DashboardStats() {
  const supabase = createClient();

  try {
    // === FILA 1: Métricas Compactas ===
    
    // Total de usuarios registrados (contamos desde users que es 1:1 con auth.users)
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Nuevos usuarios (últimos 30 días) - desde users.customer_since
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: newUsers30d } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('customer_since', thirtyDaysAgo);

    // Legacy reactivados
    const { count: legacyReactivated } = await supabase
      .from('legacy_users')
      .select('*', { count: 'exact' })
      .eq('reactivation_status', 'reactivated');

    // Suscripciones activas
    const { count: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact' })
      .eq('status', 'active');

    // MRR (Monthly Recurring Revenue)
    const { data: mrrData } = await supabase
      .from('subscriptions')
      .select(`
        price_id,
        prices!inner(unit_amount, interval, type)
      `)
      .eq('status', 'active')
      .eq('prices.type', 'recurring')
      .eq('prices.interval', 'month');
    
    const mrrCents = mrrData?.reduce((sum, sub: any) => sum + (sub.prices?.unit_amount || 0), 0) || 0;
    const mrr = (mrrCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Accesos TradingView activos
    const { count: activeIndicatorAccess } = await supabase
      .from('indicator_access')
      .select('*', { count: 'exact' })
      .eq('status', 'active');

    // === FILA 2: Métricas Destacadas ===
    
    // Legacy sin activar
    const { count: legacyPending } = await supabase
      .from('legacy_users')
      .select('*', { count: 'exact' })
      .eq('reactivation_status', 'pending');

    // Tasa de conversión
    const { data: conversionData } = await supabase
      .from('visitor_tracking')
      .select('purchased');
    
    const totalVisitors = conversionData?.length || 0;
    const convertedVisitors = conversionData?.filter(v => v.purchased).length || 0;
    const conversionRate = totalVisitors > 0 ? ((convertedVisitors / totalVisitors) * 100).toFixed(1) : '0.0';

    // Visitantes únicos (últimos 30 días)
    const { data: visitorsData } = await supabase
      .from('visitor_tracking')
      .select('session_id')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    const uniqueVisitors30d = new Set(visitorsData?.map(v => v.session_id)).size;

    // LTV Promedio
    const { data: ltvData } = await supabase
      .from('users')
      .select('total_lifetime_spent')
      .gt('total_lifetime_spent', 0);
    
    const avgLtv = ltvData && ltvData.length > 0
      ? (ltvData.reduce((sum, u) => sum + Number(u.total_lifetime_spent || 0), 0) / ltvData.length / 100)
      : 0;
    const avgLtvFormatted = avgLtv.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // === ESTRUCTURAS DE DATOS ===
    
    const compactStats = [
      { 
        name: 'Total Usuarios', 
        stat: (totalUsers || 0).toLocaleString(), 
        icon: Users,
        color: 'text-blue-400',
        bgColor: 'from-blue-500/20 to-blue-600/10'
      },
      { 
        name: 'Nuevos (30d)', 
        stat: (newUsers30d || 0).toLocaleString(), 
        icon: UserPlus,
        color: 'text-green-400',
        bgColor: 'from-green-500/20 to-green-600/10'
      },
      { 
        name: 'Legacy Reactivados', 
        stat: (legacyReactivated || 0).toLocaleString(), 
        icon: RefreshCw,
        color: 'text-purple-400',
        bgColor: 'from-purple-500/20 to-purple-600/10'
      },
      { 
        name: 'Suscripciones', 
        stat: (activeSubscriptions || 0).toLocaleString(), 
        icon: Zap,
        color: 'text-yellow-400',
        bgColor: 'from-yellow-500/20 to-yellow-600/10'
      },
      { 
        name: 'MRR', 
        stat: `$${mrr}`, 
        icon: DollarSign,
        color: 'text-emerald-400',
        bgColor: 'from-emerald-500/20 to-emerald-600/10'
      },
      { 
        name: 'Accesos TradingView', 
        stat: (activeIndicatorAccess || 0).toLocaleString(), 
        icon: Activity,
        color: 'text-cyan-400',
        bgColor: 'from-cyan-500/20 to-cyan-600/10'
      },
    ];

    const featuredStats = [
      { 
        name: 'Legacy Sin Activar', 
        stat: (legacyPending || 0).toLocaleString(), 
        description: 'Oportunidad de reactivación',
        icon: AlertCircle,
        color: 'text-orange-400',
        bgColor: 'from-orange-500/20 to-orange-600/10',
        highlight: true
      },
      { 
        name: 'Tasa Conversión', 
        stat: `${conversionRate}%`, 
        description: `${convertedVisitors} de ${totalVisitors} visitantes`,
        icon: TrendingUp,
        color: 'text-pink-400',
        bgColor: 'from-pink-500/20 to-pink-600/10',
        highlight: false
      },
      { 
        name: 'Visitantes (30d)', 
        stat: uniqueVisitors30d.toLocaleString(), 
        description: 'Sesiones únicas',
        icon: Eye,
        color: 'text-indigo-400',
        bgColor: 'from-indigo-500/20 to-indigo-600/10',
        highlight: false
      },
      { 
        name: 'LTV Promedio', 
        stat: `$${avgLtvFormatted}`, 
        description: `${ltvData?.length || 0} usuarios pagantes`,
        icon: Wallet,
        color: 'text-teal-400',
        bgColor: 'from-teal-500/20 to-teal-600/10',
        highlight: false
      },
    ];

    return (
      <div className="space-y-6">
        {/* FILA 1: 6 Cards Compactas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {compactStats.map((stat) => {
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

        {/* FILA 2: 4 Cards Destacadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className={`bg-gradient-to-br ${stat.bgColor} backdrop-blur-xl border ${stat.highlight ? 'border-orange-500/50' : 'border-white/10'} rounded-2xl p-6 hover:border-apidevs-primary/50 transition-all ${stat.highlight ? 'ring-2 ring-orange-500/20' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                  {stat.highlight && (
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full font-semibold">
                      ALTO ROI
                    </span>
                  )}
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.stat}</div>
                <div className="text-sm font-medium text-gray-300 mb-1">{stat.name}</div>
                <div className="text-xs text-gray-500">{stat.description}</div>
              </div>
            );
          })}
        </div>
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