'use client';

import RevenueChart from '../overview/RevenueChart';
import TypeBreakdown from '../overview/TypeBreakdown';
import TopProducts from '../overview/TopProducts';

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

