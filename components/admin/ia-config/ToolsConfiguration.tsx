'use client';

import { Wrench, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { AIConfig } from './AIConfigurationClient';

interface Props {
  config: AIConfig;
  updateConfig: (updates: Partial<AIConfig>) => void;
}

export default function ToolsConfiguration({ config, updateConfig }: Props) {
  const availableToolsList = [
    {
      id: 'getUserAccessDetails',
      name: 'Consultar Accesos de Usuario',
      description: 'Permite al asistente consultar los indicadores activos de cualquier usuario',
      category: 'Admin',
      status: 'stable',
      icon: '👥'
    },
    {
      id: 'grantIndicatorAccess',
      name: 'Conceder Acceso a Indicador',
      description: 'Permite conceder acceso a indicadores específicos',
      category: 'Admin',
      status: 'coming-soon',
      icon: '✅'
    },
    {
      id: 'revokeIndicatorAccess',
      name: 'Revocar Acceso a Indicador',
      description: 'Permite revocar accesos a indicadores',
      category: 'Admin',
      status: 'coming-soon',
      icon: '❌'
    },
    {
      id: 'searchUsers',
      name: 'Buscar Usuarios',
      description: 'Búsqueda avanzada de usuarios por email, nombre o TradingView username',
      category: 'Admin',
      status: 'coming-soon',
      icon: '🔍'
    },
    {
      id: 'bulkOperations',
      name: 'Operaciones Masivas',
      description: 'Gestión de accesos en lote para múltiples usuarios',
      category: 'Admin',
      status: 'coming-soon',
      icon: '⚡'
    },
  ];

  const toggleTool = (toolId: string) => {
    const currentTools = config.available_tools || [];
    const newTools = currentTools.includes(toolId)
      ? currentTools.filter(t => t !== toolId)
      : [...currentTools, toolId];
    
    updateConfig({ available_tools: newTools });
  };

  const enabledCount = config.available_tools?.length || 0;
  const stableCount = availableToolsList.filter(t => t.status === 'stable').length;

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <Wrench className="w-5 h-5 text-orange-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">Herramientas del Asistente</h3>
          <p className="text-sm text-gray-400">
            Activa o desactiva las capacidades de acción del asistente
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{enabledCount}</div>
          <div className="text-xs text-gray-400">activas</div>
        </div>
      </div>

      {/* Master Toggle */}
      <div className="mb-6">
        <label className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl cursor-pointer hover:bg-purple-500/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Wrench className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Habilitar Herramientas (Tools)</div>
              <div className="text-xs text-gray-400">
                Permite que el asistente ejecute acciones más allá de responder preguntas
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={config.tools_enabled}
            onChange={(e) => updateConfig({ tools_enabled: e.target.checked })}
            className="w-6 h-6 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
          />
        </label>
      </div>

      {/* Tools List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-300">Herramientas Disponibles</h4>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Estable ({stableCount})
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              Próximamente
            </span>
          </div>
        </div>

        {availableToolsList.map((tool) => {
          const isEnabled = config.available_tools?.includes(tool.id);
          const isStable = tool.status === 'stable';
          const canToggle = config.tools_enabled && isStable;

          return (
            <div
              key={tool.id}
              className={`p-4 rounded-xl border transition-all ${
                isEnabled && canToggle
                  ? 'border-green-500/30 bg-green-500/5'
                  : !isStable
                  ? 'border-yellow-500/20 bg-yellow-500/5 opacity-60'
                  : 'border-white/10 bg-white/5'
              } ${!canToggle ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{tool.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="text-sm font-bold text-white">{tool.name}</h5>
                    {!isStable && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold rounded border border-yellow-500/30">
                        PRÓXIMAMENTE
                      </span>
                    )}
                    {isEnabled && canToggle && (
                      <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{tool.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-bold rounded">
                      {tool.category}
                    </span>
                  </div>
                </div>
                {isStable && (
                  <button
                    onClick={() => canToggle && toggleTool(tool.id)}
                    disabled={!canToggle}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isEnabled
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    } disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    {isEnabled ? 'Activa' : 'Inactiva'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning */}
      {!config.tools_enabled && (
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div className="text-sm text-yellow-300">
              <p className="font-medium mb-1">⚠️ Herramientas Deshabilitadas</p>
              <p className="text-xs text-yellow-300/80">
                El asistente solo podrá responder preguntas. Activa las herramientas para permitir acciones como consultar accesos, conceder permisos, etc.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

