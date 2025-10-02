'use client';

import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/solid';

interface Metric {
  label: string;
  current: number;
  previous: number;
  format?: (value: number) => string;
  inverse?: boolean; // true si menor es mejor (ej: CAC)
}

interface PeriodComparisonProps {
  metrics: Metric[];
  currentPeriodLabel: string;
  previousPeriodLabel: string;
}

export default function PeriodComparison({
  metrics,
  currentPeriodLabel,
  previousPeriodLabel
}: PeriodComparisonProps) {
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  };

  const getChangeColor = (change: number, inverse: boolean = false) => {
    if (Math.abs(change) < 0.1) return 'text-gray-400';
    
    const isPositive = change > 0;
    const isGood = inverse ? !isPositive : isPositive;
    
    return isGood ? 'text-green-400' : 'text-red-400';
  };

  const getChangeIcon = (change: number) => {
    if (Math.abs(change) < 0.1) return <MinusIcon className="w-4 h-4" />;
    return change > 0 
      ? <ArrowUpIcon className="w-4 h-4" />
      : <ArrowDownIcon className="w-4 h-4" />;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-100">
          Comparación de Períodos
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-400">{currentPeriodLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-gray-400">{previousPeriodLabel}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const change = calculateChange(metric.current, metric.previous);
          const changeColor = getChangeColor(change, metric.inverse);
          const changeIcon = getChangeIcon(change);
          const formatFn = metric.format || ((v) => v.toLocaleString());

          return (
            <div 
              key={index}
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30 hover:border-gray-600/50 transition-all"
            >
              <div className="text-sm text-gray-400 mb-2">
                {metric.label}
              </div>
              
              <div className="flex items-baseline justify-between mb-3">
                <div className="text-2xl font-bold text-gray-100">
                  {formatFn(metric.current)}
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${changeColor}`}>
                  {changeIcon}
                  <span>{Math.abs(change).toFixed(1)}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Anterior:</span>
                <span className="text-gray-400 font-medium">
                  {formatFn(metric.previous)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

