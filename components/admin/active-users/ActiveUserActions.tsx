'use client';

import { useState } from 'react';
import { Shield, Lock, Ban, DollarSign, Mail, AlertTriangle, Loader2, CheckCircle, XCircle } from 'lucide-react';

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
  
  // Reset Password
  const handleResetPassword = async () => {
    if (!confirm(`¿Enviar email de recuperación a ${userEmail}?`)) return;
    
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
  
  // Cancel Subscription
  const handleCancelSubscription = async () => {
    if (!subscriptionId) {
      setMessage({ type: 'error', text: 'No hay suscripción activa' });
      return;
    }
    
    // Seleccionar tipo de cancelación
    const cancelType = prompt(
      `Tipo de cancelación:\n\n` +
      `1 = INMEDIATA (pierde acceso ahora - casos graves)\n` +
      `2 = AL FINAL DEL PERÍODO (mantiene acceso hasta vencimiento)\n\n` +
      `Escribe el número (2 recomendado):`
    );
    
    if (!cancelType) return;
    
    const cancelTypeMap: Record<string, string> = {
      '1': 'immediate',
      '2': 'end_of_period'
    };
    
    const selectedType = cancelTypeMap[cancelType] || 'end_of_period';
    const typeText = selectedType === 'immediate' 
      ? '⚠️ INMEDIATA (pierde acceso ahora)' 
      : '✅ Al final del período (mantiene acceso)';
    
    const reason = prompt('Razón de cancelación (opcional):');
    if (reason === null) return;
    
    if (!confirm(
      `¿Cancelar suscripción de ${userName}?\n\n` +
      `Tipo: ${typeText}\n` +
      `Razón: ${reason || 'No especificada'}\n\n` +
      `Esta acción no se puede deshacer.`
    )) return;
    
    setLoading('cancel-subscription');
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId, reason, cancelType: selectedType })
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
  
  // Process Refund
  const handleProcessRefund = async () => {
    const successfulPayments = paymentIntents.filter(pi => pi.status === 'succeeded');
    
    if (successfulPayments.length === 0) {
      setMessage({ type: 'error', text: 'No hay pagos exitosos para reembolsar' });
      return;
    }
    
    // Mostrar lista de pagos
    const paymentList = successfulPayments
      .map((pi, i) => `${i + 1}. $${(pi.amount / 100).toFixed(2)} ${pi.currency.toUpperCase()} - ${pi.id}`)
      .join('\n');
    
    const selection = prompt(`Selecciona el pago a reembolsar (número):\n\n${paymentList}`);
    if (!selection) return;
    
    const index = parseInt(selection) - 1;
    if (isNaN(index) || index < 0 || index >= successfulPayments.length) {
      setMessage({ type: 'error', text: 'Selección inválida' });
      return;
    }
    
    const selectedPayment = successfulPayments[index];
    
    const reason = prompt('Razón del reembolso:\n1. duplicate\n2. fraudulent\n3. requested_by_customer\n\nEscribe el número:');
    const reasonMap: Record<string, string> = {
      '1': 'duplicate',
      '2': 'fraudulent',
      '3': 'requested_by_customer'
    };
    
    if (!confirm(`¿Reembolsar $${(selectedPayment.amount / 100).toFixed(2)} ${selectedPayment.currency.toUpperCase()} a ${userName}?`)) return;
    
    setLoading('process-refund');
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/create-refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          paymentIntentId: selectedPayment.id,
          reason: reasonMap[reason || '3'] || 'requested_by_customer'
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error procesando reembolso');
      }
      
      setMessage({ type: 'success', text: data.message });
      
      // Recargar página después de 2 segundos
      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(null);
    }
  };
  
  // Send Email
  const handleSendEmail = async () => {
    const subject = prompt(`Asunto del email para ${userName}:`);
    if (!subject) return;
    
    const message = prompt('Mensaje (puede incluir HTML):');
    if (!message) return;
    
    if (!confirm(`¿Enviar email a ${userEmail}?`)) return;
    
    setLoading('send-email');
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to: userEmail,
          subject,
          message,
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
            onClick={handleResetPassword}
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
            onClick={handleCancelSubscription}
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
            onClick={handleProcessRefund}
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
            onClick={handleSendEmail}
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
    </div>
  );
}
