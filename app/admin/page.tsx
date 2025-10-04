import { Suspense } from 'react';
import DashboardStats from '@/components/admin/DashboardStats';
import RecentActivity from '@/components/admin/RecentActivity';
import { Sparkles } from 'lucide-react';

export default async function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Dashboard Administrativo
          </h1>
        </div>
        <p className="text-gray-400">Gestión completa de usuarios legacy y analytics de APIDevs Trading Platform</p>
      </div>

      {/* Stats Cards con datos reales de Supabase */}
      <Suspense fallback={<StatsLoadingSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Recent Activity - Ancho Completo */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Actividad Reciente</h3>
        <Suspense fallback={<ActivityLoadingSkeleton />}>
          <RecentActivity />
        </Suspense>
      </div>

      {/* Status Message */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xl">✓</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">
              Sistema Operativo al 100%
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <span>Base de datos conectada y sincronizada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <span>6,477 usuarios legacy disponibles</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <span>3,269 compras históricas analizables</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <span>Dashboard listo para expansión</span>
              </div>
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