import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { checkOnboardingStatus } from '@/utils/auth-helpers/onboarding';
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
  const { completed } = await checkOnboardingStatus(user.id);

  if (completed) {
    redirect(searchParams.redirect || '/account');
  }

  return (
    <Onboarding 
      redirectPath={searchParams.redirect || '/account'} 
    />
  );
}
