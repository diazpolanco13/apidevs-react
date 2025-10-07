'use client';

import { ExternalLink, Calendar, Crown, Gift, Infinity } from 'lucide-react';
import Image from 'next/image';

type IndicatorAccess = {
  id: string;
  status: string;
  granted_at: string | null;
  expires_at: string | null;
  duration_type: string | null;
  access_source: string;
  indicators: {
    id: string;
    pine_id: string;
    name: string;
    description: string | null;
    category: string;
    access_tier: string;
    tradingview_url: string | null;
    public_script_url: string | null;
    image_1: string | null;
  };
};

type Props = {
  accesses: IndicatorAccess[];
};

export default function UserIndicatorsList({ accesses }: Props) {
  if (accesses.length === 0) {
    return (
      <div className="text-center py-20 border border-zinc-800 rounded-3xl bg-zinc-900/30">
        <div className="w-20 h-20 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <Crown className="w-10 h-10 text-zinc-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">No tienes indicadores activos</h2>
        <p className="text-gray-400 mb-6">
          Actualiza tu plan para acceder a indicadores profesionales
        </p>
        <a
          href="/pricing"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-apidevs-primary to-green-400 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-apidevs-primary/50 transition-all"
        >
          Ver Planes
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isExpiringSoon = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    const daysUntilExpiration = Math.ceil(
      (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiration <= 7 && daysUntilExpiration > 0;
  };

  const getTierBadge = (tier: string) => {
    if (tier === 'premium') {
      return (
        <div className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
          <Crown className="h-3 w-3" />
          Premium
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
        <Gift className="h-3 w-3" />
        Free
      </div>
    );
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      indicador: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
      escaner: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
      tools: 'border-purple-500/30 bg-purple-500/10 text-purple-400'
    };
    
    return (
      <span className={`rounded-full border px-3 py-1 text-xs font-medium ${colors[category as keyof typeof colors] || colors.indicador}`}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      {/* Header de la tabla */}
      <div className="grid grid-cols-[3fr_100px_140px_140px_100px] gap-4 border-b border-zinc-800 bg-zinc-900/80 px-6 py-4 text-sm font-medium text-gray-400">
        <div>INDICADOR</div>
        <div className="text-center">ESTADO</div>
        <div className="text-center">CONCEDIDO</div>
        <div className="text-center">EXPIRA</div>
        <div className="text-center">ACCIÓN</div>
      </div>

      {/* Filas de indicadores */}
      <div className="divide-y divide-zinc-800">
        {accesses.map((access) => {
          const indicator = access.indicators;
          const isLifetime = access.duration_type === '1L' || !access.expires_at;
          const expiringSoon = !isLifetime && isExpiringSoon(access.expires_at);

          return (
            <div
              key={access.id}
              className="grid grid-cols-[3fr_100px_140px_140px_100px] gap-4 items-center px-6 py-4 transition-colors hover:bg-zinc-800/30"
            >
              {/* Columna: Indicador */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-12 w-12 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800">
                  {indicator.image_1 ? (
                    <Image
                      src={indicator.image_1}
                      alt={indicator.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800">
                      <Crown className="h-5 w-5 text-zinc-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white truncate">
                      {indicator.name}
                    </p>
                    {getTierBadge(indicator.access_tier)}
                  </div>
                  {getCategoryBadge(indicator.category)}
                </div>
              </div>

              {/* Columna: Estado */}
              <div className="flex justify-center">
                <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                  active
                </span>
              </div>

              {/* Columna: Concedido */}
              <div className="text-center">
                <p className="text-sm text-gray-400">
                  {formatDate(access.granted_at)}
                </p>
              </div>

              {/* Columna: Expira */}
              <div className="flex justify-center">
                {isLifetime ? (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Infinity className="h-4 w-4 text-emerald-400" />
                    <span className="font-medium text-emerald-400">Lifetime</span>
                  </div>
                ) : (
                  <p className={`text-sm ${expiringSoon ? 'font-medium text-yellow-400' : 'text-gray-400'}`}>
                    {formatDate(access.expires_at)}
                    {expiringSoon && (
                      <span className="ml-1 text-yellow-400">⚠️</span>
                    )}
                  </p>
                )}
              </div>

              {/* Columna: Acción */}
              <div className="flex justify-center">
                {indicator.public_script_url && (
                  <a
                    href={indicator.public_script_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-apidevs-primary to-green-400 px-3 py-1.5 text-xs font-semibold text-black transition-all hover:shadow-lg hover:shadow-apidevs-primary/50"
                  >
                    Usar
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

