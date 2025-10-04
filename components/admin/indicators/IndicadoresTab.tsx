'use client';

import IndicatorsTable from '../IndicatorsTable';
import AddIndicatorButton from '../AddIndicatorButton';

type Indicator = {
  id: string;
  pine_id: string;
  name: string;
  description: string | null;
  category: 'indicador' | 'escaner' | 'tools';
  status: 'activo' | 'desactivado' | 'desarrollo';
  type: 'privado' | 'publico';
  image_1: string | null;
  image_2: string | null;
  image_3: string | null;
  total_users: number;
  active_users: number;
  created_at: string;
  updated_at: string;
};

type Stats = {
  total: number;
  activos: number;
  indicadores: number;
  escaners: number;
  tools: number;
  free: number;
  premium: number;
};

type Props = {
  indicators: Indicator[];
  stats: Stats;
};

export default function IndicadoresTab({ indicators, stats }: Props) {
  return (
    <div className="space-y-4">
      {/* Stats Cards - Una sola fila compacta */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Indicadores */}
        <div className="rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-4 backdrop-blur-sm border border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="rounded-md bg-purple-500/20 p-2">
              <svg
                className="h-4 w-4 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-emerald-400 mt-1">{stats.activos} activos</p>
        </div>

        {/* Indicadores */}
        <div className="rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4 backdrop-blur-sm border border-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="rounded-md bg-blue-500/20 p-2">
              <svg
                className="h-4 w-4 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-1">Indicadores</p>
          <p className="text-2xl font-bold text-white">{stats.indicadores}</p>
        </div>

        {/* Escaners */}
        <div className="rounded-lg bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 p-4 backdrop-blur-sm border border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="rounded-md bg-cyan-500/20 p-2">
              <svg
                className="h-4 w-4 text-cyan-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-1">Escaners</p>
          <p className="text-2xl font-bold text-white">{stats.escaners}</p>
        </div>

        {/* Tools */}
        <div className="rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-4 backdrop-blur-sm border border-amber-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="rounded-md bg-amber-500/20 p-2">
              <svg
                className="h-4 w-4 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-1">Tools</p>
          <p className="text-2xl font-bold text-white">{stats.tools}</p>
        </div>

        {/* Free */}
        <div className="rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-4 backdrop-blur-sm border border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="rounded-md bg-emerald-500/20 p-2">
              <svg
                className="h-4 w-4 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-1">Free</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.free}</p>
        </div>

        {/* Premium */}
        <div className="rounded-lg bg-gradient-to-br from-violet-500/10 to-violet-600/5 p-4 backdrop-blur-sm border border-violet-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="rounded-md bg-violet-500/20 p-2">
              <svg
                className="h-4 w-4 text-violet-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-1">Premium</p>
          <p className="text-2xl font-bold text-violet-400">{stats.premium}</p>
        </div>
      </div>

      {/* Header con botón agregar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Lista de Indicadores
          </h2>
          <p className="text-sm text-gray-400">
            Gestiona todos tus indicadores de TradingView
          </p>
        </div>
        <AddIndicatorButton />
      </div>

      {/* Tabla de Indicadores */}
      <IndicatorsTable initialIndicators={indicators} />
    </div>
  );
}
