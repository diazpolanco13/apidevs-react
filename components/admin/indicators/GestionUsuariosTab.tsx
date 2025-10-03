'use client';

import { useState } from 'react';
import { Search, UserCircle, Calendar, Award } from 'lucide-react';
import GrantAccessModal from './GrantAccessModal';

type User = {
  id: string;
  email: string;
  full_name: string | null;
  tradingview_username: string | null;
  avatar_url: string | null;
  customer_tier: string | null;
  is_legacy_user: boolean;
  onboarding_completed: boolean;
  total_lifetime_spent: number;
  purchase_count: number;
};

type IndicatorAccess = {
  id: string;
  indicator_id: string;
  status: string;
  granted_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  duration_type: string | null;
  access_source: string;
  indicators: {
    id: string;
    name: string;
    pine_id: string;
    category: string;
    access_tier: string;
    image_1: string | null;
  };
};

type AccessStats = {
  total: number;
  active: number;
  pending: number;
  expired: number;
  revoked: number;
  failed: number;
};

export default function GestionUsuariosTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userAccesses, setUserAccesses] = useState<IndicatorAccess[]>([]);
  const [accessStats, setAccessStats] = useState<AccessStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGrantModal, setShowGrantModal] = useState(false);

  // Buscar usuarios
  const handleSearch = async () => {
    if (searchQuery.length < 2) {
      setError('Ingresa al menos 2 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/users/search?q=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error('Error buscando usuarios');
      }

      const users = await response.json();
      setSearchResults(users);

      if (users.length === 0) {
        setError('No se encontraron usuarios');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar accesos del usuario seleccionado
  const handleSelectUser = async (user: User) => {
    setSelectedUser(user);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${user.id}/indicator-access`);

      if (!response.ok) {
        throw new Error('Error cargando accesos del usuario');
      }

      const data = await response.json();
      setUserAccesses(data.accesses || []);
      setAccessStats(data.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Conceder acceso individual
  const handleGrantAccess = () => {
    setShowGrantModal(true);
  };

  // Callback cuando se concede acceso exitosamente
  const handleAccessGranted = async () => {
    if (selectedUser) {
      await handleSelectUser(selectedUser); // Recargar accesos
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      revoked: 'bg-red-500/20 text-red-400 border-red-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  return (
    <div className="space-y-6">
      {/* Header con descripción */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
            <UserCircle className="h-7 w-7 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Gestión de Usuarios</h2>
            <p className="text-sm text-gray-400">
              Gestiona accesos individuales de usuarios a indicadores
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm text-gray-400">
          <p className="flex items-center gap-2">
            ✅ Buscar usuarios por email o TradingView username
          </p>
          <p className="flex items-center gap-2">
            ✅ Ver indicadores activos por usuario
          </p>
          <p className="flex items-center gap-2">
            ✅ Conceder acceso individual a indicadores específicos
          </p>
          <p className="flex items-center gap-2">
            ⚡ Acciones rápidas: Conceder todos Free/Premium, Renovar, Revocar
          </p>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <label className="mb-3 block text-sm font-medium text-gray-400">
          Buscar Usuario
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Email, nombre completo o TradingView username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="rounded-lg bg-emerald-500 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Resultados de búsqueda */}
      {searchResults.length > 0 && !selectedUser && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Resultados ({searchResults.length})
          </h3>
          <div className="space-y-2">
            {searchResults.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="flex w-full items-center gap-4 rounded-lg border border-zinc-700 bg-zinc-800/30 p-4 text-left transition-colors hover:border-emerald-500/50 hover:bg-zinc-800/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                  <UserCircle className="h-6 w-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">
                    {user.full_name || 'Sin nombre'}
                  </p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-400">
                    {user.tradingview_username || 'Sin username'}
                  </p>
                  {user.is_legacy_user && (
                    <span className="text-xs text-amber-400">⭐ Legacy</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Perfil del usuario seleccionado */}
      {selectedUser && (
        <>
          {/* Card de usuario */}
          <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30">
                  <UserCircle className="h-10 w-10 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedUser.full_name || 'Sin nombre'}
                  </h3>
                  <p className="text-sm text-gray-400">{selectedUser.email}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                      @{selectedUser.tradingview_username || 'Sin configurar'}
                    </span>
                    {selectedUser.is_legacy_user && (
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                        ⭐ Legacy
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setUserAccesses([]);
                  setAccessStats(null);
                }}
                className="text-sm text-gray-400 hover:text-white"
              >
                ✕ Cerrar
              </button>
            </div>

            {/* Stats del usuario */}
            {accessStats && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-white">{accessStats.total}</p>
                </div>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
                  <p className="text-xs text-gray-400">Activos</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {accessStats.active}
                  </p>
                </div>
                <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
                  <p className="text-xs text-gray-400">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {accessStats.pending}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-500/20 bg-gray-500/10 p-3">
                  <p className="text-xs text-gray-400">Expirados</p>
                  <p className="text-2xl font-bold text-gray-400">
                    {accessStats.expired}
                  </p>
                </div>
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                  <p className="text-xs text-gray-400">Revocados</p>
                  <p className="text-2xl font-bold text-red-400">
                    {accessStats.revoked}
                  </p>
                </div>
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                  <p className="text-xs text-gray-400">Fallidos</p>
                  <p className="text-2xl font-bold text-red-400">{accessStats.failed}</p>
                </div>
              </div>
            )}

            {/* Botón de acción */}
            <div className="mt-4">
              <button
                onClick={handleGrantAccess}
                className="w-full rounded-lg bg-emerald-500 py-3 font-medium text-white transition-colors hover:bg-emerald-600"
              >
                + Conceder Acceso Individual
              </button>
            </div>
          </div>

          {/* Tabla de accesos */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Accesos Actuales ({userAccesses.length})
            </h3>

            {userAccesses.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-400">
                  Este usuario no tiene accesos a indicadores aún
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800">
                    <tr>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Indicador
                      </th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Estado
                      </th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Concedido
                      </th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Expira
                      </th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Origen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {userAccesses.map((access) => (
                      <tr key={access.id} className="hover:bg-zinc-800/30">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">
                              {access.indicators.name}
                            </span>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-xs ${
                                access.indicators.access_tier === 'premium'
                                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                                  : 'border-green-500/30 bg-green-500/10 text-green-400'
                              }`}
                            >
                              {access.indicators.access_tier === 'premium'
                                ? '💎 Premium'
                                : '🎁 Free'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(
                              access.status
                            )}`}
                          >
                            {access.status}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-gray-400">
                          {formatDate(access.granted_at)}
                        </td>
                        <td className="py-3 text-sm text-gray-400">
                          {access.duration_type === '1L'
                            ? '∞ Lifetime'
                            : formatDate(access.expires_at)}
                        </td>
                        <td className="py-3">
                          <span className="text-xs text-gray-500">
                            {access.access_source}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal de conceder acceso */}
      {selectedUser && (
        <GrantAccessModal
          isOpen={showGrantModal}
          onClose={() => setShowGrantModal(false)}
          userId={selectedUser.id}
          userEmail={selectedUser.email}
          onSuccess={handleAccessGranted}
        />
      )}
    </div>
  );
}
