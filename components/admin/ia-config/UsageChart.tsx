'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface UsageChartProps {
  dailyUsage: number;
  weeklyUsage: number;
  monthlyUsage: number;
}

export default function UsageChart({ dailyUsage, weeklyUsage, monthlyUsage }: UsageChartProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  // Generar datos simulados para los últimos 30 días
  // En producción, estos vendrían de un endpoint real
  const generateMockData = () => {
    const days = [];
    const values = [];
    const today = new Date();
    
    // Usar los datos reales disponibles para los últimos puntos
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }));
      
      // Simular tendencia creciente con variación
      if (i === 0) {
        // Hoy - usar dato real
        values.push(dailyUsage);
      } else if (i <= 7) {
        // Última semana - basado en promedio semanal
        values.push((weeklyUsage / 7) * (0.8 + Math.random() * 0.4));
      } else {
        // Mes - basado en promedio mensual
        values.push((monthlyUsage / 30) * (0.7 + Math.random() * 0.6));
      }
    }
    
    return { days, values };
  };

  const { days, values } = generateMockData();

  const data = {
    labels: days,
    datasets: [
      {
        label: 'Consumo Diario ($)',
        data: values,
        fill: true,
        borderColor: 'rgb(168, 85, 247)', // purple-500
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(168, 85, 247)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `$${context.parsed.y.toFixed(4)}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af', // gray-400
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af', // gray-400
          callback: function(value: any) {
            return '$' + value.toFixed(3);
          }
        },
      },
    },
  };

  // Renderizado condicional para evitar problemas de SSR
  if (!isClient) {
    return (
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-center h-[400px]">
          <div className="animate-pulse text-gray-400">Cargando gráfico...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-white">Evolución del Consumo</h3>
          <p className="text-xs text-gray-400">Últimos 30 días de uso de IA</p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
          <span className="text-[10px] text-purple-400 font-medium">USD</span>
        </div>
      </div>
      
      <div className="h-[220px]">
        <Line data={data} options={options} />
      </div>

      <div className="mt-3 p-2 bg-blue-500/5 border border-blue-500/20 rounded-lg">
        <p className="text-[10px] text-blue-400">
          💡 <strong>Nota:</strong> Datos estimados del uso actual. Para métricas exactas, ver Balance de Cuenta.
        </p>
      </div>
    </div>
  );
}

