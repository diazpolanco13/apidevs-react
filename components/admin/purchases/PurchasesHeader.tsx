'use client';

import { DollarSign, ShoppingCart, TrendingUp, Calendar } from 'lucide-react';
import { PurchaseMetrics } from '@/types/purchases';

interface PurchasesHeaderProps {
  metrics: PurchaseMetrics | null;
  loading?: boolean;
}

export default function PurchasesHeader({ metrics, loading = false }: PurchasesHeaderProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const cards = [
    {
      id: 'revenue',
      label: 'Revenue Total',
      value: metrics ? formatCurrency(metrics.totalRevenue) : '$0.00',
      subtitle: metrics ? `${metrics.monthOverMonth.revenue >= 0 ? '+' : ''}${metrics.monthOverMonth.revenue.toFixed(1)}% vs mes anterior` : 'vs mes anterior',
      icon: DollarSign,
      gradient: 'from-green-500/10 to-emerald-500/10',
      iconColor: 'text-green-400',
      borderColor: 'border-green-500/30'
    },
    {
      id: 'purchases',
      label: 'Total Compras',
      value: metrics ? formatNumber(metrics.totalPurchases) : '0',
      subtitle: metrics ? `${metrics.monthOverMonth.purchases >= 0 ? '+' : ''}${metrics.monthOverMonth.purchases.toFixed(1)}% vs mes anterior` : 'transacciones',
      icon: ShoppingCart,
      gradient: 'from-blue-500/10 to-cyan-500/10',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 'ticket',
      label: 'Ticket Promedio',
      value: metrics ? formatCurrency(metrics.averageTicket) : '$0.00',
      subtitle: 'por transacción',
      icon: TrendingUp,
      gradient: 'from-purple-500/10 to-pink-500/10',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/30'
    },
    {
      id: 'mrr',
      label: 'MRR',
      value: metrics ? formatCurrency(metrics.mrr) : '$0.00',
      subtitle: 'recurrente mensual',
      icon: Calendar,
      gradient: 'from-orange-500/10 to-red-500/10',
      iconColor: 'text-orange-400',
      borderColor: 'border-orange-500/30'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-pulse"
          >
            <div className="h-8 w-8 bg-gray-700 rounded mb-4"></div>
            <div className="h-10 bg-gray-700 rounded mb-1"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3 mb-1"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className={`
              bg-gradient-to-br ${card.gradient} backdrop-blur-xl 
              border ${card.borderColor} rounded-2xl p-6 
              hover:scale-105 transition-all
            `}
          >
            {/* Icon */}
            <div className="flex items-center justify-between mb-4">
              <Icon className={`w-8 h-8 ${card.iconColor}`} />
            </div>

            {/* Value */}
            <div className="text-3xl font-bold text-white mb-1">
              {card.value}
            </div>

            {/* Label */}
            <div className="text-sm text-gray-400">{card.label}</div>

            {/* Subtitle */}
            {card.subtitle && (
              <div className="text-xs text-gray-500 mt-1">{card.subtitle}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

