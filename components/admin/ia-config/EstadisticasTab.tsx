'use client';

import { BarChart3, TrendingUp, Users, MessageSquare, Clock, Zap, DollarSign, RefreshCw, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import UsageChart from './UsageChart';
import ConversationMetrics from './ConversationMetrics';

interface AIBalance {
  balance: number;
  usage: number;
  limit: number;
  is_free_tier: boolean;
  usage_breakdown: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  rate_limit: {
    requests: number;
    interval: string;
  };
  raw_data: {
    total_credits: number;
    total_usage: number;
    key_usage: number;
  };
}

export default function EstadisticasTab() {
  const [balance, setBalance] = useState<AIBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchBalance = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/balance');
      const data = await response.json();
      
      if (data.success) {
        setBalance(data.balance);
        setLastUpdate(new Date());
      } else {
        setError(data.message || 'Error al cargar balance');
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Error de conexión al cargar balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  // Calcular porcentaje de uso
  const usagePercentage = balance ? (balance.usage / balance.limit) * 100 : 0;
  const isNearLimit = usagePercentage > 80;
  const isDangerZone = usagePercentage > 90;

  // Calcular estimación mensual basada en uso actual
  const estimatedMonthlyCost = balance ? (balance.usage_breakdown.daily * 30) : 0;

  // Costo por token (aproximado)
  const COST_PER_1M_TOKENS = 0.25; // Claude 3 Haiku aproximado
  const estimatedTokens = balance ? (balance.usage / COST_PER_1M_TOKENS) * 1_000_000 : 0;
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Estadísticas y Métricas de IA</h2>
          <p className="text-gray-400 text-xs">Monitoreo de uso, costos y rendimiento del chatbot</p>
        </div>
        <button
          onClick={fetchBalance}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 text-xs font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <div>
              <p className="text-red-400 font-medium text-xs">Error al cargar datos</p>
              <p className="text-red-400/70 text-xs">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Balance Principal */}
      <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Balance de Cuenta OpenRouter</h3>
              <p className="text-xs text-gray-400">
                {lastUpdate ? `Actualizado: ${lastUpdate.toLocaleTimeString('es-ES')}` : 'Cargando...'}
              </p>
            </div>
          </div>
          {balance?.is_free_tier && (
            <div className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 text-[10px] font-medium">
              FREE TIER
            </div>
          )}
        </div>

        {loading && !balance ? (
          <div className="flex items-center justify-center py-6">
            <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        ) : balance ? (
          <>
            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {/* Disponible */}
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-1">Disponible</p>
                <p className={`text-2xl font-bold mb-0.5 ${
                  isDangerZone ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  ${balance.balance.toFixed(2)}
                </p>
                <p className="text-[10px] text-gray-500">Créditos restantes</p>
              </div>

              {/* Consumido */}
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-1">Consumido</p>
                <p className="text-2xl font-bold text-orange-400 mb-0.5">
                  ${balance.usage.toFixed(2)}
                </p>
                <p className="text-[10px] text-gray-500">Total usado</p>
              </div>

              {/* Límite */}
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-1">Límite</p>
                <p className="text-2xl font-bold text-blue-400 mb-0.5">
                  ${balance.limit.toFixed(2)}
                </p>
                <p className="text-[10px] text-gray-500">Total disponible</p>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-400">Uso del límite</span>
                <span className={`font-bold ${
                  isDangerZone ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-gray-300'
                }`}>
                  {usagePercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isDangerZone 
                      ? 'bg-gradient-to-r from-red-500 to-red-600' 
                      : isNearLimit 
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500'
                  }`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
              {isDangerZone && (
                <p className="text-[10px] text-red-400 mt-1.5">
                  ⚠️ Límite casi alcanzado - considera recargar créditos
                </p>
              )}
              {isNearLimit && !isDangerZone && (
                <p className="text-[10px] text-yellow-400 mt-1.5">
                  ⚡ Uso elevado - monitorear consumo
                </p>
              )}
            </div>

            {/* Rate Limit */}
            {balance.rate_limit.requests > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-blue-400">
                    Rate Limit: {balance.rate_limit.requests} requests/{balance.rate_limit.interval}
                  </span>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Consumo por Periodo */}
      {balance && (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-orange-500/10">
              <BarChart3 className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Consumo por Periodo</h3>
              <p className="text-xs text-gray-400">Desglose de uso en diferentes rangos temporales</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Diario */}
            <div className="bg-black/20 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Clock className="w-4 h-4 text-blue-400" />
                <p className="text-gray-400 text-xs font-medium">Hoy</p>
              </div>
              <p className="text-xl font-bold text-blue-400 mb-0.5">
                ${balance.usage_breakdown.daily.toFixed(4)}
              </p>
              <p className="text-[10px] text-gray-500">Consumo del día</p>
            </div>

            {/* Semanal */}
            <div className="bg-black/20 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <p className="text-gray-400 text-xs font-medium">Esta Semana</p>
              </div>
              <p className="text-xl font-bold text-purple-400 mb-0.5">
                ${balance.usage_breakdown.weekly.toFixed(4)}
              </p>
              <p className="text-[10px] text-gray-500">Últimos 7 días</p>
            </div>

            {/* Mensual */}
            <div className="bg-black/20 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center gap-1.5 mb-1.5">
                <BarChart3 className="w-4 h-4 text-green-400" />
                <p className="text-gray-400 text-xs font-medium">Este Mes</p>
              </div>
              <p className="text-xl font-bold text-green-400 mb-0.5">
                ${balance.usage_breakdown.monthly.toFixed(4)}
              </p>
              <p className="text-[10px] text-gray-500">Últimos 30 días</p>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de Evolución Temporal */}
      {balance && (
        <UsageChart 
          dailyUsage={balance.usage_breakdown.daily}
          weeklyUsage={balance.usage_breakdown.weekly}
          monthlyUsage={balance.usage_breakdown.monthly}
        />
      )}

      {/* Proyección con Anthropic Claude 3 Haiku */}
      {balance && (
        <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl border border-indigo-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-indigo-500/10">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Proyección con Claude 3 Haiku</h3>
              <p className="text-xs text-gray-400">Estimación mensual basada en uso actual</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Estimación Mensual */}
            <div className="bg-black/20 rounded-lg p-3 border border-indigo-700">
              <p className="text-gray-400 text-xs mb-1">Costo Mensual Estimado</p>
              <p className="text-2xl font-bold text-indigo-400 mb-0.5">
                ${estimatedMonthlyCost.toFixed(2)}
              </p>
              <p className="text-[10px] text-gray-500">
                ${balance.usage_breakdown.daily.toFixed(4)}/día × 30 días
              </p>
            </div>

            {/* Tokens Estimados */}
            <div className="bg-black/20 rounded-lg p-3 border border-indigo-700">
              <p className="text-gray-400 text-xs mb-1">Tokens Procesados (aprox)</p>
              <p className="text-2xl font-bold text-purple-400 mb-0.5">
                ~{(estimatedTokens / 1000).toFixed(0)}K
              </p>
              <p className="text-[10px] text-gray-500">
                Aprox. ${COST_PER_1M_TOKENS}/1M tokens
              </p>
            </div>
          </div>

          {/* Info de Claude 3 Haiku */}
          <div className="mt-3 p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
            <p className="text-[10px] text-indigo-400 mb-0.5 font-medium">ℹ️ Modelo Actual: Anthropic Claude 3 Haiku</p>
            <p className="text-[10px] text-gray-400">
              $0.25/1M tokens entrada | $1.25/1M tokens salida
            </p>
          </div>
        </div>
      )}

      {/* Métricas de Conversaciones del Chatbot */}
      <ConversationMetrics />
    </div>
  );
}
