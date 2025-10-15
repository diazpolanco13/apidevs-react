'use client';

import { Wrench, CheckCircle, AlertCircle, Code, Play } from 'lucide-react';

const availableTools = [
  {
    name: 'getUserStatus',
    description: 'Obtiene información completa del usuario autenticado',
    status: 'active' as const,
    file: 'lib/ai/tools/get-user-status.ts',
    lastUsed: '2025-10-13',
    executions: 127,
  },
  {
    name: 'getTradingViewUsername',
    description: 'Consulta el username de TradingView específicamente',
    status: 'active' as const,
    file: 'lib/ai/tools/get-tradingview-username.ts',
    lastUsed: '2025-10-13',
    executions: 89,
  },
  {
    name: 'grantIndicatorAccess',
    description: 'Dar acceso a indicadores a un usuario',
    status: 'pending' as const,
    file: 'lib/ai/tools/grant-indicator-access.ts',
    lastUsed: null,
    executions: 0,
  },
  {
    name: 'cancelSubscription',
    description: 'Cancelar suscripción de un usuario',
    status: 'pending' as const,
    file: 'lib/ai/tools/cancel-subscription.ts',
    lastUsed: null,
    executions: 0,
  },
  {
    name: 'processRefund',
    description: 'Procesar reembolso de un pago',
    status: 'pending' as const,
    file: 'lib/ai/tools/process-refund.ts',
    lastUsed: null,
    executions: 0,
  },
  {
    name: 'showIndicatorAccess',
    description: 'Mostrar todos los accesos a indicadores de un usuario',
    status: 'pending' as const,
    file: 'lib/ai/tools/show-indicator-access.ts',
    lastUsed: null,
    executions: 0,
  },
];

export default function ToolsTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Tools & Acciones del Chatbot</h2>
          <p className="text-gray-400 text-sm">Herramientas disponibles para el asistente IA</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-green-500 font-semibold text-sm">2 Activas</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">2</p>
              <p className="text-xs text-gray-400">Activas</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">4</p>
              <p className="text-xs text-gray-400">Pendientes</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Play className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">216</p>
              <p className="text-xs text-gray-400">Ejecuciones</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Code className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">6</p>
              <p className="text-xs text-gray-400">Total Tools</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tools List */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Lista de Tools</h3>
        </div>
        
        <div className="divide-y divide-gray-800">
          {availableTools.map((tool) => (
            <div key={tool.name} className="p-6 hover:bg-gray-800/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-white font-semibold">{tool.name}</h4>
                    {tool.status === 'active' ? (
                      <span className="px-2 py-1 bg-green-500/10 border border-green-500/30 rounded text-green-500 text-xs font-semibold">
                        ✅ Activa
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-500 text-xs font-semibold">
                        ⏳ Pendiente - Fase 2
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{tool.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Code className="w-3 h-3" />
                      {tool.file}
                    </span>
                    {tool.lastUsed && (
                      <>
                        <span>•</span>
                        <span>Última ejecución: {tool.lastUsed}</span>
                        <span>•</span>
                        <span className="text-purple-400 font-semibold">{tool.executions} ejecuciones</span>
                      </>
                    )}
                  </div>
                </div>
                
                {tool.status === 'active' ? (
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Probar
                  </button>
                ) : (
                  <button disabled className="px-4 py-2 bg-gray-800 text-gray-600 rounded-lg text-sm font-medium cursor-not-allowed opacity-50">
                    No disponible
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ⚠️ Problema Conocido */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-bold text-red-400 mb-2">⚠️ Problema Conocido con X.AI Grok</h3>
            <p className="text-gray-300 text-sm mb-3">
              Las tools se ejecutan y obtienen datos correctamente, pero el modelo X.AI Grok-2-1212 NO usa los resultados para responder al usuario.
            </p>
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-3">
              <p className="text-xs text-gray-400 font-mono mb-1">Síntoma:</p>
              <p className="text-sm text-gray-300 font-mono">&lt;has_function_call&gt;I am retrieving your information...&lt;/has_function_call&gt;</p>
            </div>
            <p className="text-sm text-yellow-400 font-semibold">
              💡 Solución recomendada: Usar MCP de Supabase para pre-fetch de datos. Ver CHATBOT-ARCHITECTURE.md
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

