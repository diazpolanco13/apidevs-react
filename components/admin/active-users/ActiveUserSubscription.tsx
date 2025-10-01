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

interface ActiveUserSubscriptionProps {
  subscriptions: Subscription[];
  stripeCustomerId?: string | null;
}

export default function ActiveUserSubscription({
  subscriptions,
  stripeCustomerId
}: ActiveUserSubscriptionProps) {
  
  const activeSubscription = subscriptions.find(
    sub => ['active', 'trialing'].includes(sub.status)
  );

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

        {activeSubscription ? (
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
                    {formatPrice(activeSubscription.prices?.unit_amount, activeSubscription.prices?.currency || 'usd')}
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

            {/* ID de Suscripción */}
            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">ID de Suscripción</span>
                <code className="text-apidevs-primary font-mono">{activeSubscription.id}</code>
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
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-white font-medium">
                        {sub.prices?.products?.name || 'Plan Desconocido'}
                      </p>
                      {getStatusBadge(sub.status)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>
                        Creada: {new Date(sub.created).toLocaleDateString('es-ES')}
                      </span>
                      {sub.canceled_at && (
                        <span>
                          Cancelada: {new Date(sub.canceled_at).toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-apidevs-primary">
                      {formatPrice(sub.prices?.unit_amount, sub.prices?.currency || 'usd')}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatInterval(sub.prices?.interval, sub.prices?.interval_count)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

