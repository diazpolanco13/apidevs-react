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
    const message = encodeURIComponent('Debes iniciar sesión para acceder a tu cuenta');
    return redirect(`/signin?message=${message}`);
  }

  // Check onboarding status and get extended profile
  const { completed, profile } = await checkOnboardingStatus(user.id);
  
  if (!completed || !profile) {
    return redirect('/onboarding');
  }

  // Get loyalty profile
  const loyaltyProfile = await getUserLoyaltyProfile(supabase, user.id);

  // 🏆 JERARQUÍA DE PLANES: Determinar el plan de mayor valor del usuario
  // Lifetime ($999) > PRO (recurrente) > FREE ($0)
  
  // 1. Verificar si tiene compra Lifetime PAGADA (excluir FREE)
  const { data: allLifetimePurchases } = await (supabase as any)
    .from('purchases')
    .select('id, is_lifetime_purchase, order_total_cents, payment_method, order_date')
    .eq('customer_email', user.email)
    .eq('is_lifetime_purchase', true)
    .eq('payment_status', 'paid')
    .order('order_total_cents', { ascending: false }); // Ordenar por VALOR, no fecha

  // Filtrar solo compras PAGADAS (excluir FREE) y tomar la de mayor valor
  const paidLifetimePurchases = (allLifetimePurchases || []).filter(
    (p: any) => p.order_total_cents > 0 && p.payment_method !== 'free'
  );
  
  const hasLifetimeAccess = paidLifetimePurchases.length > 0;

  // 🆓 Verificar si tiene indicadores activos (FREE o PREMIUM)
  const { count: activeIndicatorsCount } = await supabase
    .from('indicator_access')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active');

  const hasActiveIndicators = (activeIndicatorsCount ?? 0) > 0;

  return (
    <AccountDashboardLayout 
      user={user} 
      subscription={subscription}
      userProfile={profile}
      loyaltyTier={loyaltyProfile?.customer_tier}
      isLegacy={loyaltyProfile?.is_legacy_user}
      hasLifetimeAccess={hasLifetimeAccess}
      hasActiveIndicators={hasActiveIndicators}
    >
      {children}
    </AccountDashboardLayout>
  );
}

export const metadata = {
  title: 'Mi Cuenta - APIDevs Trading',
  description: 'Gestiona tu cuenta, suscripción y preferencias en APIDevs Trading Platform',
};
