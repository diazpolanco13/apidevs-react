'use client';

import { DollarSign, Users, TrendingDown, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import PurchasesTable from '../overview/PurchasesTable';
import Tooltip from '@/components/ui/Tooltip';
import { Purchase } from '@/types/purchases';

interface SubscriptionsTabProps {
  subscriptionsData: {
    metrics: {
      mrr: number;
      arr: number;
      churnRate: number;
      avgLTV: number;
      activeSubscriptions: number;
      netRevenueRetention: number;
      monthOverMonth: {
        mrr: number;
        activeSubscriptions: number;
      };
    };
    subscriptions: Purchase[];
  };
}

export default function SubscriptionsTab({ subscriptionsData }: SubscriptionsTabProps) {
  const { metrics, subscriptions } = subscriptionsData;

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

  return (
    <div className="space-y-6">
      {/* Métricas Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: MRR/ARR */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="relative bg-gray-900/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-6 hover:border-green-500/40 transition-all min-h-[180px] flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <p className="text-xs text-gray-400">MRR</p>
                  <Tooltip 
                    content="MRR (Monthly Recurring Revenue): Ingresos recurrentes mensuales. Representa el ingreso predecible que recibirás cada mes de tus suscripciones activas."
                    position="top"
                  />
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(metrics.mrr)}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">ARR</span>
                  <Tooltip 
                    content="ARR (Annual Recurring Revenue): Ingresos recurrentes anuales. Se calcula multiplicando el MRR por 12. Es la métrica que proyecta tus ingresos anuales."
                    position="top"
                    iconSize={12}
                  />
                </div>
                <span className="text-white font-semibold">{formatCurrency(metrics.arr)}</span>
              </div>
              
              {metrics.monthOverMonth.mrr !== 0 && (
                <div className="flex items-center gap-1 text-xs">
                  {metrics.monthOverMonth.mrr >= 0 ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">{formatPercent(metrics.monthOverMonth.mrr)} vs mes anterior</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3 text-red-400" />
                      <span className="text-red-400">{formatPercent(metrics.monthOverMonth.mrr)} vs mes anterior</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Suscripciones Activas */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="relative bg-gray-900/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all min-h-[180px] flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <p className="text-xs text-gray-400">Suscripciones Activas</p>
                  <Tooltip 
                    content="Total de suscripciones activas actualmente. Incluye todas las suscripciones con pagos completados que no han sido canceladas."
                    position="top"
                  />
                </div>
                <p className="text-2xl font-bold text-white">{metrics.activeSubscriptions}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">AVG LTV</span>
                  <Tooltip 
                    content="AVG LTV (Average Lifetime Value): Valor promedio del tiempo de vida del cliente. Representa cuánto dinero genera cada cliente durante toda su relación con tu negocio."
                    position="top"
                    iconSize={12}
                  />
                </div>
                <span className="text-white font-semibold">{formatCurrency(metrics.avgLTV)}</span>
              </div>
              
              {metrics.monthOverMonth.activeSubscriptions !== 0 && (
                <div className="flex items-center gap-1 text-xs">
                  {metrics.monthOverMonth.activeSubscriptions >= 0 ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">{formatPercent(metrics.monthOverMonth.activeSubscriptions)} nuevas este mes</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3 text-red-400" />
                      <span className="text-red-400">{formatPercent(metrics.monthOverMonth.activeSubscriptions)} este mes</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Churn Rate */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="relative bg-gray-900/50 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6 hover:border-orange-500/40 transition-all min-h-[180px] flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <TrendingDown className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <p className="text-xs text-gray-400">Tasa de Cancelación</p>
                  <Tooltip 
                    content="Churn Rate: Porcentaje de clientes que cancelan su suscripción. Un churn bajo (<5%) indica buena retención. Valores altos requieren atención inmediata."
                    position="top"
                  />
                </div>
                <p className="text-2xl font-bold text-white">{metrics.churnRate.toFixed(1)}%</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs text-gray-400">
                {metrics.churnRate < 5 ? (
                  <span className="text-green-400">✓ Excelente retención</span>
                ) : metrics.churnRate < 10 ? (
                  <span className="text-yellow-400">⚠ Retención normal</span>
                ) : (
                  <span className="text-red-400">⚠ Requiere atención</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Net Revenue Retention */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="relative bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all min-h-[180px] flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <RefreshCw className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <p className="text-xs text-gray-400">Retención Neta</p>
                  <Tooltip 
                    content="Net Revenue Retention (NRR): Mide si tus ingresos crecen o decrecen con tu base actual de clientes. >100% indica crecimiento neto, <100% indica pérdida de ingresos."
                    position="top"
                  />
                </div>
                <p className="text-2xl font-bold text-white">{metrics.netRevenueRetention.toFixed(0)}%</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs text-gray-400">
                {metrics.netRevenueRetention >= 100 ? (
                  <span className="text-green-400">✓ Crecimiento neto positivo</span>
                ) : metrics.netRevenueRetention >= 90 ? (
                  <span className="text-yellow-400">⚠ Manteniendo ingresos</span>
                ) : (
                  <span className="text-red-400">⚠ Perdiendo ingresos</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Título de la sección */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-apidevs-primary" />
            Gestión completa de pagos recurrentes con métricas clave
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {subscriptions.length} suscripción{subscriptions.length !== 1 ? 'es' : ''} activa{subscriptions.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Tabla de Suscripciones */}
      <PurchasesTable purchases={subscriptions} />
    </div>
  );
}
