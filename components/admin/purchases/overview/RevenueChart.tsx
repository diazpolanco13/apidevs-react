'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calendar } from 'lucide-react';

interface RevenueChartProps {
  data: {
    date: string;
    revenue: number;
    purchases: number;
  }[];
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

export default function RevenueChart({ data }: RevenueChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [chartKey, setChartKey] = useState(Date.now());
  
  // Debug: Ver qué datos llegan al gráfico
  console.log('📈 RevenueChart recibió:', data.length, 'días de datos');
  console.log('📈 Últimos 5 días:', data.slice(-5).map(d => ({ date: d.date, revenue: d.revenue, purchases: d.purchases })));
  
  // Forzar re-render cuando cambian los datos
  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange);
    setChartKey(Date.now()); // Forzar recreación del gráfico
  };

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

  // Filtrar datos según el rango de tiempo seleccionado
  const getFilteredData = () => {
    if (timeRange === 'all') return data;
    
    const today = new Date();
    const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
    const daysToShow = daysMap[timeRange];
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToShow);
    
    console.log('📊 Filtro activo:', timeRange, '→ cutoffDate:', cutoffDate.toISOString().split('T')[0]);
    
    const filtered = data.filter(item => {
      const itemDate = new Date(item.date);
      const included = itemDate >= cutoffDate;
      if (!included && item.revenue > 0) {
        console.log('❌ Excluido:', item.date, 'revenue:', item.revenue, 'cutoff:', cutoffDate.toISOString().split('T')[0]);
      }
      return included;
    });
    
    console.log('📊 Datos filtrados:', filtered.length, 'de', data.length);
    console.log('📊 Total revenue filtrado:', filtered.reduce((sum, d) => sum + d.revenue, 0));
    
    return filtered;
  };

  const filteredData = getFilteredData();

  // Calcular totales
  const totalRevenue = filteredData.reduce((sum, item) => sum + item.revenue, 0);
  const totalPurchases = filteredData.reduce((sum, item) => sum + item.purchases, 0);
  const avgRevenue = filteredData.length > 0 ? totalRevenue / filteredData.length : 0;

  return (
    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Revenue Timeline</h3>
          <p className="text-sm text-gray-400">
            {timeRange === '7d' && 'Últimos 7 días'}
            {timeRange === '30d' && 'Últimos 30 días'}
            {timeRange === '90d' && 'Últimos 90 días'}
            {timeRange === 'all' && 'Todo el período'}
            {data.length > 30 && ''}
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-3">
          {/* Selector */}
          <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-1 border border-gray-700">
            <button
              onClick={() => handleTimeRangeChange('7d')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                timeRange === '7d'
                  ? 'bg-apidevs-primary text-black'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              7D
            </button>
            <button
              onClick={() => handleTimeRangeChange('30d')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                timeRange === '30d'
                  ? 'bg-apidevs-primary text-black'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              30D
            </button>
            <button
              onClick={() => handleTimeRangeChange('90d')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                timeRange === '90d'
                  ? 'bg-apidevs-primary text-black'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              90D
            </button>
            <button
              onClick={() => handleTimeRangeChange('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                timeRange === 'all'
                  ? 'bg-apidevs-primary text-black'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Todo
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-6 mb-6">
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

      {/* Chart */}
      <div className="h-80">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%" key={chartKey}>
            <AreaChart data={filteredData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
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
                width={80}
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

