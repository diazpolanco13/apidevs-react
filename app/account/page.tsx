import { createClient } from '@/utils/supabase/server';
import { checkOnboardingStatus } from '@/utils/auth-helpers/onboarding';
import { getUser, getSubscription } from '@/utils/supabase/queries';
import { getUserLoyaltyProfile } from '@/utils/supabase/loyalty';
import { redirect } from 'next/navigation';
import { TrendingUp, User, Shield, Bell, Zap, Crown, CheckCircle, ArrowRight, Sparkles, BookOpen, Video, LineChart, Target, Rocket, Lock } from 'lucide-react';
import Link from 'next/link';
import DashboardWelcome from '@/components/account/DashboardWelcome';
import LegacyHeroBanner from '@/components/account/LegacyHeroBanner';
import RecentActivity from '@/components/account/RecentActivity';

// Force dynamic rendering - no cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  // 🔍 Verificar si tiene accesos Lifetime activos (compra one-time)
  const { data: lifetimeAccess } = await supabase
    .from('indicator_access')
    .select('id, duration_type')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .eq('duration_type', '1L')
    .limit(1);

  const hasLifetimeAccess = lifetimeAccess && lifetimeAccess.length > 0;

  const productName = subscription?.prices?.products?.name || 'Free';
  
  // Determinar el plan del usuario
  let userPlan = productName;
  if (hasLifetimeAccess) {
    userPlan = 'Plan Lifetime Access';
  } else if (productName === 'APIDevs Trading Indicators' && subscription?.prices?.interval) {
    const interval = subscription.prices.interval;
    userPlan = interval === 'year' 
      ? 'Plan PRO Anual' 
      : interval === 'month' 
        ? 'Plan PRO Mensual' 
        : 'Plan PRO';
  } else if (productName.toLowerCase().includes('lifetime')) {
    userPlan = 'Plan Lifetime Access';
  }
  
  const isLifetime = hasLifetimeAccess || productName.toLowerCase().includes('lifetime');
  const hasPremium = subscription?.status === 'active' || hasLifetimeAccess;
  const isPro = hasPremium && !isLifetime;

  // Obtener indicadores para mostrar en stats
  const { data: indicatorsCount } = await supabase
    .from('indicators')
    .select('access_tier', { count: 'exact', head: true })
    .eq('status', 'activo');

  const { count: totalIndicators } = indicatorsCount || {};
  const { count: premiumIndicators } = await supabase
    .from('indicators')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'activo')
    .eq('access_tier', 'premium') || {};

  const { count: freeIndicators } = await supabase
    .from('indicators')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'activo')
    .eq('access_tier', 'free') || {};

  // Quick stats - diferente para FREE vs PRO
  const stats = hasPremium ? [
    { name: 'Indicadores Usados', value: '0', change: '+0%', icon: TrendingUp },
    { name: 'Alertas Activas', value: '0', change: '0', icon: Bell },
    { name: 'Sesiones Este Mes', value: '0', change: '+0', icon: CheckCircle },
  ] : [
    { name: 'Indicadores Gratuitos', value: (freeIndicators || 0).toString(), change: 'Disponibles', icon: TrendingUp, color: 'text-green-400' },
    { name: 'Indicadores Bloqueados', value: (premiumIndicators || 0).toString(), change: '🔒 Premium', icon: Lock, color: 'text-orange-400' },
    { name: 'Plan Actual', value: 'Free', change: 'Mejorar ahora', icon: Shield, color: 'text-gray-400' },
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

      {/* Free Plan Motivational Banner - Solo mostrar si NO tiene premium */}
      {!hasPremium && (
        <div className="bg-gradient-to-r from-apidevs-primary/10 via-green-400/10 to-apidevs-primary/10 border-2 border-apidevs-primary/30 rounded-2xl p-8 relative overflow-hidden">
          {/* Animated glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-apidevs-primary/5 via-transparent to-apidevs-primary/5 animate-pulse blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex-1 min-w-[300px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-apidevs-primary/20 rounded-full flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-apidevs-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      🎁 Desbloquea Todo el Potencial
                    </h2>
                    <p className="text-sm text-gray-400">Comienza con indicadores gratuitos</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4 max-w-2xl">
                  Accede a indicadores premium, alertas en tiempo real, y análisis avanzados. 
                  <span className="text-apidevs-primary font-semibold"> Empieza tu prueba gratuita</span> y lleva tu trading al siguiente nivel.
                </p>
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-white bg-white/5 px-3 py-1.5 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-apidevs-primary flex-shrink-0" />
                    <span>2 indicadores premium</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white bg-white/5 px-3 py-1.5 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-apidevs-primary flex-shrink-0" />
                    <span>Alertas ilimitadas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white bg-white/5 px-3 py-1.5 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-apidevs-primary flex-shrink-0" />
                    <span>Soporte prioritario</span>
                  </div>
                </div>
              </div>
              <div>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-apidevs-primary to-green-400 hover:from-green-400 hover:to-apidevs-primary text-black font-bold text-lg rounded-xl shadow-lg shadow-apidevs-primary/30 hover:shadow-apidevs-primary/50 transition-all transform hover:scale-105"
                >
                  <Sparkles className="w-5 h-5" />
                  Obtén tu Prueba Gratuita
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const iconColor = (stat as any).color || 'text-apidevs-primary';
          return (
            <div
              key={stat.name}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-apidevs-primary/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${iconColor}`} />
                <span className="text-xs text-gray-400">{stat.change}</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.name}</div>
            </div>
          );
        })}
      </div>

      {/* Personal Roadmap - Solo para usuarios FREE */}
      {!hasPremium && (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Tu Progreso</h3>
              <p className="text-sm text-gray-400">Completa estos pasos para aprovechar al máximo</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Progreso general</span>
              <span className="text-sm font-semibold text-apidevs-primary">50% completado</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-apidevs-primary to-green-400 rounded-full" style={{width: '50%'}}></div>
            </div>
          </div>

          {/* Roadmap steps */}
          <div className="space-y-4">
            {/* Step 1 - Completed */}
            <div className="flex items-start gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">Cuenta creada</h4>
                <p className="text-sm text-gray-400">Tu cuenta está activa y lista para usar</p>
              </div>
            </div>

            {/* Step 2 - Completed */}
            <div className="flex items-start gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">Perfil completado</h4>
                <p className="text-sm text-gray-400">Has configurado tu información básica</p>
              </div>
            </div>

            {/* Step 3 - Current */}
            <div className="flex items-start gap-4 p-4 bg-apidevs-primary/10 border-2 border-apidevs-primary/50 rounded-xl">
              <div className="w-8 h-8 bg-apidevs-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-apidevs-primary animate-pulse" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">Suscríbete y desbloquea indicadores</h4>
                <p className="text-sm text-gray-400 mb-3">Accede a {premiumIndicators} indicadores premium y alertas en tiempo real</p>
                <Link 
                  href="/pricing"
                  className="inline-flex items-center gap-2 text-sm font-medium text-apidevs-primary hover:text-green-400 transition-colors"
                >
                  Ver planes disponibles
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Step 4 - Locked */}
            <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-xl opacity-50">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">Configura tu primera alerta</h4>
                <p className="text-sm text-gray-400">Se desbloquea al suscribirte</p>
              </div>
            </div>

            {/* Step 5 - Locked */}
            <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-xl opacity-50">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">Únete a la comunidad Telegram</h4>
                <p className="text-sm text-gray-400">Acceso exclusivo para suscriptores PRO</p>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Quick Actions Grid - Solo para usuarios PRO */}
      {hasPremium && (
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

          {/* Indicators Quick Access */}
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