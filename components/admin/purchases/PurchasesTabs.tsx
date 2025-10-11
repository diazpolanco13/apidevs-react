'use client';

import { useState } from 'react';
import { 
  LayoutDashboard, 
  RefreshCw, 
  ShoppingBag, 
  RotateCcw, 
  BarChart3,
  List,
  AlertTriangle
} from 'lucide-react';
import PurchasesHeader from './PurchasesHeader';
import { PurchaseMetrics } from '@/types/purchases';

interface PurchasesTabsProps {
  metrics: PurchaseMetrics | null;
  overviewView: React.ReactNode;
  allPurchasesView: React.ReactNode;
  subscriptionsView: React.ReactNode;
  oneTimeView: React.ReactNode;
  refundsView: React.ReactNode;
  analyticsView: React.ReactNode;
  cancellationsView: React.ReactNode;
}

export default function PurchasesTabs({
  metrics,
  overviewView,
  allPurchasesView,
  subscriptionsView,
  oneTimeView,
  refundsView,
  analyticsView,
  cancellationsView
}: PurchasesTabsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Determinar si mostrar métricas arriba (SOLO para el tab "Todas las Compras")
  const showMetricsAbove = activeTab === 'all-purchases';

  const tabs = [
    {
      id: 'overview',
      name: 'Overview',
      icon: LayoutDashboard,
      description: 'Análisis visual'
    },
    {
      id: 'all-purchases',
      name: 'Todas las Compras',
      icon: List,
      description: 'Lista completa'
    },
    {
      id: 'subscriptions',
      name: 'Suscripciones',
      icon: RefreshCw,
      description: 'Pagos recurrentes'
    },
    {
      id: 'one-time',
      name: 'One-Time',
      icon: ShoppingBag,
      description: 'Compras únicas'
    },
    {
      id: 'refunds',
      name: 'Reembolsos',
      icon: RotateCcw,
      description: 'Devoluciones procesadas'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: BarChart3,
      description: 'Análisis financiero'
    },
    {
      id: 'cancellations',
      name: 'Cancelaciones',
      icon: AlertTriangle,
      description: 'Gestión de cancelaciones'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return overviewView;
      case 'all-purchases':
        return allPurchasesView;
      case 'subscriptions':
        return subscriptionsView;
      case 'one-time':
        return oneTimeView;
      case 'refunds':
        return refundsView;
      case 'analytics':
        return analyticsView;
      case 'cancellations':
        return cancellationsView;
      default:
        return overviewView;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs Header - SIEMPRE PRIMERO */}
      <div className="border-b border-gray-800">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group relative flex items-center gap-2 px-3 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap flex-shrink-0
                  ${isActive
                    ? 'border-apidevs-primary text-apidevs-primary'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                  }
                `}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-apidevs-primary' : 'text-gray-400 group-hover:text-gray-300'}`} />
                
                <div className="flex flex-col items-start hidden sm:flex">
                  <span className="text-sm">{tab.name}</span>
                  <span className="text-xs text-gray-500 mt-0.5">{tab.description}</span>
                </div>
                <span className="text-sm sm:hidden">{tab.name}</span>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-apidevs-primary to-green-400" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Metrics Header - Mostrar SOLO en el tab "Todas las Compras" */}
      {showMetricsAbove && (
        <PurchasesHeader metrics={metrics} loading={!metrics} />
      )}

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        {renderContent()}
      </div>
    </div>
  );
}

