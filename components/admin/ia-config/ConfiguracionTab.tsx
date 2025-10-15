'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Save, RefreshCw, AlertCircle, Bot, FileText, Building2, Users, Settings as SettingsIcon } from 'lucide-react';
import { AIConfig } from './IAMainView';

// Importar los sub-editores
import ModelConfiguration from './ModelConfiguration';
import SystemPromptEditor from './SystemPromptEditor';
import ToolsConfiguration from './ToolsConfiguration';
import GreetingConfiguration from './GreetingConfiguration';
import AdvancedSettings from './AdvancedSettings';
import ConfigurationPreview from './ConfigurationPreview';
import QuickActions from './QuickActions';
import PlatformInfoEditor from './PlatformInfoEditor';
import PricingConfigEditor from './PricingConfigEditor';
import UserTypeConfigEditor from './UserTypeConfigEditor';

interface Props {
  config: AIConfig | null;
  setConfig: (config: AIConfig | null) => void;
}

type SubTab = 'modelo' | 'prompt' | 'plataforma' | 'usuarios' | 'avanzado';

export default function ConfiguracionTab({ config, setConfig }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('modelo');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const saveConfiguration = async () => {
    if (!config) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const supabase = createClient();
      
      // Primero, desactivar TODOS los otros registros activos
      // @ts-ignore - ai_configuration table not in types yet
      await (supabase as any)
        .from('ai_configuration')
        .update({ is_active: false })
        .neq('id', config.id);
      
      // Luego, actualizar y activar este registro
      // @ts-ignore - ai_configuration table not in types yet
      const { error } = await (supabase as any)
        .from('ai_configuration')
        .update({
          ...config,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', config.id);

      if (error) throw error;

      setSuccess('✅ Configuración guardada exitosamente');
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving configuration:', err);
      setError('❌ Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (updates: Partial<AIConfig>) => {
    if (!config) return;
    setConfig({ ...config, ...updates });
  };

  if (!config) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-400 text-lg font-semibold">No se pudo cargar la configuración del asistente IA</p>
        <p className="text-gray-400 text-sm mt-2">Por favor, recarga la página o contacta soporte</p>
      </div>
    );
  }

  const subTabs = [
    {
      id: 'modelo' as SubTab,
      name: 'Modelo IA',
      icon: Bot,
      description: 'Provider, modelo, parámetros',
    },
    {
      id: 'prompt' as SubTab,
      name: 'Prompt & Comportamiento',
      icon: FileText,
      description: 'System prompt, greeting, estilo',
    },
    {
      id: 'plataforma' as SubTab,
      name: 'Plataforma & Precios',
      icon: Building2,
      description: 'Info general y planes',
    },
    {
      id: 'usuarios' as SubTab,
      name: 'Tipos de Usuario',
      icon: Users,
      description: 'Configuración por segmento',
    },
    {
      id: 'avanzado' as SubTab,
      name: 'Avanzado',
      icon: SettingsIcon,
      description: 'Tools, rate limit, logs',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-2">
          <span className="text-green-400 text-2xl">✅</span>
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Sub-Tabs Navigation */}
      <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
        <div className="flex gap-2 overflow-x-auto">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/50 text-white shadow-lg'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                  }
                `}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-purple-400' : 'text-gray-500'}`} />
                <div className="flex flex-col items-start">
                  <span>{tab.name}</span>
                  <span className={`text-[10px] ${isActive ? 'text-purple-300/70' : 'text-gray-500'}`}>
                    {tab.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Sub-Tab Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 🤖 MODELO IA */}
          {activeSubTab === 'modelo' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <ModelConfiguration config={config} updateConfig={updateConfig} />
              </div>
            </div>
          )}

          {/* 📝 PROMPT & COMPORTAMIENTO */}
          {activeSubTab === 'prompt' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <SystemPromptEditor config={config} updateConfig={updateConfig} />
              </div>
              
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <GreetingConfiguration config={config} updateConfig={updateConfig} />
              </div>
            </div>
          )}

          {/* 🏢 PLATAFORMA & PRECIOS */}
          {activeSubTab === 'plataforma' && (
            <div className="space-y-6">
              <PlatformInfoEditor
                platformInfo={config.platform_info || {
                  name: "APIDevs Trading Platform",
                  description: "Plataforma de indicadores de TradingView",
                  features: []
                }}
                onChange={(info) => updateConfig({ platform_info: info })}
              />

              <PricingConfigEditor
                pricingConfig={config.pricing_config || {
                  plans: {
                    free: { name: "FREE", price: 0, currency: "USD", features: [] },
                    pro_monthly: { name: "PRO Mensual", price: 39, currency: "USD", billing: "monthly", features: [] },
                    pro_yearly: { name: "PRO Anual", price: 390, currency: "USD", billing: "yearly", features: [] },
                    lifetime: { name: "Lifetime", price: 999, currency: "USD", billing: "one_time", features: [] }
                  }
                }}
                onChange={(pricing) => updateConfig({ pricing_config: pricing })}
              />
            </div>
          )}

          {/* 👥 TIPOS DE USUARIO */}
          {activeSubTab === 'usuarios' && (
            <div className="space-y-6">
              <UserTypeConfigEditor
                configs={config.user_type_configs || {
                  visitor: {
                    label: "Visitantes",
                    greeting_template: "¡Hola! 👋",
                    capabilities: [],
                    restrictions: [],
                    tone: "informativo",
                    show_pricing: true,
                    show_discounts: false,
                    call_to_action: null
                  },
                  registered_no_purchase: {
                    label: "Registrados",
                    greeting_template: "¡Hola! 👋",
                    capabilities: [],
                    restrictions: [],
                    tone: "amigable",
                    show_pricing: true,
                    show_discounts: false,
                    call_to_action: null
                  },
                  pro_active: {
                    label: "PRO",
                    greeting_template: "¡Hola! 👋",
                    capabilities: [],
                    restrictions: [],
                    tone: "profesional",
                    show_pricing: false,
                    show_discounts: false,
                    call_to_action: null
                  },
                  lifetime: {
                    label: "Lifetime",
                    greeting_template: "¡Hola! 👋",
                    capabilities: [],
                    restrictions: [],
                    tone: "premium",
                    show_pricing: false,
                    show_discounts: false,
                    call_to_action: null
                  },
                  legacy: {
                    label: "Legacy",
                    greeting_template: "¡Hola! 👋",
                    capabilities: [],
                    restrictions: [],
                    tone: "agradecido",
                    show_pricing: true,
                    show_discounts: true,
                    call_to_action: null
                  }
                }}
                onChange={(userConfigs) => updateConfig({ user_type_configs: userConfigs })}
              />
            </div>
          )}

          {/* ⚙️ AVANZADO */}
          {activeSubTab === 'avanzado' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <ToolsConfiguration config={config} updateConfig={updateConfig} />
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <AdvancedSettings config={config} updateConfig={updateConfig} />
              </div>
            </div>
          )}

        </div>

        {/* Right Column - Actions & Preview (siempre visible) */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <QuickActions onSave={saveConfiguration} onReload={() => window.location.reload()} saving={saving} />
          </div>

          {/* Configuration Preview */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <ConfigurationPreview config={config} />
          </div>
        </div>
      </div>

    </div>
  );
}
