import { createClient } from '@/utils/supabase/server';

export interface UserProfile {
  onboarding_completed: boolean;
  tradingview_username: string;
  full_name: string;
  country: string;
  city: string;
  phone: string;
  postal_code: string;
  address: string;
  timezone: string;
  avatar_url?: string;
  telegram_username?: string;
}

export async function checkOnboardingStatus(userId: string): Promise<{
  completed: boolean;
  profile: UserProfile | null;
}> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from('users')
    .select('onboarding_completed, tradingview_username, full_name, country, city, phone, postal_code, address, timezone, avatar_url, telegram_username')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error checking onboarding status:', error);
    return { completed: false, profile: null };
  }

  return {
    completed: (profile as any)?.onboarding_completed || false,
    profile: profile as UserProfile | null
  };
}

export function getOnboardingRedirectUrl(currentPath: string) {
  return `/onboarding?redirect=${encodeURIComponent(currentPath)}`;
}
