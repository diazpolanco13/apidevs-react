import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Onboarding from '@/components/ui/Onboarding';

export default async function OnboardingPage({
  searchParams
}: {
  searchParams: { redirect?: string };
}) {
  const supabase = createClient();
  
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/signin');
  }

  // Check if user already completed onboarding
  const { data: profile } = await supabase
    .from('users')
    .select('onboarding_completed, tradingview_username')
    .eq('id', user.id)
    .single();

  if (profile?.onboarding_completed) {
    redirect(searchParams.redirect || '/account');
  }

  return (
    <Onboarding 
      user={user} 
      redirectPath={searchParams.redirect || '/account'} 
    />
  );
}
