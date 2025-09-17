import { createClient } from '@/utils/supabase/server';
import { Suspense } from 'react';
import UsersTable from '@/components/admin/UsersTable';
import UsersFilterWrapper from '@/components/admin/UsersFilterWrapper';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();

  // Parámetros de búsqueda y filtros
  const page = Number(searchParams.page) || 1;
  const limit = 10; // Máximo 10 elementos por página
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

  // Obtener países únicos para filtros
  const { data: countries } = await supabase
    .from('legacy_users')
    .select('country')
    .not('country', 'is', null)
    .order('country');

  const uniqueCountries = Array.from(new Set(countries?.map((c: any) => c.country))).filter(Boolean);

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-700 pb-4">
        <h1 className="text-2xl font-bold text-white">
          Gestión de Usuarios Legacy
        </h1>
        <p className="mt-1 text-gray-400">
          {count?.toLocaleString()} usuarios migrados desde WordPress
        </p>
      </div>

      {/* Filtros */}
      <Suspense fallback={<div>Cargando filtros...</div>}>
        <UsersFilterWrapper 
          totalItems={count || 0}
          filteredItems={count || 0}
        />
      </Suspense>

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
