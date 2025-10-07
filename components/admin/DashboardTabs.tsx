'use client';

import { useState } from 'react';
import { Zap, DollarSign, ShoppingCart, RefreshCw, TrendingUp, Package, CreditCard, Wallet, Users, AlertCircle } from 'lucide-react';

interface DashboardTabsProps {
  subscriptions: {
    total: number;
    recurring: number;
    lifetime: number;
  };
  revenue: {
    mrr: number;
    totalLtv: number;
    avgLtv: number;
    payingUsers: number;
  };
  purchases: {
    total: number;
    last30d: number;
    lifetime: number;
  };
  legacy: {
    reactivated: number;
    pending: number;
    total: number;
  };
}

type TabType = 'subscriptions' | 'revenue' | 'purchases' | 'legacy';

export default function DashboardTabs({ subscriptions, revenue, purchases, legacy }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('subscriptions');

  const tabs = [
    {
      id: 'subscriptions' as TabType,
      name: 'Suscripciones',
      icon: Zap,
      count: subscriptions.total,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/50'
    },
    {
      id: 'revenue' as TabType,
      name: 'Ingresos',
      icon: DollarSign,
      count: `$${revenue.mrr.toFixed(0)}`,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/50'
    },
    {
      id: 'purchases' as TabType,
      name: 'Compras',
      icon: ShoppingCart,
      count: purchases.total,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/50'
    },
    {
      id: 'legacy' as TabType,
      name: 'Usuarios Legacy',
      icon: RefreshCw,
      count: legacy.pending,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/50'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 transition-all ${
                isActive
                  ? `${tab.bgColor} border-b-2 ${tab.borderColor} ${tab.color}`
                  : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{tab.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                isActive ? `${tab.bgColor} ${tab.color}` : 'bg-gray-700 text-gray-300'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tabs Content */}
      <div className="p-6">
        {activeTab === 'subscriptions' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={Zap}
              title="Total Suscripciones"
              value={subscriptions.total}
              description="Usuarios con acceso activo"
              color="text-yellow-400"
              bgColor="from-yellow-500/20 to-yellow-600/10"
            />
            <StatCard
              icon={TrendingUp}
              title="Recurrentes"
              value={subscriptions.recurring}
              description="Mensual + Anual activas"
              color="text-blue-400"
              bgColor="from-blue-500/20 to-blue-600/10"
            />
            <StatCard
              icon={Package}
              title="Lifetime"
              value={subscriptions.lifetime}
              description="Compras únicas pagadas"
              color="text-purple-400"
              bgColor="from-purple-500/20 to-purple-600/10"
            />
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={DollarSign}
              title="MRR"
              value={`$${revenue.mrr.toFixed(2)}`}
              description="Ingresos mensuales recurrentes"
              color="text-emerald-400"
              bgColor="from-emerald-500/20 to-emerald-600/10"
            />
            <StatCard
              icon={Wallet}
              title="LTV Total"
              value={`$${revenue.totalLtv.toFixed(2)}`}
              description="Valor total generado"
              color="text-teal-400"
              bgColor="from-teal-500/20 to-teal-600/10"
            />
            <StatCard
              icon={TrendingUp}
              title="LTV Promedio"
              value={`$${revenue.avgLtv.toFixed(2)}`}
              description="Por usuario pagante"
              color="text-cyan-400"
              bgColor="from-cyan-500/20 to-cyan-600/10"
            />
            <StatCard
              icon={Users}
              title="Usuarios Pagantes"
              value={revenue.payingUsers}
              description="Con al menos 1 compra"
              color="text-indigo-400"
              bgColor="from-indigo-500/20 to-indigo-600/10"
            />
          </div>
        )}

        {activeTab === 'purchases' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={ShoppingCart}
              title="Total Compras"
              value={purchases.total}
              description="Todas las transacciones pagadas"
              color="text-blue-400"
              bgColor="from-blue-500/20 to-blue-600/10"
            />
            <StatCard
              icon={CreditCard}
              title="Últimos 30 días"
              value={purchases.last30d}
              description="Compras recientes"
              color="text-green-400"
              bgColor="from-green-500/20 to-green-600/10"
            />
            <StatCard
              icon={Package}
              title="Compras Lifetime"
              value={purchases.lifetime}
              description="Acceso de por vida"
              color="text-purple-400"
              bgColor="from-purple-500/20 to-purple-600/10"
            />
          </div>
        )}

        {activeTab === 'legacy' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={RefreshCw}
              title="Reactivados"
              value={legacy.reactivated}
              description="Ya migrados exitosamente"
              color="text-green-400"
              bgColor="from-green-500/20 to-green-600/10"
            />
            <StatCard
              icon={AlertCircle}
              title="Pendientes"
              value={legacy.pending}
              description="Oportunidad de conversión"
              color="text-orange-400"
              bgColor="from-orange-500/20 to-orange-600/10"
              highlight
            />
            <StatCard
              icon={Users}
              title="Total Legacy"
              value={legacy.total}
              description="Base histórica"
              color="text-purple-400"
              bgColor="from-purple-500/20 to-purple-600/10"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  description, 
  color, 
  bgColor,
  highlight = false
}: { 
  icon: any; 
  title: string; 
  value: number | string; 
  description: string; 
  color: string; 
  bgColor: string;
  highlight?: boolean;
}) {
  return (
    <div className={`bg-gradient-to-br ${bgColor} backdrop-blur-xl border ${highlight ? 'border-orange-500/50 ring-2 ring-orange-500/20' : 'border-white/10'} rounded-xl p-6 hover:border-apidevs-primary/50 transition-all`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-8 h-8 ${color}`} />
        {highlight && (
          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full font-semibold">
            ALTO ROI
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-2">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="text-sm font-medium text-gray-300 mb-1">{title}</div>
      <div className="text-xs text-gray-500">{description}</div>
    </div>
  );
}

