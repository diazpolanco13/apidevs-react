'use client';

import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Clock, 
  CheckCircle,
  Award,
  DollarSign,
  ShoppingCart
} from 'lucide-react';

interface ActiveUserStatsProps {
  registeredDays: number;
  lastLoginDate: Date | null;
  onboardingCompleted: boolean;
  subscriptionsCount: number;
  indicatorAccessCount: number;
  customerTier?: string | null;
  totalLifetimeSpent?: number | null;
  purchaseCount?: number | null;
  loyaltyDiscount?: number | null;
}

export default function ActiveUserStats({
  registeredDays,
  lastLoginDate,
  onboardingCompleted,
  subscriptionsCount,
  indicatorAccessCount,
  customerTier,
  totalLifetimeSpent,
  purchaseCount,
  loyaltyDiscount
}: ActiveUserStatsProps) {
  
  const stats = [
    {
      name: 'Días Registrado',
      value: registeredDays.toString(),
      subtitle: 'Desde el registro',
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      name: 'Último Acceso',
      value: lastLoginDate 
        ? `${Math.floor((Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24))}d`
        : 'N/A',
      subtitle: lastLoginDate ? 'días atrás' : 'Sin registro',
      icon: Clock,
      color: 'text-purple-400',
      bgColor: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-500/30'
    },
    {
      name: 'Suscripciones',
      value: subscriptionsCount.toString(),
      subtitle: subscriptionsCount > 0 ? 'Activas' : 'Sin suscripciones',
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-500/30'
    },
    {
      name: 'Accesos TradingView',
      value: indicatorAccessCount.toString(),
      subtitle: 'Indicadores activos',
      icon: TrendingUp,
      color: 'text-cyan-400',
      bgColor: 'from-cyan-500/10 to-blue-500/10',
      borderColor: 'border-cyan-500/30'
    }
  ];

  // Stats adicionales si hay datos de compras
  const advancedStats = [];

  if (totalLifetimeSpent !== null && totalLifetimeSpent !== undefined) {
    advancedStats.push({
      name: 'Lifetime Value',
      value: `$${totalLifetimeSpent.toFixed(2)}`,
      subtitle: 'Total gastado',
      icon: DollarSign,
      color: 'text-yellow-400',
      bgColor: 'from-yellow-500/10 to-orange-500/10',
      borderColor: 'border-yellow-500/30'
    });
  }

  if (purchaseCount !== null && purchaseCount !== undefined && purchaseCount > 0) {
    advancedStats.push({
      name: 'Compras',
      value: purchaseCount.toString(),
      subtitle: 'Transacciones',
      icon: ShoppingCart,
      color: 'text-pink-400',
      bgColor: 'from-pink-500/10 to-rose-500/10',
      borderColor: 'border-pink-500/30'
    });
  }

  if (customerTier) {
    advancedStats.push({
      name: 'Plan',
      value: customerTier.toUpperCase(),
      subtitle: loyaltyDiscount ? `${loyaltyDiscount}% descuento` : customerTier.toLowerCase() === 'pro' ? 'Plan activo' : 'Cliente',
      icon: Award,
      color: customerTier.toLowerCase() === 'pro' ? 'text-green-400' : customerTier === 'free' ? 'text-gray-400' : 'text-amber-400',
      bgColor: customerTier.toLowerCase() === 'pro' ? 'from-green-500/10 to-emerald-500/10' : customerTier === 'free' ? 'from-gray-500/10 to-slate-500/10' : 'from-amber-500/10 to-yellow-500/10',
      borderColor: customerTier.toLowerCase() === 'pro' ? 'border-green-500/30' : customerTier === 'free' ? 'border-gray-500/30' : 'border-amber-500/30'
    });
  }

  const allStats = [...stats, ...advancedStats];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {allStats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.name}
            className={`bg-gradient-to-br ${stat.bgColor} backdrop-blur-xl border ${stat.borderColor} rounded-xl p-5 hover:scale-105 transition-all duration-200`}
          >
            <div className="flex items-center justify-between mb-3">
              <Icon className={`w-6 h-6 ${stat.color}`} />
              {stat.name === 'Último Acceso' && lastLoginDate && (
                <span className="text-[10px] text-gray-500">
                  {lastLoginDate.toLocaleDateString('es-ES')}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.name}</div>
            {stat.subtitle && (
              <div className="text-[10px] text-gray-500 mt-1">{stat.subtitle}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

