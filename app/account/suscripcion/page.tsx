import { createClient } from '@/utils/supabase/server';
import { getUser, getSubscription } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import CustomerPortalForm from '@/components/ui/AccountForms/CustomerPortalForm';
import PaymentHistory from '@/components/ui/AccountForms/PaymentHistory';
import { Shield, Crown, Zap, CheckCircle, XCircle, Calendar, CreditCard } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering - no cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SuscripcionPage() {
  const supabase = createClient();
  const [user, subscription] = await Promise.all([
    getUser(supabase),
    getSubscription(supabase)
  ]);

  if (!user) {
    return redirect('/signin');
  }

  // 🏆 JERARQUÍA DE PLANES: Lifetime ($999) > PRO > FREE ($0)
  const { data: allLifetimePurchases } = await (supabase as any)
    .from('purchases')
    .select('id, is_lifetime_purchase, order_total_cents, payment_method, order_date')
    .eq('customer_email', user.email)
    .eq('is_lifetime_purchase', true)
    .eq('payment_status', 'paid')
    .order('order_total_cents', { ascending: false }); // Ordenar por VALOR

  // Filtrar solo compras PAGADAS (excluir FREE)
  const paidLifetimePurchases = (allLifetimePurchases || []).filter(
    (p: any) => p.order_total_cents > 0 && p.payment_method !== 'free'
  );
  
  const hasLifetimeAccess = paidLifetimePurchases.length > 0;
  const lifetimePurchase = paidLifetimePurchases[0] || null; // Tomar la de mayor valor

  // Obtener el último payment intent exitoso para mostrar el precio REAL pagado y la fecha
  let actualPricePaid: number | null = null;
  let lastPaymentDate: string | null = null;
  
  // Buscar último pago (incluye compras Lifetime)
  const { data: paymentIntents } = await supabase
    .from('payment_intents')
    .select('amount, status, created')
    .eq('user_id', user.id)
    .eq('status', 'succeeded')
    .order('created', { ascending: false })
    .limit(1) as { data: { amount: number; status: string; created: string }[] | null };

  if (paymentIntents && paymentIntents.length > 0) {
    actualPricePaid = paymentIntents[0].amount;
    lastPaymentDate = paymentIntents[0].created;
  }

  const productName = subscription?.prices?.products?.name || 'Free';
  const interval = subscription?.prices?.interval;
  
  // Mapear nombres técnicos a nombres amigables
  let userPlan = productName;
  if (hasLifetimeAccess) {
    userPlan = 'Plan Lifetime Access';
  } else if (productName === 'APIDevs Trading Indicators' && interval) {
    userPlan = interval === 'year' 
      ? 'Plan PRO Anual' 
      : interval === 'month' 
        ? 'Plan PRO Mensual' 
        : 'Plan PRO';
  } else if (productName.toLowerCase().includes('lifetime')) {
    userPlan = 'Plan Lifetime Access';
  }
  
  // Detectar si es premium: suscripción activa O accesos Lifetime
  const isPro = subscription?.status === 'active' && !productName.toLowerCase().includes('lifetime') && !hasLifetimeAccess;
  const isLifetime = hasLifetimeAccess || productName.toLowerCase().includes('lifetime');
  const hasPremium = subscription?.status === 'active' || hasLifetimeAccess;
  
  // Detectar estado de cancelación
  const isCancelled = subscription?.cancel_at_period_end === true;
  const cancellationDate = subscription?.canceled_at ? new Date(subscription.canceled_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Suscripción y Facturación</h1>
        <p className="text-gray-400">Gestiona tu plan y métodos de pago</p>
      </div>

      {/* Current Plan Card */}
      <div className={`rounded-3xl p-6 border ${
        isLifetime
          ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30'
          : isPro
            ? 'bg-gradient-to-br from-apidevs-primary/10 to-green-400/10 border-apidevs-primary/30'
            : 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {isLifetime ? (
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <Crown className="w-7 h-7 text-white" />
              </div>
            ) : isPro ? (
              <div className="w-14 h-14 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-2xl flex items-center justify-center">
                <Zap className="w-7 h-7 text-black" />
              </div>
            ) : (
              <div className="w-14 h-14 bg-gray-700 rounded-2xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-gray-400" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-white">{userPlan}</h2>
              <div className="flex items-center gap-2">
                {isCancelled ? (
                  <>
                    <span className="text-sm text-orange-400 font-medium">Cancelada</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-400">
                      Acceso hasta {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'final del período'}
                    </span>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">
                    {hasPremium ? 'Activo' : 'Inactivo'}
                  </p>
                )}
              </div>
            </div>
          </div>
          {subscription && (
            <div className="text-right">
              <div className="text-3xl font-bold text-white">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: subscription.prices?.currency || 'USD',
                  minimumFractionDigits: 0
                }).format((actualPricePaid || subscription.prices?.unit_amount || 0) / 100)}
              </div>
              <div className="text-sm text-gray-400">
                /{subscription.prices?.interval}
              </div>
            </div>
          )}
        </div>

        {/* Plan Status */}
        <div className="bg-black/30 rounded-2xl p-4 mb-4">
          {hasPremium ? (
            <>
              {isLifetime ? (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-purple-400 font-medium mb-2">
                      Acceso Lifetime Activo
                    </div>
                    <div className="text-gray-300 text-sm">
                      Tienes acceso de por vida a todos los indicadores premium.
                      <span className="block mt-1 text-purple-400 font-semibold">
                        ✨ Sin renovaciones ni cargos adicionales
                      </span>
                      {actualPricePaid && (
                        <span className="block mt-2 text-gray-400">
                          Precio pagado: {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 2
                          }).format(actualPricePaid / 100)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : subscription?.cancel_at_period_end ? (
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-orange-400 font-medium mb-2">
                      Suscripción Cancelada
                    </div>
                    <div className="text-gray-300 text-sm">
                      Tu suscripción al plan {subscription.prices?.products?.name} ha sido cancelada, 
                      pero seguirá activa hasta el{' '}
                      <span className="font-semibold text-white">
                        {new Date(subscription.current_period_end).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-green-400 font-medium mb-2">
                      Suscripción Activa
                    </div>
                    <div className="text-gray-300 text-sm">
                      Estás suscrito al plan {subscription?.prices?.products?.name}.
                      {subscription?.current_period_end && (
                        <span>
                          {' '}Próxima renovación: {' '}
                          <span className="font-semibold text-white">
                            {new Date(subscription.current_period_end).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-white font-medium mb-2">
                  Sin Suscripción Activa
                </div>
                <div className="text-gray-300 text-sm">
                  No tienes una suscripción activa actualmente. Actualiza tu plan para acceder a funciones premium.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!hasPremium ? (
            <Link
              href="/pricing"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-apidevs-primary to-green-400 hover:from-green-400 hover:to-apidevs-primary text-black font-semibold rounded-2xl transition-all transform hover:scale-105 text-center shadow-lg shadow-apidevs-primary/30"
            >
              Elegir Plan
            </Link>
          ) : isLifetime ? (
            <div className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400 font-semibold rounded-2xl text-center flex items-center justify-center gap-2">
              <Crown className="w-5 h-5" />
              <span>Acceso de Por Vida Activo</span>
            </div>
          ) : subscription ? (
            <>
              <div className="flex-1">
                <CustomerPortalForm subscription={subscription} />
              </div>
              {subscription.cancel_at_period_end && (
                <Link
                  href="/pricing"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-2xl transition-all transform hover:scale-105 text-center"
                >
                  Reactivar Suscripción
                </Link>
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* Features Comparison */}
      {!hasPremium && (
        <div className="bg-gradient-to-r from-apidevs-primary/10 to-green-400/10 border border-apidevs-primary/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">¿Por qué actualizar?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-apidevs-primary flex-shrink-0 mt-0.5" />
              <div className="text-gray-300 text-sm">
                <span className="font-semibold text-white">Indicadores Premium</span>
                <br />Acceso ilimitado a todos nuestros indicadores profesionales
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-apidevs-primary flex-shrink-0 mt-0.5" />
              <div className="text-gray-300 text-sm">
                <span className="font-semibold text-white">Alertas en Tiempo Real</span>
                <br />Notificaciones instantáneas de señales de trading
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-apidevs-primary flex-shrink-0 mt-0.5" />
              <div className="text-gray-300 text-sm">
                <span className="font-semibold text-white">Soporte Prioritario</span>
                <br />Atención personalizada y respuesta rápida
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-apidevs-primary flex-shrink-0 mt-0.5" />
              <div className="text-gray-300 text-sm">
                <span className="font-semibold text-white">Academia Exclusiva</span>
                <br />Cursos y tutoriales avanzados (Lifetime)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-white">Historial de Pagos</h2>
        </div>
        <PaymentHistory 
          subscription={subscription} 
          userEmail={user.email || ''} 
          actualPricePaid={actualPricePaid}
          lastPaymentDate={lastPaymentDate}
        />
      </div>
    </div>
  );
}
