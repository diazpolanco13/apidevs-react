'use client';

import Button from '@/components/ui/Button';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { createStripePortal } from '@/utils/stripe/server';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { Tables } from '@/types_db';

type Subscription = Tables<'subscriptions'>;
type Price = Tables<'prices'>;
type Product = Tables<'products'>;

type SubscriptionWithPriceAndProduct = Subscription & {
  prices:
    | (Price & {
        products: Product | null;
      })
    | null;
};

interface Props {
  subscription: SubscriptionWithPriceAndProduct | null;
}

export default function CustomerPortalForm({ subscription }: Props) {
  const router = useRouter();
  const currentPath = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subscriptionPrice =
    subscription &&
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: subscription?.prices?.currency!,
      minimumFractionDigits: 0
    }).format((subscription?.prices?.unit_amount || 0) / 100);

  const handleStripePortalRequest = async () => {
    setIsSubmitting(true);
    try {
      const redirectUrl = await createStripePortal(currentPath);
      return router.push(redirectUrl);
    } catch (error) {
      console.error('Error opening customer portal:', error);
      // For now, redirect to pricing page as fallback
      return router.push('/#pricing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      onClick={handleStripePortalRequest}
      disabled={isSubmitting}
      className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-2xl transition-all disabled:cursor-not-allowed text-center"
    >
      {isSubmitting ? 'Abriendo...' : 'Gestionar Suscripción'}
    </button>
  );
}
