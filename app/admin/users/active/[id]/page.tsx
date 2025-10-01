import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ActiveUserStats from '@/components/admin/active-users/ActiveUserStats';
import ActiveUserProfileCard from '@/components/admin/active-users/ActiveUserProfileCard';
import ActiveUserSubscription from '@/components/admin/active-users/ActiveUserSubscription';

interface ActiveUserDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ActiveUserDetailPage({ params }: ActiveUserDetailPageProps) {
  const supabase = createClient();

  // ==================== QUERIES FUNDAMENTALES ====================
  
  // 1. Datos del usuario desde la tabla users (con todos los campos necesarios)
  const { data: user, error: userError } = await supabase
    .from('users')
    .select(`
      id,
      email,
      full_name,
      avatar_url,
      phone,
      country,
      city,
      state,
      postal_code,
      address,
      timezone,
      tradingview_username,
      telegram_username,
      onboarding_completed,
      customer_tier,
      loyalty_discount_percentage,
      total_lifetime_spent,
      purchase_count,
      customer_since,
      first_purchase_date,
      last_purchase_date
    `)
    .eq('id', params.id)
    .single();

  if (userError || !user) {
    console.error('Error fetching user:', userError);
    notFound();
  }

  // 2. Datos de autenticación desde auth.users usando supabaseAdmin (Service Role)
  let authUser = null;
  try {
    const { data, error: authError } = await supabaseAdmin.auth.admin.getUserById(params.id);
    if (!authError) {
      authUser = data;
      console.log('✅ Datos de auth obtenidos exitosamente');
    } else {
      console.warn('⚠️  Error al obtener datos de auth:', authError.message);
    }
  } catch (err) {
    console.warn('⚠️  No se pudieron obtener datos de auth:', err);
  }

  // 3. Datos de Stripe (customer_id)
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('stripe_customer_id')
    .eq('id', params.id)
    .maybeSingle(); // maybeSingle() no falla si no hay registro

  if (customerError) {
    console.error('❌ Error fetching customer:', customerError);
  } else if (!customer) {
    console.log('ℹ️  Usuario sin registro en Stripe (no ha realizado compras)');
  }

  // 4. Suscripción actual
  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from('subscriptions')
    .select(`
      *,
      prices (
        *,
        products (*)
      )
    `)
    .eq('user_id', params.id)
    .order('created', { ascending: false });

  if (subscriptionsError) {
    console.error('Error fetching subscriptions:', subscriptionsError);
  }

  const activeSubscription = subscriptions?.find(
    sub => ['active', 'trialing'].includes(sub.status)
  );

  // 5. Accesos a TradingView
  const { data: indicatorAccess, error: accessError } = await supabase
    .from('user_indicator_access')
    .select(`
      *,
      tradingview_indicators (*)
    `)
    .eq('user_id', params.id);

  if (accessError) {
    console.error('Error fetching indicator access:', accessError);
  }

  // ==================== CÁLCULOS Y MÉTRICAS ====================
  
  const registeredDays = user.customer_since 
    ? Math.floor((Date.now() - new Date(user.customer_since).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const lastLoginDate = authUser?.user?.last_sign_in_at 
    ? new Date(authUser.user.last_sign_in_at)
    : null;

  const emailVerified = authUser?.user?.email_confirmed_at ? true : false;
  
  // Email principal con fallback
  const primaryEmail = user.email || authUser?.user?.email || 'Sin email';

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="border-b border-gray-700 pb-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/users"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Volver a usuarios</span>
          </Link>
          <div className="h-6 w-px bg-gray-700"></div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">
                {user.full_name || 'Usuario sin nombre'}
              </h1>
              {activeSubscription && (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full border border-green-500/30">
                  Cliente Activo
                </span>
              )}
              {!user.onboarding_completed && (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm font-medium rounded-full border border-yellow-500/30">
                  Onboarding Pendiente
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
              <span>Registrado hace {registeredDays} días</span>
              {lastLoginDate && (
                <>
                  <span>•</span>
                  <span>Último acceso: {lastLoginDate.toLocaleDateString('es-ES')}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left column - User profile */}
        <div className="xl:col-span-1">
          <ActiveUserProfileCard
            user={user as any}
            authUser={authUser}
            primaryEmail={primaryEmail}
            emailVerified={emailVerified}
            stripeCustomerId={customer?.stripe_customer_id}
          />
        </div>

        {/* Right column - Main content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Stats Cards Mejorados */}
          <ActiveUserStats
            registeredDays={registeredDays}
            lastLoginDate={lastLoginDate}
            onboardingCompleted={user.onboarding_completed || false}
            subscriptionsCount={subscriptions?.length || 0}
            indicatorAccessCount={indicatorAccess?.length || 0}
            customerTier={user.customer_tier}
            totalLifetimeSpent={user.total_lifetime_spent ? Number(user.total_lifetime_spent) : null}
            purchaseCount={user.purchase_count}
            loyaltyDiscount={user.loyalty_discount_percentage}
          />

          {/* Panel de Suscripción Mejorado */}
          <ActiveUserSubscription
            subscriptions={(subscriptions as any) || []}
            stripeCustomerId={customer?.stripe_customer_id}
          />

          {/* Indicator Access - Placeholder */}
          {indicatorAccess && indicatorAccess.length > 0 && (
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Accesos a Indicadores</h3>
              <div className="space-y-3">
                {indicatorAccess.map((access: any) => (
                  <div 
                    key={access.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {access.tradingview_indicators?.name || 'Indicador Desconocido'}
                      </p>
                      <p className="text-xs text-gray-400">
                        Estado: <span className="text-green-400">{access.access_status}</span>
                      </p>
                    </div>
                    {access.expires_at && (
                      <div className="text-right text-xs text-gray-400">
                        Expira: {new Date(access.expires_at).toLocaleDateString('es-ES')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Usuario Activo - Admin APIDevs',
  description: 'Vista detallada del usuario activo con suscripciones y accesos',
};

