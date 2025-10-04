'use client';

import { useState } from 'react';
import IndicadoresTab from './IndicadoresTab';
import GestionUsuariosTab from './GestionUsuariosTab';
import BulkAssignmentTab from './BulkAssignmentTab';
import HistorialTab from './HistorialTab';

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
  initialIndicators: Indicator[];
  stats: Stats;
};

export default function IndicadoresMainView({ initialIndicators, stats }: Props) {
  const [activeTab, setActiveTab] = useState<'indicadores' | 'usuarios' | 'asignacion' | 'historial'>('indicadores');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
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
          <div>
            <h1 className="text-3xl font-bold text-white">
              Gestión de Indicadores TradingView
            </h1>
            <p className="text-gray-400">
              Panel unificado de gestión de indicadores y accesos
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-800">
          <nav className="flex justify-start space-x-1 -mb-px">
            {/* Tab Indicadores */}
            <button
              onClick={() => setActiveTab('indicadores')}
              className={`
                group relative flex items-center gap-3 px-6 py-4 border-b-2 font-medium text-sm transition-all
                ${
                  activeTab === 'indicadores'
                    ? 'border-apidevs-primary text-apidevs-primary'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }
              `}
            >
              <svg
                className={`h-5 w-5 ${
                  activeTab === 'indicadores'
                    ? 'text-apidevs-primary'
                    : 'text-gray-400 group-hover:text-gray-300'
                }`}
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

              <div className="flex flex-col items-start">
                <span className="flex items-center gap-2">
                  Indicadores
                  <span
                    className={`
                      px-2 py-0.5 rounded-full text-xs font-semibold
                      ${
                        activeTab === 'indicadores'
                          ? 'bg-apidevs-primary/20 text-apidevs-primary'
                          : 'bg-gray-800 text-gray-400'
                      }
                    `}
                  >
                    {stats.total}
                  </span>
                </span>
                <span className="text-xs text-gray-500 text-left mt-0.5">
                  Catálogo de indicadores TradingView
                </span>
              </div>

              {/* Active indicator */}
              {activeTab === 'indicadores' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-apidevs-primary to-green-400" />
              )}
            </button>

            {/* Tab Gestión de Usuarios */}
            <button
              onClick={() => setActiveTab('usuarios')}
              className={`
                group relative flex items-center gap-3 px-6 py-4 border-b-2 font-medium text-sm transition-all
                ${
                  activeTab === 'usuarios'
                    ? 'border-apidevs-primary text-apidevs-primary'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }
              `}
            >
              <svg
                className={`h-5 w-5 ${
                  activeTab === 'usuarios'
                    ? 'text-apidevs-primary'
                    : 'text-gray-400 group-hover:text-gray-300'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>

              <div className="flex flex-col items-start">
                <span className="flex items-center gap-2">
                  Gestión de Usuarios
                </span>
                <span className="text-xs text-gray-500 text-left mt-0.5">
                  Administración de accesos por usuario
                </span>
              </div>

              {/* Active indicator */}
              {activeTab === 'usuarios' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-apidevs-primary to-green-400" />
              )}
            </button>

            {/* Tab Asignación Masiva */}
            <button
              onClick={() => setActiveTab('asignacion')}
              className={`
                group relative flex items-center gap-3 px-6 py-4 border-b-2 font-medium text-sm transition-all
                ${
                  activeTab === 'asignacion'
                    ? 'border-apidevs-primary text-apidevs-primary'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }
              `}
            >
              <svg
                className={`h-5 w-5 ${
                  activeTab === 'asignacion'
                    ? 'text-apidevs-primary'
                    : 'text-gray-400 group-hover:text-gray-300'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>

              <div className="flex flex-col items-start">
                <span className="flex items-center gap-2">
                  Asignación Masiva
                </span>
                <span className="text-xs text-gray-500 text-left mt-0.5">
                  Operaciones bulk a múltiples usuarios
                </span>
              </div>

              {/* Active indicator */}
              {activeTab === 'asignacion' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-apidevs-primary to-green-400" />
              )}
            </button>

            {/* Tab Historial */}
            <button
              onClick={() => setActiveTab('historial')}
              className={`
                group relative flex items-center gap-3 px-6 py-4 border-b-2 font-medium text-sm transition-all
                ${
                  activeTab === 'historial'
                    ? 'border-apidevs-primary text-apidevs-primary'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }
              `}
            >
              <svg
                className={`h-5 w-5 ${
                  activeTab === 'historial'
                    ? 'text-apidevs-primary'
                    : 'text-gray-400 group-hover:text-gray-300'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              <div className="flex flex-col items-start">
                <span className="flex items-center gap-2">
                  Historial
                </span>
                <span className="text-xs text-gray-500 text-left mt-0.5">
                  Auditoría y seguimiento de operaciones
                </span>
              </div>

              {/* Active indicator */}
              {activeTab === 'historial' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-apidevs-primary to-green-400" />
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        {activeTab === 'indicadores' && (
          <IndicadoresTab indicators={initialIndicators} stats={stats} />
        )}
        {activeTab === 'usuarios' && <GestionUsuariosTab />}
        {activeTab === 'asignacion' && <BulkAssignmentTab />}
        {activeTab === 'historial' && <HistorialTab />}
      </div>
    </div>
  );
}

