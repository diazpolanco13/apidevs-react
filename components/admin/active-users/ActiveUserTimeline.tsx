'use client';

import { Activity, Clock, Calendar } from 'lucide-react';

interface ActiveUserTimelineProps {
  userId: string;
}

export default function ActiveUserTimeline({
  userId
}: ActiveUserTimelineProps) {
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Timeline de Actividad</h2>
        </div>
        <p className="text-gray-400 text-sm">
          Historial completo de acciones, eventos y cambios del usuario
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/30 rounded-xl p-5">
          <Clock className="w-8 h-8 text-blue-400 mb-3" />
          <div className="text-2xl font-bold text-white mb-1">0</div>
          <div className="text-sm text-gray-400">Eventos Totales</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/30 rounded-xl p-5">
          <Activity className="w-8 h-8 text-green-400 mb-3" />
          <div className="text-2xl font-bold text-white mb-1">-</div>
          <div className="text-sm text-gray-400">Última Actividad</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 rounded-xl p-5">
          <Calendar className="w-8 h-8 text-purple-400 mb-3" />
          <div className="text-2xl font-bold text-white mb-1">0</div>
          <div className="text-sm text-gray-400">Eventos Esta Semana</div>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-12">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center">
              <Activity className="w-10 h-10 text-gray-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white">
            🚧 FASE 6 - En Desarrollo
          </h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Timeline completo de actividad del usuario con eventos de login, compras, 
            accesos a indicadores, cambios de suscripción y todas las interacciones relevantes.
          </p>
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/30 text-sm">
              <span className="animate-pulse">●</span>
              Próximamente disponible
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

