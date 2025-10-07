'use client';

import { Calendar, Crown, Gift, Infinity, AlertCircle, TrendingUp, ExternalLink } from 'lucide-react';
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
  } | null;
};

type Props = {
  accesses: IndicatorAccess[];
};

export default function AdminIndicatorAccessList({ accesses }: Props) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
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

  const isExpired = (expiresAt: string | null, durationType: string | null) => {
    if (durationType === '1L') return false;
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getTierBadge = (tier: string) => {
    if (tier === 'premium') {
      return (
        <div className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
          <Crown className="h-3 w-3" />
          Premium
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
        <Gift className="h-3 w-3" />
        Free
      </div>
    );
  };

  const getCategoryBadge = (category: string | null | undefined) => {
    if (!category) {
      return (
        <span className="rounded-full border border-gray-500/30 bg-gray-500/10 px-2.5 py-0.5 text-xs font-medium text-gray-400">
          Sin categoría
        </span>
      );
    }
    
    const colors = {
      indicador: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
      escaner: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
      tools: 'border-purple-500/30 bg-purple-500/10 text-purple-400'
    };
    
    return (
      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[category.toLowerCase() as keyof typeof colors] || colors.indicador}`}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status: string, expiresAt: string | null, durationType: string | null) => {
    if (status === 'active') {
      const expired = isExpired(expiresAt, durationType);
      const expiringSoon = !expired && isExpiringSoon(expiresAt);
      
      if (expired) {
        return (
          <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
            Expirado
          </span>
        );
      }
      
      if (expiringSoon) {
        return (
          <span className="inline-flex items-center rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-400">
            Por expirar
          </span>
        );
      }
      
      return (
        <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
          Activo
        </span>
      );
    }
    
    if (status === 'revoked') {
      return (
        <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
          Revocado
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center rounded-full border border-gray-500/30 bg-gray-500/10 px-2.5 py-1 text-xs font-medium text-gray-400">
        {status}
      </span>
    );
  };

  const getAccessSourceBadge = (source: string) => {
    const sources: Record<string, { label: string; color: string }> = {
      manual: { label: 'Manual', color: 'border-blue-500/30 bg-blue-500/10 text-blue-400' },
      stripe: { label: 'Stripe', color: 'border-purple-500/30 bg-purple-500/10 text-purple-400' },
      promocode: { label: 'Promo', color: 'border-pink-500/30 bg-pink-500/10 text-pink-400' },
      migration: { label: 'Migración', color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' }
    };
    
    const sourceConfig = sources[source] || { label: source, color: 'border-gray-500/30 bg-gray-500/10 text-gray-400' };
    
    return (
      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${sourceConfig.color}`}>
        {sourceConfig.label}
      </span>
    );
  };

  // Calcular estadísticas
  const totalAccesses = accesses.length;
  const activeAccesses = accesses.filter(a => 
    a.status === 'active' && !isExpired(a.expires_at, a.duration_type)
  ).length;
  const premiumAccesses = accesses.filter(a => 
    a.indicators?.access_tier === 'premium'
  ).length;
  const freeAccesses = accesses.filter(a => 
    a.indicators?.access_tier === 'free'
  ).length;

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Accesos a Indicadores TradingView</h3>
          <p className="text-sm text-gray-400">Gestión completa de indicadores del usuario</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-2xl font-bold text-apidevs-primary">{activeAccesses}</div>
            <div className="text-xs text-gray-400">Activos</div>
          </div>
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">Total</span>
          </div>
          <div className="text-xl font-bold text-white">{totalAccesses}</div>
        </div>
        
        <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-1">
            <Gift className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400">Free</span>
          </div>
          <div className="text-xl font-bold text-emerald-400">{freeAccesses}</div>
        </div>
        
        <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/30">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-400">Premium</span>
          </div>
          <div className="text-xl font-bold text-amber-400">{premiumAccesses}</div>
        </div>
        
        <div className="bg-apidevs-primary/10 rounded-lg p-3 border border-apidevs-primary/30">
          <div className="flex items-center gap-2 mb-1">
            <Infinity className="w-4 h-4 text-apidevs-primary" />
            <span className="text-xs text-apidevs-primary">Lifetime</span>
          </div>
          <div className="text-xl font-bold text-apidevs-primary">
            {accesses.filter(a => a.duration_type === '1L').length}
          </div>
        </div>
      </div>

      {/* Tabla de indicadores */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[3fr_120px_100px_110px_110px] gap-4 border-b border-zinc-800 bg-zinc-900/80 px-4 py-3 text-xs font-medium text-gray-400">
          <div>INDICADOR</div>
          <div className="text-center">ESTADO</div>
          <div className="text-center">ORIGEN</div>
          <div className="text-center">CONCEDIDO</div>
          <div className="text-center">EXPIRA</div>
        </div>

        {/* Filas */}
        <div className="divide-y divide-zinc-800">
          {accesses
            .sort((a, b) => {
              // 1. Prioridad: Indicadores activos primero
              const aActive = a.status === 'active' && !isExpired(a.expires_at, a.duration_type);
              const bActive = b.status === 'active' && !isExpired(b.expires_at, b.duration_type);
              if (aActive !== bActive) return bActive ? 1 : -1;

              // 2. Prioridad: Comprados (purchase) primero
              const aPurchased = a.access_source === 'purchase';
              const bPurchased = b.access_source === 'purchase';
              if (aPurchased !== bPurchased) return bPurchased ? 1 : -1;

              // 3. Prioridad: Premium antes que Free
              const aPremium = a.indicators?.access_tier === 'premium';
              const bPremium = b.indicators?.access_tier === 'premium';
              if (aPremium !== bPremium) return bPremium ? 1 : -1;

              // 4. Por fecha de concesión: más recientes primero
              if (a.granted_at && b.granted_at) {
                return new Date(b.granted_at).getTime() - new Date(a.granted_at).getTime();
              }

              return 0;
            })
            .map((access) => {
            const indicator = access.indicators;
            if (!indicator) return null;

            const isLifetime = access.duration_type === '1L' || !access.expires_at;
            const expired = isExpired(access.expires_at, access.duration_type);
            const expiringSoon = !expired && isExpiringSoon(access.expires_at);

            return (
              <div
                key={access.id}
                className={`grid grid-cols-[3fr_120px_100px_110px_110px] gap-4 items-center px-4 py-3 transition-colors hover:bg-zinc-800/30 ${expired ? 'opacity-60' : ''}`}
              >
                {/* Columna: Indicador */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 h-10 w-10 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800">
                    {indicator.image_1 ? (
                      <Image
                        src={indicator.image_1}
                        alt={indicator.name}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800">
                        <Crown className="h-4 w-4 text-zinc-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-white truncate">
                        {indicator.name}
                      </p>
                      {getTierBadge(indicator.access_tier)}
                    </div>
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(indicator.category)}
                      {indicator.public_script_url && (
                        <a
                          href={indicator.public_script_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-apidevs-primary hover:text-green-400 flex items-center gap-1"
                        >
                          Ver
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Columna: Estado */}
                <div className="flex justify-center">
                  {getStatusBadge(access.status, access.expires_at, access.duration_type)}
                </div>

                {/* Columna: Origen */}
                <div className="flex justify-center">
                  {getAccessSourceBadge(access.access_source)}
                </div>

                {/* Columna: Concedido */}
                <div className="text-center">
                  <p className="text-sm text-gray-400">
                    {formatDate(access.granted_at)}
                  </p>
                </div>

                {/* Columna: Expira */}
                <div className="text-center">
                  {isLifetime ? (
                    <div className="flex items-center justify-center gap-1.5 text-sm">
                      <Infinity className="h-4 w-4 text-emerald-400" />
                      <span className="font-medium text-emerald-400 whitespace-nowrap">Lifetime</span>
                    </div>
                  ) : (
                    <div>
                      <p className={`text-sm ${expiringSoon ? 'font-medium text-yellow-400' : expired ? 'text-red-400' : 'text-gray-400'}`}>
                        {formatDate(access.expires_at)}
                      </p>
                      {expiringSoon && (
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs text-yellow-400">Pronto</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

