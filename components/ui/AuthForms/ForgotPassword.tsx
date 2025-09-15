'use client';

import Button from '@/components/ui/Button';
import Link from 'next/link';
import { requestPasswordUpdate } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Define prop type with allowEmail boolean
interface ForgotPasswordProps {
  allowEmail: boolean;
  redirectMethod: string;
  disableButton?: boolean;
}

export default function ForgotPassword({
  allowEmail,
  redirectMethod,
  disableButton
}: ForgotPasswordProps) {
  const router = redirectMethod === 'client' ? useRouter() : null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true); // Disable the button while the request is being handled
    await handleRequest(e, requestPasswordUpdate, router);
    setIsSubmitting(false);
  };

  return (
    <div>
      {/* Instructions */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-apidevs-primary/10 rounded-lg border border-blue-500/20">
        <p className="text-sm text-gray-300">
          📧 <strong>Recupera tu acceso:</strong> Ingresa tu email y te enviaremos un enlace seguro para restablecer tu contraseña.
        </p>
      </div>

      <form
        noValidate={true}
        className="space-y-4"
        onSubmit={(e) => handleSubmit(e)}
      >
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
            Email de tu cuenta
          </label>
          <input
            id="email"
            placeholder="tu@ejemplo.com"
            type="email"
            name="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            className="w-full p-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:border-apidevs-primary focus:ring-2 focus:ring-apidevs-primary/20 focus:outline-none transition-all"
          />
        </div>
        
        <Button
          variant="slim"
          type="submit"
          className="w-full mt-6 bg-gradient-to-r from-blue-500 to-apidevs-primary hover:from-apidevs-primary hover:to-blue-500 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
          loading={isSubmitting}
          disabled={disableButton}
        >
          {isSubmitting ? 'Enviando enlace...' : 'Enviar Enlace de Recuperación'}
        </Button>
      </form>
      
      <div className="mt-6 text-center space-y-3">
        <div className="pt-4 border-t border-gray-700">
          <p className="text-gray-400 text-sm mb-4">¿Recordaste tu contraseña?</p>
          <div className="space-y-2">
            <Link 
              href="/signin/password_signin" 
              className="block text-apidevs-primary hover:text-green-400 transition-colors text-sm font-medium"
            >
              Iniciar sesión con email y contraseña
            </Link>
            
            {allowEmail && (
              <Link 
                href="/signin/email_signin" 
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                Iniciar sesión con enlace mágico
              </Link>
            )}
            
            <div className="pt-3 border-t border-gray-700/50">
              <p className="text-gray-400 text-sm mb-2">¿No tienes cuenta?</p>
              <Link 
                href="/signin/signup" 
                className="text-apidevs-primary hover:text-green-400 transition-colors text-sm font-medium"
              >
                Crear cuenta gratis
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Security Note */}
      <div className="mt-6 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
        <p className="text-xs text-gray-400 text-center">
          🔒 <strong>Seguro:</strong> El enlace expirará en 1 hora por tu seguridad. Revisa tu carpeta de spam si no lo recibes.
        </p>
      </div>
    </div>
  );
}
