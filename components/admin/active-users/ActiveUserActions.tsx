'use client';

import { useState } from 'react';
import { Shield, Lock, Ban, DollarSign, Mail, AlertTriangle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import InputModal from '@/components/ui/InputModal';
import SelectModal from '@/components/ui/SelectModal';

interface ActiveUserActionsProps {
  userId: string;
  userEmail: string;
  userName: string;
  subscriptionId?: string | null;
  paymentIntents?: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    created: string;
  }>;
}

export default function ActiveUserActions({
  userId,
  userEmail,
  userName,
  subscriptionId,
  paymentIntents = []
}: ActiveUserActionsProps) {
  
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Modal states
  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [cancelTypeModal, setCancelTypeModal] = useState(false);
  const [cancelReasonModal, setCancelReasonModal] = useState(false);
  const [cancelConfirmModal, setCancelConfirmModal] = useState(false);
  const [refundSelectModal, setRefundSelectModal] = useState(false);
  const [refundReasonModal, setRefundReasonModal] = useState(false);
  const [refundConfirmModal, setRefundConfirmModal] = useState(false);
  const [emailSubjectModal, setEmailSubjectModal] = useState(false);
  const [emailMessageModal, setEmailMessageModal] = useState(false);
  const [emailConfirmModal, setEmailConfirmModal] = useState(false);
  
  // Temp data for multi-step flows
  const [tempCancelType, setTempCancelType] = useState<string>('');
  const [tempCancelReason, setTempCancelReason] = useState<string>('');
  const [tempRefundPayment, setTempRefundPayment] = useState<any>(null);
  const [tempRefundReason, setTempRefundReason] = useState<string>('');
  const [tempRefundAmount, setTempRefundAmount] = useState<string>('');
  const [tempEmailTemplate, setTempEmailTemplate] = useState<string>('');
  const [tempEmailSubject, setTempEmailSubject] = useState<string>('');
  const [tempEmailMessage, setTempEmailMessage] = useState<string>('');
  
  // Reset Password
  const executeResetPassword = async () => {
    setLoading('reset-password');
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail })
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
  
  // Cancel Subscription - Multi-step flow
  const startCancelSubscription = () => {
    if (!subscriptionId) {
      setMessage({ type: 'error', text: 'No hay suscripción activa' });
      return;
    }
    setCancelTypeModal(true);
  };
  
  const handleCancelTypeSelected = (type: string) => {
    setTempCancelType(type);
    setCancelReasonModal(true);
  };
  
  const handleCancelReasonSubmitted = (reason: string) => {
    setTempCancelReason(reason);
    setCancelConfirmModal(true);
  };
  
  const executeCancelSubscription = async () => {
    setLoading('cancel-subscription');
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subscriptionId, 
          reason: tempCancelReason, 
          cancelType: tempCancelType 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error cancelando suscripción');
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
  
  // Process Refund - Multi-step flow
  const startRefundProcess = () => {
    const successfulPayments = paymentIntents.filter(pi => pi.status === 'succeeded');
    
    if (successfulPayments.length === 0) {
      setMessage({ type: 'error', text: 'No hay pagos exitosos para reembolsar' });
      return;
    }
    
    setRefundSelectModal(true);
  };
  
  const handleRefundPaymentSelected = (paymentId: string) => {
    const payment = paymentIntents.find((pi: any) => pi.id === paymentId);
    setTempRefundPayment(payment);
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
      const response = await fetch('/api/admin/create-refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          paymentIntentId: tempRefundPayment.id,
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
  
  // Send Email - Multi-step flow
  const startEmailProcess = () => {
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
          to: userEmail,
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
      if (data.note) {
        setTimeout(() => {
          setMessage({ type: 'success', text: data.note });
        }, 2000);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(null);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-red-400" />
          <h2 className="text-xl font-bold text-white">Acciones Administrativas</h2>
        </div>
        <p className="text-gray-400 text-sm">
          Gestión de cuenta, suscripciones y acciones críticas para <span className="text-white font-semibold">{userName}</span>
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-xl border ${
          message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        } flex items-center gap-3 animate-slide-in`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reset Password */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/30 rounded-xl p-5 hover:scale-[1.02] transition-all">
          <Lock className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Restablecer Contraseña</h3>
          <p className="text-sm text-gray-400 mb-4">
            Enviar email de recuperación a {userEmail}
          </p>
          <button 
            onClick={() => setResetPasswordModal(true)}
            disabled={loading !== null}
            className="w-full px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 text-sm hover:bg-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading === 'reset-password' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Email'
            )}
          </button>
        </div>

        {/* Cancel Subscription */}
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl border border-orange-500/30 rounded-xl p-5 hover:scale-[1.02] transition-all">
          <Ban className="w-8 h-8 text-orange-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Cancelar Suscripción</h3>
          <p className="text-sm text-gray-400 mb-4">
            {subscriptionId ? '2 tipos: Inmediata o al final del período' : 'Sin suscripción activa'}
          </p>
          <button 
            onClick={startCancelSubscription}
            disabled={loading !== null || !subscriptionId}
            className="w-full px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg border border-orange-500/30 text-sm hover:bg-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading === 'cancel-subscription' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cancelando...
              </>
            ) : (
              'Seleccionar Tipo'
            )}
          </button>
        </div>

        {/* Process Refund */}
        <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-xl border border-red-500/30 rounded-xl p-5 hover:scale-[1.02] transition-all">
          <DollarSign className="w-8 h-8 text-red-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Procesar Reembolso</h3>
          <p className="text-sm text-gray-400 mb-4">
            {paymentIntents.filter(pi => pi.status === 'succeeded').length} pagos disponibles
          </p>
          <button 
            onClick={startRefundProcess}
            disabled={loading !== null || paymentIntents.filter(pi => pi.status === 'succeeded').length === 0}
            className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 text-sm hover:bg-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading === 'process-refund' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando...
              </>
            ) : (
              'Seleccionar Pago'
            )}
          </button>
        </div>

        {/* Send Email */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 rounded-xl p-5 hover:scale-[1.02] transition-all">
          <Mail className="w-8 h-8 text-purple-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Enviar Email</h3>
          <p className="text-sm text-gray-400 mb-4">
            Comunicación directa con {userName}
          </p>
          <button 
            onClick={startEmailProcess}
            disabled={loading !== null}
            className="w-full px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30 text-sm hover:bg-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading === 'send-email' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Escribir Email'
            )}
          </button>
        </div>
      </div>

      {/* Warning Message */}
      <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              ⚠️ Acciones Críticas - Usar con Precaución
            </h3>
            <p className="text-gray-400 text-sm mb-2">
              Estas acciones son <strong className="text-white">irreversibles</strong> y afectan directamente la experiencia del usuario:
            </p>
            <ul className="text-sm text-gray-400 space-y-1 ml-4">
              <li>• <strong className="text-white">Reset de contraseña:</strong> El usuario recibirá un email y deberá crear una nueva contraseña</li>
              <li>• <strong className="text-white">Cancelar suscripción:</strong>
                <ul className="ml-4 mt-1 space-y-0.5">
                  <li className="text-orange-400">- Inmediata: Pierde acceso ahora (solo casos graves)</li>
                  <li className="text-green-400">- Al final del período: Mantiene acceso hasta vencimiento (recomendado)</li>
                </ul>
              </li>
              <li>• <strong className="text-white">Reembolsos:</strong> Procesados a través de Stripe, pueden tardar 5-10 días hábiles</li>
              <li>• <strong className="text-white">Emails:</strong> Serán enviados desde la cuenta oficial de APIDevs</li>
            </ul>
          </div>
        </div>
      </div>

      {/* MODALES PERSONALIZADOS */}
      
      {/* Reset Password Modal */}
      <ConfirmModal
        isOpen={resetPasswordModal}
        onClose={() => setResetPasswordModal(false)}
        onConfirm={executeResetPassword}
        title="Restablecer Contraseña"
        message={`¿Enviar email de recuperación a:\n\n${userEmail}?`}
        confirmText="Enviar Email"
        variant="info"
      />

      {/* Cancel Subscription - Step 1: Select Type */}
      <SelectModal
        isOpen={cancelTypeModal}
        onClose={() => setCancelTypeModal(false)}
        onSelect={handleCancelTypeSelected}
        title="Tipo de Cancelación"
        description="Selecciona cómo procesar la cancelación de la suscripción"
        options={[
          {
            value: 'end_of_period',
            label: 'Al final del período',
            description: '✅ El usuario mantiene acceso hasta que expire el período pagado. Recomendado para cancelaciones normales.',
            recommended: true,
            color: 'green'
          },
          {
            value: 'immediate',
            label: 'Inmediata',
            description: '⚠️ El usuario pierde acceso AHORA. Solo para casos graves: fraude, violación de términos, abuso.',
            color: 'red'
          }
        ]}
      />

      {/* Cancel Subscription - Step 2: Reason */}
      <InputModal
        isOpen={cancelReasonModal}
        onClose={() => setCancelReasonModal(false)}
        onSubmit={handleCancelReasonSubmitted}
        title="Razón de Cancelación"
        description="Especifica el motivo de la cancelación (opcional)"
        placeholder="Ej: Solicitud del usuario, fraude detectado, etc."
        submitText="Continuar"
        required={false}
      />

      {/* Cancel Subscription - Step 3: Confirm */}
      <ConfirmModal
        isOpen={cancelConfirmModal}
        onClose={() => setCancelConfirmModal(false)}
        onConfirm={executeCancelSubscription}
        title="Confirmar Cancelación"
        message={`¿Cancelar suscripción de ${userName}?\n\nTipo: ${
          tempCancelType === 'immediate'
            ? '⚠️ INMEDIATA (pierde acceso ahora)'
            : '✅ Al final del período (mantiene acceso)'
        }\nRazón: ${tempCancelReason || 'No especificada'}\n\n⚠️ Esta acción no se puede deshacer.`}
        confirmText="Confirmar Cancelación"
        variant={tempCancelType === 'immediate' ? 'danger' : 'warning'}
      />

      {/* Refund - Step 1: Select Payment */}
      <SelectModal
        isOpen={refundSelectModal}
        onClose={() => setRefundSelectModal(false)}
        onSelect={handleRefundPaymentSelected}
        title="Seleccionar Pago a Reembolsar"
        description="Elige el payment intent que deseas reembolsar"
        options={paymentIntents
          .filter((pi: any) => pi.status === 'succeeded')
          .map((pi: any) => ({
            value: pi.id,
            label: `$${(pi.amount / 100).toFixed(2)} ${(pi.currency || 'USD').toUpperCase()}`,
            description: `Payment Intent: ${pi.id}\nFecha: ${new Date(pi.created).toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}\nMétodo: ${pi.payment_method_types?.join(', ') || 'N/A'}`,
            color: 'blue'
          }))}
      />

      {/* Refund - Step 2: Select Reason */}
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

      {/* Refund - Step 3: Confirm */}
      <ConfirmModal
        isOpen={refundConfirmModal}
        onClose={() => setRefundConfirmModal(false)}
        onConfirm={executeRefund}
        title="Confirmar Reembolso"
        message={tempRefundPayment ? `¿Procesar reembolso completo?\n\nUsuario: ${userName}\nMonto: $${(tempRefundPayment.amount / 100).toFixed(2)} ${(tempRefundPayment.currency || 'USD').toUpperCase()}\nRazón: ${
          tempRefundReason === 'requested_by_customer' 
            ? 'Solicitado por cliente' 
            : tempRefundReason === 'duplicate' 
              ? 'Pago duplicado' 
              : 'Fraudulento'
        }\n\n⚠️ El reembolso puede tardar 5-10 días hábiles en reflejarse.` : ''}
        confirmText="Procesar Reembolso"
        variant="danger"
      />

      {/* Email - Step 1: Subject */}
      <InputModal
        isOpen={emailSubjectModal}
        onClose={() => setEmailSubjectModal(false)}
        onSubmit={handleEmailSubjectSubmitted}
        title="Asunto del Email"
        description={`Email para ${userName} (${userEmail})`}
        placeholder="Ej: Actualización importante de tu cuenta"
        submitText="Continuar"
        required={true}
      />

      {/* Email - Step 2: Message */}
      <InputModal
        isOpen={emailMessageModal}
        onClose={() => setEmailMessageModal(false)}
        onSubmit={handleEmailMessageSubmitted}
        title="Mensaje del Email"
        description="Escribe el contenido del email (soporta HTML básico)"
        placeholder={`Hola ${userName},\n\nTu mensaje aquí...\n\nSaludos,\nEquipo APIDevs`}
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
        message={`¿Enviar email a ${userName}?\n\nDe: APIDevs\nPara: ${userEmail}\nAsunto: ${tempEmailSubject}\n\nPreview:\n${tempEmailMessage.substring(0, 100)}${tempEmailMessage.length > 100 ? '...' : ''}`}
        confirmText="Enviar Email"
        variant="info"
      />
    </div>
  );
}
