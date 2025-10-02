'use client';

import { useState, useCallback, useEffect } from 'react';
import { Globe, Users, ShoppingCart, TrendingUp, MapPin, RefreshCw } from 'lucide-react';
import PlotlyGeoMap from './PlotlyGeoMap';
import CountryStatsTable from './CountryStatsTable';
import DateRangeFilter from './DateRangeFilter';
import TrendChart from '../analytics/TrendChart';
import PeriodComparison from '../analytics/PeriodComparison';

interface CountryStats {
  country: string;
  country_name: string;
  total_visits: number;
  total_purchases: number;
  total_revenue_cents: number;
  conversion_rate: number;
  avg_latitude: number;
  avg_longitude: number;
  avg_time_on_site: number;
  avg_pages_visited: number;
}

interface GeoAnalyticsClientProps {
  initialCountryStats: CountryStats[];
  initialTotalVisits: number;
  initialTotalPurchases: number;
  initialConversionRate: number;
  initialTotalRevenue: number;
  initialUniqueCountries: number;
  initialTopCountry?: CountryStats;
}

export default function GeoAnalyticsClient({
  initialCountryStats,
  initialTotalVisits,
  initialTotalPurchases,
  initialConversionRate,
  initialTotalRevenue,
  initialUniqueCountries,
  initialTopCountry
}: GeoAnalyticsClientProps) {
  const [countryStats, setCountryStats] = useState<CountryStats[]>(initialCountryStats);
  const [totalVisits, setTotalVisits] = useState(initialTotalVisits);
  const [totalPurchases, setTotalPurchases] = useState(initialTotalPurchases);
  const [conversionRate, setConversionRate] = useState(initialConversionRate);
  const [totalRevenue, setTotalRevenue] = useState(initialTotalRevenue);
  const [uniqueCountries, setUniqueCountries] = useState(initialUniqueCountries);
  const [topCountry, setTopCountry] = useState(initialTopCountry);
  const [isLoading, setIsLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  
  // Estados para tendencias y comparación
  const [trendsData, setTrendsData] = useState<any>(null);
  const [showTrends, setShowTrends] = useState(false);

  // Calcular cambios desde trendsData o usar valores iniciales
  const visitsChange = trendsData?.comparison?.visits?.toFixed(1) || '+0.0';
  const purchasesChange = trendsData?.comparison?.purchases?.toFixed(1) || '+0.0';

  const handleDateChange = useCallback(async (from: Date, to: Date) => {
    setIsLoading(true);
    setDateFrom(from);
    setDateTo(to);
    setShowTrends(true);

    try {
      // Llamar a ambas APIs en paralelo
      const [filterResponse, trendsResponse] = await Promise.all([
        fetch('/api/admin/geo-analytics/filter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: from.toISOString(),
            to: to.toISOString()
          })
        }),
        fetch('/api/admin/geo-analytics/trends', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: from.toISOString(),
            to: to.toISOString()
          })
        })
      ]);

      if (filterResponse.ok) {
        const data = await filterResponse.json();
        
        setCountryStats(data.countryStats || []);
        setTotalVisits(data.totalVisits || 0);
        setTotalPurchases(data.totalPurchases || 0);
        setConversionRate(data.conversionRate || 0);
        setTotalRevenue(data.totalRevenue || 0);
        setUniqueCountries(data.uniqueCountries || 0);
        setTopCountry(data.topCountry);
      }

      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json();
        setTrendsData(trendsData);
      }
    } catch (error) {
      console.error('Error fetching filtered data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stats: Array<{
    name: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    icon: any;
    color: string;
    bgColor: string;
    borderColor: string;
    tooltip: string;
  }> = [
    {
      name: 'Visitas Totales',
      value: totalVisits.toLocaleString(),
      change: `+${visitsChange}%`,
      changeType: 'positive',
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/30',
      tooltip: 'Total de sesiones únicas registradas'
    },
    {
      name: 'Compras',
      value: totalPurchases.toLocaleString(),
      change: `+${purchasesChange}%`,
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'text-green-400',
      bgColor: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-500/30',
      tooltip: 'Visitantes que completaron una compra'
    },
    {
      name: 'Conversion Rate',
      value: `${conversionRate.toFixed(2)}%`,
      change: '+0.2%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-500/30',
      tooltip: 'Compras / Visitas * 100'
    },
    {
      name: 'Países Alcanzados',
      value: uniqueCountries.toString(),
      change: topCountry ? `Top: ${topCountry.country_name}` : '',
      changeType: 'neutral',
      icon: Globe,
      color: 'text-orange-400',
      bgColor: 'from-orange-500/10 to-yellow-500/10',
      borderColor: 'border-orange-500/30',
      tooltip: 'Países desde donde se conectaron'
    },
  ];

  return (
    <>
      {/* Header con filtro de fechas */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <MapPin className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Geo-Analytics
            </h1>
          </div>
          <p className="text-gray-400">
            Análisis geográfico de tráfico y conversiones por país
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
          <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-8 flex items-center gap-4">
            <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
            <div>
              <div className="text-white font-semibold mb-1">Actualizando datos...</div>
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
                {stat.changeType === 'negative' && (
                  <span className="text-sm font-semibold text-red-400">
                    {stat.change}
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.name}</div>
              {stat.changeType === 'neutral' && stat.change && (
                <div className="text-xs text-gray-500 mt-1">{stat.change}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparación de Períodos y Tendencias */}
      {showTrends && trendsData && (
        <>
          <PeriodComparison
            metrics={[
              {
                label: 'Visitas',
                current: trendsData.current.visits || 0,
                previous: trendsData.previous.visits || 0,
              },
              {
                label: 'Compras',
                current: trendsData.current.purchases || 0,
                previous: trendsData.previous.purchases || 0,
              },
              {
                label: 'Revenue',
                current: trendsData.current.revenue || 0,
                previous: trendsData.previous.revenue || 0,
                format: (v) => `$${(v / 100).toFixed(2)}`,
              },
              {
                label: 'Conv. Rate',
                current: trendsData.current.conversionRate || 0,
                previous: trendsData.previous.conversionRate || 0,
                format: (v) => `${v.toFixed(2)}%`,
                inverse: false,
              },
            ]}
            currentPeriodLabel={trendsData.periodLabels.current}
            previousPeriodLabel={trendsData.periodLabels.previous}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendChart
              data={trendsData.trends.visits}
              title="Tendencia de Visitas"
              label="Período actual"
              comparisonLabel="Período anterior"
              color="rgb(16, 185, 129)"
              comparisonColor="rgb(147, 51, 234)"
              formatValue={(v) => v.toLocaleString()}
            />

            <TrendChart
              data={trendsData.trends.conversions}
              title="Tendencia de Conversiones"
              label="Período actual"
              comparisonLabel="Período anterior"
              color="rgb(59, 130, 246)"
              comparisonColor="rgb(236, 72, 153)"
              formatValue={(v) => v.toLocaleString()}
            />
          </div>

          <TrendChart
            data={trendsData.trends.revenue}
            title="Tendencia de Revenue"
            label="Período actual"
            comparisonLabel="Período anterior"
            color="rgb(245, 158, 11)"
            comparisonColor="rgb(139, 92, 246)"
            formatValue={(v) => `$${(v / 100).toFixed(2)}`}
          />
        </>
      )}

      {/* Mapa Interactivo */}
      <div className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-2xl overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-10 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-400" />
            Mapa de Conversiones Global
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Países coloreados según tasa de conversión • Tamaño del círculo = volumen de visitas
          </p>
        </div>
        <div className="p-0">
          <PlotlyGeoMap countries={countryStats} />
        </div>
      </div>

      {/* Tabla de Países */}
      <div className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-2xl overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-10 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Estadísticas por País
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Click en cualquier columna para ordenar
          </p>
        </div>
        <CountryStatsTable countries={countryStats} />
      </div>
    </>
  );
}

