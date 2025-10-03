'use client';

import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type Indicator = {
  id: string;
  pine_id: string;
  tradingview_url: string | null;
  public_script_url: string | null;
  name: string;
  description: string | null;
  category: string;
  status: string;
  type: string;
  access_tier: string;
  image_1: string | null;
  image_2: string | null;
  image_3: string | null;
  features: any;
  tags: string[];
  total_users: number;
  active_users: number;
  created_at: string;
  updated_at: string;
};

type Props = {
  indicator: Indicator;
};

export default function IndicatorInfo({ indicator }: Props) {
  return (
    <div className="space-y-6">
      {/* Información Básica */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Información Básica
          </h3>
          <Link
            href={`/admin/indicadores/${indicator.id}/editar`}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-500/20"
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
            Editar
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Pine ID */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Pine ID
            </label>
            <code className="block rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 font-mono text-sm text-emerald-400">
              {indicator.pine_id}
            </code>
          </div>

          {/* Nombre */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Nombre
            </label>
            <p className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white">
              {indicator.name}
            </p>
          </div>

          {/* Enlaces de TradingView */}
          {(indicator.tradingview_url || indicator.public_script_url) && (
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-400">
                Acceso Rápido en TradingView
              </label>
              <div className="flex flex-wrap gap-3">
                {/* URL del Código (Pine Editor) */}
                {indicator.tradingview_url && (
                  <a
                    href={indicator.tradingview_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center gap-3 overflow-hidden rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-blue-600/5 px-5 py-3 transition-all hover:border-blue-500/50 hover:from-blue-500/20 hover:to-blue-600/10 hover:shadow-lg hover:shadow-blue-500/20"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 transition-transform group-hover:scale-110">
                      <svg
                        className="h-5 w-5 text-blue-400"
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
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-400">
                        Ver Código
                      </p>
                      <p className="text-xs text-gray-400">Pine Editor</p>
                    </div>
                    <svg
                      className="h-5 w-5 text-blue-400 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </a>
                )}

                {/* URL Pública del Script */}
                {indicator.public_script_url && (
                  <a
                    href={indicator.public_script_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center gap-3 overflow-hidden rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-purple-600/5 px-5 py-3 transition-all hover:border-purple-500/50 hover:from-purple-500/20 hover:to-purple-600/10 hover:shadow-lg hover:shadow-purple-500/20"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 transition-transform group-hover:scale-110">
                      <svg
                        className="h-5 w-5 text-purple-400"
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
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-purple-400">
                        Vista Pública
                      </p>
                      <p className="text-xs text-gray-400">Página del Script</p>
                    </div>
                    <svg
                      className="h-5 w-5 text-purple-400 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Categoría */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Categoría
            </label>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium ${
                indicator.category === 'indicador'
                  ? 'border-blue-500/30 bg-blue-500/20 text-blue-400'
                  : indicator.category === 'escaner'
                    ? 'border-cyan-500/30 bg-cyan-500/20 text-cyan-400'
                    : 'border-purple-500/30 bg-purple-500/20 text-purple-400'
              }`}
            >
              {indicator.category}
            </span>
          </div>

          {/* Estado */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Estado
            </label>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium ${
                indicator.status === 'activo'
                  ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                  : indicator.status === 'desactivado'
                    ? 'border-red-500/30 bg-red-500/20 text-red-400'
                    : 'border-yellow-500/30 bg-yellow-500/20 text-yellow-400'
              }`}
            >
              {indicator.status}
            </span>
          </div>

          {/* Tipo */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Tipo de Acceso
            </label>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium ${
                indicator.type === 'privado'
                  ? 'border-purple-500/30 bg-purple-500/20 text-purple-400'
                  : 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {indicator.type === 'privado' ? 'Privado (Requiere suscripción)' : 'Público (Gratuito)'}
            </span>
          </div>

          {/* Nivel de Acceso (FREE/PREMIUM) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Nivel de Acceso
            </label>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${
                indicator.access_tier === 'premium'
                  ? 'border-amber-500/30 bg-amber-500/20 text-amber-400'
                  : 'border-green-500/30 bg-green-500/20 text-green-400'
              }`}
            >
              {indicator.access_tier === 'premium' ? (
                <>
                  <span>💎</span>
                  <span>Premium (De Pago)</span>
                </>
              ) : (
                <>
                  <span>🎁</span>
                  <span>Free (Gratuito)</span>
                </>
              )}
            </span>
          </div>

          {/* Usuarios */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Usuarios
            </label>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">
                {indicator.active_users}
              </span>
              <span className="text-sm text-gray-500">
                activos de {indicator.total_users} totales
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción */}
      {indicator.description && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-lg font-semibold text-white">Descripción</h3>
          <p className="text-gray-300 leading-relaxed">{indicator.description}</p>
        </div>
      )}

      {/* Imágenes */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
        <h3 className="mb-4 text-lg font-semibold text-white">
          Imágenes del Indicador
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[indicator.image_1, indicator.image_2, indicator.image_3].map(
            (image, idx) =>
              image && (
                <div
                  key={idx}
                  className="overflow-hidden rounded-lg border border-zinc-700"
                >
                  <Image
                    src={image}
                    alt={`${indicator.name} - Imagen ${idx + 1}`}
                    width={400}
                    height={200}
                    className="h-auto w-full object-cover"
                  />
                </div>
              )
          )}
          {!indicator.image_1 && !indicator.image_2 && !indicator.image_3 && (
            <div className="col-span-3 flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-800/30 py-12">
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-4 text-sm text-gray-400">
                No hay imágenes disponibles
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {indicator.tags && indicator.tags.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-lg font-semibold text-white">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {indicator.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-sm text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
        <h3 className="mb-4 text-lg font-semibold text-white">Metadata</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">
              Fecha de Creación
            </label>
            <p className="text-white">
              {format(new Date(indicator.created_at), "d 'de' MMMM 'de' yyyy", {
                locale: es
              })}
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">
              Última Actualización
            </label>
            <p className="text-white">
              {format(new Date(indicator.updated_at), "d 'de' MMMM 'de' yyyy", {
                locale: es
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

