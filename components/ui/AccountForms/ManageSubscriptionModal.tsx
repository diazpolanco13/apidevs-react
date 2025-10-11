'use client';

import { useState } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface FeedbackData {
  subscription_id: string;
  reason: string;
  feedback: string;
  action: string;
  created_at: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subscription: any;
}

const CANCELLATION_REASONS = [
  { value: 'too_expensive', label: 'Es muy costoso' },
  { value: 'not_using', label: 'No lo estoy usando' },
  { value: 'missing_features', label: 'Faltan funcionalidades que necesito' },
  { value: 'switching_competitor', label: 'Cambié a un competidor' },
  { value: 'technical_issues', label: 'Problemas técnicos' },
  { value: 'temporary_pause', label: 'Solo quiero pausar temporalmente' },
  { value: 'other', label: 'Otro motivo' }
];

export default function ManageSubscriptionModal({ isOpen, onClose, subscription }: Props) {
  const [step, setStep] = useState<'options' | 'cancel_confirm' | 'cancel_feedback' | 'success'>('options');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCancel = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const supabase = createClient();
      
      // Guardar feedback de cancelación
      if (selectedReason || feedback) {
        const feedbackData: FeedbackData = {
          subscription_id: subscription.id,
          reason: selectedReason,
          feedback: feedback,
          action: 'cancel',
          created_at: new Date().toISOString()
        };
        
        await (supabase as any).from('subscription_feedback').insert(feedbackData);
      }

      // Llamar a Stripe para cancelar
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription.stripe_subscription_id
        })
      });

      if (!response.ok) {
        throw new Error('Error al cancelar la suscripción');
      }

      setStep('success');
    } catch (err: any) {
      console.error('Error canceling subscription:', err);
      setError(err.message || 'Error al procesar la cancelación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenPortal = async () => {
    try {
      const response = await fetch('/api/stripe/customer-portal?return_url=' + encodeURIComponent('/account/suscripcion'), {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No se recibió URL del portal');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al abrir el portal');
      }
    } catch (error: any) {
      console.error('Error opening portal:', error);
      setError(error.message || 'Error al abrir el portal');
    }
  };

  const handleDownloadInvoices = async () => {
    try {
      const response = await fetch('/api/stripe/customer-portal?return_url=' + encodeURIComponent('/account/suscripcion'), {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No se recibió URL del portal');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al acceder a las facturas');
      }
    } catch (error: any) {
      console.error('Error accessing invoices:', error);
      setError(error.message || 'Error al acceder a las facturas');
    }
  };

  const handleClose = () => {
    setStep('options');
    setSelectedReason('');
    setFeedback('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">
            {step === 'options' && 'Gestionar Suscripción'}
            {step === 'cancel_confirm' && 'Confirmar Cancelación'}
            {step === 'cancel_feedback' && 'Ayúdanos a Mejorar'}
            {step === 'success' && '¡Listo!'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-700/30 rounded-xl">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Options */}
          {step === 'options' && (
            <div className="space-y-4">
              <p className="text-gray-400 mb-6">
                ¿Qué te gustaría hacer con tu suscripción?
              </p>

              {/* Opción: Cancelar */}
              <button
                onClick={() => setStep('cancel_confirm')}
                className="w-full p-4 bg-red-900/20 hover:bg-red-900/30 border border-red-700/30 rounded-xl text-left transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/30 transition-colors">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">Cancelar Suscripción</h3>
                    <p className="text-sm text-gray-400">
                      Cancela tu suscripción. Seguirás teniendo acceso hasta el final del período de facturación.
                    </p>
                  </div>
                </div>
              </button>

              {/* Opción: Actualizar método de pago */}
              <button
                onClick={() => handleOpenPortal()}
                className="w-full p-4 bg-blue-900/20 hover:bg-blue-900/30 border border-blue-700/30 rounded-xl text-left transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/30 transition-colors">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">Actualizar Método de Pago</h3>
                    <p className="text-sm text-gray-400">
                      Cambia tu tarjeta o método de pago actual.
                    </p>
                  </div>
                </div>
              </button>

              {/* Opción: Ver Facturas */}
              <button
                onClick={() => handleDownloadInvoices()}
                className="w-full p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/30 rounded-xl text-left transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-gray-700/70 transition-colors">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">Descargar Facturas</h3>
                    <p className="text-sm text-gray-400">
                      Accede a todas tus facturas y recibos.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: Confirmar Cancelación */}
          {step === 'cancel_confirm' && (
            <div className="space-y-6">
              <div className="p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-xl">
                <div className="flex gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-yellow-400 font-semibold mb-2">Antes de continuar</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Perderás acceso a todos los indicadores premium</li>
                      <li>• No podrás recibir alertas en tiempo real</li>
                      <li>• Tu suscripción se mantendrá activa hasta: <span className="font-semibold text-white">
                        {new Date(subscription.current_period_end).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('options')}
                  className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Volver
                </button>
                <button
                  onClick={() => setStep('cancel_feedback')}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-colors"
                >
                  Continuar con Cancelación
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Feedback de Cancelación */}
          {step === 'cancel_feedback' && (
            <div className="space-y-6">
              <p className="text-gray-400">
                Tu opinión es muy importante. ¿Podrías decirnos por qué cancelas?
              </p>

              <div className="space-y-2">
                {CANCELLATION_REASONS.map((reason) => (
                  <label
                    key={reason.value}
                    className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                      selectedReason === reason.value
                        ? 'bg-apidevs-primary/10 border-apidevs-primary'
                        : 'bg-gray-800/30 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="w-4 h-4 text-apidevs-primary"
                    />
                    <span className="text-white">{reason.label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  ¿Algo más que quieras compartir? (opcional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-apidevs-primary"
                  placeholder="Cuéntanos más sobre tu experiencia..."
                />
              </div>

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('cancel_confirm')}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800/50 text-white font-semibold rounded-xl transition-colors"
                >
                  Volver
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-800/50 text-white font-semibold rounded-xl transition-colors"
                >
                  {isSubmitting ? 'Cancelando...' : 'Confirmar Cancelación'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Suscripción Cancelada
              </h3>
              <p className="text-gray-400 mb-6">
                Tu suscripción ha sido cancelada. Seguirás teniendo acceso hasta el{' '}
                <span className="font-semibold text-white">
                  {new Date(subscription.current_period_end).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-apidevs-primary hover:bg-green-400 text-black font-semibold rounded-xl transition-colors"
              >
                Entendido
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

