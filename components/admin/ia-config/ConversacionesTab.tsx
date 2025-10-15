'use client';

import { MessageSquare, Search, Filter, Download } from 'lucide-react';

export default function ConversacionesTab() {
  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Historial de Conversaciones</h2>
          <p className="text-gray-400 text-sm">Todas las conversaciones del chatbot con usuarios</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 opacity-50 cursor-not-allowed">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
          <button className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 opacity-50 cursor-not-allowed">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conversaciones por usuario, contenido o fecha..."
            disabled
            className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Placeholder de desarrollo */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/30 mb-4">
          <MessageSquare className="w-10 h-10 text-yellow-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Funcionalidad en Desarrollo</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Esta sección mostrará el historial completo de conversaciones del chatbot, con búsqueda avanzada, filtros por usuario y fecha, y análisis de sentimientos.
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
            <h4 className="text-white font-semibold mb-2">📊 Analytics</h4>
            <p className="text-gray-400 text-sm">Métricas de engagement y satisfacción</p>
          </div>
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">🔍 Búsqueda Avanzada</h4>
            <p className="text-gray-400 text-sm">Filtros por usuario, fecha, contenido</p>
          </div>
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">💬 Transcripciones</h4>
            <p className="text-gray-400 text-sm">Historial completo exportable</p>
          </div>
        </div>
      </div>
    </div>
  );
}

