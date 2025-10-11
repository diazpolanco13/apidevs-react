'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import type { IndicatorDetail } from '@/sanity/lib/queries';
import { urlForImage } from '@/sanity/lib/image';
import TradingViewEmbed from '@/components/ui/TradingViewEmbed';
import type { User } from '@supabase/supabase-js';
import type { Tables } from '@/types_db';

type Subscription = Tables<'subscriptions'>;

interface IndicatorDetailViewProps {
  indicator: IndicatorDetail;
  user: User | null;
  subscription: Subscription | null;
  hasLifetimeAccess: boolean;
}

// Componentes personalizados para Portable Text con colores APIDevs
const portableTextComponents = {
  types: {
    image: ({value}: any) => {
      if (!value?.asset) return null;
      const imageUrl = urlForImage(value)?.width(1200).height(800).url();
      return imageUrl ? (
        <div className="my-8 rounded-xl overflow-hidden border border-gray-800 shadow-xl">
          <Image
            src={imageUrl}
            alt={value.alt || 'Imagen del indicador'}
            width={1200}
            height={800}
            className="w-full h-auto"
          />
          {value.caption && (
            <p className="text-sm text-gray-400 mt-3 text-center px-4 pb-4">{value.caption}</p>
          )}
        </div>
      ) : null;
    },
  },
  block: {
    h2: ({children}: any) => (
      <h2 className="text-3xl font-bold text-white mt-12 mb-6 flex items-center gap-3">
        <span className="w-1 h-8 bg-apidevs-primary rounded-full"></span>
        {children}
      </h2>
    ),
    h3: ({children}: any) => (
      <h3 className="text-2xl font-bold text-white mt-10 mb-4">{children}</h3>
    ),
    h4: ({children}: any) => (
      <h4 className="text-xl font-semibold text-white mt-8 mb-3">{children}</h4>
    ),
    normal: ({children}: any) => (
      <p className="text-gray-300 text-lg leading-relaxed mb-6">{children}</p>
    ),
    blockquote: ({children}: any) => (
      <blockquote className="border-l-4 border-apidevs-primary pl-6 py-4 my-8 bg-gray-800/30 rounded-r-lg">
        <p className="text-gray-200 italic">{children}</p>
      </blockquote>
    ),
  },
  marks: {
    strong: ({children}: any) => (
      <strong className="font-bold text-white">{children}</strong>
    ),
    em: ({children}: any) => (
      <em className="italic text-gray-200">{children}</em>
    ),
    code: ({children}: any) => (
      <code className="bg-gray-800 text-apidevs-primary px-2 py-1 rounded text-sm font-mono">
        {children}
      </code>
    ),
    link: ({children, value}: any) => (
      <a
        href={value.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-apidevs-primary hover:text-apidevs-primary-dark underline transition-colors"
      >
        {children}
      </a>
    ),
  },
};

export default function IndicatorDetailView({ indicator, user, subscription, hasLifetimeAccess }: IndicatorDetailViewProps) {
  const imageUrl = indicator.mainImage?.asset
    ? urlForImage(indicator.mainImage)?.width(1200).height(800).url() 
    : null;

  const getCategoryBadge = (tier: 'free' | 'premium') => {
    const colors = {
      free: 'bg-blue-600',
      premium: 'bg-purple-600'
    };
    const labels = {
      free: '🎁 GRATIS',
      premium: '💎 PREMIUM'
    };
    return { color: colors[tier], label: labels[tier] };
  };

  const badge = getCategoryBadge(indicator.access_tier);

  // Determinar el plan del usuario
  const getUserPlan = () => {
    if (!user) return 'guest';
    
    // Primero verificar Lifetime ACCESS (tiene prioridad)
    if (hasLifetimeAccess) return 'lifetime';
    
    // Luego verificar metadata de suscripción
    const metadata = subscription?.metadata as { plan_type?: string } | null;
    if (metadata?.plan_type === 'lifetime') return 'lifetime';
    
    // Verificar si el nombre del producto contiene "lifetime"
    const productName = ((subscription as any)?.prices?.products as any)?.name?.toLowerCase() || '';
    if (productName.includes('lifetime')) return 'lifetime';
    
    // Si tiene suscripción activa, es PRO
    if (subscription?.status === 'active' || subscription?.status === 'trialing') {
      return 'pro';
    }
    
    return 'free';
  };

  const userPlan = getUserPlan();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-apidevs-primary transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/indicadores" className="hover:text-apidevs-primary transition-colors">Indicadores</Link>
          <span>/</span>
          <span className="text-white">{indicator.title}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-4 py-2 rounded-lg text-sm font-bold text-white ${badge.color}`}>
              {badge.label}
            </span>
            <span className="px-4 py-2 bg-gray-800/50 text-gray-300 rounded-lg text-sm font-medium capitalize">
              📊 {indicator.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {indicator.title}
          </h1>

          <p className="text-xl text-gray-300 leading-relaxed max-w-4xl mb-6">
            {indicator.shortDescription}
          </p>
        </div>

        {/* LAYOUT 2 COLUMNAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA PRINCIPAL (Izquierda - 2/3) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Widget Interactivo de TradingView */}
            {indicator.embedUrl ? (
              <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
                <TradingViewEmbed 
                  embedUrl={indicator.embedUrl}
                  title={indicator.title}
                  height={600}
                />
              </div>
            ) : imageUrl ? (
              <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
                <Image
                  src={imageUrl}
                  alt={indicator.mainImage?.alt || indicator.title}
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                  priority
                />
              </div>
            ) : null}

            {/* Descripción Detallada */}
            {indicator.content && indicator.content.length > 0 && (
              <div className="prose prose-invert prose-lg max-w-none">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-1 h-8 bg-apidevs-primary rounded-full"></span>
                  Descripción Detallada
                </h2>
                <div className="text-gray-300 leading-relaxed">
                  <PortableText 
                    value={indicator.content} 
                    components={portableTextComponents}
                  />
                </div>
              </div>
            )}

            {/* Características */}
            {indicator.features && indicator.features.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-1 h-8 bg-apidevs-primary rounded-full"></span>
                  Características
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {indicator.features.map((feature, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start gap-3 bg-gray-800/40 p-4 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5 text-apidevs-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Beneficios */}
            {indicator.benefits && indicator.benefits.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-1 h-8 bg-apidevs-primary rounded-full"></span>
                  Beneficios
                </h2>
                <div className="space-y-4">
                  {indicator.benefits.map((benefit, idx) => (
                    <div 
                      key={idx} 
                      className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 p-6 rounded-xl border border-gray-700/50 hover:border-apidevs-primary/30 transition-colors"
                    >
                      <h3 className="text-xl font-bold text-apidevs-primary mb-3 flex items-center gap-2">
                        <span className="text-2xl">✨</span>
                        {benefit.title}
                      </h3>
                      <p className="text-gray-300 leading-relaxed">{benefit.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cómo Usar */}
            {indicator.howToUse && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-1 h-8 bg-apidevs-primary rounded-full"></span>
                  Cómo Usar
                </h2>
                <div className="bg-gray-800/40 p-6 rounded-xl border border-gray-700/50">
                  <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">
                    {indicator.howToUse}
                  </p>
                </div>
              </div>
            )}

            {/* Galería */}
            {indicator.gallery && indicator.gallery.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-1 h-8 bg-apidevs-primary rounded-full"></span>
                  Galería
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {indicator.gallery.map((image, idx) => {
                    const imgUrl = urlForImage(image)?.width(800).height(600).url();
                    return imgUrl ? (
                      <div key={idx} className="rounded-xl overflow-hidden border border-gray-800 shadow-lg hover:shadow-apidevs-primary/10 transition-shadow">
                        <Image
                          src={imgUrl}
                          alt={image.alt || `Galería ${idx + 1}`}
                          width={800}
                          height={600}
                          className="w-full h-auto"
                        />
                        {image.caption && (
                          <div className="bg-gray-800/60 p-3">
                            <p className="text-sm text-gray-300 text-center">{image.caption}</p>
                          </div>
                        )}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* FAQ */}
            {indicator.faq && indicator.faq.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-1 h-8 bg-apidevs-primary rounded-full"></span>
                  Preguntas Frecuentes
                </h2>
                <div className="space-y-4">
                  {indicator.faq.map((item, idx) => (
                    <details 
                      key={idx} 
                      className="group bg-gray-800/40 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-colors overflow-hidden"
                    >
                      <summary className="cursor-pointer p-6 font-semibold text-white text-lg flex items-center justify-between">
                        <span className="flex items-center gap-3">
                          <span className="text-apidevs-primary">❓</span>
                          {item.question}
                        </span>
                        <svg className="w-5 h-5 text-apidevs-primary transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="px-6 pb-6 text-gray-300 leading-relaxed">
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR (Derecha - 1/3 - STICKY) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              
              {/* CTA DINÁMICO según plan del usuario */}
              {userPlan === 'guest' && (
                // Usuario NO autenticado
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 shadow-xl">
                  <div className="text-sm text-gray-400 mb-2">
                    🚀 Empieza ahora
                  </div>
                  <div className="text-2xl font-bold text-white mb-4">
                    Desbloquea este indicador
                  </div>
                  
                  <Link 
                    href="/signin"
                    className="block w-full bg-apidevs-primary hover:bg-apidevs-primary-dark text-black font-bold py-4 px-6 rounded-xl text-center transition-all duration-200 shadow-lg hover:shadow-xl mb-3"
                  >
                    Iniciar Sesión
                  </Link>

                  <Link 
                    href="/pricing"
                    className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl text-center transition-colors border border-gray-600"
                  >
                    Ver Planes
                  </Link>
                  
                  <div className="mt-4 space-y-2 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-apidevs-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Sin tarjeta de crédito
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-apidevs-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Acceso inmediato
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-apidevs-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      +25 indicadores incluidos
                    </div>
                  </div>
                </div>
              )}

              {userPlan === 'free' && indicator.access_tier === 'premium' && (
                // Usuario FREE viendo indicador PREMIUM - INVITAR A UPGRADE
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border-2 border-gray-600 shadow-xl relative overflow-hidden">
                  {/* Efecto brillante */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-apidevs-primary/10 to-transparent"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🔒</span>
                      <span className="text-sm text-gray-400">Premium</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-2">
                      Actualiza a PRO
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      Desbloquea este indicador y accede a todos los indicadores premium
                    </p>
                    
                    <Link 
                      href="/pricing"
                      className="block w-full bg-apidevs-primary hover:bg-apidevs-primary-dark text-black font-bold py-4 px-6 rounded-xl text-center transition-all duration-200 shadow-lg hover:shadow-xl mb-3"
                    >
                      🚀 Actualizar Ahora
                    </Link>

                    {/* Botón Ver en TradingView para usuarios FREE */}
                    {indicator.tradingviewUrl && (
                      <a
                        href={indicator.tradingviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl text-center transition-colors border border-gray-600 flex items-center justify-center gap-2"
                      >
                        Ver en TradingView
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                    
                    <div className="mt-4 space-y-2 text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-apidevs-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Todos los indicadores premium
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-apidevs-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Alertas en tiempo real
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
              )}

              {(userPlan === 'free' && indicator.access_tier === 'free') && (
                // Usuario FREE viendo indicador FREE - Ya tiene acceso
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-600 shadow-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">✅</span>
                    <span className="text-sm text-gray-400">Acceso Gratuito</span>
                  </div>
                  <div className="text-xl font-bold text-white mb-4">
                    Ya tienes acceso
                  </div>
                  
                  {indicator.tradingviewUrl && (
                    <a
                      href={indicator.tradingviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-apidevs-primary hover:bg-apidevs-primary-dark text-black font-bold py-4 px-6 rounded-xl text-center transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      Ver en TradingView
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              )}

              {userPlan === 'pro' && (
                // Usuario PRO - Hacerlo sentir especial
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
                      Disfruta de todos los indicadores premium sin límites
                    </p>
                    
                    {indicator.tradingviewUrl && (
                      <a
                        href={indicator.tradingviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-apidevs-primary hover:bg-apidevs-primary-dark text-black font-bold py-4 px-6 rounded-xl text-center transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mb-3"
                      >
                        Abrir en TradingView
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                    
                    <Link
                      href="/account"
                      className="block w-full bg-gray-700/50 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg text-center transition-colors text-sm"
                    >
                      Gestionar Suscripción
                    </Link>
                  </div>
                </div>
              )}

              {userPlan === 'lifetime' && (
                // Usuario LIFETIME - Hacerlo sentir VIP
                <div className="bg-gradient-to-br from-purple-900/30 via-purple-800/20 to-gray-900 p-6 rounded-2xl border-2 border-purple-500/40 shadow-2xl relative overflow-hidden">
                  {/* Efecto brillante violeta */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-shimmer"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">👑</span>
                      <span className="text-sm font-bold text-purple-400">Lifetime Access</span>
                    </div>
                    <div className="text-xl font-bold text-white mb-2">
                      ¡Miembro VIP de por vida!
                    </div>
                    <p className="text-gray-300 text-sm mb-4">
                      Acceso ilimitado y permanente a toda la plataforma
                    </p>
                    
                    {indicator.tradingviewUrl && (
                      <a
                        href={indicator.tradingviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-xl text-center transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mb-3"
                      >
                        Abrir en TradingView
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                    
                    <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/20">
                      <p className="text-xs text-purple-300 font-medium">
                        💎 Gracias por ser parte de nuestra comunidad VIP
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botón de YouTube (si existe) */}
              {indicator.videoUrl && (
                <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <span className="text-white font-semibold">Video Tutorial</span>
                  </div>
                  <a
                    href={indicator.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                    Ver en YouTube
                  </a>
                </div>
              )}

              {/* Features Rápidas */}
              {indicator.features && indicator.features.length > 0 && (
                <div className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4">✨ Características</h3>
                  <div className="space-y-3">
                    {indicator.features.slice(0, 5).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                        <svg className="w-4 h-4 text-apidevs-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {indicator.tags && indicator.tags.length > 0 && (
                <div className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">ETIQUETAS</h3>
                  <div className="flex flex-wrap gap-2">
                    {indicator.tags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full border border-gray-600 hover:border-apidevs-primary transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
