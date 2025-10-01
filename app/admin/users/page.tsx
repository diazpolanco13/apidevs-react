import { createClient } from '@/utils/supabase/server';
import { Suspense } from 'react';
import UsersTable from '@/components/admin/UsersTable';
import SearchBar from '@/components/admin/SearchBar';
import { Users as UsersIcon, TrendingUp, UserCheck, UserX } from 'lucide-react';

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
  const status = searchParams.status as string || '';
  const customerType = searchParams.customerType as string || '';
  const migrationStatus = searchParams.migrationStatus as string || '';
  const sortField = searchParams.sortField as string || 'wordpress_created_at';
  const sortDirection = searchParams.sortDirection as string || 'desc';

  // Query base
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

  const { data: users, count, error } = await query;

  if (error) {
    console.error('Error fetching users:', error);
    return <div className="text-red-500">Error al cargar usuarios</div>;
  }

  const totalPages = Math.ceil((count || 0) / limit);

  // Obtener estadísticas rápidas
  const { count: reactivatedCount } = await supabase
    .from('legacy_users')
    .select('*', { count: 'exact', head: true })
    .eq('reactivation_status', 'reactivated');

  const { count: pendingCount } = await supabase
    .from('legacy_users')
    .select('*', { count: 'exact', head: true })
    .eq('reactivation_status', 'pending');

  const stats = [
    {
      name: 'Total Usuarios',
      value: count?.toLocaleString() || '0',
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
      subtitle: `${((reactivatedCount || 0) / (count || 1) * 100).toFixed(1)}% tasa`
    },
    {
      name: 'Pendientes',
      value: pendingCount?.toLocaleString() || '0',
      icon: UserX,
      color: 'text-yellow-400',
      bgColor: 'from-yellow-500/10 to-orange-500/10',
      borderColor: 'border-yellow-500/30',
      subtitle: `${((pendingCount || 0) / (count || 1) * 100).toFixed(1)}% del total`
    },
    {
      name: 'Tasa de Crecimiento',
      value: '+0%',
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-500/30',
      subtitle: 'Últimos 30 días'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Gestión de Usuarios Legacy
        </h1>
        <p className="text-gray-400">
          {count?.toLocaleString()} usuarios migrados desde WordPress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
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
      <SearchBar />

      {/* Tabla de Usuarios */}
      <Suspense fallback={<UsersTableSkeleton />}>
        <UsersTable 
          users={users || []}
          currentPage={page}
          totalPages={totalPages}
          totalCount={count || 0}
        />
      </Suspense>
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
