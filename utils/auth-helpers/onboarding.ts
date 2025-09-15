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
}

export async function checkOnboardingStatus(userId: string): Promise<{
  completed: boolean;
  profile: UserProfile | null;
}> {
  const supabase = createClient();
  
  const { data: profile, error } = await supabase
    .from('users')
    .select('onboarding_completed, tradingview_username, full_name, country, city, phone, postal_code, address, timezone')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error checking onboarding status:', error);
    return { completed: false, profile: null };
  }

  return {
    completed: profile?.onboarding_completed || false,
    profile: profile
  };
}

export function getOnboardingRedirectUrl(currentPath: string) {
  return `/onboarding?redirect=${encodeURIComponent(currentPath)}`;
}
