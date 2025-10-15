'use client';

import { Settings, Activity, Shield, Zap, Clock, Database } from 'lucide-react';
import { AIConfig } from './AIConfigurationClient';

interface Props {
  config: AIConfig;
  updateConfig: (updates: Partial<AIConfig>) => void;
}

export default function AdvancedSettings({ config, updateConfig }: Props) {
  const responseStyles = [
    { value: 'professional', label: 'Profesional', icon: '💼', description: 'Formal y preciso' },
    { value: 'friendly', label: 'Amigable', icon: '😊', description: 'Cálido y conversacional' },
    { value: 'technical', label: 'Técnico', icon: '🔧', description: 'Detallado y específico' },
  ];

  const logLevels = [
    { value: 'debug', label: 'Debug', color: 'text-blue-400', description: 'Todos los detalles' },
    { value: 'info', label: 'Info', color: 'text-green-400', description: 'Información general' },
    { value: 'warn', label: 'Warning', color: 'text-yellow-400', description: 'Solo advertencias' },
    { value: 'error', label: 'Error', color: 'text-red-400', description: 'Solo errores críticos' },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <Settings className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Configuración Avanzada</h3>
          <p className="text-sm text-gray-400">Ajustes técnicos y optimización del rendimiento</p>
        </div>
      </div>

      {/* Response Style */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Estilo de Respuesta
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {responseStyles.map((style) => (
              <button
                key={style.value}
                onClick={() => updateConfig({ response_style: style.value })}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  config.response_style === style.value
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-white/10 bg-white/5 hover:border-indigo-500/50'
                }`}
              >
                <div className="text-2xl mb-2">{style.icon}</div>
                <div className="text-sm font-bold text-white mb-1">{style.label}</div>
                <div className="text-xs text-gray-400">{style.description}</div>
                
                {config.response_style === style.value && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Performance Settings */}
        <div className="border-t border-white/10 pt-6">
          <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Rendimiento y Streaming
          </h4>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Activity className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Streaming de Respuestas</div>
                  <div className="text-xs text-gray-400">Mostrar respuestas en tiempo real palabra por palabra</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.stream_responses}
                onChange={(e) => updateConfig({ stream_responses: e.target.checked })}
                className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Indicador de "Escribiendo..."</div>
                  <div className="text-xs text-gray-400">Mostrar cuando el asistente está procesando</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.show_typing_indicator}
                onChange={(e) => updateConfig({ show_typing_indicator: e.target.checked })}
                className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
              />
            </label>
          </div>
        </div>

        {/* Memory Settings */}
        <div className="border-t border-white/10 pt-6">
          <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            Memoria y Contexto
          </h4>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Database className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Memoria de Contexto</div>
                  <div className="text-xs text-gray-400">Recordar conversaciones anteriores (próximamente)</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.enable_context_memory}
                onChange={(e) => updateConfig({ enable_context_memory: e.target.checked })}
                disabled
                className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 disabled:opacity-30"
              />
            </label>

            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-300 mb-2">
                <span>Historial de Mensajes</span>
                <span className="text-purple-400 font-mono">{config.max_conversation_history}</span>
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={config.max_conversation_history}
                onChange={(e) => updateConfig({ max_conversation_history: parseInt(e.target.value) })}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5 mensajes</span>
                <span>20 mensajes</span>
                <span>50 mensajes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Limiting */}
        <div className="border-t border-white/10 pt-6">
          <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-400" />
            Rate Limiting y Seguridad
          </h4>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Shield className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Habilitar Rate Limiting</div>
                  <div className="text-xs text-gray-400">Limitar mensajes por minuto para prevenir abuso</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.rate_limit_enabled}
                onChange={(e) => updateConfig({ rate_limit_enabled: e.target.checked })}
                className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
              />
            </label>

            {config.rate_limit_enabled && (
              <div>
                <label className="flex items-center justify-between text-sm font-medium text-gray-300 mb-2">
                  <span>Mensajes Máximos por Minuto</span>
                  <span className="text-red-400 font-mono">{config.max_messages_per_minute}</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={config.max_messages_per_minute}
                  onChange={(e) => updateConfig({ max_messages_per_minute: parseInt(e.target.value) })}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 msg/min</span>
                  <span>15 msg/min</span>
                  <span>30 msg/min</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logging Settings */}
        <div className="border-t border-white/10 pt-6">
          <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Logs y Debugging
          </h4>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Habilitar Logging</div>
                  <div className="text-xs text-gray-400">Registrar todas las interacciones del chatbot</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.enable_logging}
                onChange={(e) => updateConfig({ enable_logging: e.target.checked })}
                className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
              />
            </label>

            {config.enable_logging && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nivel de Log
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {logLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => updateConfig({ log_level: level.value })}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        config.log_level === level.value
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-white/10 bg-white/5 hover:border-cyan-500/50'
                      }`}
                    >
                      <div className={`text-xs font-bold ${level.color} mb-1`}>{level.label}</div>
                      <div className="text-xs text-gray-400">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

