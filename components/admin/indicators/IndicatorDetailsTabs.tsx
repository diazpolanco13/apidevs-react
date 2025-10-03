'use client';

import { useState } from 'react';
import IndicatorInfo from './IndicatorInfo';
import IndicatorAccessManagement from './IndicatorAccessManagement';

type Indicator = {
  id: string;
  pine_id: string;
  name: string;
  description: string | null;
  category: string;
  status: string;
  type: string;
  image_1: string | null;
  image_2: string | null;
  image_3: string | null;
  features: any;
  tags: string[];
  total_users: number;
  active_users: number;
  created_at: string;
  updated_at: string;
};

type Access = {
  id: string;
  user_id: string;
  indicator_id: string;
  tradingview_username: string;
  status: string;
  granted_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  duration_type: string | null;
  subscription_id: string | null;
  error_message: string | null;
  created_at: string;
  users: {
    id: string;
    email: string;
    full_name: string | null;
    tradingview_username: string | null;
    avatar_url: string | null;
  } | null;
};

type Stats = {
  total_accesses: number;
  active_accesses: number;
  pending_accesses: number;
  expired_accesses: number;
  revoked_accesses: number;
  failed_accesses: number;
};

type Props = {
  indicator: Indicator;
  accesses: Access[];
  stats: Stats;
};

const tabs = [
  {
    id: 'info',
    name: 'Información',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    )
  },
  {
    id: 'access',
    name: 'Gestión de Acceso',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    )
  }
];

export default function IndicatorDetailsTabs({
  indicator,
  accesses,
  stats
}: Props) {
  const [activeTab, setActiveTab] = useState('info');

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="border-b border-zinc-800">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-all ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'info' && <IndicatorInfo indicator={indicator} />}
        {activeTab === 'access' && (
          <IndicatorAccessManagement
            indicator={indicator}
            accesses={accesses}
            stats={stats}
          />
        )}
      </div>
    </div>
  );
}

