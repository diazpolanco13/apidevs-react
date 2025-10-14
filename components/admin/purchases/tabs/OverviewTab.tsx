'use client';

import dynamic from 'next/dynamic';
import TypeBreakdown from '../overview/TypeBreakdown';
import TopProducts from '../overview/TopProducts';

// Dynamic import para Chart.js (code splitting)
const RevenueChart = dynamic(() => import('../overview/RevenueChart'), {
  loading: () => (
    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 h-[500px] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
        <div className="text-gray-400 text-sm">Cargando gráfico...</div>
      </div>
    </div>
  ),
  ssr: false
});

interface OverviewTabProps {
  overviewData: {
    timeline: {
      date: string;
      revenue: number;
      purchases: number;
    }[];
    topProducts: {
      name: string;
      sales: number;
      revenue: number;
    }[];
    breakdown: {
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
    };
  };
}

export default function OverviewTab({ overviewData }: OverviewTabProps) {
  // Force re-render with unique key based on data
  const chartKey = `chart-${overviewData.timeline.reduce((sum, d) => sum + d.revenue, 0)}`;
  
  return (
    <div className="space-y-6">
      {/* Revenue Timeline Chart */}
      <RevenueChart key={chartKey} data={overviewData.timeline} />

      {/* Type Breakdown */}
      <TypeBreakdown
        subscription={overviewData.breakdown.subscription}
        oneTime={overviewData.breakdown.oneTime}
        lifetime={overviewData.breakdown.lifetime}
      />

      {/* Top Products */}
      <TopProducts products={overviewData.topProducts} />
    </div>
  );
}

