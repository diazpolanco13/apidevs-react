'use client';

import Button from '@/components/ui/Button';
import Link from 'next/link';
import { signInWithEmail } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Define prop type with allowPassword boolean
interface EmailSignInProps {
  allowPassword: boolean;
  redirectMethod: string;
  disableButton?: boolean;
}

export default function EmailSignIn({
  allowPassword,
  redirectMethod,
  disableButton
}: EmailSignInProps) {
  const router = redirectMethod === 'client' ? useRouter() : null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true); // Disable the button while the request is being handled
    await handleRequest(e, signInWithEmail, router);
    setIsSubmitting(false);
  };

  return (
    <div>
      {/* Magic Link Info */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-apidevs-primary/10 rounded-lg border border-purple-500/20">
        <p className="text-sm text-gray-300">
          ✨ <strong>Enlace Mágico:</strong> Te enviaremos un enlace seguro para iniciar sesión sin contraseña.
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
          className="w-full mt-6 bg-gradient-to-r from-purple-500 to-apidevs-primary hover:from-apidevs-primary hover:to-purple-500 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
          loading={isSubmitting}
          disabled={disableButton}
        >
          {isSubmitting ? 'Enviando enlace mágico...' : 'Enviar Enlace Mágico'}
        </Button>
      </form>
      
      {allowPassword && (
        <div className="mt-6 text-center space-y-3">
          <div className="pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-sm mb-4">¿Prefieres usar contraseña?</p>
            <div className="space-y-2">
              <Link 
                href="/signin/password_signin" 
                className="block text-apidevs-primary hover:text-green-400 transition-colors text-sm font-medium"
              >
                Iniciar sesión con email y contraseña
              </Link>
              
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
      )}
      
      {/* Magic Link Note */}
      <div className="mt-6 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
        <p className="text-xs text-gray-400 text-center">
          🪄 <strong>Enlace Mágico:</strong> Haz clic en el enlace del email para acceder automáticamente. El enlace expira en 5 minutos.
        </p>
      </div>
    </div>
  );
}
