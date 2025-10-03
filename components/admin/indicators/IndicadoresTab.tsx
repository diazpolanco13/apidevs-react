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
  privados: number;
  publicos: number;
  indicadores: number;
  escaners: number;
  tools: number;
};

type Props = {
  indicators: Indicator[];
  stats: Stats;
};

export default function IndicadoresTab({ indicators, stats }: Props) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Indicadores */}
        <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-6 backdrop-blur-sm border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Indicadores</p>
              <p className="mt-2 text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="rounded-lg bg-purple-500/20 p-3">
              <svg
                className="h-6 w-6 text-purple-400"
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
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-emerald-400">
              {stats.activos} activos
            </span>
          </div>
        </div>

        {/* Indicadores */}
        <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6 backdrop-blur-sm border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Indicadores</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {stats.indicadores}
              </p>
            </div>
            <div className="rounded-lg bg-blue-500/20 p-3">
              <svg
                className="h-6 w-6 text-blue-400"
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
        </div>

        {/* Escaners */}
        <div className="rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 p-6 backdrop-blur-sm border border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Escaners</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {stats.escaners}
              </p>
            </div>
            <div className="rounded-lg bg-cyan-500/20 p-3">
              <svg
                className="h-6 w-6 text-cyan-400"
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
        </div>

        {/* Privados vs Públicos */}
        <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-6 backdrop-blur-sm border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Distribución</p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-2xl font-bold text-emerald-400">
                  {stats.privados}
                </p>
                <span className="text-sm text-gray-500">privados</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-blue-400">
                  {stats.publicos}
                </p>
                <span className="text-sm text-gray-500">públicos</span>
              </div>
            </div>
          </div>
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

