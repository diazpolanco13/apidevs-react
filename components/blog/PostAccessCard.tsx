'use client';

import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import type { Tables } from '@/types_db';

type Subscription = Tables<'subscriptions'>;

interface PostAccessCardProps {
  userPlan: 'guest' | 'free' | 'pro' | 'lifetime';
  user: User | null;
  subscription: Subscription | null;
  hasLifetimeAccess: boolean;
  visibility?: 'public' | 'authenticated' | 'premium';
}

export default function PostAccessCard({ userPlan, user, subscription, hasLifetimeAccess, visibility = 'premium' }: PostAccessCardProps) {
  
  // Usuario PRO - Hacerlo sentir especial
  if (userPlan === 'pro') {
    return (
      <div className="bg-gradient-to-br from-yellow-900/20 via-yellow-800/10 to-gray-900 p-6 rounded-2xl border-2 border-apidevs-primary/30 shadow-xl relative overflow-hidden">
        {/* Efecto brillante animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-apidevs-primary/10 to-transparent animate-shimmer"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚡</span>
            <span className="text-sm font-semibold text-apidevs-primary">Plan PRO Activo</span>
          </div>
          <div className="text-xl font-bold text-white mb-2">
            ¡Acceso Completo!
          </div>
          <p className="text-gray-300 text-sm mb-4">
            Disfruta de todos los artículos premium sin límites
          </p>
          
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-apidevs-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Todos los artículos premium
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-apidevs-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Acceso a todos los indicadores
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-apidevs-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Soporte prioritario
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Usuario LIFETIME - VIP de por vida
  if (userPlan === 'lifetime') {
    return (
      <div className="bg-gradient-to-br from-purple-900/30 via-purple-800/20 to-gray-900 p-6 rounded-2xl border-2 border-purple-500/40 shadow-2xl relative overflow-hidden">
        {/* Efecto brillante violeta */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-shimmer"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">👑</span>
            <span className="text-sm font-bold text-purple-400">Lifetime Access</span>
          </div>
          <div className="text-xl font-bold text-white mb-2">
            ¡Miembro VIP!
          </div>
          <p className="text-gray-300 text-sm mb-4">
            Acceso ilimitado y permanente a toda la plataforma
          </p>
          
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Acceso ilimitado de por vida
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Todo el contenido premium
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Sin pagos recurrentes
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Usuario FREE o GUEST - Necesita upgrade o login
  // Determinar el tipo de restricción y mensaje apropiado
  const isAuthenticatedOnly = visibility === 'authenticated';
  const isPremiumOnly = visibility === 'premium';
  
  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black p-6 rounded-2xl border-2 border-gray-700 shadow-2xl relative overflow-hidden">
      {/* Efecto de fondo */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{isAuthenticatedOnly ? '🔐' : '🔒'}</span>
          <span className="text-sm font-semibold text-gray-400">
            {isAuthenticatedOnly ? 'Contenido Exclusivo' : 'Contenido Premium'}
          </span>
        </div>
        <div className="text-xl font-bold text-white mb-2">
          {isAuthenticatedOnly 
            ? 'Artículo para miembros' 
            : 'Artículo exclusivo PRO'}
        </div>
        <p className="text-gray-400 text-sm mb-4">
          {isAuthenticatedOnly 
            ? (userPlan === 'guest' 
              ? 'Crea una cuenta gratuita para acceder a este artículo'
              : 'Inicia sesión para continuar leyendo')
            : (userPlan === 'free' 
              ? 'Actualiza a PRO para acceder a todo el contenido premium'
              : 'Únete a PRO para desbloquear este artículo')}
        </p>
        
        <div className="space-y-2 mb-6">
          {/* Beneficios contextuales según el tipo de contenido */}
          {isAuthenticatedOnly ? (
            <>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <svg className="w-4 h-4 text-apidevs-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Artículos exclusivos para miembros</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <svg className="w-4 h-4 text-apidevs-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Acceso a indicadores gratuitos</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <svg className="w-4 h-4 text-apidevs-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Comunidad de traders</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <svg className="w-4 h-4 text-apidevs-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>100% gratis</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <svg className="w-4 h-4 text-apidevs-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Artículos premium</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <svg className="w-4 h-4 text-apidevs-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>18 indicadores VIP</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <svg className="w-4 h-4 text-apidevs-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Alertas tiempo real</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <svg className="w-4 h-4 text-apidevs-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Soporte prioritario</span>
              </div>
            </>
          )}
        </div>

        {/* Botones contextuales */}
        {isAuthenticatedOnly ? (
          // Para contenido "authenticated" - solo necesita crear cuenta/login
          <>
            {!user ? (
              <>
                <Link
                  href="/signin"
                  className="block w-full bg-apidevs-primary hover:bg-apidevs-primary-dark text-black font-bold py-3 px-4 rounded-xl text-center text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 mb-3"
                >
                  {userPlan === 'guest' ? 'Crear Cuenta Gratis' : 'Iniciar Sesión'}
                </Link>
                <p className="text-center text-xs text-gray-500">
                  Acceso 100% gratuito
                </p>
              </>
            ) : (
              <Link
                href="/signin"
                className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl text-center text-sm transition-all duration-200"
              >
                Iniciar Sesión
              </Link>
            )}
          </>
        ) : (
          // Para contenido "premium" - necesita upgrade
          <>
            <Link
              href="/pricing"
              className="block w-full bg-apidevs-primary hover:bg-apidevs-primary-dark text-black font-bold py-3 px-4 rounded-xl text-center text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 mb-3"
            >
              Ver Planes y Precios
            </Link>
            
            {!user && (
              <Link
                href="/signin"
                className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl text-center text-sm transition-all duration-200"
              >
                Iniciar Sesión
              </Link>
            )}
          </>
        )}

        {userPlan === 'free' && subscription && (
          <Link
            href="/account"
            className="block mt-3 text-center text-xs text-gray-400 hover:text-apidevs-primary transition-colors"
          >
            Gestionar mi suscripción →
          </Link>
        )}
      </div>
    </div>
  );
}

