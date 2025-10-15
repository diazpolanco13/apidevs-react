'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import ModelConfiguration from './ModelConfiguration';
import SystemPromptEditor from './SystemPromptEditor';
import ToolsConfiguration from './ToolsConfiguration';
import GreetingConfiguration from './GreetingConfiguration';
import AdvancedSettings from './AdvancedSettings';
import ConfigurationPreview from './ConfigurationPreview';
import QuickActions from './QuickActions';
import { Save, RefreshCw, AlertCircle } from 'lucide-react';
import { AIConfig } from './IAMainView';

interface Props {
  config: AIConfig | null;
  setConfig: (config: AIConfig | null) => void;
}

export default function ConfiguracionTab({ config, setConfig }: Props) {
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
      
      // @ts-ignore - ai_configuration table not in types yet
      const { error } = await (supabase as any)
        .from('ai_configuration')
        .update({
          ...config,
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

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Model Configuration */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <ModelConfiguration config={config} updateConfig={updateConfig} />
          </div>

          {/* System Prompt Editor */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <SystemPromptEditor config={config} updateConfig={updateConfig} />
          </div>

          {/* Tools Configuration */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <ToolsConfiguration config={config} updateConfig={updateConfig} />
          </div>

          {/* Greeting Configuration */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <GreetingConfiguration config={config} updateConfig={updateConfig} />
          </div>

          {/* Advanced Settings */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <AdvancedSettings config={config} updateConfig={updateConfig} />
          </div>
        </div>

        {/* Right Column - Actions & Preview */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sticky top-6">
            <QuickActions onSave={saveConfiguration} onReload={() => window.location.reload()} saving={saving} />
          </div>

          {/* Configuration Preview */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <ConfigurationPreview config={config} />
          </div>
        </div>
      </div>

      {/* Save Button - Fixed Bottom */}
      <div className="fixed bottom-6 right-6 z-10">
        <button
          onClick={saveConfiguration}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Guardar Cambios
            </>
          )}
        </button>
      </div>
    </div>
  );
}

