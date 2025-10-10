import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ActiveUserStats from '@/components/admin/active-users/ActiveUserStats';
import ActiveUserProfileCard from '@/components/admin/active-users/ActiveUserProfileCard';
import ActiveUserSubscription from '@/components/admin/active-users/ActiveUserSubscription';
import ActiveUserTabs from '@/components/admin/active-users/ActiveUserTabs';
import ActiveUserBilling from '@/components/admin/active-users/ActiveUserBilling';
import ActiveUserActions from '@/components/admin/active-users/ActiveUserActions';
import ActiveUserTimeline from '@/components/admin/active-users/ActiveUserTimeline';
import AdminIndicatorAccessList from '@/components/admin/active-users/AdminIndicatorAccessList';

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
    } else {
      console.warn('⚠️  Error al obtener datos de auth:', authError.message);
    }
  } catch (err) {
    console.warn('⚠️  No se pudieron obtener datos de auth:', err);
  }

  // 3. Datos de Stripe (customer_id) - usar supabaseAdmin para evitar RLS
  const { data: customer, error: customerError } = await (supabaseAdmin as any)
    .from('customers')
    .select('stripe_customer_id')
    .eq('id', params.id)
    .maybeSingle(); // maybeSingle() no falla si no hay registro

  if (customerError) {
    console.error('❌ Error fetching customer:', customerError);
  } 

  // 4. Suscripción actual - usar supabaseAdmin para evitar RLS
  const { data: subscriptions, error: subscriptionsError } = await supabaseAdmin
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
    console.error('❌ Error fetching subscriptions:', subscriptionsError);
  }

  const activeSubscription = subscriptions?.find(
    (sub: any) => ['active', 'trialing'].includes(sub.status)
  );

  // 5. Accesos a TradingView - usar SOLO indicator_access (tabla nueva)
  const { data: allIndicatorAccess, error: accessError } = await supabase
    .from('indicator_access')
    .select(`
      id,
      status,
      granted_at,
      expires_at,
      duration_type,
      access_source,
      indicator_id,
      indicators:indicator_id (
        id,
        pine_id,
        name,
        description,
        category,
        access_tier,
        tradingview_url,
        public_script_url,
        image_1
      )
    `)
    .eq('user_id', params.id)
    .order('granted_at', { ascending: false });

  if (accessError) {
    console.error('Error fetching indicator access:', accessError);
  }

  // 4.5 🔍 Verificar si tiene accesos Lifetime (para el banner)
  const lifetimeAccess = allIndicatorAccess?.filter((a: any) => a.duration_type === '1L') || [];
  const hasLifetimeAccess = lifetimeAccess.length > 0;

  // 6. Payment Intents desde Supabase - usar supabaseAdmin para evitar RLS
  const { data: paymentIntents, error: paymentIntentsError } = await (supabaseAdmin as any)
    .from('payment_intents')
    .select('*')
    .eq('user_id', params.id)
    .order('created', { ascending: false });

  if (paymentIntentsError) {
    console.error('❌ Error fetching payment intents:', paymentIntentsError);
  }

  // 7. Invoices desde Supabase - usar supabaseAdmin para evitar RLS
  const { data: invoices, error: invoicesError } = await (supabaseAdmin as any)
    .from('invoices')
    .select('*')
    .eq('user_id', params.id)
    .order('created', { ascending: false});

  if (invoicesError) {
    console.error('❌ Error fetching invoices:', invoicesError);
  }

  // 8. Purchases desde Supabase - buscar por customer_email
  const { data: purchases, error: purchasesError } = await (supabaseAdmin as any)
    .from('purchases')
    .select('*')
    .eq('customer_email', (user as any).email)
    .order('order_date', { ascending: false});

  if (purchasesError) {
    console.error('❌ Error fetching purchases:', purchasesError);
  }

  // ==================== CÁLCULOS Y MÉTRICAS ====================
  
  const registeredDays = (user as any).customer_since 
    ? Math.floor((Date.now() - new Date((user as any).customer_since).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const lastLoginDate = authUser?.user?.last_sign_in_at 
    ? new Date(authUser.user.last_sign_in_at)
    : null;

  const emailVerified = authUser?.user?.email_confirmed_at ? true : false;
  
  // Email principal con fallback
  const primaryEmail = (user as any).email || authUser?.user?.email || 'Sin email';

  // Calcular tier dinámicamente basado en suscripción activa
  const hasActiveSubscription = activeSubscription !== undefined && activeSubscription !== null;
  const dynamicCustomerTier = hasActiveSubscription ? 'PRO' : (user as any).customer_tier || 'free';

  // ==================== VISTAS POR TAB ====================

  // Vista Overview (Tab 1)
  const overviewView = (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Left column - User profile */}
      <div className="xl:col-span-1">
        <ActiveUserProfileCard
          user={{
            ...(user as any),
            customer_tier: dynamicCustomerTier
          }}
          authUser={authUser}
          primaryEmail={primaryEmail}
          emailVerified={emailVerified}
          stripeCustomerId={(customer as any)?.stripe_customer_id}
        />
      </div>

      {/* Right column - Main content */}
      <div className="xl:col-span-3 space-y-6">
        {/* Stats Cards Mejorados */}
        <ActiveUserStats
          registeredDays={registeredDays}
          lastLoginDate={lastLoginDate}
          onboardingCompleted={(user as any).onboarding_completed || false}
          subscriptionsCount={subscriptions?.filter((s: any) => ['active', 'trialing'].includes(s.status)).length || 0}
          indicatorAccessCount={allIndicatorAccess?.filter((a: any) => a.status === 'active').length || 0}
          customerTier={dynamicCustomerTier}
          totalLifetimeSpent={(user as any).total_lifetime_spent ? Number((user as any).total_lifetime_spent) / 100 : null}
          purchaseCount={(user as any).purchase_count}
          loyaltyDiscount={(user as any).loyalty_discount_percentage}
        />

        {/* Panel de Suscripción Mejorado */}
        <ActiveUserSubscription
          subscriptions={(subscriptions as any) || []}
          stripeCustomerId={(customer as any)?.stripe_customer_id}
          paymentIntents={(paymentIntents as any) || []}
          hasLifetimeAccess={hasLifetimeAccess}
          lifetimeAccessDetails={(lifetimeAccess as any) || []}
        />

        {/* Indicator Access */}
        {allIndicatorAccess && allIndicatorAccess.length > 0 && (
          <AdminIndicatorAccessList accesses={allIndicatorAccess as any} />
        )}
      </div>
    </div>
  );

  // Vista Facturación (Tab 2 - FASE 4)
  const billingView = (
    <ActiveUserBilling
      userId={params.id}
      stripeCustomerId={(customer as any)?.stripe_customer_id}
      paymentIntents={(paymentIntents as any) || []}
      invoices={(invoices as any) || []}
      subscription={activeSubscription as any}
      purchases={(purchases as any) || []}
    />
  );

  // Vista Acciones Admin (Tab 3 - FASE 5)
  const actionsView = (
    <ActiveUserActions
      userId={params.id}
      userEmail={primaryEmail}
      userName={(user as any).full_name || 'Usuario sin nombre'}
      subscriptionId={(activeSubscription as any)?.id || null}
      paymentIntents={(paymentIntents as any) || []}
    />
  );

  // Vista Timeline (Tab 4 - FASE 6)
  const timelineView = (
    <ActiveUserTimeline
      userId={params.id}
    />
  );

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
                {(user as any).full_name || 'Usuario sin nombre'}
              </h1>
              {(activeSubscription || hasLifetimeAccess) && (
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${
                  hasLifetimeAccess 
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
                    : 'bg-green-500/20 text-green-400 border-green-500/30'
                }`}>
                  {hasLifetimeAccess ? 'Lifetime Access' : 'Cliente Activo'}
                </span>
              )}
              {!(user as any).onboarding_completed && (
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

      {/* Tabs Navigation */}
      <ActiveUserTabs
        overviewView={overviewView}
        billingView={billingView}
        actionsView={actionsView}
        timelineView={timelineView}
      />
    </div>
  );
}

export const metadata = {
  title: 'Usuario Activo - Admin APIDevs',
  description: 'Vista detallada del usuario activo con suscripciones y accesos',
};

