'use client';

import { useState, useEffect } from 'react';
import { Cpu, RefreshCw, Search, DollarSign, Gift, SortAsc, Hash } from 'lucide-react';

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

interface Props {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export default function ContentCreatorModelSelector({ selectedModel, onModelChange }: Props) {
  const [openRouterModels, setOpenRouterModels] = useState<OpenRouterModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFree, setFilterFree] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'context'>('name');

  useEffect(() => {
    loadOpenRouterModels();
  }, []);

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

  const selectedModelInfo = openRouterModels.find(m => m.id === selectedModel);

  // Filtrar y ordenar modelos
  const filteredModels = openRouterModels
    .filter(model => {
      const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           model.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           model.provider.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPrice = filterFree === 'all' 
        ? true 
        : filterFree === 'free' 
        ? model.isFree 
        : !model.isFree;
      
      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          if (a.isFree && !b.isFree) return -1;
          if (!a.isFree && b.isFree) return 1;
          return a.pricing.prompt - b.pricing.prompt;
        case 'context':
          return b.contextWindow - a.contextWindow;
        default:
          return 0;
      }
    });

  return (
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
          >
            <Hash className="w-3 h-3" />
            Contexto
          </button>
          <button
            onClick={loadOpenRouterModels}
            disabled={loadingModels}
            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loadingModels ? 'animate-spin' : ''}`} />
            {loadingModels ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {modelsError && (
        <div className="p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
          ⚠️ {modelsError}
        </div>
      )}

      {/* Contador de resultados */}
      <div className="text-xs text-gray-400">
        {filteredModels.length} de {openRouterModels.length} modelos
        {searchTerm && ` coinciden con "${searchTerm}"`}
      </div>

      {/* Lista de modelos */}
      <div className="max-h-96 overflow-y-auto space-y-1 p-2 bg-black/20 rounded-lg border border-white/5">
        {filteredModels.map((model) => (
          <button
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
              selectedModel === model.id
                ? 'bg-apidevs-primary/20 border-2 border-apidevs-primary'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
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
                
                {selectedModel === model.id && (
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

      {/* Info del modelo seleccionado */}
      {selectedModelInfo && (
        <div className="mt-2 p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-xs text-gray-300">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-white">{selectedModelInfo.name}</span>
            {selectedModelInfo.isFree ? (
              <strong className="text-green-400">GRATIS</strong>
            ) : (
              <span>
                <strong>${selectedModelInfo.pricing.prompt.toFixed(2)}/1M</strong> tokens
              </span>
            )}
          </div>
          <p className="text-gray-400 mb-2">{selectedModelInfo.description}</p>
          <div className="flex items-center gap-4 text-xs">
            <span>Contexto: <strong>{selectedModelInfo.contextWindow.toLocaleString()}</strong> tokens</span>
            <span>Proveedor: <strong>{selectedModelInfo.provider}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}

