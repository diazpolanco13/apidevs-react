'use client';

interface TierBadgeSmallProps {
  tier: 'diamond' | 'gold' | 'silver' | 'bronze' | 'starter';
  isLegacy?: boolean;
}

const TIER_CONFIG = {
  diamond: {
    icon: '💎',
    text: 'Diamond',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/30'
  },
  gold: {
    icon: '🥇',
    text: 'Gold',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30'
  },
  silver: {
    icon: '🥈',
    text: 'Silver',
    color: 'text-gray-300',
    bg: 'bg-gray-500/20',
    border: 'border-gray-500/30'
  },
  bronze: {
    icon: '🥉',
    text: 'Bronze',
    color: 'text-orange-400',
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/30'
  },
  starter: {
    icon: '✨',
    text: 'Starter',
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30'
  }
};

export default function TierBadgeSmall({ tier, isLegacy = false }: TierBadgeSmallProps) {
  const config = TIER_CONFIG[tier];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${config.bg} ${config.border} border text-xs font-medium ${config.color}`}>
      <span>{config.icon}</span>
      <span>{config.text}</span>
      {isLegacy && (
        <span className="text-[10px] bg-apidevs-primary/20 text-apidevs-primary px-1 rounded">
          LEGACY
        </span>
      )}
    </div>
  );
}

