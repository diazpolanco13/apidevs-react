import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { Suspense } from 'react';
import UsersTable from '@/components/admin/UsersTable';
import ActiveUsersTable from '@/components/admin/ActiveUsersTable';
import SearchBar from '@/components/admin/SearchBar';
import UsersTabs from '@/components/admin/UsersTabs';
import { Users as UsersIcon, TrendingUp, UserCheck, UserX, Sparkles, Activity } from 'lucide-react';

type ActiveUser = {
  id: string;
  email: string;
  full_name: string | null;
  country: string | null;
  city: string | null;
  onboarding_completed: boolean | null;
  customer_since?: string | null;
};

type Subscription = {
  user_id: string;
  status: string;
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();

  // Parámetros de búsqueda y filtros
  const page = Number(searchParams.page) || 1;
  const limit = 20; // 20 elementos por página
  const offset = (page - 1) * limit;
  const search = searchParams.search as string || '';
  const country = searchParams.country as string || '';
  
  // Filtros para usuarios legacy
  const status = searchParams.status as string || '';
  const customerType = searchParams.customerType as string || '';
  const migrationStatus = searchParams.migrationStatus as string || '';
  const sortField = searchParams.sortField as string || 'wordpress_created_at';
  const sortDirection = searchParams.sortDirection as string || 'desc';
  
  // Filtros para usuarios activos
  const subscriptionStatus = searchParams.subscriptionStatus as string || '';
  const onboarding = searchParams.onboarding as string || '';

  // ==================== USUARIOS ACTIVOS ====================
  // Query para usuarios activos (tabla users)
  let activeUsersQuery = supabase
    .from('users')
    .select('id, email, full_name, country, city, onboarding_completed, customer_since', { count: 'exact' });

  // Aplicar búsqueda a usuarios activos
  if (search) {
    activeUsersQuery = activeUsersQuery.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  // Aplicar filtro de país
  if (country) {
    activeUsersQuery = activeUsersQuery.eq('country', country);
  }

  // Aplicar filtro de onboarding
  if (onboarding) {
    if (onboarding === 'completed') {
      activeUsersQuery = activeUsersQuery.eq('onboarding_completed', true);
    } else if (onboarding === 'pending') {
      activeUsersQuery = activeUsersQuery.or('onboarding_completed.is.null,onboarding_completed.eq.false');
    }
  }

  // Paginación para usuarios activos
  activeUsersQuery = activeUsersQuery
    .order('id', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data: activeUsers, count: activeUsersCount, error: activeUsersError } = await activeUsersQuery;

  // Obtener suscripciones activas para los usuarios activos - usar supabaseAdmin para evitar RLS
  const safeActiveUsers: ActiveUser[] = activeUsers || [];
  const activeUserIds = safeActiveUsers.map(u => u.id);
  
  const { data: subscriptions } = activeUserIds.length > 0
    ? await supabaseAdmin
        .from('subscriptions')
        .select('user_id, status')
        .in('user_id', activeUserIds)
    : { data: [] };

  // 🔍 Obtener accesos Lifetime para los usuarios activos
  const { data: lifetimeAccesses } = activeUserIds.length > 0
    ? await supabase
        .from('indicator_access')
        .select('user_id, duration_type')
        .in('user_id', activeUserIds)
        .eq('status', 'active')
        .eq('duration_type', '1L')
    : { data: [] };

  // 🆓 Obtener usuarios con indicadores FREE activos (sin suscripción)
  const { data: freeAccesses } = activeUserIds.length > 0
    ? await supabase
        .from('indicator_access')
        .select('user_id, indicator_id, indicators(access_tier)')
        .in('user_id', activeUserIds)
        .eq('status', 'active')
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
    : { data: [] };

  // Tipo para freeAccesses
  type FreeAccessWithTier = {
    user_id: string;
    indicator_id: string;
    indicators: { access_tier: string | null } | null;
  };

  // Identificar usuarios con indicadores FREE activos (y sin suscripción paga)
  const freeUserIds = new Set<string>();
  (freeAccesses as FreeAccessWithTier[] || []).forEach((access) => {
    if (access.indicators?.access_tier === 'free') {
      freeUserIds.add(access.user_id);
    }
  });

  // Crear un Set de user_ids con acceso Lifetime para búsqueda rápida
  const lifetimeUserIds = new Set((lifetimeAccesses || []).map((la: any) => la.user_id));

  // Combinar usuarios con sus suscripciones, accesos Lifetime y FREE
  const safeSubscriptions = (subscriptions || []) as any[];
  let activeUsersWithSubs = safeActiveUsers.map(user => {
    const hasSubscription = safeSubscriptions.find(s => s.user_id === user.id)?.status;
    const hasLifetime = lifetimeUserIds.has(user.id);
    const hasFree = freeUserIds.has(user.id);
    
    return {
      ...user,
      subscription_status: hasSubscription || (hasLifetime ? 'lifetime' : hasFree ? 'free' : null),
      has_lifetime_access: hasLifetime
    };
  });

  // Aplicar filtro de estado de suscripción
  if (subscriptionStatus) {
    activeUsersWithSubs = activeUsersWithSubs.filter(user => {
      if (subscriptionStatus === 'none') {
        // Sin suscripción (ni active, ni lifetime, ni free)
        return !user.subscription_status;
      } else if (subscriptionStatus === 'free') {
        // Plan FREE
        return user.subscription_status === 'free';
      } else if (subscriptionStatus === 'active') {
        // PRO Activo (suscripción activa de pago)
        return user.subscription_status === 'active';
      } else if (subscriptionStatus === 'trialing') {
        // En periodo de prueba
        return user.subscription_status === 'trialing';
      } else if (subscriptionStatus === 'lifetime') {
        // Lifetime
        return user.subscription_status === 'lifetime' || user.has_lifetime_access;
      }
      return true;
    });
  }

  const activeTotalPages = Math.ceil((activeUsersCount || 0) / limit);

  // ==================== ESTADÍSTICAS DETALLADAS ====================
  
  // Contar nuevos usuarios (últimos 30 días)
  const { count: newUsers30d } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('customer_since', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
  
  const { count: users30_60d } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('customer_since', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
    .lt('customer_since', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
  
  // Calcular tasa de crecimiento
  const growthRate = users30_60d && users30_60d > 0
    ? (((newUsers30d || 0) - users30_60d) / users30_60d * 100)
    : (newUsers30d || 0) > 0 ? 100 : 0;
  
  // Contar usuarios con suscripciones activas (PRO Mensual/Anual) - usar supabaseAdmin para evitar RLS
  const { data: activeSubscriptions } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, price_id, prices(interval, interval_count)')
    .in('status', ['active', 'trialing']);
  
  // Definir tipo para las suscripciones con precios
  type SubscriptionWithPrice = {
    user_id: string;
    price_id: string;
    prices: {
      interval: string | null;
      interval_count: number | null;
    } | null;
  };
  
  const proMonthlyUsers = (activeSubscriptions as SubscriptionWithPrice[] | null)?.filter(s => 
    s.prices && s.prices.interval === 'month' && s.prices.interval_count === 1
  ).length || 0;
  
  const proAnnualUsers = (activeSubscriptions as SubscriptionWithPrice[] | null)?.filter(s => 
    s.prices && s.prices.interval === 'year'
  ).length || 0;
  
  const totalProUsers = proMonthlyUsers + proAnnualUsers;
  
  // Contar usuarios Lifetime
  const lifetimeUsersCount = lifetimeUserIds.size;
  
  // Calcular usuarios FREE (sin ninguna suscripción ni lifetime)
  const totalPaidUsers = totalProUsers + lifetimeUsersCount;
  const realFreeUsers = (activeUsersCount || 0) - totalPaidUsers;
  
  // Calcular tasa de conversión FREE → PAGO (cualquier modalidad)
  const conversionRate = (activeUsersCount || 0) > 0
    ? (totalPaidUsers / (activeUsersCount || 1) * 100)
    : 0;

  // ==================== USUARIOS LEGACY ====================
  // Query para usuarios legacy
  let query = supabase
    .from('legacy_users')
    .select('id, email, full_name, country, city, wordpress_created_at, reactivation_status, customer_type', { count: 'exact' });

  // Aplicar filtros
  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,wordpress_username.ilike.%${search}%`);
  }
  
  if (country) {
    query = query.eq('country', country);
  }
  
  if (status) {
    query = query.eq('reactivation_status', status);
  }

  if (customerType) {
    query = query.eq('customer_type', customerType);
  }

  if (migrationStatus) {
    query = query.eq('migration_status', migrationStatus);
  }

  // Paginación y orden
  const ascending = sortDirection === 'asc';
  query = query
    .order(sortField, { ascending })
    .range(offset, offset + limit - 1);

  const { data: legacyUsers, count: legacyCount, error } = await query;

  if (error) {
    console.error('Error fetching legacy users:', error);
    return <div className="text-red-500">Error al cargar usuarios legacy</div>;
  }

  const legacyTotalPages = Math.ceil((legacyCount || 0) / limit);

  // Obtener estadísticas rápidas
  const { count: reactivatedCount } = await supabase
    .from('legacy_users')
    .select('*', { count: 'exact', head: true })
    .eq('reactivation_status', 'reactivated');

  const { count: pendingCount } = await supabase
    .from('legacy_users')
    .select('*', { count: 'exact', head: true })
    .eq('reactivation_status', 'pending');

  // Estadísticas mejoradas para usuarios activos
  const activeStats = [
    {
      name: 'Total Usuarios',
      value: activeUsersCount?.toLocaleString() || '0',
      icon: UsersIcon,
      color: 'text-blue-400',
      bgColor: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/30',
      subtitle: `${newUsers30d || 0} nuevos (30d)`,
      details: [
        { label: 'Crecimiento', value: `${growthRate > 0 ? '+' : ''}${growthRate.toFixed(0)}%` },
        { label: 'Periodo anterior', value: `${users30_60d || 0} usuarios` }
      ]
    },
    {
      name: 'Usuarios FREE',
      value: realFreeUsers?.toLocaleString() || '0',
      icon: UserX,
      color: 'text-gray-400',
      bgColor: 'from-gray-500/10 to-slate-500/10',
      borderColor: 'border-gray-500/30',
      subtitle: `${((realFreeUsers || 0) / (activeUsersCount || 1) * 100).toFixed(1)}% del total`,
      details: [
        { label: 'Pool conversión', value: `${realFreeUsers} potenciales` },
        { label: 'Indicadores', value: '2 gratuitos' }
      ]
    },
    {
      name: 'Usuarios de Pago',
      value: totalPaidUsers?.toLocaleString() || '0',
      icon: Sparkles,
      color: 'text-purple-400',
      bgColor: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-500/30',
      subtitle: `${((totalPaidUsers || 0) / (activeUsersCount || 1) * 100).toFixed(1)}% del total`,
      details: [
        { label: 'PRO Mensual', value: `${proMonthlyUsers} usuarios` },
        { label: 'PRO Anual', value: `${proAnnualUsers} usuarios` },
        { label: 'Lifetime', value: `${lifetimeUsersCount} usuarios` }
      ]
    },
    {
      name: 'Conversión FREE → PAGO',
      value: `${conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: conversionRate > 10 ? 'text-green-400' : conversionRate > 5 ? 'text-yellow-400' : 'text-red-400',
      bgColor: conversionRate > 10 ? 'from-green-500/10 to-emerald-500/10' : conversionRate > 5 ? 'from-yellow-500/10 to-orange-500/10' : 'from-red-500/10 to-rose-500/10',
      borderColor: conversionRate > 10 ? 'border-green-500/30' : conversionRate > 5 ? 'border-yellow-500/30' : 'border-red-500/30',
      subtitle: `${totalPaidUsers || 0} de ${activeUsersCount || 0} convirtieron`,
      details: [
        { label: 'Industria SaaS', value: '2-5% promedio' },
        { label: 'Tu rendimiento', value: conversionRate > 10 ? '🟢 Excelente' : conversionRate > 5 ? '🟡 Bueno' : '🔴 Mejorar' }
      ]
    },
  ];

  // Estadísticas para usuarios legacy
  const legacyStats = [
    {
      name: 'Total Usuarios',
      value: legacyCount?.toLocaleString() || '0',
      icon: UsersIcon,
      color: 'text-blue-400',
      bgColor: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      name: 'Reactivados',
      value: reactivatedCount?.toLocaleString() || '0',
      icon: UserCheck,
      color: 'text-green-400',
      bgColor: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-500/30',
      subtitle: `${((reactivatedCount || 0) / (legacyCount || 1) * 100).toFixed(1)}% tasa`
    },
    {
      name: 'Pendientes',
      value: pendingCount?.toLocaleString() || '0',
      icon: UserX,
      color: 'text-yellow-400',
      bgColor: 'from-yellow-500/10 to-orange-500/10',
      borderColor: 'border-yellow-500/30',
      subtitle: `${((pendingCount || 0) / (legacyCount || 1) * 100).toFixed(1)}% del total`
    },
    {
      name: 'Tasa de Conversión',
      value: '0.02%',
      icon: Activity,
      color: 'text-purple-400',
      bgColor: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-500/30',
      subtitle: 'Legacy → Activo'
    },
  ];

  // Vista de usuarios activos
  const activeUsersView = (
    <div className="space-y-6">
      {/* Stats Cards - Usuarios Activos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {activeStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className={`bg-gradient-to-br ${stat.bgColor} backdrop-blur-xl border ${stat.borderColor} rounded-2xl p-6 hover:scale-105 transition-all`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.name}</div>
              {stat.subtitle && (
                <div className="text-xs text-gray-500 mt-1">{stat.subtitle}</div>
              )}
              
              {/* Detalles adicionales */}
              {stat.details && stat.details.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-2">
                  {stat.details.map((detail: { label: string; value: string }, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">{detail.label}</span>
                      <span className="text-gray-300 font-medium">{detail.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Search Bar */}
      <SearchBar placeholder="Buscar por email o nombre..." mode="active" />

      {/* Tabla de Usuarios Activos */}
      <Suspense fallback={<UsersTableSkeleton />}>
        <ActiveUsersTable 
          users={activeUsersWithSubs}
          currentPage={page}
          totalPages={activeTotalPages}
          totalCount={activeUsersCount || 0}
        />
      </Suspense>
    </div>
  );

  // Vista de usuarios legacy
  const legacyUsersView = (
    <div className="space-y-6">
      {/* Stats Cards - Usuarios Legacy */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {legacyStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className={`bg-gradient-to-br ${stat.bgColor} backdrop-blur-xl border ${stat.borderColor} rounded-2xl p-6 hover:scale-105 transition-all`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.name}</div>
              {stat.subtitle && (
                <div className="text-xs text-gray-500 mt-1">{stat.subtitle}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Search Bar */}
      <SearchBar placeholder="Buscar por email, nombre o username..." mode="legacy" />

      {/* Tabla de Usuarios Legacy */}
      <Suspense fallback={<UsersTableSkeleton />}>
        <UsersTable 
          users={legacyUsers || []}
          currentPage={page}
          totalPages={legacyTotalPages}
          totalCount={legacyCount || 0}
        />
      </Suspense>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
            <UsersIcon className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Gestión de Usuarios
          </h1>
        </div>
        <p className="text-gray-400">
          Panel unificado de gestión y reactivación de usuarios
        </p>
      </div>

      {/* Tabs */}
      <UsersTabs
        activeUsersView={activeUsersView}
        legacyUsersView={legacyUsersView}
        activeUsersCount={activeUsersCount || 0}
        legacyUsersCount={legacyCount || 0}
      />
    </div>
  );
}

// Skeleton Loading
function UsersTableSkeleton() {
  return (
    <div className="bg-black/30 backdrop-blur-xl border border-apidevs-primary/20 rounded-lg">
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-700 rounded w-1/6"></div>
              <div className="h-4 bg-gray-700 rounded w-1/6"></div>
              <div className="h-4 bg-gray-700 rounded w-1/8"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
