'use client';

import { RotateCcw, AlertCircle, Calendar, DollarSign } from 'lucide-react';

interface RefundsCardProps {
  refunds: any[];
  purchase: any;
}

export default function RefundsCard({ refunds, purchase }: RefundsCardProps) {
  const totalRefunded = purchase.refund_amount_cents / 100;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReasonLabel = (reason: string) => {
    const reasons: { [key: string]: string } = {
      'requested_by_customer': 'Solicitado por el cliente',
      'duplicate': 'Pago duplicado',
      'fraudulent': 'Fraudulento',
      'other': 'Otro'
    };
    return reasons[reason] || reason;
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { label: string; color: string } } = {
      succeeded: { label: 'Procesado', color: 'bg-green-500/20 text-green-400' },
      pending: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-400' },
      failed: { label: 'Fallido', color: 'bg-red-500/20 text-red-400' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-orange-500/20">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30">
            <RotateCcw className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              Reembolsos
            </h3>
            <p className="text-sm text-gray-400">
              {refunds.length} reembolso{refunds.length !== 1 ? 's' : ''} procesado{refunds.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">Total Reembolsado</div>
          <div className="text-xl font-bold text-orange-400">
            ${totalRefunded.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Refunds List */}
      <div className="space-y-4">
        {refunds.length > 0 ? (
          refunds.map((refund, index) => (
            <div 
              key={refund.id || index}
              className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-orange-400" />
                    <span className="text-lg font-bold text-white">
                      ${((refund.refund_amount_cents || 0) / 100).toFixed(2)}
                    </span>
                  </div>
                  
                  {refund.refund_reason && (
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{getReasonLabel(refund.refund_reason)}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(refund.created_at)}</span>
                  </div>
                </div>

                <div>
                  {getStatusBadge(refund.payment_status || 'succeeded')}
                </div>
              </div>

              {refund.stripe_payment_intent_id && (
                <div className="pt-3 border-t border-gray-700/30">
                  <div className="text-xs text-gray-500 mb-1">Refund ID</div>
                  <code className="text-xs font-mono text-gray-400 break-all">
                    {refund.stripe_payment_intent_id}
                  </code>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <RotateCcw className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay reembolsos registrados</p>
          </div>
        )}
      </div>
    </div>
  );
}

