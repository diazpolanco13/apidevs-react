'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Pagination from './Pagination';
import MobilePagination from './MobilePagination';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface User {
  id: string;
  email: string | null;
  full_name: string | null;
  country: string | null;
  city: string | null;
  onboarding_completed: boolean | null;
  subscription_status?: string | null;
  has_lifetime_access?: boolean;
  customer_since?: string | null;
}

interface ActiveUsersTableProps {
  users: User[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export default function ActiveUsersTable({
  users,
  currentPage,
  totalPages,
  totalCount
}: ActiveUsersTableProps) {
  const router = useRouter();

  const handlePageChange = (page: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    router.push(url.toString());
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    // Para mantener compatibilidad con el componente Pagination
    // Items per page actualizados
  };
  
  const getStatusBadge = (user: User) => {
    // Prioridad 1: Lifetime Access
    if (user.has_lifetime_access) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
          <CheckCircle className="w-3 h-3" />
          Lifetime
        </span>
      );
    }
    // Prioridad 2: Suscripción Activa (PRO)
    else if (user.subscription_status === 'active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
          <CheckCircle className="w-3 h-3" />
          PRO Activo
        </span>
      );
    } 
    // Prioridad 3: Trial
    else if (user.subscription_status === 'trialing') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
          <Clock className="w-3 h-3" />
          Trial
        </span>
      );
    } 
    // Prioridad 4: Plan FREE (con indicadores gratuitos)
    else if (user.subscription_status === 'free') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
          <CheckCircle className="w-3 h-3" />
          Plan FREE
        </span>
      );
    }
    // Sin ningún plan
    else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
          <XCircle className="w-3 h-3" />
          Sin suscripción
        </span>
      );
    }
  };

  const getOnboardingBadge = (completed: boolean | null) => {
    if (completed) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
          <CheckCircle className="w-3 h-3" />
          Completado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">
        <Clock className="w-3 h-3" />
        Pendiente
      </span>
    );
  };

  return (
    <div className="bg-black/30 backdrop-blur-xl border border-apidevs-primary/20 rounded-2xl overflow-hidden">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-apidevs-primary/10 to-green-500/10 border-b border-apidevs-primary/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Usuarios Activos ({totalCount})
          </h3>
          <div className="text-sm text-gray-400">
            Página {currentPage} de {totalPages}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Registro
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Onboarding
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Suscripción
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No hay usuarios activos registrados
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr 
                  key={user.id} 
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-apidevs-primary to-green-400 flex items-center justify-center text-black font-semibold text-sm">
                          {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {user.full_name || 'Sin nombre'}
                          </div>
                          <div className="text-xs text-gray-400">{user.email || 'Sin email'}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {user.city && user.country ? (
                        <>
                          <div>{user.city}</div>
                          <div className="text-xs text-gray-500">{user.country}</div>
                        </>
                      ) : (
                        <span className="text-gray-500">Sin ubicación</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {user.customer_since ? (
                      <div className="flex flex-col">
                        <span className="text-gray-300">
                          {new Date(user.customer_since).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(user.customer_since).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getOnboardingBadge(user.onboarding_completed)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/admin/users/active/${user.id}`}
                      className="inline-flex items-center gap-2 text-apidevs-primary hover:text-green-400 font-medium transition-colors"
                    >
                      Ver detalles →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Desktop Pagination */}
      {totalPages > 1 && (
        <div className="hidden lg:block border-t border-gray-800">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={20}
            totalItems={totalCount}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      )}

      {/* Mobile Pagination */}
      {totalPages > 1 && (
        <div className="lg:hidden border-t border-gray-800">
          <MobilePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={20}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

