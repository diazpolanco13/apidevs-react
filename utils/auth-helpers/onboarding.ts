import { createClient } from '@/utils/supabase/server';

export async function checkOnboardingStatus(userId: string) {
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
