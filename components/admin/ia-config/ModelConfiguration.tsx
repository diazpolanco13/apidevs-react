'use client';

import { Cpu, Zap, ThermometerSun, Hash } from 'lucide-react';
import { AIConfig } from './AIConfigurationClient';

interface Props {
  config: AIConfig;
  updateConfig: (updates: Partial<AIConfig>) => void;
}

export default function ModelConfiguration({ config, updateConfig }: Props) {
  const modelProviders = [
    { 
      value: 'xai', 
      label: 'X.AI (Grok)', 
      models: ['grok-3', 'grok-2-1212'],
      icon: '🚀',
      description: 'Modelo rápido y confiable de X.AI'
    },
    { 
      value: 'openai', 
      label: 'OpenAI (GPT)', 
      models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      icon: '🤖',
      description: 'Mejor manejo de tools y function calling'
    },
    { 
      value: 'anthropic', 
      label: 'Anthropic (Claude)', 
      models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
      icon: '🧠',
      description: 'Respuestas precisas y contextuales'
    },
  ];

  const selectedProvider = modelProviders.find(p => p.value === config.model_provider);

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/10 bg-white/5 hover:border-purple-500/50'
                }`}
              >
                <div className="text-2xl mb-2">{provider.icon}</div>
                <div className="text-sm font-bold text-white mb-1">{provider.label}</div>
                <div className="text-xs text-gray-400">{provider.description}</div>
                
                {config.model_provider === provider.value && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Model Name Selection */}
        {selectedProvider && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Modelo Específico
            </label>
            <select
              value={config.model_name}
              onChange={(e) => updateConfig({ model_name: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {selectedProvider.models.map((model) => (
                <option key={model} value={model} className="bg-gray-900">
                  {model}
                </option>
              ))}
            </select>
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

