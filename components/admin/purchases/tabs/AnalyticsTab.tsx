'use client';

import { BarChart3, Target, Users, TrendingUp, Brain, Award } from 'lucide-react';

export default function AnalyticsTab() {
  const kpis = [
    { icon: Target, label: 'LTV:CAC Ratio', color: 'text-yellow-400' },
    { icon: Users, label: 'Cohorts', color: 'text-orange-400' },
    { icon: TrendingUp, label: 'ARPU', color: 'text-green-400' },
    { icon: Award, label: 'NRR', color: 'text-purple-400' },
    { icon: Brain, label: 'Predicciones IA', color: 'text-blue-400' }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-12">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="inline-flex p-4 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-2xl border border-yellow-500/30">
          <BarChart3 className="w-12 h-12 text-yellow-400" />
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Analytics Avanzado</h3>
          <p className="text-gray-400">
            KPIs financieros, cohorts y análisis predictivo
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 pt-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-3">
                <Icon className={`w-5 h-5 ${kpi.color} mx-auto mb-1`} />
                <div className="text-[10px] text-gray-500">{kpi.label}</div>
              </div>
            );
          })}
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-yellow-400">Fase 6 • Próximamente</span>
        </div>
      </div>
    </div>
  );
}

