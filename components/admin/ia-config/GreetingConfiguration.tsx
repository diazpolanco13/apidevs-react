'use client';

import { MessageCircle, Smile, Users, Gift } from 'lucide-react';
import { AIConfig } from './AIConfigurationClient';

interface Props {
  config: AIConfig;
  updateConfig: (updates: Partial<AIConfig>) => void;
}

export default function GreetingConfiguration({ config, updateConfig }: Props) {
  const greetingTypes = [
    {
      value: 'simple',
      label: 'Simple',
      icon: '👋',
      description: 'Saludo breve y directo',
      example: '¡Hola! ¿En qué puedo ayudarte?'
    },
    {
      value: 'personalized',
      label: 'Personalizado',
      icon: '😊',
      description: 'Con nombre del usuario',
      example: '¡Hola Carlos! ¿En qué puedo ayudarte hoy?'
    },
    {
      value: 'detailed',
      label: 'Detallado',
      icon: '📊',
      description: 'Con estadísticas del usuario',
      example: '¡Hola Carlos! Tienes 6 indicadores activos. ¿Necesitas ayuda?'
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20">
          <MessageCircle className="w-5 h-5 text-pink-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Configuración de Saludo</h3>
          <p className="text-sm text-gray-400">Personaliza cómo el asistente saluda a los usuarios</p>
        </div>
      </div>

      {/* Greeting Type Selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Tipo de Saludo
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {greetingTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => updateConfig({ greeting_type: type.value })}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  config.greeting_type === type.value
                    ? 'border-pink-500 bg-pink-500/10'
                    : 'border-white/10 bg-white/5 hover:border-pink-500/50'
                }`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className="text-sm font-bold text-white mb-1">{type.label}</div>
                <div className="text-xs text-gray-400 mb-2">{type.description}</div>
                <div className="text-xs text-gray-500 italic">"{type.example}"</div>
                
                {config.greeting_type === type.value && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500 animate-pulse"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Greeting Message */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Mensaje de Saludo Personalizado (Opcional)
          </label>
          <textarea
            value={config.custom_greeting || ''}
            onChange={(e) => updateConfig({ custom_greeting: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            placeholder="Ej: ¡Hola! 👋 Soy el asistente de APIDevs. ¿En qué puedo ayudarte hoy?"
          />
          <p className="text-xs text-gray-500 mt-2">
            Si defines un saludo personalizado, se usará este en lugar del tipo seleccionado arriba.
          </p>
        </div>

        {/* Toggle Options */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          {/* Show User Stats */}
          <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Mostrar Estadísticas del Usuario</div>
                <div className="text-xs text-gray-400">Indicadores activos, plan actual, etc.</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.show_user_stats}
              onChange={(e) => updateConfig({ show_user_stats: e.target.checked })}
              className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
            />
          </label>

          {/* Show Legacy Discount */}
          <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Gift className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Mostrar Descuentos Legacy</div>
                <div className="text-xs text-gray-400">Destacar beneficios de clientes antiguos</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.show_legacy_discount}
              onChange={(e) => updateConfig({ show_legacy_discount: e.target.checked })}
              className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
            />
          </label>

          {/* Include Emojis */}
          <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/10">
                <Smile className="w-4 h-4 text-pink-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Incluir Emojis en Respuestas</div>
                <div className="text-xs text-gray-400">Hace las respuestas más amigables</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.include_emojis}
              onChange={(e) => updateConfig({ include_emojis: e.target.checked })}
              className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
            />
          </label>
        </div>

        {/* Preview Card */}
        <div className="p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg">
          <h4 className="text-sm font-bold text-pink-300 mb-2">👀 Vista Previa del Saludo</h4>
          <div className="p-3 bg-black/30 rounded-lg">
            <p className="text-sm text-white">
              {config.custom_greeting || greetingTypes.find(t => t.value === config.greeting_type)?.example}
              {config.show_user_stats && config.greeting_type === 'detailed' && (
                <span className="block mt-2 text-xs text-gray-400">
                  📊 Tienes 6 indicadores activos | Plan: PRO | Tier: Diamond
                </span>
              )}
              {config.show_legacy_discount && (
                <span className="block mt-2 text-xs text-yellow-400">
                  ⭐ Como cliente legacy tienes 30% de descuento especial
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

