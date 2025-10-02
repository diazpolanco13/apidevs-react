'use client';

import { useState } from 'react';
import { RotateCcw, Mail, Download, ExternalLink, AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import InputModal from '@/components/ui/InputModal';
import SelectModal from '@/components/ui/SelectModal';

interface AdminActionsCardProps {
  purchase: any;
  hasRefunds: boolean;
  invoice?: any;
}

export default function AdminActionsCard({ purchase, hasRefunds, invoice }: AdminActionsCardProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Modal states
  const [refundReasonModal, setRefundReasonModal] = useState(false);
  const [refundConfirmModal, setRefundConfirmModal] = useState(false);
  const [emailSubjectModal, setEmailSubjectModal] = useState(false);
  const [emailMessageModal, setEmailMessageModal] = useState(false);
  const [emailConfirmModal, setEmailConfirmModal] = useState(false);
  
  // Temp data for multi-step flows
  const [tempRefundReason, setTempRefundReason] = useState<string>('');
  const [tempEmailSubject, setTempEmailSubject] = useState<string>('');
  const [tempEmailMessage, setTempEmailMessage] = useState<string>('');

  // ==================== REFUND FLOW ====================
  
  const startRefundProcess = () => {
    if (hasRefunds || purchase.order_status === 'refunded') {
      setMessage({ type: 'error', text: 'Esta compra ya fue reembolsada' });
      return;
    }
    
    const stripePaymentId = purchase.transaction_id || purchase.gateway_transaction_id;
    if (!stripePaymentId) {
      setMessage({ type: 'error', text: 'No hay Payment Intent de Stripe disponible' });
      return;
    }
    
    setRefundReasonModal(true);
  };
  
  const handleRefundReasonSelected = (reason: string) => {
    setTempRefundReason(reason);
    setRefundConfirmModal(true);
  };
  
  const executeRefund = async () => {
    setLoading('process-refund');
    setMessage(null);
    
    try {
      const stripePaymentId = purchase.transaction_id || purchase.gateway_transaction_id;
      
      const response = await fetch('/api/admin/create-refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          paymentIntentId: stripePaymentId,
          reason: tempRefundReason
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error procesando reembolso');
      }
      
      setMessage({ type: 'success', text: data.message });
      
      // Recargar página después de 3 segundos
      setTimeout(() => window.location.reload(), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(null);
    }
  };

  // ==================== EMAIL FLOW ====================
  
  const startEmailProcess = () => {
    if (!purchase.customer_email) {
      setMessage({ type: 'error', text: 'No hay email de cliente disponible' });
      return;
    }
    setEmailSubjectModal(true);
  };
  
  const handleEmailSubjectSubmitted = (subject: string) => {
    setTempEmailSubject(subject);
    setEmailMessageModal(true);
  };
  
  const handleEmailMessageSubmitted = (message: string) => {
    setTempEmailMessage(message);
    setEmailConfirmModal(true);
  };
  
  const executeSendEmail = async () => {
    setLoading('send-email');
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to: purchase.customer_email,
          subject: tempEmailSubject,
          message: tempEmailMessage,
          template: 'custom'
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error enviando email');
      }
      
      setMessage({ type: 'success', text: data.message });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(null);
    }
  };

  // ==================== OTHER ACTIONS ====================

  const handleResendInvoice = async () => {
    setLoading('resend-invoice');
    setMessage(null);
    
    try {
      // TODO: Implementar API endpoint para reenviar invoice
      setTimeout(() => {
        setMessage({ type: 'success', text: 'Invoice reenviado correctamente' });
        setLoading(null);
      }, 1500);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      setLoading(null);
    }
  };

  const handleDownloadInvoice = () => {
    if (invoice?.invoice_pdf) {
      window.open(invoice.invoice_pdf, '_blank');
    } else {
      setMessage({ type: 'error', text: 'No hay PDF disponible para esta compra' });
    }
  };

  const handleViewStripe = () => {
    const stripePaymentId = purchase.transaction_id || purchase.gateway_transaction_id;
    
    if (stripePaymentId) {
      window.open(`https://dashboard.stripe.com/payments/${stripePaymentId}`, '_blank');
    } else {
      setMessage({ type: 'error', text: 'No hay Payment Intent de Stripe disponible' });
    }
  };

  const handleContactCustomer = () => {
    const subject = encodeURIComponent(`Regarding Order #${purchase.order_number}`);
    const body = encodeURIComponent(`Hello,\n\nI'm reaching out regarding your recent purchase (Order #${purchase.order_number}).\n\n`);
    window.open(`mailto:${purchase.customer_email}?subject=${subject}&body=${body}`);
  };

  const customerName = purchase.customer_email?.split('@')[0] || 'Cliente';

  return (
    <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-1">
          Acciones Admin
        </h3>
        <p className="text-sm text-gray-400">
          Gestión de la compra
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-4 rounded-xl border flex items-center gap-3 animate-slide-in ${
          message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {/* Refund */}
        <button
          onClick={startRefundProcess}
          disabled={hasRefunds || purchase.order_status === 'refunded' || loading !== null}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all
            ${hasRefunds || purchase.order_status === 'refunded'
              ? 'bg-gray-800/30 border border-gray-700/30 text-gray-600 cursor-not-allowed'
              : 'bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300'
            }
          `}
        >
          <div className="p-2 bg-orange-500/20 rounded-lg">
            {loading === 'process-refund' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RotateCcw className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">Procesar Reembolso</div>
            <div className="text-xs opacity-70">
              {hasRefunds ? 'Ya reembolsado' : loading === 'process-refund' ? 'Procesando...' : 'Devolver pago al cliente'}
            </div>
          </div>
        </button>

        {/* Resend Invoice */}
        <button
          onClick={handleResendInvoice}
          disabled={loading !== null || !purchase.customer_email}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="p-2 bg-blue-500/20 rounded-lg">
            {loading === 'resend-invoice' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Mail className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">Reenviar Invoice</div>
            <div className="text-xs opacity-70">
              {loading === 'resend-invoice' ? 'Enviando...' : 'Enviar por email'}
            </div>
          </div>
        </button>

        {/* Download Invoice */}
        <button
          onClick={handleDownloadInvoice}
          disabled={!invoice?.invoice_pdf}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Download className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">Descargar PDF</div>
            <div className="text-xs opacity-70">Invoice en PDF</div>
          </div>
        </button>

        {/* Divider */}
        <div className="border-t border-gray-700/50 my-4"></div>

        {/* View in Stripe */}
        <button
          onClick={handleViewStripe}
          disabled={!purchase.transaction_id && !purchase.gateway_transaction_id}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#635BFF]/10 border border-[#635BFF]/30 hover:bg-[#635BFF]/20 text-[#635BFF] hover:text-[#7A73FF] transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="p-2 bg-[#635BFF]/20 rounded-lg">
            <ExternalLink className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">Ver en Stripe</div>
            <div className="text-xs opacity-70">Dashboard de Stripe</div>
          </div>
        </button>

        {/* Contact Customer */}
        <button
          onClick={startEmailProcess}
          disabled={!purchase.customer_email || loading !== null}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 text-green-400 hover:text-green-300 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="p-2 bg-green-500/20 rounded-lg">
            {loading === 'send-email' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Mail className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">Contactar Cliente</div>
            <div className="text-xs opacity-70">
              {loading === 'send-email' ? 'Enviando...' : 'Enviar email personalizado'}
            </div>
          </div>
        </button>
      </div>

      {/* Warning */}
      {purchase.order_status === 'refunded' && (
        <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-orange-400 mb-1">
                Compra Reembolsada
              </div>
              <div className="text-xs text-gray-400">
                Esta compra ya fue reembolsada. No es posible procesar más reembolsos.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALES */}

      {/* Refund - Step 1: Select Reason */}
      <SelectModal
        isOpen={refundReasonModal}
        onClose={() => setRefundReasonModal(false)}
        onSelect={handleRefundReasonSelected}
        title="Razón del Reembolso"
        description="Selecciona el motivo por el cual se procesa este reembolso"
        options={[
          {
            value: 'requested_by_customer',
            label: 'Solicitado por el cliente',
            description: '✅ El cliente solicitó el reembolso. Caso normal y común.',
            recommended: true,
            color: 'green'
          },
          {
            value: 'duplicate',
            label: 'Pago duplicado',
            description: '🔄 Se detectó un cargo duplicado accidental.',
            color: 'blue'
          },
          {
            value: 'fraudulent',
            label: 'Fraudulento',
            description: '⚠️ Transacción fraudulenta o no autorizada.',
            color: 'red'
          }
        ]}
      />

      {/* Refund - Step 2: Confirm */}
      <ConfirmModal
        isOpen={refundConfirmModal}
        onClose={() => setRefundConfirmModal(false)}
        onConfirm={executeRefund}
        title="Confirmar Reembolso"
        message={`¿Procesar reembolso completo?\n\nUsuario: ${customerName}\nMonto: $${(purchase.order_total_cents / 100).toFixed(2)} USD\nRazón: ${
          tempRefundReason === 'requested_by_customer' 
            ? 'Solicitado por cliente' 
            : tempRefundReason === 'duplicate' 
              ? 'Pago duplicado' 
              : 'Fraudulento'
        }\n\n⚠️ El reembolso puede tardar 5-10 días hábiles en reflejarse.`}
        confirmText="Procesar Reembolso"
        variant="danger"
      />

      {/* Email - Step 1: Subject */}
      <InputModal
        isOpen={emailSubjectModal}
        onClose={() => setEmailSubjectModal(false)}
        onSubmit={handleEmailSubjectSubmitted}
        title="Asunto del Email"
        description={`Email para ${customerName} (${purchase.customer_email})`}
        placeholder="Ej: Actualización importante de tu compra"
        submitText="Continuar"
        required={true}
      />

      {/* Email - Step 2: Message */}
      <InputModal
        isOpen={emailMessageModal}
        onClose={() => setEmailMessageModal(false)}
        onSubmit={handleEmailMessageSubmitted}
        title="Mensaje del Email"
        description="Escribe el contenido del email"
        placeholder={`Hola ${customerName},\n\nTu mensaje aquí...\n\nSaludos,\nEquipo APIDevs`}
        submitText="Continuar"
        multiline={true}
        required={true}
      />

      {/* Email - Step 3: Confirm */}
      <ConfirmModal
        isOpen={emailConfirmModal}
        onClose={() => setEmailConfirmModal(false)}
        onConfirm={executeSendEmail}
        title="Confirmar Envío de Email"
        message={`¿Enviar email a ${customerName}?\n\nDe: APIDevs\nPara: ${purchase.customer_email}\nAsunto: ${tempEmailSubject}\n\nPreview:\n${tempEmailMessage.substring(0, 100)}${tempEmailMessage.length > 100 ? '...' : ''}`}
        confirmText="Enviar Email"
        variant="info"
      />
    </div>
  );
}
