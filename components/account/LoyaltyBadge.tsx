'use client';

import Link from 'next/link';
import { Check, Crown, Zap, Star, Sparkles, Gift } from 'lucide-react';

interface LoyaltyBadgeProps {
  tier: 'diamond' | 'gold' | 'silver' | 'bronze' | 'starter' | 'free';
  discountPercentage: number;
  customerSince?: string;
  isLegacy?: boolean;
}

const TIER_CONFIG = {
  diamond: {
    name: 'Legacy Diamond',
    icon: '💎',
    iconComponent: Crown,
    gradientFrom: 'from-cyan-400',
    gradientTo: 'to-blue-600',
    borderColor: 'border-cyan-500/30',
    badgeBg: 'from-cyan-500 to-blue-600',
    textColor: 'text-cyan-400',
    benefits: [
      '30% de descuento en todas tus compras',
      'Soporte prioritario VIP',
      'Acceso anticipado a nuevos indicadores',
      'Comunidad exclusiva Diamond',
      'Badge de miembro fundador'
    ]
  },
  gold: {
    name: 'Legacy Gold',
    icon: '🥇',
    iconComponent: Zap,
    gradientFrom: 'from-yellow-400',
    gradientTo: 'to-orange-500',
    borderColor: 'border-yellow-500/30',
    badgeBg: 'from-yellow-500 to-orange-600',
    textColor: 'text-yellow-400',
    benefits: [
      '20% de descuento permanente',
      'Acceso early bird a features',
      'Soporte prioritario',
      'Comunidad Gold exclusiva'
    ]
  },
  silver: {
    name: 'Legacy Silver',
    icon: '🥈',
    iconComponent: Star,
    gradientFrom: 'from-gray-300',
    gradientTo: 'to-gray-500',
    borderColor: 'border-gray-500/30',
    badgeBg: 'from-gray-400 to-gray-600',
    textColor: 'text-gray-300',
    benefits: [
      '15% de descuento permanente',
      'Acceso a comunidad exclusiva',
      'Soporte mejorado'
    ]
  },
  bronze: {
    name: 'Legacy Bronze',
    icon: '🥉',
    iconComponent: Sparkles,
    gradientFrom: 'from-orange-400',
    gradientTo: 'to-yellow-600',
    borderColor: 'border-orange-500/30',
    badgeBg: 'from-orange-500 to-yellow-600',
    textColor: 'text-orange-400',
    benefits: [
      '10% de descuento permanente',
      'Badge de early adopter',
      'Comunidad de miembros'
    ]
  },
  starter: {
    name: 'Legacy Supporter',
    icon: '✨',
    iconComponent: Gift,
    gradientFrom: 'from-purple-400',
    gradientTo: 'to-pink-500',
    borderColor: 'border-purple-500/30',
    badgeBg: 'from-purple-500 to-pink-600',
    textColor: 'text-purple-400',
    benefits: [
      '5% de descuento permanente',
      'Reconocimiento como fundador',
      'Acceso a comunidad'
    ]
  },
  free: {
    name: 'Explorer',
    icon: '🆓',
    iconComponent: Sparkles,
    gradientFrom: 'from-gray-500',
    gradientTo: 'to-gray-700',
    borderColor: 'border-gray-500/30',
    badgeBg: 'from-gray-500 to-gray-700',
    textColor: 'text-gray-400',
    benefits: [
      'Acceso a features gratuitas',
      'Comunidad de APIDevs',
      'Documentación completa'
    ]
  }
};

export default function LoyaltyBadge({ 
  tier, 
  discountPercentage, 
  customerSince,
  isLegacy = false 
}: LoyaltyBadgeProps) {
  const config = TIER_CONFIG[tier];
  const IconComponent = config.iconComponent;
  
  // No mostrar badge si es free y no es legacy
  if (tier === 'free' && !isLegacy) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-br ${config.gradientFrom}/10 ${config.gradientTo}/10 border ${config.borderColor} rounded-2xl p-6 backdrop-blur-sm`}>
      {/* Header con Badge */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-20 h-20 bg-gradient-to-br ${config.badgeBg} rounded-full flex items-center justify-center shadow-lg shadow-${config.gradientFrom}/50 relative`}>
          <span className="text-4xl">{config.icon}</span>
          {isLegacy && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-apidevs-primary rounded-full flex items-center justify-center">
              <Crown className="w-3 h-3 text-black" />
            </div>
          )}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">{config.name}</h3>
          <p className={config.textColor}>
            {isLegacy ? 'Miembro fundador' : 'Miembro activo'} 
            {customerSince && ` desde ${new Date(customerSince).getFullYear()}`}
          </p>
        </div>
      </div>

      {/* Descuento Destacado */}
      {discountPercentage > 0 && (
        <div className={`bg-gradient-to-r ${config.badgeBg} rounded-xl p-4 mb-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80 font-medium">Tu descuento exclusivo</p>
              <p className="text-3xl font-bold text-white">{discountPercentage}% OFF</p>
              <p className="text-xs text-white/70">Se aplica automáticamente en checkout</p>
            </div>
            <div className="text-5xl">🎁</div>
          </div>
        </div>
      )}

      {/* Mensaje motivacional */}
      {discountPercentage > 0 && (
        <div className="bg-black/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💚</div>
            <div>
              <p className="text-white font-medium mb-1">¡Tu descuento está listo!</p>
              <p className="text-gray-400 text-sm">
                Cada vez que realices una compra, ahorrarás un <span className="text-apidevs-primary font-semibold">{discountPercentage}%</span> de forma automática. 
                {isLegacy && ' Como miembro fundador, este beneficio es permanente.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Beneficios */}
      <div className="space-y-2 mb-6">
        <p className="text-gray-300 font-medium mb-3">✨ Beneficios desbloqueados:</p>
        {config.benefits.map((benefit, index) => (
          <div key={index} className="flex items-start gap-2 text-sm text-gray-300">
            <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <span>{benefit}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link 
        href="/pricing"
        className={`block w-full py-3 bg-gradient-to-r ${config.badgeBg} text-white font-semibold rounded-lg text-center hover:shadow-lg hover:shadow-${config.gradientFrom}/50 transition-all`}
      >
        {discountPercentage > 0 ? 'Ver planes con mi descuento' : 'Explorar planes'}
      </Link>
    </div>
  );
}

