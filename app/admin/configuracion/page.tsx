import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { redirect } from 'next/navigation';
import { checkAdminPermission, PERMISSIONS } from '@/utils/admin/permissions';
import ConfiguracionClient from '@/components/admin/configuracion/ConfiguracionClient';
import { RefreshCw } from 'lucide-react';

export const metadata = {
  title: 'Configuración - Admin Dashboard',
  description: 'Configuración general del sistema y gestión de administradores',
};

async function loadConfigurationData() {
  // Usar supabaseAdmin para bypass RLS
  // Cargar administradores con sus roles
  const { data: admins, error: adminsError } = await (supabaseAdmin as any)
    .from('admin_users')
    .select(`
      *,
      admin_roles (
        id,
        name,
        slug,
        description,
        permissions,
        is_system_role
      )
    `)
    .order('created_at', { ascending: false });

  if (adminsError) {
    console.error('Error loading admins:', adminsError);
  }

  // Cargar todos los roles disponibles
  const { data: roles, error: rolesError} = await (supabaseAdmin as any)
    .from('admin_roles')
    .select('*')
    .order('name');

  if (rolesError) {
    console.error('Error loading roles:', rolesError);
  }

  return {
    admins: admins || [],
    roles: roles || [],
  };
}

export default async function ConfiguracionPage() {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  // Verificar permisos de configuración
  const hasConfigAccess = await checkAdminPermission(user.id, PERMISSIONS.CONFIG_VIEW);

  if (!hasConfigAccess) {
    redirect('/admin?message=' + encodeURIComponent('No tienes permisos para acceder a Configuración'));
  }

  // Cargar datos
  const { admins, roles } = await loadConfigurationData();

  return (
    <div className="space-y-6">
      <Suspense fallback={<ConfigLoadingSkeleton />}>
        <ConfiguracionClient 
          admins={admins} 
          roles={roles}
          currentUserId={user.id}
        />
      </Suspense>
    </div>
  );
}

function ConfigLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-10 w-32 bg-gray-700 rounded animate-pulse"></div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-2/3 mb-4"></div>
              <div className="space-y-2">
                <div className="h-10 bg-gray-700 rounded"></div>
                <div className="h-10 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

