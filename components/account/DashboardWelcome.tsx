'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import WelcomeBackModal from './WelcomeBackModal';
import { LoyaltyProfile } from '@/types/loyalty';

interface DashboardWelcomeProps {
  loyaltyProfile: LoyaltyProfile | null;
  userName?: string;
}

export default function DashboardWelcome({ loyaltyProfile, userName }: DashboardWelcomeProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if this is a welcome redirect for a legacy user
    const isWelcome = searchParams.get('welcome') === 'legacy';
    const isLegacy = loyaltyProfile?.is_legacy_user;
    const tier = loyaltyProfile?.customer_tier;

    if (isWelcome && isLegacy && tier && tier !== 'free') {
      setShowModal(true);
      
      // Remove the welcome parameter from URL without reloading
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, loyaltyProfile]);

  if (!loyaltyProfile || !loyaltyProfile.is_legacy_user || loyaltyProfile.customer_tier === 'free') {
    return null;
  }

  return (
    <WelcomeBackModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      tier={loyaltyProfile.customer_tier as any}
      discountPercentage={loyaltyProfile.loyalty_discount_percentage || 0}
      customerSince={loyaltyProfile.customer_since || undefined}
      userName={userName}
    />
  );
}

