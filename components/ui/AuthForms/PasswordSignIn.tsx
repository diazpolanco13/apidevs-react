'use client';

import Button from '@/components/ui/Button';
import Link from 'next/link';
import { signInWithPassword } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

// Define prop type with allowEmail boolean
interface PasswordSignInProps {
  allowEmail: boolean;
  redirectMethod: string;
  error?: string;
}

export default function PasswordSignIn({
  allowEmail,
  redirectMethod,
  error
}: PasswordSignInProps) {
  const router = redirectMethod === 'client' ? useRouter() : null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Traducir errores al español
  const translateError = (errorMsg: string) => {
    const translations: { [key: string]: string } = {
      'Invalid login credentials': 'Email o contraseña incorrectos',
      'Email not confirmed': 'Debes confirmar tu email antes de iniciar sesión',
      'Invalid email': 'Email inválido',
      'User not found': 'Usuario no encontrado',
      'Sign in failed.': 'Error al iniciar sesión. Verifica tus credenciales.',
      'Request rate limit reached': '⏰ Demasiados intentos. Por favor espera 15 minutos e intenta nuevamente.',
      'over_request_rate_limit': '⏰ Demasiados intentos. Por favor espera 15 minutos e intenta nuevamente.'
    };
    
    // Check if error message contains rate limit keywords
    if (errorMsg.toLowerCase().includes('rate limit') || errorMsg.toLowerCase().includes('too many')) {
      return '⏰ Demasiados intentos de inicio de sesión. Por favor espera 15-60 minutos e intenta nuevamente. Si el problema persiste, contacta a soporte.';
    }
    
    return translations[errorMsg] || errorMsg;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true); // Disable the button while the request is being handled
    await handleRequest(e, signInWithPassword, router);
    setIsSubmitting(false);
  };

  return (
    <div>
      {/* Error Message - Inline */}
      {error && (
        <div className="mb-4 p-4 bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-xl border border-red-500/50 rounded-lg animate-slide-in">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-red-100 font-medium text-sm leading-relaxed">
                {translateError(error)}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                // Ocultar mensaje (requiere recargar para mostrarlo de nuevo)
                const url = new URL(window.location.href);
                url.searchParams.delete('error');
                url.searchParams.delete('error_description');
                window.history.replaceState({}, '', url.toString());
                window.location.reload();
              }}
              className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <form
        noValidate={true}
        className="space-y-4"
        onSubmit={(e) => handleSubmit(e)}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
              Email
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
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              placeholder="Tu contraseña"
              type="password"
              name="password"
              autoComplete="current-password"
              className="w-full p-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:border-apidevs-primary focus:ring-2 focus:ring-apidevs-primary/20 focus:outline-none transition-all"
            />
          </div>
        </div>
        
        <Button
          variant="slim"
          type="submit"
          className="w-full mt-6 bg-gradient-to-r from-apidevs-primary to-green-400 hover:from-green-400 hover:to-apidevs-primary text-black font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
          loading={isSubmitting}
        >
          {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </form>
      
      <div className="mt-6 text-center space-y-3">
        <Link 
          href="/signin/forgot_password" 
          className="block text-apidevs-primary hover:text-green-400 transition-colors text-sm font-medium"
        >
          ¿Olvidaste tu contraseña?
        </Link>
        
        {allowEmail && (
          <Link 
            href="/signin/email_signin" 
            className="block text-gray-300 hover:text-white transition-colors text-sm"
          >
            Inicia sesión con enlace mágico
          </Link>
        )}
        
        <div className="pt-4 border-t border-gray-700">
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
  );
}
