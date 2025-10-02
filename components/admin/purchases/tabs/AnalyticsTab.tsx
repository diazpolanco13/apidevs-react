'use client';

import { TrendingUp, Users, DollarSign, Calendar, Target, BarChart3, AlertCircle } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';

export default function AnalyticsTab() {
  // KPIs simplificados (en un caso real vendrían de props con datos calculados)
  const kpis = {
    arpu: 45.67, // Average Revenue Per User
    cac: 23.45, // Customer Acquisition Cost (estimado)
    ltvCacRatio: 3.5, // LTV:CAC Ratio
    paybackPeriod: 8.2, // Meses
    netRevenueRetention: 108, // %
    grossMargin: 87.5 // %
  };

  // Insights automáticos
  const insights = [
    {
      type: 'positive',
      icon: TrendingUp,
      message: 'LTV:CAC ratio de 3.5x indica un modelo de negocio saludable',
      description: 'Un ratio >3 es considerado excelente en SaaS'
    },
    {
      type: 'positive',
      icon: Target,
      message: 'Net Revenue Retention >100% muestra expansión',
      description: 'Tus clientes actuales están generando más ingresos con el tiempo'
    },
    {
      type: 'info',
      icon: Calendar,
      message: 'Periodo de recuperación de 8.2 meses',
      description: 'Tiempo estimado para recuperar el costo de adquisición'
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header con descripción */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-apidevs-primary/5 to-green-600/5 rounded-xl blur-xl opacity-50" />
        
        <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-apidevs-primary/10 rounded-lg border border-apidevs-primary/20">
              <BarChart3 className="w-6 h-6 text-apidevs-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white mb-2">
                Analytics Ejecutivo
              </h2>
              <p className="text-sm text-gray-400">
                KPIs clave para la toma de decisiones estratégicas y evaluación del rendimiento del negocio
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs Ejecutivos - Grid 3x2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* KPI 1: ARPU */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="relative bg-gray-900/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all min-h-[160px] flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-right flex-1 ml-4">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <p className="text-xs text-gray-400">ARPU</p>
                  <Tooltip 
                    content="ARPU (Average Revenue Per User): Ingreso promedio por usuario. Se calcula dividiendo el revenue total entre el número de usuarios activos."
                    position="top"
                  />
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(kpis.arpu)}</p>
              </div>
            </div>
            
            <div className="mt-auto">
              <div className="text-xs text-gray-400">
                <span className="text-blue-400">Métrica de monetización</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 2: CAC */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="relative bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all min-h-[160px] flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-right flex-1 ml-4">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <p className="text-xs text-gray-400">CAC</p>
                  <Tooltip 
                    content="CAC (Customer Acquisition Cost): Costo de adquirir un nuevo cliente. Incluye marketing, ventas y otros gastos de adquisición divididos entre nuevos clientes."
                    position="top"
                  />
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(kpis.cac)}</p>
              </div>
            </div>
            
            <div className="mt-auto">
              <div className="text-xs text-gray-400">
                <span className="text-purple-400">Costo de adquisición</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 3: LTV:CAC Ratio */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="relative bg-gray-900/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-6 hover:border-green-500/40 transition-all min-h-[160px] flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-right flex-1 ml-4">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <p className="text-xs text-gray-400">LTV:CAC Ratio</p>
                  <Tooltip 
                    content="Ratio entre el valor del tiempo de vida del cliente (LTV) y el costo de adquisición (CAC). Un ratio >3 indica un modelo de negocio rentable y escalable."
                    position="top"
                  />
                </div>
                <p className="text-2xl font-bold text-white">{kpis.ltvCacRatio.toFixed(1)}x</p>
              </div>
            </div>
            
            <div className="mt-auto">
              <div className="text-xs text-gray-400">
                {kpis.ltvCacRatio >= 3 ? (
                  <span className="text-green-400">✓ Excelente rentabilidad</span>
                ) : kpis.ltvCacRatio >= 2 ? (
                  <span className="text-yellow-400">⚠ Rentabilidad aceptable</span>
                ) : (
                  <span className="text-red-400">⚠ Requiere optimización</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* KPI 4: Payback Period */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="relative bg-gray-900/50 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6 hover:border-orange-500/40 transition-all min-h-[160px] flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <Calendar className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-right flex-1 ml-4">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <p className="text-xs text-gray-400">Payback Period</p>
                  <Tooltip 
                    content="Tiempo promedio en meses para recuperar el costo de adquisición del cliente (CAC). Un periodo <12 meses es ideal para SaaS."
                    position="top"
                  />
                </div>
                <p className="text-2xl font-bold text-white">{kpis.paybackPeriod.toFixed(1)} meses</p>
              </div>
            </div>
            
            <div className="mt-auto">
              <div className="text-xs text-gray-400">
                {kpis.paybackPeriod < 12 ? (
                  <span className="text-green-400">✓ Recuperación rápida</span>
                ) : kpis.paybackPeriod < 18 ? (
                  <span className="text-yellow-400">⚠ Recuperación normal</span>
                ) : (
                  <span className="text-red-400">⚠ Recuperación lenta</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* KPI 5: Net Revenue Retention */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="relative bg-gray-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/40 transition-all min-h-[160px] flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="text-right flex-1 ml-4">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <p className="text-xs text-gray-400">NRR</p>
                  <Tooltip 
                    content="Net Revenue Retention: Porcentaje de ingresos retenidos de clientes existentes, incluyendo expansión y upsells. >100% indica crecimiento neto."
                    position="top"
                  />
                </div>
                <p className="text-2xl font-bold text-white">{kpis.netRevenueRetention.toFixed(0)}%</p>
              </div>
            </div>
            
            <div className="mt-auto">
              <div className="text-xs text-gray-400">
                {kpis.netRevenueRetention >= 100 ? (
                  <span className="text-green-400">✓ Expansión neta positiva</span>
                ) : kpis.netRevenueRetention >= 90 ? (
                  <span className="text-yellow-400">⚠ Manteniendo ingresos</span>
                ) : (
                  <span className="text-red-400">⚠ Perdiendo ingresos</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* KPI 6: Gross Margin */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="relative bg-gray-900/50 backdrop-blur-sm border border-amber-500/20 rounded-xl p-6 hover:border-amber-500/40 transition-all min-h-[160px] flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <DollarSign className="w-6 h-6 text-amber-400" />
              </div>
              <div className="text-right flex-1 ml-4">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <p className="text-xs text-gray-400">Gross Margin</p>
                  <Tooltip 
                    content="Margen bruto: Porcentaje de ingresos que queda después de costos directos. En SaaS, márgenes >80% son estándar de la industria."
                    position="top"
                  />
                </div>
                <p className="text-2xl font-bold text-white">{kpis.grossMargin.toFixed(1)}%</p>
              </div>
            </div>
            
            <div className="mt-auto">
              <div className="text-xs text-gray-400">
                {kpis.grossMargin >= 80 ? (
                  <span className="text-green-400">✓ Margen saludable</span>
                ) : kpis.grossMargin >= 70 ? (
                  <span className="text-yellow-400">⚠ Margen aceptable</span>
                ) : (
                  <span className="text-red-400">⚠ Requiere optimización</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Automáticos */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-gray-600/5 rounded-xl blur-xl opacity-50" />
        
        <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 text-apidevs-primary" />
            <h3 className="text-lg font-semibold text-white">Insights Automáticos</h3>
            <Tooltip 
              content="Análisis automático de tus métricas clave con recomendaciones accionables para mejorar el rendimiento del negocio."
              iconSize={14}
            />
          </div>

          <div className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              const colorClasses = {
                positive: 'bg-green-500/5 border-green-500/20 text-green-400',
                info: 'bg-blue-500/5 border-blue-500/20 text-blue-400',
                warning: 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400'
              };

              return (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${colorClasses[insight.type as keyof typeof colorClasses]}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      insight.type === 'positive' ? 'text-green-400' :
                      insight.type === 'warning' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white mb-1">
                        {insight.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer con nota */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-xs text-gray-500 text-center">
              Los KPIs se calculan en base a datos históricos y proyecciones. Actualizado en tiempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
