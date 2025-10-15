'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import ModelConfiguration from './ModelConfiguration';
import SystemPromptEditor from './SystemPromptEditor';
import ToolsConfiguration from './ToolsConfiguration';
import GreetingConfiguration from './GreetingConfiguration';
import AdvancedSettings from './AdvancedSettings';
import ConfigurationPreview from './ConfigurationPreview';
import QuickActions from './QuickActions';
import { Save, RefreshCw } from 'lucide-react';

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
}

export default function AIConfigurationClient() {
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // @ts-ignore - ai_configuration table not in types yet
      const { data, error } = await (supabase as any)
        .from('ai_configuration')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      setConfig(data as AIConfig);
    } catch (err: any) {
      console.error('Error loading AI configuration:', err);
      setError('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

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
          updated_by: 'api@apidevs.io'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
        <p className="text-red-400">No se pudo cargar la configuración del asistente IA</p>
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
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Model Configuration */}
          <ModelConfiguration config={config} updateConfig={updateConfig} />

          {/* System Prompt Editor */}
          <SystemPromptEditor config={config} updateConfig={updateConfig} />

          {/* Greeting Configuration */}
          <GreetingConfiguration config={config} updateConfig={updateConfig} />

          {/* Tools Configuration */}
          <ToolsConfiguration config={config} updateConfig={updateConfig} />

          {/* Advanced Settings */}
          <AdvancedSettings config={config} updateConfig={updateConfig} />
        </div>

        {/* Right Column - Preview & Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions 
            onSave={saveConfiguration} 
            onReload={loadConfiguration}
            saving={saving}
          />

          {/* Configuration Preview */}
          <ConfigurationPreview config={config} />
        </div>
      </div>

      {/* Save Button Fixed at Bottom */}
      <div className="sticky bottom-4 z-20">
        <button
          onClick={saveConfiguration}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Guardando cambios...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Guardar Configuración</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

