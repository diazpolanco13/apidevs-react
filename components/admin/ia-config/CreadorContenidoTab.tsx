'use client';

import { useState, useRef } from 'react';
import { Settings, FileText, Palette, Users, Save, RefreshCw, TestTube, AlertCircle, Clock, CheckCircle, Eye, Plus, Database, Key, Wand2, Image as ImageIcon } from 'lucide-react';
import { useAIContentSettings, AIContentSettings } from '@/hooks/useAIContentSettings';
import { useSanityIntegration } from '@/hooks/useSanityIntegration';
import ContentCreatorPermissions from './ContentCreatorPermissions';
import CreateContentModal from './CreateContentModal';
import ModelSelectorModal from './ModelSelectorModal';
import ContentPreviewModal from './ContentPreviewModal';

interface Props {
  config: any;
  setConfig: (config: any) => void;
}

export default function CreadorContenidoTab({ config, setConfig }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'configuracion' | 'cola' | 'templates'>('configuracion');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTextModelSelectorOpen, setIsTextModelSelectorOpen] = useState(false);
  const [isImageModelSelectorOpen, setIsImageModelSelectorOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<any>(null);
  
  // Refs para los inputs de Sanity
  const sanityProjectIdRef = useRef<HTMLInputElement>(null);
  const sanityDatasetRef = useRef<HTMLInputElement>(null);
  const sanityTokenRef = useRef<HTMLInputElement>(null);
  const openrouterApiKeyRef = useRef<HTMLInputElement>(null);
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
        enabled: true, // Siempre habilitado cuando se guarda
        default_language: formData.get('default_language') as 'es' | 'en',
        model_provider: formData.get('model_provider') as string || 'openrouter',
        model_name: formData.get('model_name') as string || 'anthropic/claude-3.5-sonnet',
        temperature: parseFloat(formData.get('temperature') as string) || 0.7,
        max_tokens: parseInt(formData.get('max_tokens') as string) || 4000,
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
    // Cambiar automáticamente a la pestaña de cola
    setActiveSubTab('cola');
  };

  const handleApprove = async (itemId: string) => {
    try {
      const response = await fetch(`/api/admin/content-creator/queue/${itemId}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        loadQueue(); // Recargar cola
      } else {
        alert('Error al aprobar contenido');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al aprobar contenido');
    }
  };

  const handleReject = async (itemId: string) => {
    const reason = prompt('¿Por qué rechazas este contenido?');
    if (!reason) return;

    try {
      const response = await fetch(`/api/admin/content-creator/queue/${itemId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        loadQueue(); // Recargar cola
      } else {
        alert('Error al rechazar contenido');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al rechazar contenido');
    }
  };

  const handleView = (item: any) => {
    setPreviewItem(item);
  };

  const handlePublish = async (itemId: string) => {
    if (!confirm('¿Publicar este contenido en Sanity?')) return;

    try {
      const response = await fetch(`/api/admin/content-creator/queue/${itemId}/publish`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('¡Contenido publicado en Sanity exitosamente!');
        loadQueue(); // Recargar cola
      } else {
        const result = await response.json();
        alert(`Error al publicar: ${result.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al publicar contenido');
    }
  };

  const handleSaveSanityConfig = async () => {
    try {
      // Obtener los valores de los inputs usando refs
      const projectId = sanityProjectIdRef.current?.value;
      const dataset = sanityDatasetRef.current?.value;
      const token = sanityTokenRef.current?.value;
      const openrouterApiKey = openrouterApiKeyRef.current?.value;

      if (!projectId || !dataset || !token) {
        alert('Por favor completa todos los campos de Sanity');
        return;
      }

      // Guardar configuración de Sanity y OpenRouter
      await saveSanityConfig({
        projectId,
        dataset,
        apiVersion: '2023-05-03',
        token,
        openrouter_api_key: openrouterApiKey,
      });

      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error saving Sanity config:', error);
      alert('Error al guardar la configuración');
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
                    {/* Información sobre habilitación */}
                    {(!config.tools_enabled || !config.available_tools?.includes('generateContent')) && (
                      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                          <div>
                            <p className="text-yellow-400 font-medium">Content Creator AI deshabilitado</p>
                            <p className="text-yellow-300 text-sm mt-1">
                              Para habilitar la creación de contenido:
                              <br/>1. Ve al tab <strong>"Avanzado"</strong>
                              <br/>2. Activa el toggle <strong>"Habilitar Herramientas (Tools)"</strong>
                              <br/>3. Activa la herramienta <strong>"Generar Contenido con IA"</strong> ✨
                              <br/>4. Guarda los cambios y recarga la página
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Modo de Publicación y Límites - COMPACTADO EN GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Modo de Publicación */}
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                        <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                          <Settings className="h-4 w-4 text-apidevs-primary" />
                          Modo de Publicación
                        </h3>
                        <div className="space-y-2">
                          <label className="flex items-center p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                            <input
                              type="radio"
                              name="auto_publish_mode"
                              value="draft"
                              defaultChecked={settings.auto_publish_mode === 'draft'}
                              className="h-4 w-4 text-apidevs-primary focus:ring-apidevs-primary border-gray-600"
                            />
                            <div className="ml-3">
                              <span className="text-sm text-gray-300 font-medium">Borrador</span>
                              <p className="text-xs text-gray-500">Requiere aprobación</p>
                            </div>
                          </label>
                          
                          <label className="flex items-center p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                            <input
                              type="radio"
                              name="auto_publish_mode"
                              value="review"
                              defaultChecked={settings.auto_publish_mode === 'review'}
                              className="h-4 w-4 text-apidevs-primary focus:ring-apidevs-primary border-gray-600"
                            />
                            <div className="ml-3">
                              <span className="text-sm text-gray-300 font-medium">Revisión</span>
                              <p className="text-xs text-gray-500">Cola de aprobación</p>
                            </div>
                          </label>
                          
                          <label className="flex items-center p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                            <input
                              type="radio"
                              name="auto_publish_mode"
                              value="published"
                              defaultChecked={settings.auto_publish_mode === 'published'}
                              className="h-4 w-4 text-apidevs-primary focus:ring-apidevs-primary border-gray-600"
                            />
                            <div className="ml-3">
                              <span className="text-sm text-gray-300 font-medium">Automático</span>
                              <p className="text-xs text-gray-500">⚠️ Sin revisión</p>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Límites de Seguridad */}
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                        <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4 text-apidevs-primary" />
                          Límites de Seguridad
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Máximo posts/día
                            </label>
                            <input
                              type="number"
                              name="max_posts_per_day"
                              defaultValue={settings.max_posts_per_day}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Máximo tokens/día
                            </label>
                            <input
                              type="number"
                              name="max_tokens_per_day"
                              defaultValue={settings.max_tokens_per_day}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50"
                            />
                          </div>
                          <div className="p-2 bg-gray-700/50 rounded-lg">
                            <p className="text-xs text-gray-300">
                              <span className="text-apidevs-primary font-medium">Hoy:</span> 3/{settings.max_posts_per_day} posts
                            </p>
                          </div>
                        </div>
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

                    {/* Configuración del Modelo de IA para Contenido */}
                    <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Settings className="h-5 w-5 text-green-400" />
                        Modelo de IA para Generación de Contenido
                      </h4>
                      <p className="text-sm text-gray-300 mb-4">
                        💡 Usa la misma OpenRouter API key del chat. Selecciona un modelo premium para contenido de máxima calidad o uno gratuito para pruebas.
                      </p>
                      
                      {/* Modelo actual y botón para abrir modal */}
                      <div className="mb-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Modelo actual:</p>
                            <p className="text-sm text-white font-medium">{settings?.model_name || 'anthropic/claude-3.5-sonnet'}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsTextModelSelectorOpen(true)}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg transition-all text-sm"
                          >
                            Cambiar Modelo
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Temperatura
                          </label>
                          <input
                            type="number"
                            name="temperature"
                            step="0.1"
                            min="0"
                            max="2"
                            defaultValue={settings?.temperature || 0.7}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Max Tokens
                          </label>
                          <input
                            type="number"
                            name="max_tokens"
                            step="1000"
                            min="4000"
                            max="32000"
                            defaultValue={settings?.max_tokens || 8000}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            Recomendado: 8000-16000 para contenido completo
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Configuración de Modelo para Imágenes */}
                    <div className="p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl">
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Wand2 className="h-5 w-5 text-purple-400" />
                        Modelo de IA para Generación de Imágenes
                      </h4>
                      <p className="text-sm text-gray-300 mb-4">
                        💡 Usa OpenRouter para imágenes también (una sola facturación). Gemini 2.5 Flash Image es GRATIS.
                      </p>
                      
                      {/* Modelo actual y botón para abrir modal */}
                      <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Modelo actual:</p>
                            <p className="text-sm text-white font-medium">{settings?.image_model_name || 'google/gemini-2.5-flash-image'}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsImageModelSelectorOpen(true)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all text-sm"
                          >
                            Cambiar Modelo
                          </button>
                        </div>
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
                <div className="space-y-3">
                  {queue.map((item) => (
                    <div key={item.id} className="bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-all">
                      <div className="flex items-start gap-3 p-3">
                        {/* Preview de imagen si existe */}
                        <div className="flex-shrink-0 w-20 h-20">
                          {item.content_type === 'image' && item.generated_content?.imageUrl ? (
                            <img 
                              src={item.generated_content.imageUrl}
                              alt="Preview"
                              className="w-full h-full object-cover rounded-lg border border-purple-500/30"
                            />
                          ) : item.generated_content?.mainImage?.prompt ? (
                            <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg overflow-hidden border border-purple-500/30 flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-purple-400" />
                            </div>
                          ) : (
                            <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center border border-gray-600">
                              <FileText className="h-8 w-8 text-gray-500" />
                            </div>
                          )}
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'pending_review' ? 'bg-yellow-500/20 text-yellow-400' :
                              item.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                              item.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                              item.status === 'published_in_sanity' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {item.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {item.content_type} • {item.language}
                            </span>
                          </div>
                          <h4 className="text-white font-medium text-sm mb-1 truncate">
                            {item.title || 'Sin título'}
                          </h4>
                          <p className="text-gray-400 text-xs line-clamp-2">
                            {item.user_prompt}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-2">
                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                            {item.tokens_used > 0 && <span>{item.tokens_used} tokens</span>}
                          </div>
                        </div>

                        {/* Botones compactos */}
                        <div className="flex flex-shrink-0 gap-1">
                          {item.status === 'pending_review' && (
                            <>
                              <button 
                                onClick={() => handleApprove(item.id)}
                                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] rounded"
                                title="Aprobar"
                              >
                                Aprobar
                              </button>
                              <button 
                                onClick={() => handleReject(item.id)}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] rounded"
                                title="Rechazar"
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                          {(item.status === 'approved' || item.status === 'published_in_sanity') && !item.sanity_document_id && (
                            <button 
                              onClick={() => handlePublish(item.id)}
                              className="px-2 py-1 bg-gradient-to-r from-apidevs-primary to-purple-600 text-white text-[10px] rounded font-bold"
                              title="Publicar en Sanity"
                            >
                              🚀 Publicar
                            </button>
                          )}
                          <button 
                            onClick={() => handleView(item)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] rounded"
                            title="Ver preview completo"
                          >
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

            {/* Modal para seleccionar modelo de TEXTO */}
            <ModelSelectorModal
              isOpen={isTextModelSelectorOpen}
              onClose={() => setIsTextModelSelectorOpen(false)}
              currentModel={settings?.model_name || 'anthropic/claude-3.5-sonnet'}
              onSave={async (modelId) => {
                await saveSettings({ model_name: modelId });
                loadSettings(); // Recargar para mostrar el nuevo modelo
              }}
            />

            {/* Modal para seleccionar modelo de IMÁGENES */}
            <ModelSelectorModal
              isOpen={isImageModelSelectorOpen}
              onClose={() => setIsImageModelSelectorOpen(false)}
              currentModel={settings?.image_model_name || 'google/gemini-2.5-flash-image'}
              onSave={async (modelId) => {
                await saveSettings({ image_model_name: modelId });
                loadSettings(); // Recargar para mostrar el nuevo modelo
              }}
            />

            {/* Modal de preview de contenido */}
            <ContentPreviewModal
              isOpen={!!previewItem}
              onClose={() => setPreviewItem(null)}
              item={previewItem}
            />
          </div>
        );
      }}
    </ContentCreatorPermissions>
  );
}
