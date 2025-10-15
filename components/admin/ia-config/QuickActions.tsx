'use client';

import { Save, RefreshCw, MessageSquare, TestTube, Download } from 'lucide-react';

interface Props {
  onSave: () => void;
  onReload: () => void;
  saving: boolean;
}

export default function QuickActions({ onSave, onReload, saving }: Props) {
  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-1">Acciones Rápidas</h3>
        <p className="text-xs text-gray-400">Prueba y gestiona la configuración</p>
      </div>

      {/* Actions Grid */}
      <div className="space-y-3">
        {/* Save Button */}
        <button
          onClick={onSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Guardando...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span className="text-sm">Guardar Cambios</span>
            </>
          )}
        </button>

        {/* Reload Button */}
        <button
          onClick={onReload}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm">Recargar Configuración</span>
        </button>

        {/* Divider */}
        <div className="border-t border-white/10 my-4"></div>

        {/* Test Chat Button */}
        <a
          href="/chat-v2"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 font-medium rounded-xl transition-all duration-200"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm">Probar Chat</span>
        </a>

        {/* Test Mode Button (Coming Soon) */}
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 text-gray-500 font-medium rounded-xl cursor-not-allowed opacity-50"
        >
          <TestTube className="w-4 h-4" />
          <span className="text-sm">Modo Prueba</span>
          <span className="ml-auto px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold rounded">
            PRONTO
          </span>
        </button>

        {/* Export Config Button (Coming Soon) */}
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 text-gray-500 font-medium rounded-xl cursor-not-allowed opacity-50"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Exportar Config</span>
          <span className="ml-auto px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold rounded">
            PRONTO
          </span>
        </button>
      </div>

      {/* Info Card */}
      <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <p className="text-xs text-yellow-300">
          💡 <strong>Tip:</strong> Después de guardar cambios, recarga la página del chat para ver los cambios aplicados.
        </p>
      </div>
    </div>
  );
}

