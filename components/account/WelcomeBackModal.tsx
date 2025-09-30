'use client';

import { useEffect, useState } from 'react';
import { X, Crown, Gift, Sparkles, Zap, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WelcomeBackModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: 'diamond' | 'gold' | 'silver' | 'bronze' | 'starter';
  discountPercentage: number;
  customerSince?: string;
  userName?: string;
}

const TIER_CONFIG = {
  diamond: {
    name: 'Legacy Diamond',
    icon: '💎',
    gradient: 'from-cyan-400 via-blue-500 to-purple-600',
    textColor: 'text-cyan-400',
    benefits: [
      '30% de descuento permanente en todas tus compras',
      'Soporte prioritario VIP 24/7',
      'Acceso anticipado a nuevos indicadores',
      'Comunidad exclusiva Diamond',
      'Badge de miembro fundador'
    ]
  },
  gold: {
    name: 'Legacy Gold',
    icon: '🥇',
    gradient: 'from-yellow-400 via-orange-500 to-yellow-600',
    textColor: 'text-yellow-400',
    benefits: [
      '20% de descuento permanente',
      'Acceso early bird a nuevas features',
      'Soporte prioritario',
      'Comunidad Gold exclusiva',
      'Reconocimiento como fundador'
    ]
  },
  silver: {
    name: 'Legacy Silver',
    icon: '🥈',
    gradient: 'from-gray-300 via-gray-400 to-gray-500',
    textColor: 'text-gray-300',
    benefits: [
      '15% de descuento permanente',
      'Acceso a comunidad exclusiva',
      'Soporte mejorado',
      'Badge de early adopter'
    ]
  },
  bronze: {
    name: 'Legacy Bronze',
    icon: '🥉',
    gradient: 'from-orange-400 via-yellow-600 to-orange-500',
    textColor: 'text-orange-400',
    benefits: [
      '10% de descuento permanente',
      'Badge de early adopter',
      'Comunidad de miembros',
      'Soporte mejorado'
    ]
  },
  starter: {
    name: 'Legacy Supporter',
    icon: '✨',
    gradient: 'from-purple-400 via-pink-500 to-purple-600',
    textColor: 'text-purple-400',
    benefits: [
      '5% de descuento permanente',
      'Reconocimiento como fundador',
      'Acceso a comunidad',
      'Soporte estándar'
    ]
  }
};

export default function WelcomeBackModal({
  isOpen,
  onClose,
  tier,
  discountPercentage,
  customerSince,
  userName
}: WelcomeBackModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const config = TIER_CONFIG[tier];

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      
      // Lanzar confetti después de un pequeño delay
      setTimeout(() => {
        fireConfetti();
      }, 500);
    }
  }, [isOpen]);

  const fireConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = tier === 'diamond' ? ['#00d4ff', '#0ea5e9', '#8b5cf6'] :
                   tier === 'gold' ? ['#fbbf24', '#f59e0b', '#fb923c'] :
                   tier === 'silver' ? ['#e5e7eb', '#9ca3af', '#6b7280'] :
                   tier === 'bronze' ? ['#fb923c', '#fbbf24', '#f59e0b'] :
                   ['#a78bfa', '#ec4899', '#a78bfa'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className={`relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-apidevs-primary/30 transform transition-all duration-500 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}>
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 md:p-12 text-center">
          {/* Animated Badge */}
          <div className="mb-6 relative">
            <div className={`inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br ${config.gradient} rounded-full shadow-2xl animate-pulse relative`}>
              <span className="text-6xl">{config.icon}</span>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-apidevs-primary rounded-full flex items-center justify-center animate-bounce">
                <Crown className="w-6 h-6 text-black" />
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            ¡Bienvenido de vuelta{userName ? `, ${userName}` : ''}! 🎉
          </h1>
          
          <div className={`inline-block px-6 py-3 bg-gradient-to-r ${config.gradient} rounded-full mb-6`}>
            <p className="text-xl md:text-2xl font-bold text-white">
              {config.name}
            </p>
          </div>

          {/* Main Message */}
          <div className="bg-gradient-to-r from-apidevs-primary/10 to-green-400/10 rounded-2xl p-6 mb-6 border border-apidevs-primary/20">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gift className="w-8 h-8 text-apidevs-primary" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                ¡Tu descuento ya está activo!
              </h2>
            </div>
            <p className="text-5xl font-bold text-apidevs-primary mb-2">
              {discountPercentage}% OFF
            </p>
            <p className="text-gray-300 text-lg">
              Se aplicará automáticamente en todas tus compras
            </p>
          </div>

          {/* Customer Since */}
          {customerSince && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="w-5 h-5 text-yellow-400" />
              <p className="text-gray-300">
                Miembro fundador desde <span className="text-apidevs-primary font-semibold">{new Date(customerSince).getFullYear()}</span>
              </p>
            </div>
          )}

          {/* Benefits */}
          <div className="bg-black/40 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-apidevs-primary" />
              Beneficios desbloqueados
            </h3>
            <div className="space-y-3">
              {config.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 text-left">
                  <Zap className="w-5 h-5 text-apidevs-primary flex-shrink-0 mt-0.5" />
                  <span className="text-gray-200">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleClose}
            className="w-full py-4 bg-gradient-to-r from-apidevs-primary to-green-400 text-black font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-apidevs-primary/50 transition-all transform hover:scale-105"
          >
            ¡Explorar mi Dashboard! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}

