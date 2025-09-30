'use client';

import { Crown, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { LoyaltyProfile } from '@/types/loyalty';

interface LegacyHeroBannerProps {
  loyaltyProfile: LoyaltyProfile;
}

const TIER_CONFIG = {
  diamond: {
    name: 'Diamond',
    icon: '💎',
    gradient: 'from-cyan-400 via-blue-500 to-purple-600',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
  },
  gold: {
    name: 'Gold',
    icon: '🥇',
    gradient: 'from-yellow-400 via-orange-500 to-yellow-600',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/30',
  },
  silver: {
    name: 'Silver',
    icon: '🥈',
    gradient: 'from-gray-300 via-gray-400 to-gray-500',
    textColor: 'text-gray-300',
    borderColor: 'border-gray-500/30',
  },
  bronze: {
    name: 'Bronze',
    icon: '🥉',
    gradient: 'from-orange-400 via-yellow-600 to-orange-500',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/30',
  },
  starter: {
    name: 'Supporter',
    icon: '✨',
    gradient: 'from-purple-400 via-pink-500 to-purple-600',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
  }
};

export default function LegacyHeroBanner({ loyaltyProfile }: LegacyHeroBannerProps) {
  if (!loyaltyProfile.is_legacy_user || loyaltyProfile.customer_tier === 'free') {
    return null;
  }

  const config = TIER_CONFIG[loyaltyProfile.customer_tier as keyof typeof TIER_CONFIG];
  const discountPercentage = loyaltyProfile.loyalty_discount_percentage || 0;
  const customerSinceYear = loyaltyProfile.customer_since 
    ? new Date(loyaltyProfile.customer_since).getFullYear()
    : null;

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${config.borderColor} bg-gradient-to-r ${config.gradient} p-1 mb-6`}>
      <div className="relative bg-gray-900 rounded-xl p-6 md:p-8">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
        
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Badge */}
          <div className={`flex-shrink-0 w-20 h-20 bg-gradient-to-br ${config.gradient} rounded-full flex items-center justify-center shadow-lg relative`}>
            <span className="text-4xl">{config.icon}</span>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-apidevs-primary rounded-full flex items-center justify-center animate-bounce">
              <Crown className="w-4 h-4 text-black" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Sparkles className={`w-5 h-5 ${config.textColor}`} />
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Miembro Legacy {config.name}
              </span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              🎉 ¡Tu descuento del {discountPercentage}% está activo!
            </h2>
            
            <p className="text-gray-300 mb-4">
              Como miembro fundador{customerSinceYear && ` desde ${customerSinceYear}`}, 
              disfrutas de beneficios exclusivos y descuentos permanentes en todas tus compras.
            </p>

            <Link
              href="/account/perfil"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-apidevs-primary to-green-400 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-apidevs-primary/50 transition-all transform hover:scale-105"
            >
              Ver mis beneficios
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Discount Badge */}
          <div className="flex-shrink-0">
            <div className={`px-6 py-4 bg-gradient-to-br ${config.gradient} rounded-xl text-center transform hover:scale-105 transition-all`}>
              <div className="text-4xl font-bold text-white mb-1">
                {discountPercentage}%
              </div>
              <div className="text-xs font-semibold text-white/90 uppercase">
                OFF Permanente
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

