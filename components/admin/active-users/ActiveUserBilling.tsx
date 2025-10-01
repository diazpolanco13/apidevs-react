import { CreditCard, FileText, Calendar, DollarSign, CheckCircle, XCircle, Clock, ExternalLink, AlertCircle } from 'lucide-react';

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: string | number;  // Puede ser ISO string o UNIX timestamp
  description?: string;
  payment_method?: string;
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

interface ActiveUserBillingProps {
  userId: string;
  stripeCustomerId?: string | null;
  paymentIntents?: PaymentIntent[];
  invoices?: Invoice[];
  subscription?: Subscription | null;
}

export default function ActiveUserBilling({
  userId,
  stripeCustomerId,
  paymentIntents = [],
  invoices = [],
  subscription
}: ActiveUserBillingProps) {
  
  // Calcular totales
  const totalPaid = paymentIntents
    .filter(pi => pi.status === 'succeeded')
    .reduce((sum, pi) => sum + pi.amount, 0) / 100;

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

  const formatDate = (date: string | number | null | undefined) => {
    if (!date) return 'Fecha no disponible';
    
    let dateObj: Date;
    
    // Si es un string (ISO 8601 de Supabase)
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } 
    // Si es un number (UNIX timestamp en segundos)
    else {
      dateObj = new Date(date * 1000);
    }
    
    // Validar que la fecha es válida
    if (isNaN(dateObj.getTime())) {
      return 'Fecha inválida';
    }
    
    return dateObj.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            {nextBillingDate ? formatDate(nextBillingDate) : 'Sin programar'}
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
            {paymentIntents.slice(0, 10).map((payment) => (
              <div 
                key={payment.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-white font-medium">
                      {formatPrice(payment.amount / 100, payment.currency)}
                    </p>
                    {getStatusBadge(payment.status)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{formatDate(payment.created)}</span>
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
            ))}
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
                    <span>{formatDate(invoice.created)}</span>
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
