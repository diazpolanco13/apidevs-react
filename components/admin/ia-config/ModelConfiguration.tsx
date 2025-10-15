'use client';

import { useState, useEffect } from 'react';
import { Cpu, Zap, ThermometerSun, Hash, RefreshCw } from 'lucide-react';
import { AIConfig } from './AIConfigurationClient';

interface Props {
  config: AIConfig;
  updateConfig: (updates: Partial<AIConfig>) => void;
}

interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  contextWindow: number;
  pricing: {
    prompt: number;
    completion: number;
  };
  isFree: boolean;
  provider: string;
}

export default function ModelConfiguration({ config, updateConfig }: Props) {
  const [openRouterModels, setOpenRouterModels] = useState<OpenRouterModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);

  // Modelos estáticos de X.AI
  const xaiModels = ['grok-3', 'grok-2-1212'];

  // Cargar modelos de OpenRouter dinámicamente
  useEffect(() => {
    if (config.model_provider === 'openrouter') {
      loadOpenRouterModels();
    }
  }, [config.model_provider]);

  const loadOpenRouterModels = async () => {
    setLoadingModels(true);
    setModelsError(null);
    try {
      const response = await fetch('/api/ai/models');
      const data = await response.json();
      
      if (data.success) {
        setOpenRouterModels(data.models);
      } else {
        setModelsError(data.message || 'Error al cargar modelos');
      }
    } catch (error) {
      console.error('Error loading OpenRouter models:', error);
      setModelsError('Error de conexión');
    } finally {
      setLoadingModels(false);
    }
  };

  const modelProviders = [
    { 
      value: 'xai', 
      label: 'X.AI (Grok)', 
      models: xaiModels,
      icon: '🚀',
      description: 'Modelo rápido y confiable de X.AI',
      recommended: true
    },
    { 
      value: 'openrouter', 
      label: 'OpenRouter (400+ Modelos)', 
      models: openRouterModels.length > 0 
        ? openRouterModels.map(m => m.id)
        : [
          // Fallback estático si no se pueden cargar dinámicamente
          'anthropic/claude-3.5-sonnet',
          'openai/gpt-4o',
          'openai/gpt-4o-mini',
          'google/gemini-2.0-flash-exp:free',
          'meta-llama/llama-3.3-70b-instruct',
          'deepseek/deepseek-r1',
          'deepseek/deepseek-r1:free',
          'deepseek/deepseek-chat'
        ],
      icon: '🌐',
      description: 'Acceso a múltiples proveedores AI',
      recommended: true
    },
  ];

  const selectedProvider = modelProviders.find(p => p.value === config.model_provider);
  
  // Obtener info detallada del modelo seleccionado si es de OpenRouter
  const selectedModelInfo = config.model_provider === 'openrouter' 
    ? openRouterModels.find(m => m.id === config.model_name)
    : null;

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <Cpu className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Configuración del Modelo</h3>
          <p className="text-sm text-gray-400">Selecciona el proveedor y modelo de IA</p>
        </div>
      </div>

      {/* Model Provider Selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Proveedor de IA
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {modelProviders.map((provider) => (
              <button
                key={provider.value}
                onClick={() => {
                  updateConfig({ 
                    model_provider: provider.value,
                    model_name: provider.models[0] // Auto-select first model
                  });
                }}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  config.model_provider === provider.value
                    ? 'border-apidevs-primary bg-apidevs-primary/10'
                    : 'border-white/10 bg-white/5 hover:border-apidevs-primary/50'
                }`}
              >
                <div className="text-3xl mb-2">{provider.icon}</div>
                <div className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  {provider.label}
                  {(provider as any).recommended && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-apidevs-primary/20 text-apidevs-primary border border-apidevs-primary/30">
                      RECOMENDADO
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400">{provider.description}</div>
                
                {config.model_provider === provider.value && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 rounded-full bg-apidevs-primary animate-pulse"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Model Name Selection */}
        {selectedProvider && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Modelo Específico {config.model_provider === 'openrouter' && `(${openRouterModels.length} disponibles)`}
              </label>
              {config.model_provider === 'openrouter' && (
                <button
                  onClick={loadOpenRouterModels}
                  disabled={loadingModels}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingModels ? 'animate-spin' : ''}`} />
                  {loadingModels ? 'Cargando...' : 'Actualizar'}
                </button>
              )}
            </div>

            {modelsError && (
              <div className="mb-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
                ⚠️ {modelsError} - Usando lista estática
              </div>
            )}

            <select
              value={config.model_name}
              onChange={(e) => updateConfig({ model_name: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-apidevs-primary"
              disabled={loadingModels}
            >
              {config.model_provider === 'openrouter' && openRouterModels.length > 0 ? (
                // Mostrar modelos dinámicos con información de precio
                openRouterModels.map((model) => (
                  <option key={model.id} value={model.id} className="bg-gray-900">
                    {model.name} {model.isFree ? '(GRATIS)' : `($${model.pricing.prompt.toFixed(2)}/1M)`}
                  </option>
                ))
              ) : (
                // Fallback a lista estática
                selectedProvider.models.map((model) => (
                  <option key={model} value={model} className="bg-gray-900">
                    {model}
                  </option>
                ))
              )}
            </select>
            
            {/* Mostrar info detallada del modelo seleccionado */}
            {selectedModelInfo && (
              <div className="mt-2 p-2 bg-gray-800/50 border border-gray-700 rounded text-xs text-gray-300">
                <div className="flex items-center justify-between">
                  <span>Contexto: <strong>{selectedModelInfo.contextWindow.toLocaleString()} tokens</strong></span>
                  <span>
                    {selectedModelInfo.isFree ? (
                      <strong className="text-green-400">GRATIS</strong>
                    ) : (
                      <span>
                        Entrada: <strong>${selectedModelInfo.pricing.prompt.toFixed(2)}/1M</strong>
                      </span>
                    )}
                  </span>
                </div>
                {selectedModelInfo.description && (
                  <p className="mt-1 text-gray-400">{selectedModelInfo.description}</p>
                )}
              </div>
            )}
            
            {/* Model Info for OpenRouter */}
            {config.model_provider === 'openrouter' && (
              <div className="mt-3 space-y-2">
                {/* DeepSeek R1 Highlight */}
                {(config.model_name === 'deepseek/deepseek-r1' || config.model_name === 'deepseek/deepseek-r1:free') && (
                  <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">⭐</span>
                      <div className="text-xs text-gray-300">
                        <p className="font-bold mb-1 text-purple-300">DeepSeek R1 - MODELO MÁS RECIENTE</p>
                        <ul className="space-y-1 text-gray-400">
                          <li>✅ <strong>671B parámetros</strong> (37B activos - MoE)</li>
                          <li>✅ <strong>164K tokens</strong> de contexto</li>
                          <li>✅ <strong>Supera a GPT-4</strong> en matemáticas y código</li>
                          <li>✅ <strong>Razonamiento avanzado</strong> similar a OpenAI o1</li>
                          <li>💰 <strong>${config.model_name.includes(':free') ? '0 (GRATIS)' : '~$0.14/1M tokens'}</strong></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* General Info */}
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 text-lg">ℹ️</span>
                    <div className="text-xs text-gray-300">
                      <p className="font-semibold mb-1 text-blue-300">Modelos OpenRouter disponibles:</p>
                      <ul className="space-y-1 text-gray-400">
                        <li><strong>DeepSeek R1 ⭐:</strong> NUEVO - 671B params, supera a GPT-4</li>
                        <li><strong>Claude 3.5 Sonnet:</strong> Excelente con tools, 200K contexto</li>
                        <li><strong>GPT-4o:</strong> Multimodal de OpenAI, 128K contexto</li>
                        <li><strong>GPT-4o Mini:</strong> Económico, rápido ($0.15/1M)</li>
                        <li><strong>Gemini 2.0 Flash:</strong> GRATIS, 1M contexto</li>
                        <li><strong>Llama 3.3 70B:</strong> Open-source, muy capaz</li>
                        <li><strong>DeepSeek Chat:</strong> Base económico ($0.14/1M)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Temperature Slider */}
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-300 mb-2">
            <span className="flex items-center gap-2">
              <ThermometerSun className="w-4 h-4 text-orange-400" />
              Temperatura (Creatividad)
            </span>
            <span className="text-purple-400 font-mono">{config.temperature}</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.temperature}
            onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-purple"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.0 (Preciso)</span>
            <span>0.5 (Balanceado)</span>
            <span>1.0 (Creativo)</span>
          </div>
        </div>

        {/* Max Tokens */}
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-300 mb-2">
            <span className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-blue-400" />
              Tokens Máximos
            </span>
            <span className="text-blue-400 font-mono">{config.max_tokens}</span>
          </label>
          <input
            type="range"
            min="500"
            max="4000"
            step="100"
            value={config.max_tokens}
            onChange={(e) => updateConfig({ max_tokens: parseInt(e.target.value) })}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-blue"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>500 (Corto)</span>
            <span>2000 (Normal)</span>
            <span>4000 (Largo)</span>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-300">
              <p className="font-medium mb-1">💡 Recomendaciones:</p>
              <ul className="space-y-1 text-xs text-blue-300/80">
                <li>• <strong>Grok-3:</strong> Mejor para respuestas rápidas y conversacionales</li>
                <li>• <strong>GPT-4:</strong> Excelente para tools y análisis complejos</li>
                <li>• <strong>Claude-3:</strong> Ideal para respuestas precisas y detalladas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider-purple::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }

        .slider-blue::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
}

