'use client';

import { useState } from 'react';
import { AlertCircle, Users, Target, Clock, Zap } from 'lucide-react';

type User = {
  id: string;
  email: string;
  full_name: string | null;
  tradingview_username: string | null;
};

type Indicator = {
  id: string;
  pine_id: string;
  name: string;
  access_tier: string;
};

type ConfigurationStepProps = {
  selectedUsers: User[];
  selectedIndicators: Indicator[];
  onExecute: (durationType: '7D' | '30D' | '1Y' | '1L') => void;
  executing: boolean;
};

export default function ConfigurationStep({
  selectedUsers,
  selectedIndicators,
  onExecute,
  executing
}: ConfigurationStepProps) {
  const [durationType, setDurationType] = useState<'7D' | '30D' | '1Y' | '1L'>('1Y');

  const totalOperations = selectedUsers.length * selectedIndicators.length;

  const durationOptions = [
    { value: '7D', label: '7 días', icon: '📅' },
    { value: '30D', label: '30 días', icon: '📆' },
    { value: '1Y', label: '1 año', icon: '🗓️' },
    { value: '1L', label: 'Lifetime', icon: '♾️' }
  ] as const;

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-400" />
          <div className="text-sm">
            <p className="font-medium text-amber-300">
              Estás a punto de realizar una operación masiva
            </p>
            <p className="mt-1 text-amber-400/70">
              Esta acción concederá acceso a {selectedIndicators.length} indicador
              {selectedIndicators.length !== 1 ? 'es' : ''} para {selectedUsers.length}{' '}
              usuario{selectedUsers.length !== 1 ? 's' : ''}. Total: {totalOperations}{' '}
              operaciones en TradingView.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Users Card */}
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <div className="mb-3 flex items-center gap-2 text-gray-400">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Usuarios</span>
          </div>
          <p className="text-3xl font-bold text-white">{selectedUsers.length}</p>
          <p className="mt-1 text-xs text-gray-500">
            {selectedUsers.filter((u) => u.tradingview_username).length} con TradingView
          </p>
        </div>

        {/* Indicators Card */}
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <div className="mb-3 flex items-center gap-2 text-gray-400">
            <Target className="h-4 w-4" />
            <span className="text-sm font-medium">Indicadores</span>
          </div>
          <p className="text-3xl font-bold text-white">{selectedIndicators.length}</p>
          <div className="mt-1 flex gap-2 text-xs text-gray-500">
            <span>
              🎁 {selectedIndicators.filter((i) => i.access_tier === 'free').length}
            </span>
            <span>
              💎 {selectedIndicators.filter((i) => i.access_tier === 'premium').length}
            </span>
          </div>
        </div>

        {/* Total Operations Card */}
        <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-4">
          <div className="mb-3 flex items-center gap-2 text-purple-400">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">Total Operaciones</span>
          </div>
          <p className="text-3xl font-bold text-purple-300">{totalOperations}</p>
          <p className="mt-1 text-xs text-purple-400/70">
            {totalOperations} llamadas a TradingView API
          </p>
        </div>
      </div>

      {/* Duration Selection */}
      <div>
        <label className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-300">
          <Clock className="h-4 w-4" />
          Duración del Acceso
        </label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {durationOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setDurationType(option.value)}
              className={`group rounded-lg border-2 p-4 text-left transition-all ${
                durationType === option.value
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800'
              }`}
            >
              <div className="mb-2 text-2xl">{option.icon}</div>
              <div className="font-semibold text-white">{option.label}</div>
              <div className="mt-1 text-xs text-gray-400">
                {option.value === '1L' ? 'Sin expiración' : `Expira en ${option.label}`}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* User Preview */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-300">
          Usuarios Seleccionados ({selectedUsers.length})
        </h3>
        <div className="max-h-[200px] overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900/50">
          {selectedUsers.slice(0, 10).map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between border-b border-zinc-800 px-4 py-2 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-white">
                  {user.full_name || user.email}
                </p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
              <div className="text-xs text-gray-500">
                {user.tradingview_username || 'Sin TV'}
              </div>
            </div>
          ))}
          {selectedUsers.length > 10 && (
            <div className="px-4 py-2 text-center text-xs text-gray-500">
              + {selectedUsers.length - 10} usuarios más
            </div>
          )}
        </div>
      </div>

      {/* Indicator Preview */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-300">
          Indicadores Seleccionados ({selectedIndicators.length})
        </h3>
        <div className="max-h-[200px] overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900/50">
          {selectedIndicators.slice(0, 10).map((indicator) => (
            <div
              key={indicator.id}
              className="flex items-center justify-between border-b border-zinc-800 px-4 py-2 last:border-0"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-white line-clamp-1">
                  {indicator.name}
                </p>
                <p className="text-xs text-gray-400">{indicator.pine_id}</p>
              </div>
              <span
                className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  indicator.access_tier === 'free'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-purple-500/20 text-purple-400'
                }`}
              >
                {indicator.access_tier === 'free' ? 'Free' : 'Premium'}
              </span>
            </div>
          ))}
          {selectedIndicators.length > 10 && (
            <div className="px-4 py-2 text-center text-xs text-gray-500">
              + {selectedIndicators.length - 10} indicadores más
            </div>
          )}
        </div>
      </div>

      {/* Execute Button */}
      <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-6">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-purple-300">
          <Zap className="h-5 w-5" />
          Confirmación Final
        </h3>
        <p className="mb-4 text-sm text-purple-400/70">
          Se concederá acceso de <strong>{durationOptions.find((o) => o.value === durationType)?.label}</strong> a{' '}
          <strong>{selectedIndicators.length}</strong> indicadores para{' '}
          <strong>{selectedUsers.length}</strong> usuarios.
          <br />
          Tiempo estimado: ~{Math.ceil(totalOperations / 2)} segundos
        </p>
        <button
          onClick={() => onExecute(durationType)}
          disabled={executing}
          className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-3 font-semibold text-white transition-all hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {executing ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Ejecutando... {totalOperations} operaciones
            </span>
          ) : (
            <span>⚡ Ejecutar Asignación Masiva</span>
          )}
        </button>
      </div>
    </div>
  );
}

