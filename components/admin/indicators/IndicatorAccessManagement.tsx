'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import GrantAccessModal from './GrantAccessModal';
import RevokeAccessModal from './RevokeAccessModal';

type Indicator = {
  id: string;
  pine_id: string;
  name: string;
};

type Access = {
  id: string;
  user_id: string;
  indicator_id: string;
  tradingview_username: string;
  status: string;
  granted_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  duration_type: string | null;
  subscription_id: string | null;
  error_message: string | null;
  created_at: string;
  users: {
    id: string;
    email: string;
    full_name: string | null;
    tradingview_username: string | null;
    avatar_url: string | null;
  } | null;
};

type Stats = {
  total_accesses: number;
  active_accesses: number;
  pending_accesses: number;
  expired_accesses: number;
  revoked_accesses: number;
  failed_accesses: number;
};

type Props = {
  indicator: Indicator;
  accesses: Access[];
  stats: Stats;
};

export default function IndicatorAccessManagement({
  indicator,
  accesses: initialAccesses,
  stats: initialStats
}: Props) {
  const [accesses, setAccesses] = useState(initialAccesses);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'expired' | 'revoked'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState<Access | null>(null);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);

  // Filtrar accesos
  const filteredAccesses = accesses.filter((access) => {
    const matchesFilter =
      filter === 'all' ||
      access.status === filter ||
      (filter === 'active' &&
        access.status === 'active' &&
        (!access.expires_at || new Date(access.expires_at) > new Date()));

    const matchesSearch =
      searchTerm === '' ||
      access.tradingview_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      access.users?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      access.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string, expiresAt: string | null) => {
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return 'border-gray-500/30 bg-gray-500/20 text-gray-400';
    }
    switch (status) {
      case 'active':
        return 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400';
      case 'pending':
        return 'border-yellow-500/30 bg-yellow-500/20 text-yellow-400';
      case 'expired':
        return 'border-gray-500/30 bg-gray-500/20 text-gray-400';
      case 'revoked':
        return 'border-red-500/30 bg-red-500/20 text-red-400';
      case 'failed':
        return 'border-orange-500/30 bg-orange-500/20 text-orange-400';
      default:
        return 'border-gray-500/30 bg-gray-500/20 text-gray-400';
    }
  };

  const getDurationLabel = (durationType: string | null) => {
    switch (durationType) {
      case '7D':
        return '7 días';
      case '30D':
        return '30 días';
      case '1Y':
        return '1 año';
      case '1L':
        return 'Lifetime';
      default:
        return 'N/A';
    }
  };

  const handleRevoke = (access: Access) => {
    setSelectedAccess(access);
    setIsRevokeModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header con botón para conceder acceso */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Gestión de Accesos
          </h3>
          <p className="text-sm text-gray-400">
            Administra quién tiene acceso a este indicador
          </p>
        </div>
        <button
          onClick={() => setIsGrantModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 font-medium text-white transition-all hover:from-emerald-600 hover:to-emerald-700"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Conceder Acceso
        </button>
      </div>

      {/* Filtros */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="Buscar por email, nombre o TradingView username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Filtro de estado */}
          <div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="pending">Pendientes</option>
              <option value="expired">Expirados</option>
              <option value="revoked">Revocados</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          Mostrando{' '}
          <span className="font-semibold text-white">
            {filteredAccesses.length}
          </span>{' '}
          de {accesses.length} accesos
        </div>
      </div>

      {/* Tabla de accesos */}
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  TradingView
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Duración
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Expira
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredAccesses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg
                        className="h-12 w-12 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <p className="mt-4 text-sm text-gray-400">
                        No se encontraron accesos
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAccesses.map((access) => (
                  <tr
                    key={access.id}
                    className="transition-colors hover:bg-zinc-800/30"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">
                          {access.users?.full_name || 'Sin nombre'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {access.users?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="rounded bg-zinc-800 px-2 py-1 text-xs text-cyan-400">
                        {access.tradingview_username}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                          access.status,
                          access.expires_at
                        )}`}
                      >
                        {access.expires_at &&
                        new Date(access.expires_at) < new Date()
                          ? 'Expirado'
                          : access.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300">
                        {getDurationLabel(access.duration_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {access.expires_at ? (
                        <span className="text-sm text-gray-300">
                          {format(
                            new Date(access.expires_at),
                            "d 'de' MMM yyyy",
                            { locale: es }
                          )}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Permanente</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {access.status === 'active' &&
                          (!access.expires_at ||
                            new Date(access.expires_at) > new Date()) && (
                            <button
                              onClick={() => handleRevoke(access)}
                              className="rounded-lg bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20"
                              title="Revocar acceso"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                              </svg>
                            </button>
                          )}
                        {access.error_message && (
                          <button
                            className="rounded-lg bg-orange-500/10 p-2 text-orange-400"
                            title={access.error_message}
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      <GrantAccessModal
        indicator={indicator}
        isOpen={isGrantModalOpen}
        onClose={() => setIsGrantModalOpen(false)}
        onSuccess={() => {
          setIsGrantModalOpen(false);
          window.location.reload(); // Recargar para mostrar el nuevo acceso
        }}
      />

      {selectedAccess && (
        <RevokeAccessModal
          access={selectedAccess}
          indicator={indicator}
          isOpen={isRevokeModalOpen}
          onClose={() => {
            setIsRevokeModalOpen(false);
            setSelectedAccess(null);
          }}
          onSuccess={() => {
            setIsRevokeModalOpen(false);
            setSelectedAccess(null);
            window.location.reload(); // Recargar para actualizar el estado
          }}
        />
      )}
    </div>
  );
}

