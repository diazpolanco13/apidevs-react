'use client';

import { useState } from 'react';
import { 
  Shield, 
  Key, 
  Settings, 
  Mail, 
  CreditCard, 
  TrendingUp, 
  Lock, 
  Wrench
} from 'lucide-react';
import AdministradoresTab from './tabs/AdministradoresTab';
import PlaceholderTab from './tabs/PlaceholderTab';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role_id: string;
  avatar_url: string | null;
  status: string;
  last_login_at: string | null;
  created_at: string;
  admin_roles: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    permissions: Record<string, boolean>;
    is_system_role: boolean;
  };
}

interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  permissions: Record<string, boolean>;
  is_system_role: boolean;
}

interface Tab {
  id: string;
  name: string;
  icon: any;
  enabled: boolean;
}

interface ConfiguracionClientProps {
  admins: AdminUser[];
  roles: Role[];
  currentUserId: string;
}

const TABS: Tab[] = [
  { id: 'admins', name: 'Administradores & Permisos', icon: Shield, enabled: true },
  { id: 'integrations', name: 'Integraciones & API Keys', icon: Key, enabled: false },
  { id: 'system', name: 'Configuración del Sistema', icon: Settings, enabled: false },
  { id: 'email', name: 'Email & Notificaciones', icon: Mail, enabled: false },
  { id: 'stripe', name: 'Stripe & Pagos', icon: CreditCard, enabled: false },
  { id: 'tradingview', name: 'TradingView API', icon: TrendingUp, enabled: false },
  { id: 'security', name: 'Seguridad & Auditoría', icon: Lock, enabled: false },
  { id: 'maintenance', name: 'Mantenimiento', icon: Wrench, enabled: false },
];

export default function ConfiguracionClient({ 
  admins, 
  roles,
  currentUserId 
}: ConfiguracionClientProps) {
  const [activeTab, setActiveTab] = useState<string>('admins');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'admins':
        return (
          <AdministradoresTab 
            admins={admins} 
            roles={roles}
            currentUserId={currentUserId}
          />
        );
      case 'integrations':
        return <PlaceholderTab tabName="Integraciones & API Keys" icon={Key} />;
      case 'system':
        return <PlaceholderTab tabName="Configuración del Sistema" icon={Settings} />;
      case 'email':
        return <PlaceholderTab tabName="Email & Notificaciones" icon={Mail} />;
      case 'stripe':
        return <PlaceholderTab tabName="Stripe & Pagos" icon={CreditCard} />;
      case 'tradingview':
        return <PlaceholderTab tabName="TradingView API" icon={TrendingUp} />;
      case 'security':
        return <PlaceholderTab tabName="Seguridad & Auditoría" icon={Lock} />;
      case 'maintenance':
        return <PlaceholderTab tabName="Mantenimiento" icon={Wrench} />;
      default:
        return <PlaceholderTab tabName="En desarrollo" icon={Wrench} />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header - Exactamente igual al de Indicadores */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Settings className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Configuración General
            </h1>
            <p className="text-gray-400">
              Panel unificado de configuración y gestión del sistema APIDevs Trading Platform
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation - Exactamente igual al de Indicadores */}
      <div className="mb-8">
        <div className="border-b border-gray-800">
          <nav className="flex justify-start space-x-1 -mb-px">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => tab.enabled && setActiveTab(tab.id)}
                  disabled={!tab.enabled}
                  className={`
                    group relative flex items-center gap-3 px-6 py-4 border-b-2 font-medium text-sm transition-all
                    ${isActive
                      ? 'border-apidevs-primary text-apidevs-primary'
                      : tab.enabled
                        ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                        : 'border-transparent text-gray-600 cursor-not-allowed'
                    }
                  `}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isActive
                        ? 'text-apidevs-primary'
                        : tab.enabled
                          ? 'text-gray-400 group-hover:text-gray-300'
                          : 'text-gray-600'
                    }`}
                  />

                  <div className="flex flex-col items-start">
                    <span className="flex items-center gap-2">
                      {tab.name}
                      {!tab.enabled && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-800 text-gray-500">
                          Próximamente
                        </span>
                      )}
                    </span>
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
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  );
}

