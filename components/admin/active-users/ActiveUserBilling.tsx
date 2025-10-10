import { CreditCard, FileText, Calendar, DollarSign, CheckCircle, XCircle, Clock, ExternalLink, AlertCircle } from 'lucide-react';
import { formatDateShort } from '@/utils/formatDate';

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: string | number;  // Puede ser ISO string o UNIX timestamp
  description?: string;
  payment_method?: string;
  amount_refunded?: number;
  refunded?: boolean;
  refunds?: Array<{
    id: string;
    amount: number;
    reason: string;
    status: string;
  }>;
}

interface Invoice {
  id: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: string;
  created: string | number;  // Puede ser ISO string o UNIX timestamp
  due_date?: string | number | null;
  invoice_pdf?: string;
  hosted_invoice_url?: string;
  number?: string;
}

interface Subscription {
  id: string;
  status: string;
  current_period_end: string | number;  // Puede ser ISO string o UNIX timestamp
  items: {
    data: Array<{
      price: {
        unit_amount: number;
        currency: string;
        recurring?: {
          interval: string;
        };
      };
    }>;
  };
}

interface Purchase {
  id: string;
  order_number: string;
  customer_email: string;
  order_total_cents: number;
  order_date: string;
  order_status: string;
  payment_status?: string;
  product_name?: string;
  is_lifetime_purchase?: boolean;
}

interface ActiveUserBillingProps {
  userId: string;
  stripeCustomerId?: string | null;
  paymentIntents?: PaymentIntent[];
  invoices?: Invoice[];
  subscription?: Subscription | null;
  purchases?: Purchase[];
}

export default function ActiveUserBilling({
  userId,
  stripeCustomerId,
  paymentIntents = [],
  invoices = [],
  subscription,
  purchases = []
}: ActiveUserBillingProps) {
  
  // ==================== CÁLCULO ROBUSTO DEL TOTAL FACTURADO ====================
  // Estrategia: Combinar ambas fuentes (invoices + payment_intents) evitando duplicados
  // mediante detección por monto y fecha
  
  // Helper: Normalizar fecha a timestamp para comparación
  const getTimestamp = (date: string | number): number => {
    if (typeof date === 'number') return date;
    return Math.floor(new Date(date).getTime() / 1000);
  };

  // 1. Procesar Invoices pagados (fuente principal para suscripciones)
  const paidInvoices = invoices
    .filter(inv => inv.status === 'paid')
    .map(inv => ({
      amount: inv.amount_paid,
      timestamp: getTimestamp(inv.created),
      source: 'invoice' as const,
      id: inv.id
    }));

  // 2. Procesar Payment Intents exitosos (one-time payments y fallback)
  const succeededPayments = paymentIntents
    .filter(pi => pi.status === 'succeeded')
    .map(pi => ({
      amount: pi.amount - (pi.amount_refunded || 0), // Restar refunds
      timestamp: getTimestamp(pi.created),
      source: 'payment_intent' as const,
      id: pi.id
    }));

  // 3. Combinar y eliminar duplicados (mismo monto ±5 segundos = mismo pago)
  const allPayments = [...paidInvoices, ...succeededPayments];
  const uniquePayments: typeof allPayments = [];
  
  allPayments.forEach(payment => {
    const isDuplicate = uniquePayments.some(existing => {
      const timeDiff = Math.abs(existing.timestamp - payment.timestamp);
      const amountMatch = existing.amount === payment.amount;
      // Si mismo monto y dentro de 5 segundos, es duplicado
      return amountMatch && timeDiff <= 5;
    });
    
    if (!isDuplicate) {
      uniquePayments.push(payment);
    }
  });

  // 4. Calcular total sumando pagos únicos
  const totalPaidCents = uniquePayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPaid = totalPaidCents / 100;

  const totalInvoices = invoices.length;

  // Próximo cobro basado en suscripción activa
  const nextBillingDate = subscription?.current_period_end || null;

  const nextBillingAmount = subscription?.items?.data[0]?.price?.unit_amount 
    ? subscription.items.data[0].price.unit_amount / 100
    : null;

  const nextBillingCurrency = subscription?.items?.data[0]?.price?.currency || 'usd';

  // Obtener status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { icon: any; color: string; bgColor: string; borderColor: string; label: string }> = {
      succeeded: {
        icon: CheckCircle,
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/30',
        label: 'Exitoso'
      },
      processing: {
        icon: Clock,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/30',
        label: 'Procesando'
      },
      requires_payment_method: {
        icon: AlertCircle,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/30',
        label: 'Requiere Pago'
      },
      failed: {
        icon: XCircle,
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30',
        label: 'Fallido'
      },
      canceled: {
        icon: XCircle,
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/20',
        borderColor: 'border-gray-500/30',
        label: 'Cancelado'
      },
      paid: {
        icon: CheckCircle,
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/30',
        label: 'Pagado'
      },
      open: {
        icon: Clock,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/30',
        label: 'Pendiente'
      },
      draft: {
        icon: FileText,
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/20',
        borderColor: 'border-gray-500/30',
        label: 'Borrador'
      },
      uncollectible: {
        icon: XCircle,
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30',
        label: 'Incobrable'
      },
      void: {
        icon: XCircle,
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/20',
        borderColor: 'border-gray-500/30',
        label: 'Anulado'
      }
    };

    const config = statusConfig[status] || statusConfig.failed;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Panel de Facturación</h2>
          </div>
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
        <p className="text-gray-400 text-sm">
          Historial completo de pagos, invoices y próximos cobros programados
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/30 rounded-xl p-5">
          <DollarSign className="w-8 h-8 text-green-400 mb-3" />
          <div className="text-2xl font-bold text-white mb-1">
            {formatPrice(totalPaid, 'usd')}
          </div>
          <div className="text-sm text-gray-400">Total Facturado</div>
          <div className="text-xs text-gray-500 mt-1">
            {paymentIntents.filter(pi => pi.status === 'succeeded').length} pagos exitosos
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/30 rounded-xl p-5">
          <FileText className="w-8 h-8 text-blue-400 mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{totalInvoices}</div>
          <div className="text-sm text-gray-400">Invoices Totales</div>
          <div className="text-xs text-gray-500 mt-1">
            {invoices.filter(inv => inv.status === 'paid').length} pagados
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 rounded-xl p-5">
          <Calendar className="w-8 h-8 text-purple-400 mb-3" />
          <div className="text-xl font-bold text-white mb-1">
            {nextBillingDate ? formatDateShort(nextBillingDate) : 'Sin programar'}
          </div>
          <div className="text-sm text-gray-400">Próximo Cobro</div>
          {nextBillingAmount && (
            <div className="text-xs text-gray-500 mt-1">
              {formatPrice(nextBillingAmount, nextBillingCurrency)}
            </div>
          )}
        </div>
      </div>

      {/* Historial de Pagos */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-apidevs-primary" />
          Historial de Pagos
        </h3>

        {paymentIntents.length > 0 ? (
          <div className="space-y-3">
            {paymentIntents
              .filter(payment => payment.status === 'succeeded' || payment.status === 'processing')
              .slice(0, 10)
              .map((payment) => {
              const hasRefund = !!(payment.amount_refunded && payment.amount_refunded > 0);
              const isFullyRefunded = payment.refunded || false;
              const refundPercentage = hasRefund 
                ? Math.round((payment.amount_refunded! / payment.amount) * 100)
                : 0;

              return (
                <div 
                  key={payment.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    isFullyRefunded 
                      ? 'bg-red-500/10 border-red-500/30' 
                      : hasRefund 
                        ? 'bg-orange-500/10 border-orange-500/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className={`font-medium ${isFullyRefunded ? 'text-red-400 line-through' : 'text-white'}`}>
                          {formatPrice(payment.amount / 100, payment.currency)}
                        </p>
                        {hasRefund && !isFullyRefunded && (
                          <span className="px-2 py-0.5 bg-orange-500/30 text-orange-400 text-xs rounded-full border border-orange-500/50">
                            Reembolso parcial: {refundPercentage}%
                          </span>
                        )}
                        {isFullyRefunded && (
                          <span className="px-2 py-0.5 bg-red-500/30 text-red-400 text-xs rounded-full border border-red-500/50">
                            💸 Reembolsado
                          </span>
                        )}
                        {!hasRefund && getStatusBadge(payment.status)}
                      </div>
                      
                      {/* Información de refund */}
                      {hasRefund && (
                        <div className="mb-2 px-3 py-2 bg-black/20 rounded-lg border border-white/10">
                          <p className="text-sm text-red-300 font-medium mb-1">
                            Reembolsado: {formatPrice(payment.amount_refunded! / 100, payment.currency)}
                          </p>
                          {payment.refunds && payment.refunds.length > 0 && (
                            <div className="text-xs text-gray-400 space-y-0.5">
                              {payment.refunds.map((refund) => (
                                <div key={refund.id} className="flex items-center gap-2">
                                  <span>• {formatPrice(refund.amount / 100, payment.currency)}</span>
                                  {refund.reason && (
                                    <span className="text-orange-400">
                                      ({refund.reason === 'requested_by_customer' ? 'Solicitado' : 
                                        refund.reason === 'duplicate' ? 'Duplicado' : 
                                        refund.reason === 'fraudulent' ? 'Fraude' : refund.reason})
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{formatDateShort(payment.created)}</span>
                        {payment.description && <span>• {payment.description}</span>}
                      </div>
                    </div>
                    <a
                      href={`https://dashboard.stripe.com/payments/${payment.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : paymentIntents.length > 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No hay pagos exitosos registrados</p>
            <p className="text-gray-500 text-xs mt-2">
              {paymentIntents.filter(p => p.status === 'requires_payment_method' || p.status === 'failed').length} intentos fallidos ocultos
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No hay pagos registrados</p>
          </div>
        )}
      </div>

      {/* Invoices */}
      {invoices.length > 0 && (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-apidevs-primary" />
            Facturas (Invoices)
          </h3>

          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div 
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-white font-medium">
                      {invoice.number || invoice.id}
                    </p>
                    {getStatusBadge(invoice.status)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{formatDateShort(invoice.created)}</span>
                    <span>• {formatPrice(invoice.amount_paid / 100, invoice.currency)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {invoice.invoice_pdf && (
                    <a
                      href={invoice.invoice_pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 text-xs hover:bg-blue-500/30 transition-colors"
                    >
                      PDF
                    </a>
                  )}
                  {invoice.hosted_invoice_url && (
                    <a
                      href={invoice.hosted_invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Purchases (Compras de la tabla purchases) */}
      {purchases.length > 0 && (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Compras Registradas ({purchases.length})
          </h3>

          <div className="space-y-3">
            {purchases.map((purchase) => (
              <div 
                key={purchase.id}
                className={`p-4 rounded-lg border transition-colors ${
                  purchase.is_lifetime_purchase 
                    ? 'bg-purple-500/10 border-purple-500/30' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-white font-medium">
                        {formatPrice(purchase.order_total_cents / 100, 'USD')}
                      </p>
                      {purchase.is_lifetime_purchase && (
                        <span className="px-2 py-0.5 bg-purple-500/30 text-purple-400 text-xs rounded-full border border-purple-500/50">
                          👑 Lifetime
                        </span>
                      )}
                      {purchase.payment_status && getStatusBadge(purchase.payment_status)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{formatDateShort(purchase.order_date)}</span>
                      {purchase.product_name && <span>• {purchase.product_name}</span>}
                      <span>• {purchase.order_number}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info de desarrollo */}
      {!stripeCustomerId && (
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Usuario sin Customer ID de Stripe
              </h3>
              <p className="text-gray-400 text-sm">
                Este usuario no tiene un Customer ID asociado en Stripe. 
                Los datos de facturación se mostrarán una vez que el usuario realice su primera compra.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
