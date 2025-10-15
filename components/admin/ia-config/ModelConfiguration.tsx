'use client';

import { useState, useEffect } from 'react';
import { Cpu, Zap, ThermometerSun, Hash, RefreshCw, Search, Filter, SortAsc, DollarSign, Gift } from 'lucide-react';
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
  
  // 🔍 Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFree, setFilterFree] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'context'>('name');
  const [showDropdown, setShowDropdown] = useState(false);
  
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

  // 🔍 Filtrar y ordenar modelos de OpenRouter
  const filteredModels = openRouterModels
    .filter(model => {
      // Filtro de búsqueda
      const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           model.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           model.provider.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro de precio
      const matchesPrice = filterFree === 'all' 
        ? true 
        : filterFree === 'free' 
        ? model.isFree 
        : !model.isFree;
      
      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      // Ordenamiento
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          // Free primero, luego por precio ascendente
          if (a.isFree && !b.isFree) return -1;
          if (!a.isFree && b.isFree) return 1;
          return a.pricing.prompt - b.pricing.prompt;
        case 'context':
          return b.contextWindow - a.contextWindow; // Descendente (mayor contexto primero)
        default:
          return 0;
      }
    });

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

        {/* OpenRouter Balance Moved to Estadísticas Tab */}
        {config.model_provider === 'openrouter' && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-300">
                  Balance y métricas de consumo
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Consulta el balance de OpenRouter y estadísticas de uso en el tab de <span className="text-blue-400 font-medium">Estadísticas</span>
                </p>
              </div>
            </div>
          </div>
        )}

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

{/* Selector Personalizado con Búsqueda y Filtros para OpenRouter */}
            {config.model_provider === 'openrouter' && openRouterModels.length > 0 ? (
              <div className="space-y-3">
                {/* Barra de búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, ID o proveedor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-apidevs-primary placeholder-gray-500"
                  />
                </div>

                {/* Filtros y ordenamiento */}
                <div className="flex gap-2 flex-wrap">
                  {/* Filtro de precio */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => setFilterFree('all')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        filterFree === 'all'
                          ? 'bg-apidevs-primary text-black'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setFilterFree('free')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                        filterFree === 'free'
                          ? 'bg-green-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <Gift className="w-3 h-3" />
                      Gratis
                    </button>
                    <button
                      onClick={() => setFilterFree('paid')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                        filterFree === 'paid'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <DollarSign className="w-3 h-3" />
                      De pago
                    </button>
                  </div>

                  {/* Ordenamiento */}
                  <div className="flex gap-1 ml-auto">
                    <button
                      onClick={() => setSortBy('name')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                        sortBy === 'name'
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                      title="Ordenar por nombre"
                    >
                      <SortAsc className="w-3 h-3" />
                      Nombre
                    </button>
                    <button
                      onClick={() => setSortBy('price')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                        sortBy === 'price'
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                      title="Ordenar por precio"
                    >
                      <DollarSign className="w-3 h-3" />
                      Precio
                    </button>
                    <button
                      onClick={() => setSortBy('context')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                        sortBy === 'context'
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                      title="Ordenar por ventana de contexto"
                    >
                      <Hash className="w-3 h-3" />
                      Contexto
                    </button>
                  </div>
                </div>

                {/* Contador de resultados */}
                <div className="text-xs text-gray-400">
                  {filteredModels.length} de {openRouterModels.length} modelos
                  {searchTerm && ` coinciden con "${searchTerm}"`}
                </div>

                {/* Lista de modelos - Formato compacto horizontal */}
                <div className="max-h-96 overflow-y-auto space-y-1 p-2 bg-black/20 rounded-lg border border-white/5">
                  {filteredModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => updateConfig({ model_name: model.id })}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                        config.model_name === model.id
                          ? 'bg-apidevs-primary/20 border-2 border-apidevs-primary'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Nombre y badge */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-xs font-semibold text-white truncate">
                            {model.name}
                          </span>
                          {model.isFree && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-green-500/20 text-green-400 border border-green-500/30 flex-shrink-0">
                              GRATIS
                            </span>
                          )}
                        </div>
                        
                        {/* Contexto y Precio - DESTACADO */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 rounded border border-blue-500/20">
                            <Hash className="w-3 h-3 text-blue-400" />
                            <span className="text-xs font-bold text-blue-300">
                              {(model.contextWindow / 1000).toFixed(0)}K
                            </span>
                          </div>
                          
                          {!model.isFree && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded border border-green-500/20">
                              <DollarSign className="w-3 h-3 text-green-400" />
                              <span className="text-xs font-bold text-green-300">
                                ${model.pricing.prompt.toFixed(2)}
                              </span>
                            </div>
                          )}
                          
                          {config.model_name === model.id && (
                            <div className="w-2 h-2 rounded-full bg-apidevs-primary animate-pulse"></div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}

                  {filteredModels.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No se encontraron modelos</p>
                      <p className="text-xs mt-1">Intenta cambiar los filtros o el término de búsqueda</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Fallback a select tradicional para X.AI o cuando no hay modelos cargados
              <select
                value={config.model_name}
                onChange={(e) => updateConfig({ model_name: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-apidevs-primary"
                disabled={loadingModels}
              >
                {selectedProvider && selectedProvider.models.map((model) => (
                  <option key={model} value={model} className="bg-gray-900">
                    {model}
                  </option>
                ))}
              </select>
            )}
            
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
            
            {/* DeepSeek R1 Highlight - Solo cuando está seleccionado */}
            {config.model_provider === 'openrouter' && 
             (config.model_name === 'deepseek/deepseek-r1' || config.model_name === 'deepseek/deepseek-r1:free') && (
              <div className="mt-3 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-xl">⭐</span>
                  <div className="text-xs text-gray-300">
                    <p className="font-bold mb-1 text-purple-300">DeepSeek R1 - MODELO MÁS RECIENTE</p>
                    <ul className="space-y-0.5 text-gray-400">
                      <li>✅ <strong>671B parámetros</strong> (37B activos - MoE)</li>
                      <li>✅ <strong>164K tokens</strong> de contexto</li>
                      <li>✅ <strong>Supera a GPT-4</strong> en matemáticas y código</li>
                      <li>💰 <strong>${config.model_name.includes(':free') ? '0 (GRATIS)' : '~$0.14/1M tokens'}</strong></li>
                    </ul>
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

