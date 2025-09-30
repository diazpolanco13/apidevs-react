export type CustomerTier = 'diamond' | 'gold' | 'silver' | 'bronze' | 'starter' | 'free';
export type CustomerType = 'free' | 'paid' | 'vip';

export interface LoyaltyProfile {
  is_legacy_user: boolean;
  legacy_customer_type?: CustomerType;
  customer_tier: CustomerTier;
  loyalty_discount_percentage: number;
  total_lifetime_spent: number;
  purchase_count: number;
  customer_since: string;
  first_purchase_date?: string;
  last_purchase_date?: string;
  tier_unlocked_at?: string;
}

export interface TierInfo {
  name: string;
  icon: string;
  minSpent: number;
  discount: number;
  colorFrom: string;
  colorTo: string;
  benefits: string[];
}

export const TIER_THRESHOLDS = {
  diamond: 500,
  gold: 200,
  silver: 100,
  bronze: 50,
  starter: 1,
  free: 0
} as const;

export const TIER_DISCOUNTS = {
  diamond: 30,
  gold: 20,
  silver: 15,
  bronze: 10,
  starter: 5,
  free: 0
} as const;

export function calculateTier(totalSpent: number): CustomerTier {
  if (totalSpent >= TIER_THRESHOLDS.diamond) return 'diamond';
  if (totalSpent >= TIER_THRESHOLDS.gold) return 'gold';
  if (totalSpent >= TIER_THRESHOLDS.silver) return 'silver';
  if (totalSpent >= TIER_THRESHOLDS.bronze) return 'bronze';
  if (totalSpent >= TIER_THRESHOLDS.starter) return 'starter';
  return 'free';
}

export function getDiscountForTier(tier: CustomerTier): number {
  return TIER_DISCOUNTS[tier];
}

export function getNextTier(currentTier: CustomerTier): { tier: CustomerTier; remaining: number; threshold: number } | null {
  const tiers: CustomerTier[] = ['starter', 'bronze', 'silver', 'gold', 'diamond'];
  const currentIndex = tiers.indexOf(currentTier);
  
  if (currentIndex === -1 || currentIndex === tiers.length - 1) {
    return null; // Ya está en el tier máximo
  }
  
  const nextTier = tiers[currentIndex + 1];
  const threshold = TIER_THRESHOLDS[nextTier];
  
  return {
    tier: nextTier,
    remaining: threshold,
    threshold
  };
}

export function formatCustomerSince(date: string | undefined): string {
  if (!date) return 'Recientemente';
  
  const customerDate = new Date(date);
  const now = new Date();
  const years = now.getFullYear() - customerDate.getFullYear();
  
  if (years > 0) {
    return `${years} año${years > 1 ? 's' : ''}`;
  }
  
  const months = (now.getFullYear() - customerDate.getFullYear()) * 12 + 
                 now.getMonth() - customerDate.getMonth();
  
  if (months > 0) {
    return `${months} mes${months > 1 ? 'es' : ''}`;
  }
  
  return 'Este mes';
}

