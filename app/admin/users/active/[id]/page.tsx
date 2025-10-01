import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface ActiveUserDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ActiveUserDetailPage({ params }: ActiveUserDetailPageProps) {
  const supabase = createClient();

  // ==================== QUERIES FUNDAMENTALES ====================
  
  // 1. Datos del usuario desde la tabla users
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
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
        <div className="xl:col-span-1 space-y-6">
          {/* Profile Card - Placeholder */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Información Personal</h3>
            
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.full_name || 'Avatar'}
                  className="w-24 h-24 rounded-full border-4 border-apidevs-primary"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-apidevs-primary to-green-400 flex items-center justify-center text-black text-3xl font-bold">
                  {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">Email:</span>
                <p className="text-white font-medium break-all">{primaryEmail}</p>
                {authUser && primaryEmail !== 'Sin email' && (
                  emailVerified ? (
                    <span className="text-xs text-green-400">✓ Verificado</span>
                  ) : (
                    <span className="text-xs text-yellow-400">⚠ Sin verificar</span>
                  )
                )}
              </div>

              {user.phone && (
                <div>
                  <span className="text-gray-400">Teléfono:</span>
                  <p className="text-white">{user.phone}</p>
                </div>
              )}

              {(user.city || user.country) && (
                <div>
                  <span className="text-gray-400">Ubicación:</span>
                  <p className="text-white">
                    {[user.city, user.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}

              {user.tradingview_username && (
                <div>
                  <span className="text-gray-400">TradingView:</span>
                  <p className="text-white font-mono text-xs">{user.tradingview_username}</p>
                </div>
              )}

              {user.timezone && (
                <div>
                  <span className="text-gray-400">Timezone:</span>
                  <p className="text-white">{user.timezone}</p>
                </div>
              )}
            </div>

            {/* Auth Info */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="text-sm font-semibold text-white mb-3">Autenticación</h4>
              <div className="space-y-2 text-xs">
                {authUser ? (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Proveedor:</span>
                    <span className="text-white font-medium">
                      {authUser.user?.app_metadata?.provider || 'email'}
                    </span>
                  </div>
                ) : (
                  <div className="text-gray-500 text-xs italic">
                    Datos de auth no disponibles (rate limit)
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">ID Usuario:</span>
                  <code className="text-apidevs-primary text-[10px]" title={params.id}>
                    {params.id.slice(0, 8)}...
                  </code>
                </div>
                {customer?.stripe_customer_id && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Stripe ID:</span>
                    <code className="text-purple-400 text-[10px]" title={customer.stripe_customer_id}>
                      {customer.stripe_customer_id.slice(0, 12)}...
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Main content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Stats Cards - Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
              <h4 className="text-sm text-gray-400 mb-2">Suscripciones</h4>
              <p className="text-3xl font-bold text-white">{subscriptions?.length || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {activeSubscription ? 'Activa' : 'Sin suscripción activa'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
              <h4 className="text-sm text-gray-400 mb-2">Accesos TradingView</h4>
              <p className="text-3xl font-bold text-white">{indicatorAccess?.length || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Indicadores activos</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
              <h4 className="text-sm text-gray-400 mb-2">Onboarding</h4>
              <p className="text-3xl font-bold text-white">
                {user.onboarding_completed ? '✓' : '⏳'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {user.onboarding_completed ? 'Completado' : 'Pendiente'}
              </p>
            </div>
          </div>

          {/* Subscription Panel - Placeholder */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Suscripción Actual</h3>
            
            {activeSubscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-white">
                      {(activeSubscription as any).prices?.products?.name || 'Plan Desconocido'}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Estado: <span className="text-green-400 font-medium">{activeSubscription.status}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-apidevs-primary">
                      ${((activeSubscription as any).prices?.unit_amount || 0) / 100}
                    </p>
                    <p className="text-xs text-gray-400">
                      /{(activeSubscription as any).prices?.interval || 'mes'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Inicio:</span>
                    <p className="text-white">
                      {new Date(activeSubscription.created).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Próximo cobro:</span>
                    <p className="text-white">
                      {new Date(activeSubscription.current_period_end).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>

                {customer?.stripe_customer_id && (
                  <div className="pt-4 border-t border-gray-700">
                    <a
                      href={`https://dashboard.stripe.com/customers/${customer.stripe_customer_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-2"
                    >
                      Ver en Stripe Dashboard →
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Sin suscripción activa</p>
              </div>
            )}
          </div>

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

