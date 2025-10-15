'use client';

import { Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { AIConfig } from './AIConfigurationClient';

interface Props {
  config: AIConfig;
}

export default function ConfigurationPreview({ config }: Props) {
  const getStatusColor = (value: boolean) => value ? 'text-green-400' : 'text-gray-500';
  const getStatusIcon = (value: boolean) => value 
    ? <CheckCircle className="w-4 h-4 text-green-400" />
    : <XCircle className="w-4 h-4 text-gray-500" />;

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <Eye className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Vista Previa</h3>
          <p className="text-sm text-gray-400">Resumen de configuración</p>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="space-y-4">
        {/* Model Info */}
        <div className="p-4 bg-white/5 rounded-lg">
          <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Modelo</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Proveedor:</span>
              <span className="text-white font-medium">{config.model_provider.toUpperCase()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Modelo:</span>
              <span className="text-white font-medium">{config.model_name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Temperatura:</span>
              <span className="text-purple-400 font-mono">{config.temperature}</span>
            </div>
          </div>
        </div>

        {/* Features Status */}
        <div className="p-4 bg-white/5 rounded-lg">
          <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Características</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Herramientas:</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(config.tools_enabled)}
                <span className={`text-xs font-medium ${getStatusColor(config.tools_enabled)}`}>
                  {config.tools_enabled ? 'Activas' : 'Inactivas'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Streaming:</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(config.stream_responses)}
                <span className={`text-xs font-medium ${getStatusColor(config.stream_responses)}`}>
                  {config.stream_responses ? 'Activado' : 'Desactivado'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Rate Limiting:</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(config.rate_limit_enabled)}
                <span className={`text-xs font-medium ${getStatusColor(config.rate_limit_enabled)}`}>
                  {config.rate_limit_enabled ? `${config.max_messages_per_minute}/min` : 'Desactivado'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Logging:</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(config.enable_logging)}
                <span className={`text-xs font-medium ${getStatusColor(config.enable_logging)}`}>
                  {config.enable_logging ? config.log_level.toUpperCase() : 'Desactivado'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Greeting Info */}
        <div className="p-4 bg-white/5 rounded-lg">
          <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Personalización</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Tipo de Saludo:</span>
              <span className="text-white text-xs font-medium capitalize">{config.greeting_type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Emojis:</span>
              {getStatusIcon(config.include_emojis)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Stats Usuario:</span>
              {getStatusIcon(config.show_user_stats)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Descuentos Legacy:</span>
              {getStatusIcon(config.show_legacy_discount)}
            </div>
          </div>
        </div>

        {/* Tools Count */}
        {config.tools_enabled && (
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-white">
                {config.available_tools?.length || 0}
              </div>
              <div>
                <div className="text-sm font-medium text-white">Herramientas Activas</div>
                <div className="text-xs text-gray-400">
                  {config.available_tools?.join(', ') || 'Ninguna'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="pt-3 border-t border-white/10">
          <div className="text-xs text-gray-500">
            Última actualización: {new Date(config.updated_at).toLocaleString('es-ES')}
          </div>
        </div>
      </div>
    </div>
  );
}

