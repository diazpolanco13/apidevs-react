'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Indicator = {
  id: string;
  pine_id: string;
  tradingview_url: string | null;
  public_script_url: string | null;
  name: string;
  description: string | null;
  category: 'indicador' | 'escaner' | 'tools';
  status: 'activo' | 'desactivado' | 'desarrollo';
  type: 'privado' | 'publico';
  access_tier: 'free' | 'premium';
  image_1: string | null;
  image_2: string | null;
  image_3: string | null;
  total_users: number;
  active_users: number;
  created_at: string;
  updated_at: string;
};

type Props = {
  initialIndicators: Indicator[];
};

export default function IndicatorsTable({ initialIndicators }: Props) {
  const [indicators, setIndicators] = useState<Indicator[]>(initialIndicators);
  const [filter, setFilter] = useState<'all' | 'activo' | 'desactivado' | 'desarrollo'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'indicador' | 'escaner' | 'tools'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'privado' | 'publico'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar indicadores
  const filteredIndicators = indicators.filter((indicator) => {
    const matchesStatus = filter === 'all' || indicator.status === filter;
    const matchesCategory = categoryFilter === 'all' || indicator.category === categoryFilter;
    const matchesType = typeFilter === 'all' || indicator.type === typeFilter;
    const matchesSearch =
      searchTerm === '' ||
      indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indicator.pine_id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesCategory && matchesType && matchesSearch;
  });


  const handleDelete = async (indicatorId: string) => {
    if (!confirm('¿Estás seguro de eliminar este indicador?')) return;

    try {
      const response = await fetch(`/api/admin/indicators/${indicatorId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setIndicators(indicators.filter((i) => i.id !== indicatorId));
      } else {
        alert('Error al eliminar el indicador');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el indicador');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'indicador':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'escaner':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'tools':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'desactivado':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'desarrollo':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'privado':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'publico':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="rounded-xl bg-zinc-900/50 p-6 backdrop-blur-sm border border-zinc-800">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {/* Búsqueda */}
          <div className="lg:col-span-4">
            <input
              type="text"
              placeholder="Buscar por nombre o Pine ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Filtro de Estado */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Estado
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="desactivado">Desactivado</option>
              <option value="desarrollo">En Desarrollo</option>
            </select>
          </div>

          {/* Filtro de Categoría */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Categoría
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">Todas las categorías</option>
              <option value="indicador">Indicador</option>
              <option value="escaner">Escaner</option>
              <option value="tools">Tools</option>
            </select>
          </div>

          {/* Filtro de Tipo */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Tipo
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">Todos los tipos</option>
              <option value="privado">Privado</option>
              <option value="publico">Público</option>
            </select>
          </div>

          {/* Contador de resultados */}
          <div className="flex items-end">
            <p className="text-sm text-gray-400">
              Mostrando{' '}
              <span className="font-semibold text-white">
                {filteredIndicators.length}
              </span>{' '}
              de {indicators.length} indicadores
            </p>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Indicador
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Categoría
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Nivel
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Usuarios Activos
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Enlaces
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredIndicators.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
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
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="mt-4 text-sm text-gray-400">
                        No se encontraron indicadores
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredIndicators.map((indicator) => (
                  <tr
                    key={indicator.id}
                    className="transition-colors hover:bg-zinc-800/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Imagen */}
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                          {indicator.image_1 ? (
                            <Image
                              src={indicator.image_1}
                              alt={indicator.name}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-600">
                              <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div>
                          <p className="font-medium text-white">
                            {indicator.name}
                          </p>
                          {indicator.description && (
                            <p className="text-sm text-gray-400 line-clamp-1">
                              {indicator.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(
                          indicator.category
                        )}`}
                      >
                        {indicator.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                          indicator.status
                        )}`}
                      >
                        {indicator.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          indicator.access_tier === 'premium'
                            ? 'border-amber-500/30 bg-amber-500/20 text-amber-400'
                            : 'border-green-500/30 bg-green-500/20 text-green-400'
                        }`}
                      >
                        {indicator.access_tier === 'premium' ? '💎' : '🎁'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <span className="text-2xl font-bold text-emerald-400">
                          {indicator.active_users || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Botón URL del Código */}
                        {indicator.tradingview_url && (
                          <a
                            href={indicator.tradingview_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-blue-500/10 p-2 text-blue-400 transition-colors hover:bg-blue-500/20"
                            title="Ver Código (Pine Editor)"
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
                                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                              />
                            </svg>
                          </a>
                        )}

                        {/* Botón URL Pública */}
                        {indicator.public_script_url && (
                          <a
                            href={indicator.public_script_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-purple-500/10 p-2 text-purple-400 transition-colors hover:bg-purple-500/20"
                            title="Vista Pública del Script"
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </a>
                        )}

                        {/* Si no tiene enlaces */}
                        {!indicator.tradingview_url && !indicator.public_script_url && (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Botón Ver Detalles */}
                        <Link
                          href={`/admin/indicadores/${indicator.id}`}
                          className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
                        >
                          Ver detalles →
                        </Link>

                        {/* Botón Editar */}
                        <Link
                          href={`/admin/indicadores/${indicator.id}/editar`}
                          className="rounded-lg bg-blue-500/10 p-2 text-blue-400 transition-colors hover:bg-blue-500/20"
                          title="Editar"
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </Link>

                        {/* Botón Eliminar */}
                        <button
                          onClick={() => handleDelete(indicator.id)}
                          className="rounded-lg bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20"
                          title="Eliminar"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

