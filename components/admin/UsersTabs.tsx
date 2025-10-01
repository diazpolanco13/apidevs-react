'use client';

import { useState } from 'react';
import { Users, RefreshCw } from 'lucide-react';

interface UsersTabsProps {
  activeUsersView: React.ReactNode;
  legacyUsersView: React.ReactNode;
  activeUsersCount: number;
  legacyUsersCount: number;
}

export default function UsersTabs({
  activeUsersView,
  legacyUsersView,
  activeUsersCount,
  legacyUsersCount
}: UsersTabsProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'legacy'>('active');

  const tabs = [
    {
      id: 'active' as const,
      name: 'Usuarios Activos',
      icon: Users,
      count: activeUsersCount,
      description: 'Clientes con cuentas activas'
    },
    {
      id: 'legacy' as const,
      name: 'Reactivación Legacy',
      icon: RefreshCw,
      count: legacyUsersCount,
      description: 'Usuarios migrados de WordPress'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Tabs Header */}
      <div className="border-b border-gray-800">
        <nav className="flex space-x-1 -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group relative flex items-center gap-3 px-6 py-4 border-b-2 font-medium text-sm transition-all
                  ${isActive
                    ? 'border-apidevs-primary text-apidevs-primary'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-apidevs-primary' : 'text-gray-400 group-hover:text-gray-300'}`} />
                
                <div className="flex flex-col items-start">
                  <span className="flex items-center gap-2">
                    {tab.name}
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-semibold
                      ${isActive
                        ? 'bg-apidevs-primary/20 text-apidevs-primary'
                        : 'bg-gray-800 text-gray-400'
                      }
                    `}>
                      {tab.count.toLocaleString()}
                    </span>
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5">{tab.description}</span>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-apidevs-primary to-green-400" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        {activeTab === 'active' ? activeUsersView : legacyUsersView}
      </div>
    </div>
  );
}

