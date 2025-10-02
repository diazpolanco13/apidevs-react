'use client';

import { DollarSign, ShoppingBag, TrendingUp, Star, Award, TrendingDown } from 'lucide-react';
import PurchasesTable from '../overview/PurchasesTable';
import Tooltip from '@/components/ui/Tooltip';
import { Purchase } from '@/types/purchases';

interface OneTimeTabProps {
  oneTimeData: {
    metrics: {
      totalOneTime: number;
      aov: number;
      lifetimeSold: number;
      upsells: number;
      currentMonthRevenue: number;
      currentMonthCount: number;
      monthOverMonth: {
        revenue: number;
        purchases: number;
      };
    };
    purchases: Purchase[];
  };
}

export default function OneTimeTab({ oneTimeData }: OneTimeTabProps) {
  const { metrics, purchases } = oneTimeData;

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
        {/* Card 1: Revenue Total One-Time */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="relative bg-gray-900/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all min-h-[180px] flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <p className="text-xs text-gray-400">Revenue Total</p>
                  <Tooltip 
                    content="Total de ingresos generados por compras únicas y Lifetime. Representa ventas de pago único sin recurrencia mensual."
                    position="top"
                  />
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(metrics.totalOneTime)}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Este mes</span>
                <span className="text-white font-semibold">{formatCurrency(metrics.currentMonthRevenue)}</span>
              </div>
              
              {metrics.monthOverMonth.revenue !== 0 && (
                <div className="flex items-center gap-1 text-xs">
                  {metrics.monthOverMonth.revenue >= 0 ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">{formatPercent(metrics.monthOverMonth.revenue)} vs mes anterior</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3 text-red-400" />
                      <span className="text-red-400">{formatPercent(metrics.monthOverMonth.revenue)} vs mes anterior</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: AOV (Average Order Value) */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="relative bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all min-h-[180px] flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <ShoppingBag className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <p className="text-xs text-gray-400">AOV</p>
                  <Tooltip 
                    content="AOV (Average Order Value): Valor promedio de cada orden. Se calcula dividiendo el revenue total entre el número de compras. Indica cuánto gastan los clientes por transacción."
                    position="top"
                  />
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(metrics.aov)}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Total vendidos</span>
                <span className="text-white font-semibold">{metrics.lifetimeSold}</span>
              </div>
              
              <div className="text-xs text-gray-400">
                {metrics.aov > 200 ? (
                  <span className="text-green-400">✓ Excelente ticket promedio</span>
                ) : metrics.aov > 100 ? (
                  <span className="text-yellow-400">⚠ Ticket promedio normal</span>
                ) : (
                  <span className="text-gray-400">Ticket promedio bajo</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Lifetime Sold */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="relative bg-gray-900/50 backdrop-blur-sm border border-amber-500/20 rounded-xl p-6 hover:border-amber-500/40 transition-all min-h-[180px] flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <Award className="w-6 h-6 text-amber-400" />
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <p className="text-xs text-gray-400">Lifetime Vendidos</p>
                  <Tooltip 
                    content="Número total de productos Lifetime vendidos. Estas compras representan acceso permanente sin pagos recurrentes."
                    position="top"
                  />
                </div>
                <p className="text-2xl font-bold text-white">{metrics.lifetimeSold}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Este mes</span>
                <span className="text-white font-semibold">{metrics.currentMonthCount}</span>
              </div>
              
              {metrics.monthOverMonth.purchases !== 0 && (
                <div className="flex items-center gap-1 text-xs">
                  {metrics.monthOverMonth.purchases >= 0 ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">{formatPercent(metrics.monthOverMonth.purchases)} nuevas</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3 text-red-400" />
                      <span className="text-red-400">{formatPercent(metrics.monthOverMonth.purchases)} este mes</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Upsells Detectados */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="relative bg-gray-900/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-6 hover:border-green-500/40 transition-all min-h-[180px] flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <Star className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <p className="text-xs text-gray-400">Upsells</p>
                  <Tooltip 
                    content="Clientes que realizaron múltiples compras el mismo día. Indica efectividad en estrategias de venta cruzada y ofertas complementarias."
                    position="top"
                  />
                </div>
                <p className="text-2xl font-bold text-white">{metrics.upsells}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs text-gray-400">
                {metrics.upsells > 0 ? (
                  <span className="text-green-400">✓ Estrategia de upsell activa</span>
                ) : (
                  <span className="text-gray-400">Sin upsells detectados</span>
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
            <ShoppingBag className="w-5 h-5 text-apidevs-primary" />
            Compras únicas y acceso Lifetime
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {purchases.length} compra{purchases.length !== 1 ? 's' : ''} lifetime realizadas
          </p>
        </div>
      </div>

      {/* Tabla de Compras One-Time */}
      <PurchasesTable purchases={purchases} />
    </div>
  );
}
