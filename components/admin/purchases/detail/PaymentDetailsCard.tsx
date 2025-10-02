'use client';

import { CreditCard, FileText, MapPin, Mail, CheckCircle, ExternalLink } from 'lucide-react';

interface PaymentDetailsCardProps {
  purchase: any;
  paymentIntent: any;
  invoice?: any;
}

export default function PaymentDetailsCard({ purchase, paymentIntent, invoice }: PaymentDetailsCardProps) {
  return (
    <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-700/50">
        <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
          <CreditCard className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-1">
            Detalles de Pago
          </h3>
          <p className="text-sm text-gray-400">
            Información de transacción y facturación
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Stripe Payment Intent */}
        {(purchase.transaction_id || purchase.gateway_transaction_id) && (
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              <ExternalLink className="w-3 h-3" />
              Stripe Payment Intent ID
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-xs font-mono text-gray-300 break-all">
                {purchase.transaction_id || purchase.gateway_transaction_id}
              </code>
              <a
                href={`https://dashboard.stripe.com/payments/${purchase.transaction_id || purchase.gateway_transaction_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#635BFF] hover:bg-[#7A73FF] rounded-lg transition-colors"
                title="Ver en Stripe"
              >
                <ExternalLink className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>
        )}

        {/* Invoice */}
        {purchase.invoice_number && (
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              <FileText className="w-3 h-3" />
              Número de Factura
            </div>
            <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-mono text-white mb-1">{purchase.invoice_number}</div>
                  <div className="text-xs text-gray-500">Factura generada</div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              
              {invoice?.invoice_pdf && (
                <div className="flex gap-2">
                  <a
                    href={invoice.invoice_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-xs font-medium text-white transition-colors text-center"
                  >
                    📄 Ver PDF
                  </a>
                  <a
                    href={invoice.invoice_pdf}
                    download
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-medium text-white transition-colors"
                    title="Descargar PDF"
                  >
                    ⬇️
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            <CreditCard className="w-3 h-3" />
            Método de Pago
          </div>
          
          <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              {/* Card Brand Icon */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                <CreditCard className="w-6 h-6 text-blue-400" />
              </div>
              
              <div className="flex-1">
                <div className="text-sm font-semibold text-white capitalize mb-1">
                  {paymentIntent?.payment_method_brand || 'Card'} •••• {paymentIntent?.payment_method_last4 || '****'}
                </div>
                <div className="text-xs text-gray-500">
                  {purchase.payment_method === 'stripe' ? 'Procesado por Stripe' : 'Método de pago'}
                </div>
              </div>
              
              {paymentIntent?.payment_status === 'succeeded' && (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
            </div>
          </div>
        </div>

        {/* Billing Address */}
        {(paymentIntent?.billing_address_line1 || paymentIntent?.billing_address_city) && (
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              <MapPin className="w-3 h-3" />
              Dirección de Facturación
            </div>
            <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4">
              <div className="text-sm text-white space-y-1">
                {paymentIntent.billing_address_line1 && (
                  <div>{paymentIntent.billing_address_line1}</div>
                )}
                {paymentIntent.billing_address_line2 && (
                  <div>{paymentIntent.billing_address_line2}</div>
                )}
                {paymentIntent.billing_address_city && (
                  <div>
                    {paymentIntent.billing_address_city}
                    {paymentIntent.billing_address_state && `, ${paymentIntent.billing_address_state}`}
                    {paymentIntent.billing_address_postal_code && ` ${paymentIntent.billing_address_postal_code}`}
                  </div>
                )}
                {paymentIntent.billing_address_country && (
                  <div className="text-gray-400">{paymentIntent.billing_address_country}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Receipt Email */}
        {purchase.customer_email && (
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              <Mail className="w-3 h-3" />
              Email de Recibo
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/30 border border-gray-700/30 rounded-xl">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">{purchase.customer_email}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

