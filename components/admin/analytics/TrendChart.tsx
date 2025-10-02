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
  ChartOptions
} from 'chart.js';

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

interface TrendDataPoint {
  date: string;
  value: number;
  comparisonValue?: number;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  title: string;
  label: string;
  comparisonLabel?: string;
  color?: string;
  comparisonColor?: string;
  formatValue?: (value: number) => string;
}

export default function TrendChart({
  data,
  title,
  label,
  comparisonLabel,
  color = 'rgb(16, 185, 129)', // green-500
  comparisonColor = 'rgb(147, 51, 234)', // purple-600
  formatValue = (value) => value.toString()
}: TrendChartProps) {
  const hasComparison = data.some(d => d.comparisonValue !== undefined);

  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: label,
        data: data.map(d => d.value),
        borderColor: color,
        backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
      ...(hasComparison && comparisonLabel ? [{
        label: comparisonLabel,
        data: data.map(d => d.comparisonValue || 0),
        borderColor: comparisonColor,
        backgroundColor: comparisonColor.replace('rgb', 'rgba').replace(')', ', 0.1)'),
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        borderDash: [5, 5],
      }] : [])
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)', // gray-400
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)', // gray-900
        titleColor: 'rgb(243, 244, 246)', // gray-100
        bodyColor: 'rgb(209, 213, 219)', // gray-300
        borderColor: 'rgba(75, 85, 99, 0.5)', // gray-600
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatValue(context.parsed.y);
            }
            return label;
          }
        }
      },
      title: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)', // gray-600 with opacity
        },
        ticks: {
          color: 'rgb(156, 163, 175)', // gray-400
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: {
            size: 11
          },
          callback: function(value) {
            return formatValue(Number(value));
          }
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">{title}</h3>
      <div className="h-[300px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

