'use client';

import { RotateCcw, DollarSign, Percent, Clock, AlertTriangle } from 'lucide-react';

export default function RefundsTab() {
  const metrics = [
    { icon: DollarSign, label: 'Total Reembolsado', color: 'text-red-400' },
    { icon: Percent, label: 'Tasa Reembolso', color: 'text-orange-400' },
    { icon: Clock, label: 'Tiempo Proceso', color: 'text-yellow-400' },
    { icon: AlertTriangle, label: 'Razones', color: 'text-gray-400' }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-12">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="inline-flex p-4 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl border border-red-500/30">
          <RotateCcw className="w-12 h-12 text-red-400" />
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Reembolsos</h3>
          <p className="text-gray-400">
            Gestión y análisis de devoluciones procesadas
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

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-red-400">Fase 5 • Próximamente</span>
        </div>
      </div>
    </div>
  );
}

