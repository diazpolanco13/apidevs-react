import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import {
  getUserDetails,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';
import { checkOnboardingStatus } from '@/utils/auth-helpers/onboarding';
import AccountDashboardLayout from '@/components/account/AccountDashboardLayout';

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const [user, userDetails, subscription] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase),
    getSubscription(supabase)
  ]);

  if (!user) {
    return redirect('/signin?message=Debes%20iniciar%20sesión%20para%20acceder%20a%20tu%20cuenta');
  }

  // Check onboarding status and get extended profile
  const { completed, profile } = await checkOnboardingStatus(user.id);
  
  if (!completed || !profile) {
    return redirect('/onboarding');
  }

  return (
    <AccountDashboardLayout 
      user={user} 
      subscription={subscription}
      userProfile={profile}
    >
      {children}
    </AccountDashboardLayout>
  );
}

export const metadata = {
  title: 'Mi Cuenta - APIDevs Trading',
  description: 'Gestiona tu cuenta, suscripción y preferencias en APIDevs Trading Platform',
};
