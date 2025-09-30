import { createClient } from '@/utils/supabase/server';
import { checkOnboardingStatus } from '@/utils/auth-helpers/onboarding';
import { getUser, getSubscription } from '@/utils/supabase/queries';
import { getUserLoyaltyProfile } from '@/utils/supabase/loyalty';
import { redirect } from 'next/navigation';
import { TrendingUp, User, Shield, Bell, Zap, Crown, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import DashboardWelcome from '@/components/account/DashboardWelcome';
import LegacyHeroBanner from '@/components/account/LegacyHeroBanner';
import RecentActivity from '@/components/account/RecentActivity';

export default async function AccountDashboard() {
  const supabase = createClient();
  const [user, subscription] = await Promise.all([
    getUser(supabase),
    getSubscription(supabase)
  ]);

  if (!user) {
    return redirect('/signin');
  }

  const { completed, profile } = await checkOnboardingStatus(user.id);
  
  if (!completed || !profile) {
    return redirect('/onboarding');
  }

  // Get loyalty profile for welcome modal
  const loyaltyProfile = await getUserLoyaltyProfile(supabase as any, user.id);

  const userPlan = subscription?.prices?.products?.name || 'Free';
  const isLifetime = userPlan.toLowerCase().includes('lifetime');
  
  // Si tiene suscripción activa, es premium (independientemente del nombre del producto)
  const hasPremium = subscription?.status === 'active';
  const isPro = hasPremium && !isLifetime;

  // Quick stats
  const stats = [
    { name: 'Indicadores Usados', value: '0', change: '+0%', icon: TrendingUp },
    { name: 'Alertas Activas', value: '0', change: '0', icon: Bell },
    { name: 'Sesiones Este Mes', value: '0', change: '+0', icon: CheckCircle },
  ];

  return (
    <>
      {/* Welcome Modal for Legacy Users */}
      <DashboardWelcome 
        loyaltyProfile={loyaltyProfile}
        userName={profile.full_name?.split(' ')[0]}
      />
      
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Bienvenido de nuevo, {profile.full_name?.split(' ')[0] || 'Trader'}</p>
        </div>

        {/* Legacy Hero Banner - Solo visible si es Free */}
        {loyaltyProfile && (
          <LegacyHeroBanner 
            loyaltyProfile={loyaltyProfile} 
            showOnlyIfFree={true}
            hasPaidPlan={hasPremium}
          />
        )}

      {/* Plan Status Card - Solo mostrar si NO tiene premium */}
      {!hasPremium && (
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-gray-400" />
                <h2 className="text-xl font-bold text-white">{userPlan}</h2>
              </div>
              <p className="text-gray-300">
                Actualiza tu plan para desbloquear funciones premium
              </p>
            </div>
            <div>
              <Link
                href="/pricing"
                className="px-6 py-3 bg-gradient-to-r from-apidevs-primary to-green-400 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-apidevs-primary/50 transition-all"
              >
                Actualizar Plan
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-apidevs-primary/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-8 h-8 text-apidevs-primary" />
                <span className="text-xs text-gray-400">{stat.change}</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.name}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Profile Quick View */}
        <Link
          href="/account/perfil"
          className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  className="w-12 h-12 rounded-full border-2 border-blue-500"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-white">{profile.full_name || 'Sin nombre'}</h3>
                <p className="text-sm text-gray-400">
                  @{profile.tradingview_username || 'Sin username'}
                  {profile.city && profile.country && (
                    <span className="ml-2">• {profile.city}, {profile.country}</span>
                  )}
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-sm text-gray-300">Ver y editar perfil completo</p>
        </Link>
      </div>

      {/* Premium Features Locked */}
      {!hasPremium && (
        <div className="bg-gradient-to-r from-apidevs-primary/10 to-green-400/10 border border-apidevs-primary/30 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-full flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">Desbloquea Todo el Potencial</h3>
              <p className="text-gray-300 mb-4">
                Accede a indicadores premium, notificaciones en tiempo real, y mucho más con un plan PRO.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-apidevs-primary to-green-400 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-apidevs-primary/50 transition-all"
              >
                Ver Planes
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Actividad Reciente</h3>
        <RecentActivity userEmail={user.email || ''} userId={user.id} />
      </div>
      </div>
    </>
  );
}