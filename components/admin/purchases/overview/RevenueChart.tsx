'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface RevenueChartProps {
  data: {
    date: string;
    revenue: number;
    purchases: number;
  }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  // Formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  // Calcular totales
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalPurchases = data.reduce((sum, item) => sum + item.purchases, 0);
  const avgRevenue = data.length > 0 ? totalRevenue / data.length : 0;

  return (
    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Revenue Timeline</h3>
          <p className="text-sm text-gray-400">Últimos 30 días</p>
        </div>
        
        {/* Stats */}
        <div className="flex gap-6">
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Total</div>
            <div className="text-xl font-bold text-green-400">{formatCurrency(totalRevenue)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Promedio/día</div>
            <div className="text-xl font-bold text-blue-400">{formatCurrency(avgRevenue)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Compras</div>
            <div className="text-xl font-bold text-purple-400">{totalPurchases}</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF94" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00FF94" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  padding: '12px'
                }}
                labelStyle={{ color: '#F3F4F6', marginBottom: '8px' }}
                itemStyle={{ color: '#00FF94' }}
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                labelFormatter={(label) => formatDate(label)}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#00FF94" 
                strokeWidth={3}
                fill="url(#revenueGradient)"
                dot={{ fill: '#00FF94', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#00FF94', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-500 mb-2">Sin datos disponibles</div>
              <div className="text-xs text-gray-600">No hay compras en los últimos 30 días</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

