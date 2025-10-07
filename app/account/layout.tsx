import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import {
  getUserDetails,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';
import { checkOnboardingStatus } from '@/utils/auth-helpers/onboarding';
import { getUserLoyaltyProfile } from '@/utils/supabase/loyalty';
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

  // Get loyalty profile
  const loyaltyProfile = await getUserLoyaltyProfile(supabase, user.id);

  // 🔍 Verificar si tiene compra Lifetime PAGADA (excluir FREE)
  const { data: lifetimePurchase } = await (supabase as any)
    .from('purchases')
    .select('id, is_lifetime_purchase, order_total_cents, payment_method')
    .eq('customer_email', user.email)
    .eq('is_lifetime_purchase', true)
    .eq('payment_status', 'paid')
    .order('order_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Diferenciar Lifetime PAGADO de FREE (ambos tienen duration 1L)
  const hasLifetimeAccess = !!(lifetimePurchase && lifetimePurchase.order_total_cents > 0 && lifetimePurchase.payment_method !== 'free');

  return (
    <AccountDashboardLayout 
      user={user} 
      subscription={subscription}
      userProfile={profile}
      loyaltyTier={loyaltyProfile?.customer_tier}
      isLegacy={loyaltyProfile?.is_legacy_user}
      hasLifetimeAccess={hasLifetimeAccess}
    >
      {children}
    </AccountDashboardLayout>
  );
}

export const metadata = {
  title: 'Mi Cuenta - APIDevs Trading',
  description: 'Gestiona tu cuenta, suscripción y preferencias en APIDevs Trading Platform',
};
