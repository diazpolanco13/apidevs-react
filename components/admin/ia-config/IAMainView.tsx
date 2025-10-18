'use client';

import { useState } from 'react';
import { Bot, Settings, MessageSquare, Wrench, BarChart3, History, FileText } from 'lucide-react';
import ConfiguracionTab from './ConfiguracionTab';
import ConversacionesTab from './ConversacionesTab';
import ToolsTab from './ToolsTab';
import EstadisticasTab from './EstadisticasTab';
import HistorialTab from './HistorialTab';
import CreadorContenidoTab from './CreadorContenidoTab';

export interface AIConfig {
  id: string;
  model_provider: string;
  model_name: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string | null;
  custom_greeting: string | null;
  tools_enabled: boolean;
  available_tools: string[];
  rate_limit_enabled: boolean;
  max_messages_per_minute: number;
  response_style: string;
  include_emojis: boolean;
  show_typing_indicator: boolean;
  greeting_type: string;
  show_user_stats: boolean;
  show_legacy_discount: boolean;
  stream_responses: boolean;
  enable_context_memory: boolean;
  max_conversation_history: number;
  enable_logging: boolean;
  log_level: string;
  is_active: boolean;
  updated_at: string;
  // Nuevos campos parametrizables
  platform_info?: {
    name: string;
    description: string;
    features: string[];
  };
  pricing_config?: {
    plans: {
      free: any;
      pro_monthly: any;
      pro_yearly: any;
      lifetime: any;
    };
  };
  user_type_configs?: {
    visitor: any;
    registered_no_purchase: any;
    pro_active: any;
    lifetime: any;
    legacy: any;
  };
  response_templates?: any;
  behavior_rules?: any;
  admin_instructions?: any;
}

type TabType = 'configuracion' | 'conversaciones' | 'tools' | 'estadisticas' | 'historial' | 'creador-contenido';

interface Props {
  initialConfig: AIConfig | null;
}

export default function IAMainView({ initialConfig }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('configuracion');
  const [config, setConfig] = useState<AIConfig | null>(initialConfig);

  const tabs = [
    {
      id: 'configuracion' as TabType,
      name: 'Configuración',
      description: 'Modelos, prompt y comportamiento',
      icon: Settings,
      count: null,
    },
    {
      id: 'conversaciones' as TabType,
      name: 'Conversaciones',
      description: 'Historial de chats',
      icon: MessageSquare,
      count: null,
      badge: 'Por Desarrollar',
    },
    {
      id: 'tools' as TabType,
      name: 'Tools & Acciones',
      description: 'Herramientas disponibles',
      icon: Wrench,
      count: 2, // getUserStatus, getTradingViewUsername
    },
    {
      id: 'estadisticas' as TabType,
      name: 'Estadísticas',
      description: 'Métricas de uso',
      icon: BarChart3,
      count: null,
    },
    {
      id: 'historial' as TabType,
      name: 'Historial',
      description: 'Cambios de configuración',
      icon: History,
      count: null,
      badge: 'Por Desarrollar',
    },
    {
      id: 'creador-contenido' as TabType,
      name: 'Creador de Contenido',
      description: 'Generación automática de contenido',
      icon: FileText,
      count: null,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <Bot className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Gestión del Asistente IA
            </h1>
            <p className="text-gray-400">
              Panel unificado de configuración y gestión del chatbot APIDevs
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-800">
          <nav 
            className="flex justify-start space-x-1 -mb-px overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-gray-800/50 hover:scrollbar-thumb-purple-500/70"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(147, 51, 234, 0.5) rgba(31, 41, 55, 0.5)',
            }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={!!tab.badge}
                  className={`
                    group relative flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap flex-shrink-0
                    ${
                      isActive
                        ? 'border-apidevs-primary text-apidevs-primary'
                        : tab.badge
                        ? 'border-transparent text-gray-600 cursor-not-allowed'
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                    }
                  `}
                >
                  <Icon
                    className={`h-4 w-4 flex-shrink-0 ${
                      isActive
                        ? 'text-apidevs-primary'
                        : tab.badge
                        ? 'text-gray-600'
                        : 'text-gray-400 group-hover:text-gray-300'
                    }`}
                  />

                  <div className="flex flex-col items-start">
                    <span className="flex items-center gap-1.5">
                      <span className="text-sm">{tab.name}</span>
                      {tab.count !== null && (
                        <span
                          className={`
                            px-1.5 py-0.5 rounded text-xs font-semibold
                            ${
                              isActive
                                ? 'bg-apidevs-primary/20 text-apidevs-primary'
                                : 'bg-gray-800 text-gray-400'
                            }
                          `}
                        >
                          {tab.count}
                        </span>
                      )}
                      {tab.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                          {tab.badge}
                        </span>
                      )}
                    </span>
                    <span
                      className={`text-[10px] leading-tight ${
                        isActive
                          ? 'text-apidevs-primary/70'
                          : tab.badge
                          ? 'text-gray-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {tab.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        nav::-webkit-scrollbar {
          height: 6px;
        }
        nav::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 3px;
        }
        nav::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 3px;
        }
        nav::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
      `}</style>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'configuracion' && (
          <ConfiguracionTab config={config} setConfig={setConfig} />
        )}
        {activeTab === 'conversaciones' && <ConversacionesTab />}
        {activeTab === 'tools' && <ToolsTab />}
        {activeTab === 'estadisticas' && <EstadisticasTab />}
        {activeTab === 'historial' && <HistorialTab />}
        {activeTab === 'creador-contenido' && (
          <CreadorContenidoTab config={config} setConfig={setConfig} />
        )}
      </div>
    </div>
  );
}

