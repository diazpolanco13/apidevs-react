'use client';

import Button from '@/components/ui/Button';
import React from 'react';
import Link from 'next/link';
import { signUp } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Define prop type with allowEmail boolean
interface SignUpProps {
  allowEmail: boolean;
  redirectMethod: string;
  selectedPlan?: string;
  planInfo?: {
    name: string;
    price: string;
    color: string;
    benefits: string[];
  } | null;
}

export default function SignUp({ allowEmail, redirectMethod, selectedPlan, planInfo }: SignUpProps) {
  const router = redirectMethod === 'client' ? useRouter() : null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true); // Disable the button while the request is being handled
    await handleRequest(e, signUp, router);
    setIsSubmitting(false);
  };

  return (
    <div>
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
              placeholder="Mínimo 8 caracteres"
              type="password"
              name="password"
              autoComplete="new-password"
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
          {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm mb-4">¿Ya tienes cuenta?</p>
        <div className="space-y-2">
          <Link 
            href="/signin/password_signin" 
            className="block text-apidevs-primary hover:text-green-400 transition-colors text-sm font-medium"
          >
            Inicia sesión con email y contraseña
          </Link>
          {allowEmail && (
            <Link 
              href="/signin/email_signin" 
              className="block text-gray-300 hover:text-white transition-colors text-sm"
            >
              Inicia sesión con enlace mágico
            </Link>
          )}
        </div>
      </div>
      
      {/* Benefits Preview */}
      <div className="mt-8 p-4 bg-gradient-to-r from-apidevs-primary/10 to-green-400/10 rounded-lg border border-apidevs-primary/20">
        <h4 className="text-sm font-semibold text-apidevs-primary mb-2">
          {planInfo ? `Con ${planInfo.name} obtienes:` : 'Al crear tu cuenta obtienes:'}
        </h4>
        <ul className="text-xs text-gray-300 space-y-1">
          {planInfo ? (
            planInfo.benefits.map((benefit, index) => (
              <li key={index}>✓ {benefit}</li>
            ))
          ) : (
            <>
              <li>✓ Acceso inmediato al Plan FREE</li>
              <li>✓ 5 indicadores clásicos incluidos</li>
              <li>✓ Comunidad Telegram exclusiva</li>
              <li>✓ Tutoriales y documentación completa</li>
            </>
          )}
        </ul>
        
        {planInfo && selectedPlan !== 'free' && (
          <div className="mt-3 pt-3 border-t border-apidevs-primary/20">
            <p className="text-xs text-gray-400">
              💡 <strong>Nota:</strong> Primero crea tu cuenta, luego podrás suscribirte al {planInfo.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
