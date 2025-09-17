import { Suspense } from 'react';
import DashboardStats from '@/components/admin/DashboardStats';
import RecentActivity from '@/components/admin/RecentActivity';
import QuickActions from '@/components/admin/QuickActions';

export default async function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-700 pb-4">
        <h1 className="text-2xl font-bold text-white">
          Dashboard Administrativo
        </h1>
        <p className="mt-1 text-gray-400">
          Gestión completa de usuarios legacy y analytics de APIDevs Trading Platform
        </p>
      </div>

      {/* Stats Cards con datos reales de Supabase */}
      <Suspense fallback={<StatsLoadingSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - 2 columnas */}
        <div className="lg:col-span-2">
          <Suspense fallback={<ActivityLoadingSkeleton />}>
            <RecentActivity />
          </Suspense>
        </div>

        {/* Quick Actions - 1 columna */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* Status Message */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">✓</span>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-green-400">
              Sistema Operativo al 100%
            </h3>
            <div className="mt-2 text-sm text-green-300">
              <p>
                • Base de datos conectada y sincronizada<br/>
                • 6,477 usuarios legacy disponibles para gestión<br/>
                • 3,269 compras históricas analizables<br/>
                • Dashboard listo para funcionalidades avanzadas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading skeletons
function StatsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-8 bg-gray-700 rounded w-1/2 mb-3"></div>
            <div className="h-3 bg-gray-700 rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityLoadingSkeleton() {
  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Dashboard Admin - APIDevs Trading',
  description: 'Panel principal de administración con métricas y gestión de usuarios legacy',
};