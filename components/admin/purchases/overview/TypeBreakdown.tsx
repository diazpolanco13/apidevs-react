'use client';

import { RefreshCw, ShoppingBag, Award, TrendingUp } from 'lucide-react';

interface TypeBreakdownProps {
  subscription: {
    count: number;
    revenue: number;
  };
  oneTime: {
    count: number;
    revenue: number;
  };
  lifetime: {
    count: number;
    revenue: number;
  };
}

export default function TypeBreakdown({ subscription, oneTime, lifetime }: TypeBreakdownProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const total = subscription.revenue + oneTime.revenue + lifetime.revenue;
  const totalCount = subscription.count + oneTime.count + lifetime.count;

  const calculatePercentage = (amount: number) => {
    if (total === 0) return 0;
    return ((amount / total) * 100).toFixed(1);
  };

  const types = [
    {
      id: 'subscription',
      name: 'Suscripciones',
      icon: RefreshCw,
      count: subscription.count,
      revenue: subscription.revenue,
      percentage: calculatePercentage(subscription.revenue),
      gradient: 'from-blue-500/10 to-cyan-500/10',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/30',
      barColor: 'bg-blue-500'
    },
    {
      id: 'one-time',
      name: 'One-Time',
      icon: ShoppingBag,
      count: oneTime.count,
      revenue: oneTime.revenue,
      percentage: calculatePercentage(oneTime.revenue),
      gradient: 'from-purple-500/10 to-pink-500/10',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/30',
      barColor: 'bg-purple-500'
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      icon: Award,
      count: lifetime.count,
      revenue: lifetime.revenue,
      percentage: calculatePercentage(lifetime.revenue),
      gradient: 'from-orange-500/10 to-red-500/10',
      iconColor: 'text-orange-400',
      borderColor: 'border-orange-500/30',
      barColor: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Desglose por Tipo</h3>
          <p className="text-sm text-gray-400">Distribución de compras</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{formatCurrency(total)}</div>
          <div className="text-xs text-gray-500">{totalCount} compras</div>
        </div>
      </div>

      {/* Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {types.map((type) => {
          const Icon = type.icon;
          
          return (
            <div
              key={type.id}
              className={`
                bg-gradient-to-br ${type.gradient} backdrop-blur-xl 
                border ${type.borderColor} rounded-xl p-5
                hover:scale-105 transition-all duration-200
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-6 h-6 ${type.iconColor}`} />
                <div className={`px-2 py-1 rounded-lg text-xs font-bold ${type.iconColor} bg-white/5`}>
                  {type.percentage}%
                </div>
              </div>

              {/* Name */}
              <div className="text-sm text-gray-400 mb-1">{type.name}</div>

              {/* Revenue */}
              <div className="text-2xl font-bold text-white mb-3">
                {formatCurrency(type.revenue)}
              </div>

              {/* Count */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <TrendingUp className="w-3 h-3" />
                <span>{type.count} compras</span>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${type.barColor} rounded-full transition-all duration-500`}
                  style={{ width: `${type.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

