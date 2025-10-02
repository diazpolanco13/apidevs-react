'use client';

import { ShoppingBag, Package, Tag, Star, Filter } from 'lucide-react';

export default function OneTimeTab() {
  const features = [
    { icon: Package, label: 'Productos', color: 'text-purple-400' },
    { icon: Tag, label: 'Lifetime Deals', color: 'text-pink-400' },
    { icon: Star, label: 'Top Sellers', color: 'text-yellow-400' },
    { icon: Filter, label: 'Filtros Avanzados', color: 'text-blue-400' }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-12">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="inline-flex p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30">
          <ShoppingBag className="w-12 h-12 text-purple-400" />
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Compras One-Time</h3>
          <p className="text-gray-400">
            Análisis de compras únicas y productos lifetime
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.label} className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-3">
                <Icon className={`w-5 h-5 ${feature.color} mx-auto mb-1`} />
                <div className="text-[10px] text-gray-500">{feature.label}</div>
              </div>
            );
          })}
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-purple-400">Fase 4 • Próximamente</span>
        </div>
      </div>
    </div>
  );
}

