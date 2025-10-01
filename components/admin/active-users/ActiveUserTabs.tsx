'use client';

import { useState } from 'react';
import { User, CreditCard, Shield, Activity } from 'lucide-react';

interface ActiveUserTabsProps {
  overviewView: React.ReactNode;
  billingView: React.ReactNode;
  actionsView: React.ReactNode;
  timelineView: React.ReactNode;
}

export default function ActiveUserTabs({
  overviewView,
  billingView,
  actionsView,
  timelineView
}: ActiveUserTabsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'billing' | 'actions' | 'timeline'>('overview');

  const tabs = [
    {
      id: 'overview' as const,
      name: 'Perfil',
      icon: User,
      description: 'Información general del usuario'
    },
    {
      id: 'billing' as const,
      name: 'Facturación',
      icon: CreditCard,
      description: 'Historial de pagos e invoices'
    },
    {
      id: 'actions' as const,
      name: 'Acciones Admin',
      icon: Shield,
      description: 'Gestión y acciones críticas'
    },
    {
      id: 'timeline' as const,
      name: 'Actividad',
      icon: Activity,
      description: 'Historial y timeline'
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
                  <span>{tab.name}</span>
                  <span className="text-xs text-gray-500 mt-0.5 hidden lg:block">{tab.description}</span>
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
        {activeTab === 'overview' && overviewView}
        {activeTab === 'billing' && billingView}
        {activeTab === 'actions' && actionsView}
        {activeTab === 'timeline' && timelineView}
      </div>
    </div>
  );
}

