import { createClient } from '@/utils/supabase/server';
import { checkOnboardingStatus } from '@/utils/auth-helpers/onboarding';
import { getUser, getSubscription } from '@/utils/supabase/queries';
import { getUserLoyaltyProfile } from '@/utils/supabase/loyalty';
import { redirect } from 'next/navigation';
import { TrendingUp, User, Shield, Bell, Zap, Crown, CheckCircle, ArrowRight, Sparkles, BookOpen, Video, LineChart, Target, Rocket } from 'lucide-react';
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

      {/* PRO Welcome Banner - Solo para usuarios PRO */}
      {hasPremium && (
        <div className="bg-gradient-to-r from-apidevs-primary/20 via-green-400/20 to-apidevs-primary/20 border-2 border-apidevs-primary/50 rounded-2xl p-8 relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-apidevs-primary/10 to-transparent blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-[300px]">
                <div className="flex items-center gap-3 mb-3">
                  {isLifetime ? (
                    <Crown className="w-10 h-10 text-purple-400" />
                  ) : (
                    <Zap className="w-10 h-10 text-apidevs-primary" />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      {isLifetime ? 'Plan Lifetime Access' : 'Plan PRO Activo'}
                      <Sparkles className="w-5 h-5 text-apidevs-primary animate-pulse" />
                    </h2>
                    <p className="text-sm text-gray-400">Miembro desde {new Date(subscription?.created || '').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4">
                  ¡Todo el poder de APIDevs está en tus manos! Accede a todos los indicadores premium, alertas en tiempo real, y mucho más.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/account/perfil"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 hover:border-apidevs-primary/50 transition-all"
                  >
                    <Target className="w-4 h-4" />
                    Ver Mi Perfil
                  </Link>
                  <Link
                    href="/account/suscripcion"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 hover:border-apidevs-primary/50 transition-all"
                  >
                    <Shield className="w-4 h-4" />
                    Gestionar Suscripción
                  </Link>
                </div>
              </div>

              {/* Quick benefits */}
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-apidevs-primary/30">
                <p className="text-xs text-gray-400 mb-2">Beneficios Activos</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-white">
                    <CheckCircle className="w-4 h-4 text-apidevs-primary flex-shrink-0" />
                    <span>Todos los indicadores premium</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white">
                    <CheckCircle className="w-4 h-4 text-apidevs-primary flex-shrink-0" />
                    <span>Alertas en tiempo real</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white">
                    <CheckCircle className="w-4 h-4 text-apidevs-primary flex-shrink-0" />
                    <span>Soporte prioritario</span>
                  </div>
                  {loyaltyProfile?.customer_tier && (
                    <div className="flex items-center gap-2 text-sm text-apidevs-primary font-semibold">
                      <Crown className="w-4 h-4 flex-shrink-0" />
                      <span>{loyaltyProfile.loyalty_discount_percentage}% descuento permanente</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
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

      {/* Quick Start Guide - Solo para PRO */}
      {hasPremium && (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-full flex items-center justify-center">
              <Rocket className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Comienza Aquí</h3>
              <p className="text-sm text-gray-400">Configura tu experiencia premium en minutos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="https://tradingview.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-apidevs-primary/50 rounded-xl p-4 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-apidevs-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <LineChart className="w-5 h-5 text-apidevs-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1 group-hover:text-apidevs-primary transition-colors">
                    1. Instala Indicadores
                  </h4>
                  <p className="text-sm text-gray-400">Accede a TradingView y agrega los indicadores premium a tus gráficos</p>
                </div>
              </div>
            </Link>

            <Link
              href="/account/perfil"
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-apidevs-primary/50 rounded-xl p-4 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1 group-hover:text-apidevs-primary transition-colors">
                    2. Configura Alertas
                  </h4>
                  <p className="text-sm text-gray-400">Personaliza tus notificaciones y preferencias de trading</p>
                </div>
              </div>
            </Link>

            <Link
              href="/indicadores"
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-apidevs-primary/50 rounded-xl p-4 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1 group-hover:text-apidevs-primary transition-colors">
                    3. Explora Herramientas
                  </h4>
                  <p className="text-sm text-gray-400">Descubre todos los indicadores disponibles para ti</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Indicators Quick Access - Solo PRO */}
        {hasPremium && (
          <Link
            href="/indicadores"
            className="bg-gradient-to-br from-apidevs-primary/10 to-green-400/10 backdrop-blur-xl border border-apidevs-primary/30 rounded-2xl p-6 hover:border-apidevs-primary/50 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Mis Indicadores</h3>
                  <p className="text-sm text-gray-400">
                    <span className="text-apidevs-primary font-semibold">Acceso completo</span> • {stats[0].value} en uso
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-apidevs-primary group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-sm text-gray-300">Gestiona y configura tus indicadores premium</p>
          </Link>
        )}
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