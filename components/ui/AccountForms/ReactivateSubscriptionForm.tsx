'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface ReactivateSubscriptionFormProps {
  subscriptionId: string;
  onSuccess?: () => void;
}

export default function ReactivateSubscriptionForm({ 
  subscriptionId, 
  onSuccess 
}: ReactivateSubscriptionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleReactivate = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/stripe/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: '¡Suscripción reactivada exitosamente! Tu plan continuará renovándose automáticamente.',
        });
        
        // Recargar la página después de un breve delay para mostrar el mensaje
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Error al reactivar la suscripción. Por favor, inténtalo de nuevo.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error de conexión. Por favor, verifica tu conexión e inténtalo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1">
      <button
        onClick={handleReactivate}
        disabled={isLoading}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-2xl transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed text-center flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            Reactivando...
          </>
        ) : (
          <>
            <RefreshCw className="w-5 h-5" />
            Reactivar Suscripción
          </>
        )}
      </button>

      {/* Mensaje de estado */}
      {message && (
        <div className={`mt-3 p-3 rounded-lg flex items-start gap-2 ${
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}
    </div>
  );
}
