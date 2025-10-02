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
  return (
    <div className="space-y-6">
      {/* Revenue Timeline Chart */}
      <RevenueChart data={overviewData.timeline} />

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

