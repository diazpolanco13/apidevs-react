'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Calendar } from 'lucide-react';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RevenueChartProps {
  data: {
    date: string;
    revenue: number;
    purchases: number;
    purchaseIds?: string[];
    purchaseDetails?: {
      id: string;
      email: string;
      amount: number;
    }[];
  }[];
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

export default function RevenueChart({ data }: RevenueChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const chartRef = useRef<ChartJS<'line'>>(null);
  
  // ⚠️ CRÍTICO: Forzar re-render cuando cambian los datos
  const [chartKey, setChartKey] = useState(0);
  
  // Debug: Ver qué datos llegan al gráfico
  console.log('📈 RevenueChart recibió:', data.length, 'días de datos');
  console.log('📈 Últimos 5 días:', data.slice(-5).map(d => ({ date: d.date, revenue: d.revenue, purchases: d.purchases })));
  console.log('📈 Días con revenue > 0:', data.filter(d => d.revenue > 0).map(d => ({ date: d.date, revenue: d.revenue, purchases: d.purchases })));

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Formatear fecha - USAR UTC PURO para evitar offset de timezone
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00Z');
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      timeZone: 'UTC'  // ⚠️ CRÍTICO: Forzar UTC para evitar offset
    });
  };

  // ⚠️ CRÍTICO: Forzar re-creación del gráfico cuando cambian los datos
  useEffect(() => {
    setChartKey(prev => prev + 1);
  }, [data, timeRange]);

  // Filtrar datos según el rango de tiempo seleccionado
  const getFilteredData = () => {
    if (timeRange === 'all') return data;
    
    // ⚠️ CRÍTICO: Usar UTC puro para evitar problemas de zona horaria
    const nowUTC = new Date();
    const todayUTC = new Date(Date.UTC(
      nowUTC.getUTCFullYear(),
      nowUTC.getUTCMonth(),
      nowUTC.getUTCDate(),
      23, 59, 59, 999
    ));
    
    const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
    const daysToShow = daysMap[timeRange];
    
    const cutoffDateUTC = new Date(Date.UTC(
      nowUTC.getUTCFullYear(),
      nowUTC.getUTCMonth(),
      nowUTC.getUTCDate() - daysToShow,
      0, 0, 0, 0
    ));
    
    console.log('📊 Filtro activo:', timeRange, '→ cutoffDate UTC:', cutoffDateUTC.toISOString().split('T')[0]);
    console.log('📊 Hoy UTC:', todayUTC.toISOString().split('T')[0]);
    
    const filtered = data.filter(item => {
      // ⚠️ CRÍTICO: Parsear fecha en UTC
      const itemDate = new Date(item.date + 'T00:00:00Z');
      const included = itemDate >= cutoffDateUTC && itemDate <= todayUTC;
      
      if (!included && item.revenue > 0) {
        console.log('❌ Excluido:', item.date, '→ cutoff:', cutoffDateUTC.toISOString().split('T')[0]);
      }
      if (included && item.revenue > 0) {
        console.log('✅ Incluido:', item.date, '→ $', item.revenue, '→', item.purchases, 'compras');
      }
      return included;
    });
    
    console.log('📊 Resultado filtro:', filtered.length, 'días de', data.length, 'totales');
    console.log('📊 Revenue filtrado:', filtered.reduce((sum, d) => sum + d.revenue, 0), 'US$');
    console.log('📊 Purchases filtradas:', filtered.reduce((sum, d) => sum + d.purchases, 0));
    
    return filtered;
  };

  const filteredData = getFilteredData();

  // Calcular totales
  const totalRevenue = filteredData.reduce((sum, item) => sum + item.revenue, 0);
  const totalPurchases = filteredData.reduce((sum, item) => sum + item.purchases, 0);
  const avgRevenue = filteredData.length > 0 ? totalRevenue / filteredData.length : 0;

  // ⚠️ DEBUG CRÍTICO: Ver qué datos recibe Chart.js
  console.log('🎨 CHART.JS VA A RECIBIR:', {
    totalDays: filteredData.length,
    labels: filteredData.map(item => item.date),
    revenues: filteredData.map(item => item.revenue),
    purchases: filteredData.map(item => item.purchases),
    daysWithRevenue: filteredData.filter(d => d.revenue > 0).map(d => ({
      date: d.date,
      revenue: d.revenue,
      purchases: d.purchases
    }))
  });

  // Preparar datos para Chart.js
  const chartData: ChartData<'line'> = {
    labels: filteredData.map(item => formatDate(item.date)),
    datasets: [
      {
        label: 'Revenue',
        data: filteredData.map(item => item.revenue),
        fill: true,
        borderColor: '#00FF94',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(0, 255, 148, 0.3)');
          gradient.addColorStop(1, 'rgba(0, 255, 148, 0)');
          return gradient;
        },
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#00FF94',
        pointBorderColor: '#000',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#00FF94',
        pointHoverBorderColor: '#FFF',
        pointHoverBorderWidth: 2,
      }
    ]
  };

  // Opciones del gráfico
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        titleColor: '#F3F4F6',
        bodyColor: '#00FF94',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            const dayData = filteredData[index];
            console.log('🖱️ TOOLTIP HOVER:', {
              index,
              date: dayData?.date,
              revenue: dayData?.revenue,
              purchases: dayData?.purchases,
              purchaseIds: dayData?.purchaseIds,
              purchaseDetails: dayData?.purchaseDetails,
              totalItemsInFiltered: filteredData.length
            });
            return formatDate(dayData.date);
          },
          label: (context) => {
            const index = context.dataIndex;
            const dayData = filteredData[index];
            const revenue = dayData.revenue;
            const purchases = dayData.purchases;
            const labels = [
              `Revenue: ${formatCurrency(revenue)}`,
              `Compras: ${purchases}`
            ];
            
            // Agregar IDs de compras si existen
            if (dayData.purchaseIds && dayData.purchaseIds.length > 0) {
              labels.push('---');
              dayData.purchaseDetails?.forEach(p => {
                labels.push(`${p.id}: ${formatCurrency(p.amount)} (${p.email})`);
              });
            }
            
            return labels;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(55, 65, 81, 0.3)',
          drawTicks: false
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 0
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          display: true,
          color: 'rgba(55, 65, 81, 0.3)',
          drawTicks: false
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 11
          },
          callback: (value) => formatCurrency(Number(value))
        },
        border: {
          display: false
        }
      }
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    }
  };

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
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-3">
          {/* Selector */}
          <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-1 border border-gray-700">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                timeRange === '7d'
                  ? 'bg-apidevs-primary text-black'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                timeRange === '30d'
                  ? 'bg-apidevs-primary text-black'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              30D
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                timeRange === '90d'
                  ? 'bg-apidevs-primary text-black'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              90D
            </button>
            <button
              onClick={() => setTimeRange('all')}
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
          <Line 
            key={chartKey}
            ref={chartRef} 
            data={chartData} 
            options={options}
            redraw={true}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-500 mb-2">Sin datos disponibles</div>
              <div className="text-xs text-gray-600">No hay compras en el rango seleccionado</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
