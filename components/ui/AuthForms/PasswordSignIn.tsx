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
      'Sign in failed.': 'Error al iniciar sesión. Verifica tus credenciales.'
    };
    
    return translations[errorMsg] || errorMsg;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true); // Disable the button while the request is being handled
    await handleRequest(e, signInWithPassword, router);
    setIsSubmitting(false);
  };

  return (
    <div>
      <form
        noValidate={true}
        className="space-y-4"
        onSubmit={(e) => handleSubmit(e)}
      >
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold mb-1">Error al iniciar sesión</p>
              <p>{translateError(error)}</p>
            </div>
          </div>
        )}
        
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
