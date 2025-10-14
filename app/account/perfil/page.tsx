import { createClient } from '@/utils/supabase/server';
import { checkOnboardingStatus } from '@/utils/auth-helpers/onboarding';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import EditProfileUnified from './EditProfileUnified';
import LoyaltyBadge from '@/components/account/LoyaltyBadge';
import LoyaltyTeaser from '@/components/account/LoyaltyTeaser';
import { getUserLoyaltyProfile } from '@/utils/supabase/loyalty';

export default async function PerfilPage() {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  const { completed, profile } = await checkOnboardingStatus(user.id);
  
  if (!completed || !profile) {
    return redirect('/onboarding');
  }

  // Obtener datos de lealtad
  const loyaltyProfile = await getUserLoyaltyProfile(supabase, user.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">{profile.full_name || 'Mi Perfil'}</h1>
        <p className="text-gray-400">Gestiona tu perfil de TradingView, datos personales y ubicación</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de perfil - Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          <EditProfileUnified
            userId={user.id}
            userEmail={user.email || ''}
            initialData={{
              full_name: profile.full_name || '',
              tradingview_username: profile.tradingview_username || '',
              avatar_url: profile.avatar_url || '',
              phone: profile.phone || '',
              country: profile.country || '',
              city: profile.city || '',
              postal_code: profile.postal_code || '',
              address: profile.address || '',
              timezone: profile.timezone || '',
              telegram_username: profile.telegram_username || ''
            }}
          />
        </div>

        {/* Badge de lealtad - Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            {loyaltyProfile && 
             loyaltyProfile.customer_tier && 
             loyaltyProfile.customer_tier !== 'free' ? (
              <LoyaltyBadge
                tier={loyaltyProfile.customer_tier}
                discountPercentage={loyaltyProfile.loyalty_discount_percentage || 0}
                customerSince={loyaltyProfile.customer_since}
                isLegacy={loyaltyProfile.is_legacy_user}
              />
            ) : (
              <LoyaltyTeaser />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
