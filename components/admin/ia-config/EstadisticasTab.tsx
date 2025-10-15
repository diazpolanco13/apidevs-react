'use client';

import { BarChart3, TrendingUp, Users, MessageSquare, Clock, Zap } from 'lucide-react';

export default function EstadisticasTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Estadísticas y Métricas</h2>
        <p className="text-gray-400 text-sm">Analytics de uso del chatbot y engagement</p>
      </div>

      {/* Preview de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-gray-400 text-sm">Usuarios Activos</p>
          </div>
          <p className="text-3xl font-bold text-white mb-1">---</p>
          <p className="text-xs text-gray-500">Últimos 30 días</p>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <MessageSquare className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-gray-400 text-sm">Mensajes Totales</p>
          </div>
          <p className="text-3xl font-bold text-white mb-1">---</p>
          <p className="text-xs text-gray-500">Acumulado</p>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-gray-400 text-sm">Tasa de Respuesta</p>
          </div>
          <p className="text-3xl font-bold text-white mb-1">---</p>
          <p className="text-xs text-gray-500">Promedio</p>
        </div>
      </div>

      {/* Placeholder de desarrollo */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/30 mb-4">
          <BarChart3 className="w-10 h-10 text-yellow-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Dashboard de Analytics en Desarrollo</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Esta sección mostrará métricas completas de uso, engagement, satisfacción del usuario y análisis de patrones de conversación.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-500 text-sm font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
          </span>
          Fase 2 - Próximamente
        </div>

        {/* Preview de features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 text-left">
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h4 className="text-white font-semibold">Usuarios</h4>
            </div>
            <p className="text-gray-400 text-sm">Usuarios activos, nuevos vs recurrentes, segmentación por tipo</p>
          </div>

          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <h4 className="text-white font-semibold">Mensajes</h4>
            </div>
            <p className="text-gray-400 text-sm">Volumen de mensajes, temas frecuentes, duración de conversaciones</p>
          </div>

          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-green-400" />
              <h4 className="text-white font-semibold">Tiempos</h4>
            </div>
            <p className="text-gray-400 text-sm">Tiempo de respuesta, horarios pico, duración promedio</p>
          </div>

          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              <h4 className="text-white font-semibold">Tendencias</h4>
            </div>
            <p className="text-gray-400 text-sm">Crecimiento diario, patrones semanales, estacionalidad</p>
          </div>

          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-orange-400" />
              <h4 className="text-white font-semibold">Engagement</h4>
            </div>
            <p className="text-gray-400 text-sm">Tasa de respuesta, satisfacción, conversiones</p>
          </div>

          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-pink-400" />
              <h4 className="text-white font-semibold">Reports</h4>
            </div>
            <p className="text-gray-400 text-sm">Reportes exportables, dashboards personalizados, insights</p>
          </div>
        </div>
      </div>
    </div>
  );
}

