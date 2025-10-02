'use client';

import { useState, useCallback } from 'react';
import { Megaphone, DollarSign, TrendingUp, Users, ShoppingCart, Target, RefreshCw } from 'lucide-react';
import DateRangeFilter from '@/components/admin/geo-analytics/DateRangeFilter';
import CampaignsTable from './CampaignsTable';

interface Campaign {
  campaign_id: string;
  campaign_name: string;
  utm_source: string;
  utm_campaign: string;
  status: 'active' | 'paused' | 'completed';
  budget_cents: number;
  external_reach: number;
  external_spend_cents: number;
  total_visits: number;
  total_purchases: number;
  total_revenue_cents: number;
  conversion_rate: number;
  ctr: number;
  cac_cents: number;
  roas: number;
  first_visit: string;
  last_visit: string;
}

interface CampaignsClientProps {
  initialCampaigns: Campaign[];
  activeCampaignsCount: number;
  totalSpent: number;
  totalRevenue: number;
  totalVisits: number;
  totalPurchases: number;
  globalConversionRate: number;
  globalROAS: number;
  globalCAC: number;
}

export default function CampaignsClient({
  initialCampaigns,
  activeCampaignsCount: initialActiveCampaigns,
  totalSpent: initialTotalSpent,
  totalRevenue: initialTotalRevenue,
  totalVisits: initialTotalVisits,
  totalPurchases: initialTotalPurchases,
  globalConversionRate: initialGlobalConversionRate,
  globalROAS: initialGlobalROAS,
  globalCAC: initialGlobalCAC,
}: CampaignsClientProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [activeCampaignsCount, setActiveCampaignsCount] = useState(initialActiveCampaigns);
  const [totalSpent, setTotalSpent] = useState(initialTotalSpent);
  const [totalRevenue, setTotalRevenue] = useState(initialTotalRevenue);
  const [globalConversionRate, setGlobalConversionRate] = useState(initialGlobalConversionRate);
  const [globalROAS, setGlobalROAS] = useState(initialGlobalROAS);
  const [globalCAC, setGlobalCAC] = useState(initialGlobalCAC);
  const [isLoading, setIsLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  const handleDateChange = useCallback(async (from: Date, to: Date) => {
    setIsLoading(true);
    setDateFrom(from);
    setDateTo(to);

    try {
      const response = await fetch('/api/admin/campaigns/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: from.toISOString(),
          to: to.toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        setCampaigns(data.campaigns || []);
        setActiveCampaignsCount(data.activeCampaignsCount || 0);
        setTotalSpent(data.totalSpent || 0);
        setTotalRevenue(data.totalRevenue || 0);
        setGlobalConversionRate(data.globalConversionRate || 0);
        setGlobalROAS(data.globalROAS || 0);
        setGlobalCAC(data.globalCAC || 0);
      }
    } catch (error) {
      console.error('Error fetching filtered campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const stats = [
    {
      name: 'Gasto Total en Ads',
      value: formatCurrency(totalSpent),
      change: `${activeCampaignsCount} activas`,
      changeType: 'neutral' as const,
      icon: DollarSign,
      color: 'text-red-400',
      bgColor: 'from-red-500/10 to-orange-500/10',
      borderColor: 'border-red-500/30',
      tooltip: 'Dinero invertido en publicidad'
    },
    {
      name: 'Revenue Generado',
      value: formatCurrency(totalRevenue),
      change: `ROAS: ${globalROAS.toFixed(0)}%`,
      changeType: globalROAS > 200 ? 'positive' : 'neutral' as const,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-500/30',
      tooltip: 'Dinero ganado por las campañas'
    },
    {
      name: 'CAC Promedio',
      value: formatCurrency(globalCAC),
      change: `${initialTotalPurchases} clientes`,
      changeType: 'neutral' as const,
      icon: Target,
      color: 'text-purple-400',
      bgColor: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-500/30',
      tooltip: 'Costo de Adquisición por Cliente'
    },
    {
      name: 'Conversion Rate',
      value: `${globalConversionRate.toFixed(2)}%`,
      change: `${initialTotalPurchases}/${initialTotalVisits} visitas`,
      changeType: globalConversionRate > 5 ? 'positive' : 'neutral' as const,
      icon: ShoppingCart,
      color: 'text-blue-400',
      bgColor: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/30',
      tooltip: 'Tasa de conversión global'
    },
  ];

  return (
    <>
      {/* Header con filtro de fechas */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
              <Megaphone className="w-6 h-6 text-orange-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Campañas UTM
            </h1>
          </div>
          <p className="text-gray-400">
            Dashboard de campañas publicitarias con métricas de ROI, CAC y ROAS
          </p>
        </div>
        
        <DateRangeFilter 
          onDateChange={handleDateChange}
          defaultRange="month"
        />
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-900/90 border border-orange-500/30 rounded-2xl p-8 flex items-center gap-4">
            <RefreshCw className="w-6 h-6 text-orange-400 animate-spin" />
            <div>
              <div className="text-white font-semibold mb-1">Actualizando campañas...</div>
              <div className="text-sm text-gray-400">
                {dateFrom && dateTo && (
                  `Analizando del ${dateFrom.toLocaleDateString('es-ES')} al ${dateTo.toLocaleDateString('es-ES')}`
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className={`bg-gradient-to-br ${stat.bgColor} backdrop-blur-xl border ${stat.borderColor} rounded-2xl p-6 hover:scale-105 transition-all group cursor-default relative overflow-hidden`}
              title={stat.tooltip}
            >
              {isLoading && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
              )}
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${stat.color}`} />
                {stat.changeType === 'positive' && (
                  <span className="text-sm font-semibold text-green-400">
                    {stat.change}
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.name}</div>
              {(stat.changeType === 'neutral' || !stat.changeType) && stat.change && (
                <div className="text-xs text-gray-500 mt-1">{stat.change}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tabla de Campañas */}
      <div className="bg-black/30 backdrop-blur-xl border border-orange-500/20 rounded-2xl overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-10 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-orange-400 animate-spin" />
          </div>
        )}
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-orange-400" />
            Rendimiento por Campaña
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Click en cualquier columna para ordenar • {campaigns.length} campañas encontradas
          </p>
        </div>
        <CampaignsTable campaigns={campaigns} />
      </div>
    </>
  );
}

