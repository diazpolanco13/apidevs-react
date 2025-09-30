import { createClient } from '@/utils/supabase/server';
import { checkOnboardingStatus } from '@/utils/auth-helpers/onboarding';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import EditProfileUnified from './EditProfileUnified';

export default async function PerfilPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  const { completed, profile } = await checkOnboardingStatus(user.id);
  
  if (!completed || !profile) {
    return redirect('/onboarding');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">{profile.full_name || 'Mi Perfil'}</h1>
        <p className="text-gray-400">Gestiona tu perfil de TradingView, datos personales y ubicación</p>
      </div>

      {/* Unified Profile Form */}
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
  );
}
