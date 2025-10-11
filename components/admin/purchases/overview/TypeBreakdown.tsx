'use client';

import { ShoppingCart, RefreshCw, Award, TrendingUp, DollarSign } from 'lucide-react';

interface TypeBreakdownProps {
  subscription: {
    count: number;
    revenue: number;
  };
  oneTime: {
    count: number;
    revenue: number;
  };
  lifetime: {
    count: number;
    revenue: number;
  };
}

export default function TypeBreakdown({ subscription, oneTime, lifetime }: TypeBreakdownProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // ⚠️ CORREGIDO: One-Time y Lifetime son la misma categoría (compras únicas)
  // Unificar oneTime y lifetime en una sola categoría
  const totalOneTimePurchases = oneTime.count + lifetime.count;
  const totalOneTimeRevenue = oneTime.revenue + lifetime.revenue;

  const total = subscription.revenue + totalOneTimeRevenue;
  const totalCount = subscription.count + totalOneTimePurchases;

  const calculatePercentage = (amount: number) => {
    if (total === 0) return 0;
    return ((amount / total) * 100).toFixed(1);
  };

  // Separar lifetime de las suscripciones recurrentes
  // Asumiendo que lifetime.count son los lifetime purchases ya identificados
  const lifetimeRevenue = lifetime.revenue;
  const lifetimeCount = lifetime.count;
  
  // Las suscripciones recurrentes (mensual/anual) son el resto
  const recurringRevenue = subscription.revenue;
  const recurringCount = subscription.count;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Análisis de Ingresos</h3>
          <p className="text-sm text-gray-400">Distribución por tipo de compra</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            {formatCurrency(total)}
          </div>
          <div className="text-xs text-gray-500">{totalCount} compras</div>
        </div>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ============ NUEVAS COMPRAS ============ */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          {/* Header Card */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
              <ShoppingCart className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-bold text-lg">Nuevas Compras</h4>
              <p className="text-xs text-gray-400">Compras únicas realizadas</p>
            </div>
          </div>

          {/* Total de Nuevas Compras */}
          <div className="mb-6 pb-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">
                  {formatCurrency(totalOneTimeRevenue)}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {totalOneTimePurchases} compras • {calculatePercentage(totalOneTimeRevenue)}% del total
                </div>
              </div>
              <div className="text-right">
                <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                  parseFloat(calculatePercentage(totalOneTimeRevenue)) > 50 
                    ? 'text-green-400 bg-green-500/10' 
                    : 'text-purple-400 bg-purple-500/10'
                }`}>
                  {calculatePercentage(totalOneTimeRevenue)}%
                </div>
              </div>
            </div>
          </div>

          {/* Desglose de Nuevas Compras */}
          <div className="space-y-3">
            {/* Lifetime */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-600/30 rounded-xl hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-white font-semibold text-sm">Lifetime</div>
                  <div className="text-xs text-gray-400">{lifetimeCount} compras</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">{formatCurrency(lifetimeRevenue)}</div>
                <div className="text-xs text-yellow-400">
                  {total > 0 ? `${((lifetimeRevenue / total) * 100).toFixed(1)}%` : '0%'}
                </div>
              </div>
            </div>

            {/* One-Time (sin lifetime) */}
            {oneTime.count > 0 && (
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-600/30 rounded-xl hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-white font-semibold text-sm">Otros One-Time</div>
                    <div className="text-xs text-gray-400">{oneTime.count} compras</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{formatCurrency(oneTime.revenue)}</div>
                  <div className="text-xs text-purple-400">
                    {total > 0 ? `${((oneTime.revenue / total) * 100).toFixed(1)}%` : '0%'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============ SUSCRIPCIONES ============ */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          {/* Header Card */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
              <RefreshCw className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-bold text-lg">Suscripciones</h4>
              <p className="text-xs text-gray-400">Ingresos recurrentes</p>
            </div>
          </div>

          {/* Total de Suscripciones */}
          <div className="mb-6 pb-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">
                  {formatCurrency(recurringRevenue)}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {recurringCount} suscripciones • {calculatePercentage(recurringRevenue)}% del total
                </div>
              </div>
              <div className="text-right">
                <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                  parseFloat(calculatePercentage(recurringRevenue)) > 50 
                    ? 'text-green-400 bg-green-500/10' 
                    : 'text-blue-400 bg-blue-500/10'
                }`}>
                  {calculatePercentage(recurringRevenue)}%
                </div>
              </div>
            </div>
          </div>

          {/* Desglose de Suscripciones */}
          <div className="space-y-3">
            {/* Mensual */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-600/30 rounded-xl hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-white font-semibold text-sm">Mensual</div>
                  <div className="text-xs text-gray-400">{recurringCount} activas</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">{formatCurrency(recurringRevenue)}</div>
                <div className="text-xs text-blue-400">
                  {total > 0 ? `${((recurringRevenue / total) * 100).toFixed(1)}%` : '0%'}
                </div>
              </div>
            </div>

            {/* Info adicional */}
            <div className="p-3 bg-gray-800/30 rounded-xl border border-gray-700/30">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span>
                  {recurringCount > 0 
                    ? `Promedio: ${formatCurrency(recurringRevenue / recurringCount)}/mes`
                    : 'Sin suscripciones activas'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Progress Bar General */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-400">DISTRIBUCIÓN DE INGRESOS</span>
          <span className="text-xs text-gray-500">{formatCurrency(total)}</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden flex">
          {/* Barra de Nuevas Compras */}
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 relative group"
            style={{ width: `${calculatePercentage(totalOneTimeRevenue)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {/* Barra de Suscripciones */}
          <div 
            className="bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 relative group"
            style={{ width: `${calculatePercentage(recurringRevenue)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
            <span className="text-gray-400">Nuevas Compras: {calculatePercentage(totalOneTimeRevenue)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
            <span className="text-gray-400">Suscripciones: {calculatePercentage(recurringRevenue)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
