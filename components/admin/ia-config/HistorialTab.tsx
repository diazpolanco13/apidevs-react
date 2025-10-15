'use client';

import { History, FileText, User, Calendar } from 'lucide-react';

export default function HistorialTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Historial de Cambios</h2>
        <p className="text-gray-400 text-sm">Registro de modificaciones en la configuración del chatbot</p>
      </div>

      {/* Placeholder de desarrollo */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/30 mb-4">
          <History className="w-10 h-10 text-yellow-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Historial de Auditoría en Desarrollo</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Esta sección mostrará un registro completo de todos los cambios realizados en la configuración del chatbot, incluyendo quién hizo el cambio, cuándo y qué modificó.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-500 text-sm font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
          </span>
          Fase 2 - Próximamente
        </div>

        {/* Preview de features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-left">
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <h4 className="text-white font-semibold">Cambios Detallados</h4>
            </div>
            <p className="text-gray-400 text-sm">Diff completo de cada modificación realizada</p>
          </div>

          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-purple-400" />
              <h4 className="text-white font-semibold">Autoría</h4>
            </div>
            <p className="text-gray-400 text-sm">Quién realizó cada cambio</p>
          </div>

          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-green-400" />
              <h4 className="text-white font-semibold">Timeline</h4>
            </div>
            <p className="text-gray-400 text-sm">Línea de tiempo de modificaciones</p>
          </div>
        </div>

        {/* Ejemplo de entrada de historial */}
        <div className="mt-8 bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-left max-w-2xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 flex-shrink-0">
              <User className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-white font-semibold text-sm">api@apidevs.io</p>
                <p className="text-gray-500 text-xs">2025-10-13 14:30</p>
              </div>
              <p className="text-gray-400 text-sm mb-2">Cambió el modelo de <span className="text-purple-400 font-mono">grok-2-1212</span> a <span className="text-green-400 font-mono">gpt-4o-mini</span></p>
              <div className="bg-gray-800/50 rounded p-2 text-xs font-mono">
                <p className="text-red-400">- model: "grok-2-1212"</p>
                <p className="text-green-400">+ model: "gpt-4o-mini"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

