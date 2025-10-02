'use client';

import { DollarSign, Percent, Clock, AlertCircle, TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';
import PurchasesTable from '../overview/PurchasesTable';
import Tooltip from '@/components/ui/Tooltip';
import { Purchase } from '@/types/purchases';

interface RefundsTabProps {
  refundsData: {
    metrics: {
      totalRefunded: number;
      refundRate: number;
      avgProcessingTime: number;
      topReason: string;
      reasonBreakdown: {
        requested_by_customer: number;
        duplicate: number;
        fraudulent: number;
      };
      currentMonthRefunds: number;
      currentMonthAmount: number;
      monthOverMonth: {
        count: number;
        amount: number;
      };
    };
    purchases: Purchase[];
  };
}

export default function RefundsTab({ refundsData }: RefundsTabProps) {
  const { metrics, purchases } = refundsData;

  // Formatear números
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const formatted = Math.abs(value).toFixed(1);
    return `${value >= 0 ? '+' : '-'}${formatted}%`;
  };

  // Traducir razones
  const translateReason = (reason: string) => {
    const translations: { [key: string]: string } = {
      'requested_by_customer': 'Solicitado por cliente',
      'duplicate': 'Duplicado',
      'fraudulent': 'Fraudulento'
    };
    return translations[reason] || reason;
  };

  // Calcular porcentaje para las progress bars
  const totalReasons = metrics.reasonBreakdown.requested_by_customer + 
                       metrics.reasonBreakdown.duplicate + 
                       metrics.reasonBreakdown.fraudulent;

  return (
    <div className="space-y-6">
      {/* Métricas Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Reembolsado */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="relative bg-gray-900/50 backdrop-blur-sm border border-red-500/20 rounded-xl p-6 hover:border-red-500/40 transition-all min-h-[180px] flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <DollarSign className="w-6 h-6 text-red-400" />
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <p className="text-xs text-gray-400">Total Reembolsado</p>
                  <Tooltip 
                    content="Monto total reembolsado a clientes desde el inicio. Incluye reembolsos completos y parciales procesados exitosamente."
                    position="top"
                  />
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(metrics.totalRefunded)}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Este mes</span>
                <span className="text-white font-semibold">{formatCurrency(metrics.currentMonthAmount)}</span>
              </div>
              
              {metrics.monthOverMonth.amount !== 0 && (
                <div className="flex items-center gap-1 text-xs">
                  {metrics.monthOverMonth.amount >= 0 ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-red-400" />
                      <span className="text-red-400">{formatPercent(metrics.monthOverMonth.amount)} vs mes anterior</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">{formatPercent(metrics.monthOverMonth.amount)} vs mes anterior</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Refund Rate */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="relative bg-gray-900/50 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6 hover:border-orange-500/40 transition-all min-h-[180px] flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <Percent className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <p className="text-xs text-gray-400">Tasa de Reembolso</p>
                  <Tooltip 
                    content="Refund Rate: Porcentaje de compras que terminan siendo reembolsadas. Una tasa baja (<3%) indica satisfacción del cliente. Tasas altas requieren análisis de causas."
                    position="top"
                  />
                </div>
                <p className="text-2xl font-bold text-white">{metrics.refundRate.toFixed(1)}%</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Reembolsos</span>
                <span className="text-white font-semibold">{purchases.length}</span>
              </div>
              
              <div className="text-xs text-gray-400">
                {metrics.refundRate < 3 ? (
                  <span className="text-green-400">✓ Tasa excelente</span>
                ) : metrics.refundRate < 5 ? (
                  <span className="text-yellow-400">⚠ Tasa normal</span>
                ) : (
                  <span className="text-red-400">⚠ Requiere análisis</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Tiempo Promedio de Procesamiento */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="relative bg-gray-900/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all min-h-[180px] flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <p className="text-xs text-gray-400">Tiempo Promedio</p>
                  <Tooltip 
                    content="Tiempo promedio desde que se solicita un reembolso hasta que se procesa. Un tiempo bajo (<48h) mejora la experiencia del cliente."
                    position="top"
                  />
                </div>
                <p className="text-2xl font-bold text-white">{metrics.avgProcessingTime}h</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs text-gray-400">
                {metrics.avgProcessingTime < 24 ? (
                  <span className="text-green-400">✓ Procesamiento rápido</span>
                ) : metrics.avgProcessingTime < 48 ? (
                  <span className="text-yellow-400">⚠ Tiempo aceptable</span>
                ) : (
                  <span className="text-red-400">⚠ Tiempo elevado</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Reembolsos Este Mes */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="relative bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all min-h-[180px] flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <RotateCcw className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <p className="text-xs text-gray-400">Este Mes</p>
                  <Tooltip 
                    content="Número de reembolsos procesados en el mes actual. Permite identificar tendencias y patrones temporales."
                    position="top"
                  />
                </div>
                <p className="text-2xl font-bold text-white">{metrics.currentMonthRefunds}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              {metrics.monthOverMonth.count !== 0 && (
                <div className="flex items-center gap-1 text-xs">
                  {metrics.monthOverMonth.count >= 0 ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-red-400" />
                      <span className="text-red-400">{formatPercent(metrics.monthOverMonth.count)} vs mes anterior</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">{formatPercent(metrics.monthOverMonth.count)} vs mes anterior</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Motivos de Reembolso */}
      {totalReasons > 0 && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-gray-600/5 rounded-xl blur-xl opacity-50" />
          
          <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <AlertCircle className="w-5 h-5 text-apidevs-primary" />
              <h3 className="text-lg font-semibold text-white">Motivos de Reembolso</h3>
              <Tooltip 
                content="Distribución de los motivos por los cuales se procesaron reembolsos. Ayuda a identificar patrones y áreas de mejora."
                iconSize={14}
              />
            </div>

            <div className="space-y-4">
              {/* Solicitado por Cliente */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Solicitado por cliente</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{metrics.reasonBreakdown.requested_by_customer}</span>
                    <span className="text-xs text-gray-400">
                      ({((metrics.reasonBreakdown.requested_by_customer / totalReasons) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${(metrics.reasonBreakdown.requested_by_customer / totalReasons) * 100}%` }}
                  />
                </div>
              </div>

              {/* Duplicado */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Duplicado</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{metrics.reasonBreakdown.duplicate}</span>
                    <span className="text-xs text-gray-400">
                      ({totalReasons > 0 ? ((metrics.reasonBreakdown.duplicate / totalReasons) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${totalReasons > 0 ? (metrics.reasonBreakdown.duplicate / totalReasons) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Fraudulento */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Fraudulento</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{metrics.reasonBreakdown.fraudulent}</span>
                    <span className="text-xs text-gray-400">
                      ({totalReasons > 0 ? ((metrics.reasonBreakdown.fraudulent / totalReasons) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${totalReasons > 0 ? (metrics.reasonBreakdown.fraudulent / totalReasons) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Insight del motivo principal */}
            <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-white">Motivo principal:</span> {translateReason(metrics.topReason)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    La mayoría de reembolsos son solicitados directamente por los clientes, lo cual es normal en negocios digitales.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Título de la sección */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-apidevs-primary" />
            Historial completo de reembolsos
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {purchases.length} reembolso{purchases.length !== 1 ? 's' : ''} procesado{purchases.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Tabla de Reembolsos */}
      <PurchasesTable purchases={purchases} />
    </div>
  );
}
