'use client';

import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  Calendar,
  DollarSign,
  CreditCard
} from 'lucide-react';

interface Subscription {
  id: string;
  status: string;
  created: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  prices: {
    id: string;
    unit_amount: number | null;
    currency: string;
    interval: string | null;
    interval_count: number | null;
    products: {
      id: string;
      name: string;
      description: string | null;
    } | null;
  } | null;
}

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: string;
  invoice_id?: string | null;
}

interface ActiveUserSubscriptionProps {
  subscriptions: Subscription[];
  stripeCustomerId?: string | null;
  paymentIntents?: PaymentIntent[];
  hasLifetimeAccess?: boolean;
  lifetimeAccessDetails?: any[];
}

export default function ActiveUserSubscription({
  subscriptions,
  stripeCustomerId,
  paymentIntents = [],
  hasLifetimeAccess = false,
  lifetimeAccessDetails = []
}: ActiveUserSubscriptionProps) {
  
  const activeSubscription = subscriptions.find(
    sub => ['active', 'trialing'].includes(sub.status)
  );
  
  // Si tiene Lifetime, mostrar eso como la suscripción principal
  const hasPremiumAccess = activeSubscription || hasLifetimeAccess;

  /**
   * Obtiene el precio REAL que pagó el usuario para una suscripción.
   * Esto es importante para usuarios con descuentos permanentes (loyalty, coupons, etc.)
   * 
   * @param subscriptionId - ID de la suscripción
   * @param fallbackAmount - Precio base del producto como fallback
   * @returns El monto real pagado o el fallback si no hay payment intents
   */
  const getActualPricePaid = (subscriptionId: string, fallbackAmount: number | null): number | null => {
    // Buscar el último payment intent exitoso para esta suscripción
    const successfulPayments = paymentIntents
      .filter(pi => pi.status === 'succeeded')
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    // Si hay pagos exitosos, usar el monto del más reciente
    if (successfulPayments.length > 0) {
      return successfulPayments[0].amount;
    }

    // Si no hay payment intents, usar el precio base del producto como fallback
    return fallbackAmount;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { icon: any; color: string; bgColor: string; borderColor: string; label: string }> = {
      active: {
        icon: CheckCircle,
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/30',
        label: 'Activa'
      },
      trialing: {
        icon: Clock,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/30',
        label: 'Trial'
      },
      past_due: {
        icon: AlertCircle,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/30',
        label: 'Pago Vencido'
      },
      canceled: {
        icon: XCircle,
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30',
        label: 'Cancelada'
      },
      incomplete: {
        icon: AlertCircle,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/20',
        borderColor: 'border-orange-500/30',
        label: 'Incompleta'
      }
    };

    const config = statusConfig[status] || statusConfig.canceled;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const formatPrice = (amount: number | null | undefined, currency: string) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  const formatInterval = (interval: string | null | undefined, intervalCount: number | null | undefined) => {
    if (!interval) return '';
    const count = intervalCount || 1;
    const periods: Record<string, string> = {
      day: count > 1 ? `cada ${count} días` : 'diario',
      week: count > 1 ? `cada ${count} semanas` : 'semanal',
      month: count > 1 ? `cada ${count} meses` : 'mensual',
      year: count > 1 ? `cada ${count} años` : 'anual'
    };
    return periods[interval] || interval;
  };

  return (
    <div className="space-y-6">
      {/* Suscripción Actual */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Suscripción Actual</h3>
          {stripeCustomerId && (
            <a
              href={`https://dashboard.stripe.com/customers/${stripeCustomerId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-2 transition-colors"
            >
              Ver en Stripe
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {hasLifetimeAccess && !activeSubscription ? (
          <div className="space-y-6">
            {/* Header de Lifetime Access */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-700">
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-white mb-2">
                  Plan Lifetime Access 👑
                </h4>
                <p className="text-sm text-gray-400">
                  Acceso de por vida a todos los indicadores premium sin renovaciones
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <CheckCircle className="w-4 h-4" />
                  Lifetime Activo
                </span>
              </div>
            </div>
            
            {/* Detalles de Lifetime Access */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <DollarSign className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">Tipo de Compra</p>
                  <p className="text-white font-medium">Compra Única (One-Time Payment)</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <Calendar className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">Accesos Otorgados</p>
                  <p className="text-white font-medium">{lifetimeAccessDetails.length} indicador(es) premium</p>
                  {lifetimeAccessDetails[0]?.granted_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      Desde: {new Date(lifetimeAccessDetails[0].granted_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeSubscription ? (
          <div className="space-y-6">
            {/* Header de Suscripción */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-700">
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-white mb-2">
                  {activeSubscription.prices?.products?.name || 'Plan Desconocido'}
                </h4>
                {activeSubscription.prices?.products?.description && (
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {activeSubscription.prices.products.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                {getStatusBadge(activeSubscription.status)}
                <div className="text-right">
                  <div className="text-3xl font-bold text-apidevs-primary">
                    {formatPrice(
                      getActualPricePaid(activeSubscription.id, activeSubscription.prices?.unit_amount ?? null), 
                      activeSubscription.prices?.currency || 'usd'
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatInterval(activeSubscription.prices?.interval, activeSubscription.prices?.interval_count)}
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles de Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <Calendar className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 mb-1">Inicio de Suscripción</p>
                  <p className="text-white font-medium">
                    {new Date(activeSubscription.created).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <DollarSign className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 mb-1">Próximo Cobro</p>
                  <p className="text-white font-medium">
                    {new Date(activeSubscription.current_period_end).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.ceil((new Date(activeSubscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} días restantes
                  </p>
                </div>
              </div>
            </div>

            {/* Trial Info */}
            {activeSubscription.trial_end && new Date(activeSubscription.trial_end) > new Date() && (
              <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                <Clock className="w-5 h-5 text-blue-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Período de Prueba Activo</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Termina el {new Date(activeSubscription.trial_end).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            )}

            {/* Cancelación Programada */}
            {activeSubscription.cancel_at_period_end && (
              <div className="flex items-center gap-3 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Cancelación Programada</p>
                  <p className="text-xs text-gray-400 mt-1">
                    El acceso finalizará el {new Date(activeSubscription.current_period_end).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            )}

            {/* ID de Suscripción y botón de Stripe */}
            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">ID de Suscripción:</span>
                  <code className="text-xs font-mono text-apidevs-primary bg-apidevs-primary/10 px-2 py-1 rounded">
                    {activeSubscription.id}
                  </code>
                </div>
                <a
                  href={`https://dashboard.stripe.com/subscriptions/${activeSubscription.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Ver en Stripe
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">Sin Suscripción Activa</p>
            <p className="text-gray-500 text-sm">
              Este usuario no tiene ninguna suscripción activa en este momento
            </p>
          </div>
        )}
      </div>

      {/* Historial de Suscripciones */}
      {subscriptions.length > 1 && (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Historial de Suscripciones</h3>
          
          <div className="space-y-3">
            {subscriptions
              .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
              .map((sub) => (
                <div 
                  key={sub.id}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-white font-medium">
                          {sub.prices?.products?.name || 'Plan Desconocido'}
                        </p>
                        {getStatusBadge(sub.status)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>
                          Creada: {new Date(sub.created).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })}
                        </span>
                        {sub.canceled_at && (
                          <span>
                            Cancelada: {new Date(sub.canceled_at).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-apidevs-primary">
                        {formatPrice(
                          getActualPricePaid(sub.id, sub.prices?.unit_amount ?? null), 
                          sub.prices?.currency || 'usd'
                        )}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatInterval(sub.prices?.interval, sub.prices?.interval_count)}
                      </p>
                    </div>
                  </div>
                  
                  {/* ID de suscripción y botón de Stripe */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">ID:</span>
                      <code className="text-xs font-mono text-gray-400 bg-black/30 px-2 py-1 rounded">
                        {sub.id}
                      </code>
                    </div>
                    <a
                      href={`https://dashboard.stripe.com/subscriptions/${sub.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Ver en Stripe
                    </a>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

