'use client';

import Link from 'next/link';
import { Sparkles, TrendingUp } from 'lucide-react';

export default function LoyaltyTeaser() {
  return (
    <div className="bg-gradient-to-br from-apidevs-primary/10 to-green-400/10 border border-apidevs-primary/30 rounded-2xl p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-apidevs-primary to-green-400 rounded-full flex items-center justify-center shadow-lg shadow-apidevs-primary/50">
          <Sparkles className="w-8 h-8 text-black" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Sistema de Recompensas</h3>
          <p className="text-gray-400 text-sm">Desbloquea beneficios exclusivos</p>
        </div>
      </div>

      {/* Descripción */}
      <p className="text-gray-300 mb-6 text-sm">
        Con cada compra, subes de nivel y desbloqueas descuentos permanentes. 
        ¡Empieza tu camino hacia beneficios exclusivos!
      </p>

      {/* Tiers Preview */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <span className="text-gray-300">Primera compra</span>
          </div>
          <span className="text-apidevs-primary font-semibold">5% OFF</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥉</span>
            <span className="text-gray-300">$50+ gastados</span>
          </div>
          <span className="text-apidevs-primary font-semibold">10% OFF</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥈</span>
            <span className="text-gray-300">$100+ gastados</span>
          </div>
          <span className="text-apidevs-primary font-semibold">15% OFF</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">💎</span>
            <span className="text-gray-300">$500+ gastados</span>
          </div>
          <span className="text-cyan-400 font-semibold">30% OFF</span>
        </div>
      </div>

      {/* Beneficios */}
      <div className="bg-black/30 rounded-lg p-4 mb-6">
        <p className="text-gray-300 text-sm mb-3 font-medium">
          <TrendingUp className="w-4 h-4 inline mr-2 text-green-400" />
          Beneficios que desbloqueas:
        </p>
        <ul className="space-y-2 text-xs text-gray-400">
          <li>• Descuentos permanentes que crecen contigo</li>
          <li>• Soporte prioritario según tu nivel</li>
          <li>• Acceso anticipado a nuevos indicadores</li>
          <li>• Comunidad exclusiva de traders</li>
        </ul>
      </div>

      {/* CTA */}
      <Link 
        href="/pricing"
        className="block w-full py-3 bg-gradient-to-r from-apidevs-primary to-green-400 text-black font-semibold rounded-lg text-center hover:shadow-lg hover:shadow-apidevs-primary/50 transition-all"
      >
        Ver planes y comenzar
      </Link>
    </div>
  );
}

