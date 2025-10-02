'use client';

import { RefreshCw, DollarSign, Users, TrendingDown, Award } from 'lucide-react';

export default function SubscriptionsTab() {
  const metrics = [
    { icon: DollarSign, label: 'MRR/ARR', color: 'text-green-400' },
    { icon: Users, label: 'Suscripciones Activas', color: 'text-blue-400' },
    { icon: TrendingDown, label: 'Tasa Cancelación', color: 'text-orange-400' },
    { icon: Award, label: 'Retención Neta', color: 'text-purple-400' }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-12">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="inline-flex p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-500/30">
          <RefreshCw className="w-12 h-12 text-blue-400" />
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Suscripciones</h3>
          <p className="text-gray-400">
            Gestión completa de pagos recurrentes con métricas clave
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-3">
                <Icon className={`w-5 h-5 ${metric.color} mx-auto mb-1`} />
                <div className="text-[10px] text-gray-500">{metric.label}</div>
              </div>
            );
          })}
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-blue-400">Fase 3 • Próximamente</span>
        </div>
      </div>
    </div>
  );
}

