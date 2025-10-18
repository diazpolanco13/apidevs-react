'use client';

import { useState, useRef } from 'react';
import { Settings, FileText, Palette, Users, Save, RefreshCw, TestTube, AlertCircle, Clock, CheckCircle, Eye, Plus, Database, Key, Wand2 } from 'lucide-react';
import { useAIContentSettings, AIContentSettings } from '@/hooks/useAIContentSettings';
import { useSanityIntegration } from '@/hooks/useSanityIntegration';
import ContentCreatorPermissions from './ContentCreatorPermissions';
import CreateContentModal from './CreateContentModal';

interface Props {
  config: any;
  setConfig: (config: any) => void;
}

export default function CreadorContenidoTab({ config, setConfig }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'configuracion' | 'cola' | 'templates'>('configuracion');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Refs para los inputs de Sanity
  const sanityProjectIdRef = useRef<HTMLInputElement>(null);
  const sanityDatasetRef = useRef<HTMLInputElement>(null);
  const sanityTokenRef = useRef<HTMLInputElement>(null);
  const grokApiKeyRef = useRef<HTMLInputElement>(null);
  const {
    settings,
    queue,
    loading,
    saving,
    error,
    saveSettings,
    loadSettings,
    loadQueue,
  } = useAIContentSettings();
  
  const {
    config: sanityConfig,
    loading: sanityLoading,
    error: sanityError,
    saveConfig: saveSanityConfig,
    testConnection,
  } = useSanityIntegration();

  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testingGrokConnection, setTestingGrokConnection] = useState(false);
  const [grokTestResult, setGrokTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const subTabs = [
    {
      id: 'configuracion' as const,
      name: 'Configuración Creator',
      description: 'Modo de publicación, imágenes, SEO',
      icon: Settings,
    },
    {
      id: 'cola' as const,
      name: 'Cola de Contenido',
      description: 'Pendientes de revisión',
      icon: FileText,
    },
    {
      id: 'templates' as const,
      name: 'Templates',
      description: 'Plantillas de contenido',
      icon: Palette,
    },
  ];

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      // Recopilar datos del formulario
      const formData = new FormData(document.getElementById('ai-content-form') as HTMLFormElement);
      
      const updates: Partial<AIContentSettings> = {
        enabled: formData.get('enabled') === 'on',
        default_language: formData.get('default_language') as 'es' | 'en',
        model_provider: formData.get('model_provider') as string,
        model_name: formData.get('model_name') as string,
        temperature: parseFloat(formData.get('temperature') as string),
        max_tokens: parseInt(formData.get('max_tokens') as string),
        auto_publish_mode: formData.get('auto_publish_mode') as 'draft' | 'review' | 'published',
        require_admin_approval: formData.get('require_admin_approval') === 'on',
        image_generation_enabled: formData.get('image_generation_enabled') === 'on',
        image_provider: formData.get('image_provider') as 'grok' | 'dalle' | 'midjourney',
        grok_api_key: formData.get('grok_api_key') as string,
        seo_optimization_enabled: formData.get('seo_optimization_enabled') === 'on',
        auto_generate_meta_description: formData.get('auto_generate_meta_description') === 'on',
        auto_generate_keywords: formData.get('auto_generate_keywords') === 'on',
        target_keyword_density: parseFloat(formData.get('target_keyword_density') as string),
        auto_translate_enabled: formData.get('auto_translate_enabled') === 'on',
        translate_after_publish: formData.get('translate_after_publish') === 'on',
        max_posts_per_day: parseInt(formData.get('max_posts_per_day') as string),
        max_tokens_per_day: parseInt(formData.get('max_tokens_per_day') as string),
      };

      await saveSettings(updates);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleCreateSuccess = () => {
    // Recargar la cola después de crear contenido
    loadQueue();
  };

  const handleSaveSanityConfig = async () => {
    try {
      // Obtener los valores de los inputs usando refs
      const projectId = sanityProjectIdRef.current?.value;
      const dataset = sanityDatasetRef.current?.value;
      const token = sanityTokenRef.current?.value;

      if (!projectId || !dataset || !token) {
        alert('Por favor completa todos los campos de Sanity');
        return;
      }

      await saveSanityConfig({
        projectId,
        dataset,
        apiVersion: '2023-05-03',
        token,
      });

      alert('Configuración de Sanity guardada exitosamente');
    } catch (error) {
      console.error('Error saving Sanity config:', error);
      alert('Error al guardar la configuración de Sanity');
    }
  };

  const handleSaveOpenAIConfig = async () => {
    try {
      const openaiApiKey = grokApiKeyRef.current?.value;

      if (!openaiApiKey) {
        alert('Por favor ingresa la API key de OpenAI');
        return;
      }

      // Guardar la API key en system_configuration
      const response = await fetch('/api/admin/content-creator/sanity/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          openai_api_key: openaiApiKey
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar la API key');
      }

      alert('API key de OpenAI guardada exitosamente');
    } catch (error) {
      console.error('Error saving OpenAI config:', error);
      alert('Error al guardar la API key de OpenAI');
    }
  };

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      setTestResult(null);

      // Obtener los valores actuales de los inputs
      const projectId = sanityProjectIdRef.current?.value;
      const dataset = sanityDatasetRef.current?.value;
      const token = sanityTokenRef.current?.value;

      if (!projectId || !dataset || !token) {
        setTestResult({
          success: false,
          message: 'Por favor completa todos los campos antes de probar la conexión'
        });
        return;
      }

      // Hacer test de conexión con los valores actuales
      const result = await testConnection();
      setTestResult(result);

      // Mostrar resultado por 5 segundos
      setTimeout(() => {
        setTestResult(null);
      }, 5000);

    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Error al probar la conexión'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleTestGrokConnection = async () => {
    try {
      setTestingGrokConnection(true);
      setGrokTestResult(null);

      const openaiApiKey = grokApiKeyRef.current?.value;

      if (!openaiApiKey) {
        setGrokTestResult({
          success: false,
          message: 'Por favor ingresa la API key de OpenAI'
        });
        return;
      }

      // Test simple de generación de imagen con OpenAI
      const response = await fetch('/api/admin/content-creator/grok/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'test image generation',
          style: 'realistic',
          size: '1024x1024',
          quality: 'standard',
          apiKey: openaiApiKey // Pass API key for testing
        }),
      });

      const result = await response.json();

      if (result.success) {
        setGrokTestResult({
          success: true,
          message: 'Conexión con OpenAI DALL-E 3 API exitosa'
        });
      } else {
        setGrokTestResult({
          success: false,
          message: result.error || 'Error al conectar con OpenAI DALL-E 3 API'
        });
      }

      // Mostrar resultado por 5 segundos
      setTimeout(() => {
        setGrokTestResult(null);
      }, 5000);

    } catch (error) {
      setGrokTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Error al probar la conexión con OpenAI DALL-E 3'
      });
    } finally {
      setTestingGrokConnection(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apidevs-primary"></div>
        <span className="ml-3 text-gray-400">Cargando configuración...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-400" />
        <div>
          <p className="text-red-400 font-medium">Error al cargar configuración</p>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <ContentCreatorPermissions>
      {(permissions) => {
        if (!permissions.canView) {
          return (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-yellow-400 font-medium">Acceso denegado</p>
                <p className="text-yellow-300 text-sm">No tienes permisos para acceder al Content Creator AI</p>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6">
      {/* Sub-tabs Navigation */}
      <div className="border-b border-gray-800">
        <nav className="flex space-x-1 -mb-px">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`
                  group relative flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-all
                  ${
                    isActive
                      ? 'border-apidevs-primary text-apidevs-primary'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                  }
                `}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? 'text-apidevs-primary' : 'text-gray-400 group-hover:text-gray-300'
                  }`}
                />
                <div className="flex flex-col items-start">
                  <span className="text-sm">{tab.name}</span>
                  <span
                    className={`text-[10px] leading-tight ${
                      isActive ? 'text-apidevs-primary/70' : 'text-gray-500'
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

      {/* Sub-tab Content */}
      <div className="mt-6">
        {activeSubTab === 'configuracion' && settings && (
          <form id="ai-content-form" className="space-y-6">
            {/* Modo de Publicación */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-apidevs-primary" />
                Modo de Publicación
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="auto_publish_mode"
                      value="draft"
                      defaultChecked={settings.auto_publish_mode === 'draft'}
                      className="h-4 w-4 text-apidevs-primary focus:ring-apidevs-primary border-gray-600 bg-gray-700"
                    />
                    <span className="ml-2 text-gray-300">Modo Borrador (Recomendado)</span>
                  </label>
                </div>
                <p className="text-sm text-gray-400 ml-6">
                  Guarda como draft, requiere aprobación manual
                </p>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="auto_publish_mode"
                      value="review"
                      defaultChecked={settings.auto_publish_mode === 'review'}
                      className="h-4 w-4 text-apidevs-primary focus:ring-apidevs-primary border-gray-600 bg-gray-700"
                    />
                    <span className="ml-2 text-gray-300">Modo Revisión</span>
                  </label>
                </div>
                <p className="text-sm text-gray-400 ml-6">
                  Crea en cola de revisión para aprobación
                </p>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="auto_publish_mode"
                      value="published"
                      defaultChecked={settings.auto_publish_mode === 'published'}
                      className="h-4 w-4 text-apidevs-primary focus:ring-apidevs-primary border-gray-600 bg-gray-700"
                    />
                    <span className="ml-2 text-gray-300">Modo Automático</span>
                  </label>
                </div>
                <p className="text-sm text-gray-400 ml-6">
                  Publica directamente en status "published" ⚠️ Sin revisión humana
                </p>
              </div>
            </div>

            {/* Generación de Imágenes */}
            {permissions.canGenerateImages && (
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Palette className="h-5 w-5 text-apidevs-primary" />
                  Generación de Imágenes con Grok
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-300">Habilitar generación automática</label>
                      <p className="text-xs text-gray-400">Genera imágenes para posts de blog automáticamente</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="image_generation_enabled"
                        defaultChecked={settings.image_generation_enabled}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-apidevs-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-apidevs-primary"></div>
                    </label>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">
                      API Key de Grok
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        name="grok_api_key"
                        defaultValue={settings.grok_api_key || ''}
                        placeholder="Ingresa tu API key de Grok..."
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50 focus:border-transparent"
                      />
                      <button type="button" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
                        Test
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Límites de Seguridad */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-apidevs-primary" />
                Límites de Seguridad
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Máximo posts por día
                  </label>
                  <input
                    type="number"
                    name="max_posts_per_day"
                    defaultValue={settings.max_posts_per_day}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Máximo tokens por día
                  </label>
                  <input
                    type="number"
                    name="max_tokens_per_day"
                    defaultValue={settings.max_tokens_per_day}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50"
                  />
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-300">
                  <span className="text-apidevs-primary">Usados hoy:</span> 3/{settings.max_posts_per_day} posts | 12,450/{settings.max_tokens_per_day.toLocaleString()} tokens
                </p>
              </div>
            </div>

            {/* Configuración de Sanity */}
            {permissions.canView && (
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5 text-apidevs-primary" />
                  Configuración de Sanity CMS
                </h3>
                
                {sanityConfig ? (
                  <div className="space-y-4">
                    <div className={`p-3 rounded-lg border ${
                      sanityConfig.isConfigured 
                        ? 'bg-green-900/20 border-green-500/30' 
                        : 'bg-yellow-900/20 border-yellow-500/30'
                    }`}>
                      <div className="flex items-center gap-2">
                        {sanityConfig.isConfigured ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-400" />
                        )}
                        <span className={`text-sm ${
                          sanityConfig.isConfigured ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          Estado: {sanityConfig.isConfigured ? 'Configurado' : 'No configurado'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Project ID
                        </label>
                        <input
                          ref={sanityProjectIdRef}
                          type="text"
                          defaultValue={sanityConfig.projectId || ''}
                          placeholder="tu-project-id"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Dataset
                        </label>
                        <input
                          ref={sanityDatasetRef}
                          type="text"
                          defaultValue={sanityConfig.dataset || 'production'}
                          placeholder="production"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        API Token
                      </label>
                      <div className="flex gap-2">
                        <input
                          ref={sanityTokenRef}
                          type="password"
                          defaultValue={sanityConfig.token === 'not_configured' ? '' : '***configured***'}
                          placeholder="sk-..."
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50"
                        />
                        <button 
                          type="button"
                          onClick={handleTestConnection}
                          disabled={testingConnection}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {testingConnection ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <TestTube className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Configuración de OpenAI API para imágenes */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl">
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Wand2 className="h-5 w-5 text-purple-400" />
                        Configuración de OpenAI API (DALL-E 3)
                      </h4>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          OpenAI API Key
                        </label>
                        <div className="flex gap-2">
                          <input
                            ref={grokApiKeyRef}
                            type="password"
                            defaultValue={sanityConfig?.openai_api_key || ''}
                            placeholder="sk-..."
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          />
                          <button 
                            type="button"
                            onClick={handleTestGrokConnection}
                            disabled={testingGrokConnection}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                          >
                            {testingGrokConnection ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <TestTube className="h-4 w-4" />
                            )}
                          </button>
                          <button 
                            type="button"
                            onClick={handleSaveOpenAIConfig}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Necesaria para generar imágenes con DALL-E 3 directamente
                        </p>
                        {sanityConfig?.openai_api_key && sanityConfig.openai_api_key.length > 0 && (
                          <div className="mt-2 p-2 bg-green-900/20 border border-green-500/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-400" />
                              <span className="text-green-400 text-sm">API key configurada</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Resultado del test de conexión */}
                    {testResult && (
                      <div className={`p-3 rounded-lg border ${
                        testResult.success 
                          ? 'bg-green-900/20 border-green-500/30' 
                          : 'bg-red-900/20 border-red-500/30'
                      }`}>
                        <div className="flex items-center gap-2">
                          {testResult.success ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-400" />
                          )}
                          <span className={`text-sm ${
                            testResult.success ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {testResult.message}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Resultado del test de Grok */}
                    {grokTestResult && (
                      <div className={`p-3 rounded-lg border ${
                        grokTestResult.success 
                          ? 'bg-green-900/20 border-green-500/30' 
                          : 'bg-red-900/20 border-red-500/30'
                      }`}>
                        <div className="flex items-center gap-2">
                          {grokTestResult.success ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-400" />
                          )}
                          <span className={`text-sm ${
                            grokTestResult.success ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {grokTestResult.message}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleSaveSanityConfig}
                        disabled={sanityLoading}
                        className="px-4 py-2 bg-gradient-to-r from-apidevs-primary to-purple-600 hover:from-apidevs-primary/90 hover:to-purple-600/90 text-white rounded-lg transition-all disabled:opacity-50"
                      >
                        {sanityLoading ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        {sanityLoading ? 'Guardando...' : 'Guardar Configuración'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Cargando configuración de Sanity...</p>
                  </div>
                )}
              </div>
            )}
          </form>
        )}

        {activeSubTab === 'cola' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-apidevs-primary" />
                  Cola de Contenido ({queue.length} elementos)
                </h3>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-apidevs-primary to-purple-600 hover:from-apidevs-primary/90 hover:to-purple-600/90 text-white rounded-lg transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Crear Contenido
                </button>
              </div>
              
              {queue.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No hay contenido pendiente de revisión</p>
                  <p className="text-sm text-gray-500 mt-2">
                    El contenido generado aparecerá aquí para revisión
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {queue.map((item) => (
                    <div key={item.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              item.status === 'pending_review' ? 'bg-yellow-500/20 text-yellow-400' :
                              item.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                              item.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                              item.status === 'published' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {item.status}
                            </span>
                            <span className="text-xs text-gray-400">
                              {item.content_type} • {item.language}
                            </span>
                          </div>
                          <h4 className="text-white font-medium mb-1">
                            {item.title || 'Sin título'}
                          </h4>
                          <p className="text-gray-400 text-sm mb-2">
                            {item.user_prompt}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Creado: {new Date(item.created_at).toLocaleDateString()}</span>
                            {item.tokens_used > 0 && (
                              <span>Tokens: {item.tokens_used}</span>
                            )}
                            {item.processing_time_ms && (
                              <span>Tiempo: {item.processing_time_ms}ms</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {item.status === 'pending_review' && (
                            <>
                              <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded">
                                Aprobar
                              </button>
                              <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded">
                                Rechazar
                              </button>
                            </>
                          )}
                          <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded">
                            Ver
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'templates' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Palette className="h-5 w-5 text-apidevs-primary" />
                Templates de Contenido
              </h3>
              <div className="text-center py-12">
                <Palette className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Templates personalizados</p>
                <p className="text-sm text-gray-500 mt-2">
                  Configura plantillas para diferentes tipos de contenido
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

            {/* Quick Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Recargar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-apidevs-primary to-purple-600 hover:from-apidevs-primary/90 hover:to-purple-600/90 text-white rounded-lg transition-all disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar Cambios
              </button>
            </div>

            {/* Modal para crear contenido */}
            <CreateContentModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSuccess={handleCreateSuccess}
            />
          </div>
        );
      }}
    </ContentCreatorPermissions>
  );
}
