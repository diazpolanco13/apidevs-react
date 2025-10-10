'use client';

import { Package, Calendar, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { formatDateLong } from '@/utils/formatDate';

interface PurchaseInfoCardProps {
  purchase: any;
}

export default function PurchaseInfoCard({ purchase }: PurchaseInfoCardProps) {
  // Status badge
  const getStatusBadge = (status: string) => {
    const badges = {
      completed: { 
        icon: CheckCircle, 
        label: 'Completado', 
        color: 'text-green-400 bg-green-500/10 border-green-500/30' 
      },
      pending: { 
        icon: Clock, 
        label: 'Pendiente', 
        color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' 
      },
      refunded: { 
        icon: AlertCircle, 
        label: 'Reembolsado', 
        color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' 
      },
      failed: { 
        icon: XCircle, 
        label: 'Fallido', 
        color: 'text-red-400 bg-red-500/10 border-red-500/30' 
      }
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${badge.color}`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    );
  };

  // Payment status badge
  const getPaymentStatusBadge = (status: string) => {
    const badges = {
      paid: { label: 'Pagado', color: 'bg-green-500/20 text-green-400' },
      pending: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-400' },
      failed: { label: 'Fallido', color: 'bg-red-500/20 text-red-400' }
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;

    return (
      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };


  return (
    <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
            <Package className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              Información de la Compra
            </h3>
            <p className="text-sm text-gray-400">
              Order #{purchase.order_number}
            </p>
          </div>
        </div>
        
        {getStatusBadge(purchase.order_status)}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Number */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Número de Orden
          </div>
          <div className="text-base font-mono font-medium text-white">
            {purchase.order_number}
          </div>
        </div>

        {/* Transaction ID */}
        {(purchase.transaction_id || purchase.gateway_transaction_id) && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Payment Intent ID
            </div>
            <div className="text-sm font-mono text-gray-300 break-all">
              {purchase.transaction_id || purchase.gateway_transaction_id}
            </div>
          </div>
        )}

        {/* Fecha */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Fecha de Compra
          </div>
          <div className="flex items-center gap-2 text-sm text-white">
            <Calendar className="w-4 h-4 text-gray-400" />
            {formatDateLong(purchase.created_at)}
          </div>
        </div>

        {/* Payment Status */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Estado de Pago
          </div>
          <div>
            {getPaymentStatusBadge(purchase.payment_status || 'paid')}
          </div>
        </div>

        {/* Payment Method */}
        {purchase.payment_method && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Método de Pago
            </div>
            <div className="text-sm text-white capitalize">
              {purchase.payment_method === 'stripe' ? 'Stripe' : purchase.payment_method}
            </div>
          </div>
        )}

        {/* Invoice Number */}
        {purchase.invoice_number && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Número de Factura
            </div>
            <div className="text-sm font-mono text-white">
              {purchase.invoice_number}
            </div>
          </div>
        )}
      </div>

      {/* Timeline de Estados */}
      <div className="mt-6 pt-6 border-t border-gray-700/50">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Timeline de Estados
        </div>
        
        <div className="relative">
          {/* Line connector */}
          <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-green-500 to-gray-700"></div>
          
          <div className="space-y-4 relative">
            {/* Created */}
            <div className="flex items-start gap-3 pl-6">
              <div className="w-4 h-4 rounded-full bg-green-500 border-4 border-gray-900 absolute left-0"></div>
              <div>
                <div className="text-sm font-medium text-white">Orden Creada</div>
                <div className="text-xs text-gray-500">
                  {formatDateLong(purchase.created_at)}
                </div>
              </div>
            </div>

            {/* Processing */}
            {purchase.order_status !== 'pending' && (
              <div className="flex items-start gap-3 pl-6">
                <div className="w-4 h-4 rounded-full bg-blue-500 border-4 border-gray-900 absolute left-0"></div>
                <div>
                  <div className="text-sm font-medium text-white">Procesando</div>
                  <div className="text-xs text-gray-500">
                    {formatDateLong(purchase.created_at)}
                  </div>
                </div>
              </div>
            )}

            {/* Completed */}
            {purchase.order_status === 'completed' && (
              <div className="flex items-start gap-3 pl-6">
                <div className="w-4 h-4 rounded-full bg-green-500 border-4 border-gray-900 absolute left-0"></div>
                <div>
                  <div className="text-sm font-medium text-white">Completado</div>
                  <div className="text-xs text-gray-500">
                    {formatDateLong(purchase.order_date || purchase.created_at)}
                  </div>
                </div>
              </div>
            )}

            {/* Refunded (si aplica) */}
            {(purchase.refund_amount_cents > 0) && (
              <div className="flex items-start gap-3 pl-6">
                <div className="w-4 h-4 rounded-full bg-orange-500 border-4 border-gray-900 absolute left-0"></div>
                <div>
                  <div className="text-sm font-medium text-orange-400">Reembolsado</div>
                  <div className="text-xs text-gray-500">
                    {(purchase.refund_amount_cents / 100).toFixed(2)} USD
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

