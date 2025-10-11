'use client';

import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { portableTextComponents } from './PortableTextComponents';
import { urlFor } from '@/lib/sanity/client';
import Link from 'next/link';

interface IndicatorDetailViewProps {
  content: any;
  technical: any;
}

export default function IndicatorDetailView({ content, technical }: IndicatorDetailViewProps) {
  const isFree = technical?.access_tier === 'free';
  const categoryMap: Record<string, { label: string; icon: string }> = {
    indicador: { label: 'Indicador', icon: '📈' },
    escaner: { label: 'Escáner', icon: '🔍' },
    tools: { label: 'Herramienta', icon: '🛠️' },
  };
  const categoryBadge = categoryMap[technical?.category || 'indicador'];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              {/* Badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    isFree
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  }`}
                >
                  {isFree ? '🆓 GRATUITO' : '⭐ PREMIUM'}
                </span>
                <span className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg border border-gray-700">
                  {categoryBadge.icon} {categoryBadge.label}
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {content.title}
              </h1>

              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                {content.shortDescription}
              </p>

              {/* Stats */}
              {technical && (
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400">
                      {technical.total_users || 0}
                    </div>
                    <div className="text-sm text-gray-500">Usuarios Totales</div>
                  </div>
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400">
                      {technical.active_users || 0}
                    </div>
                    <div className="text-sm text-gray-500">Usuarios Activos</div>
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href={isFree ? '/signin' : '/pricing'}
                  className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-xl font-semibold transition-colors shadow-lg shadow-green-500/20"
                >
                  {isFree ? 'Obtener Gratis' : 'Ver Planes Premium'}
                </Link>
                {technical?.tradingview_url && (
                  <a
                    href={technical.tradingview_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl font-semibold transition-colors"
                  >
                    Ver en TradingView →
                  </a>
                )}
              </div>
            </div>

            {/* Right: Image */}
            {content.mainImage && (
              <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
                <Image
                  src={urlFor(content.mainImage).url()}
                  alt={content.mainImage.alt || content.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      {content.features && content.features.length > 0 && (
        <section className="py-16 bg-gray-900/30 border-y border-gray-800">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-3xl font-bold mb-8">Características Principales</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.features.map((feature: string, idx: number) => (
                <div
                  key={idx}
                  className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-green-500/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-green-400 text-2xl">✓</span>
                    <p className="text-gray-300">{feature}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Content Section (Portable Text) */}
      {content.content && (
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <div className="prose prose-invert prose-lg max-w-none">
              <PortableText
                value={content.content}
                components={portableTextComponents}
              />
            </div>
          </div>
        </section>
      )}

      {/* Video Section */}
      {content.videoUrl && (
        <section className="py-16 bg-gray-900/30">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <h2 className="text-3xl font-bold mb-8">Video Demostración</h2>
            <div className="relative w-full rounded-2xl overflow-hidden border border-gray-800 shadow-2xl" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={content.videoUrl.includes('youtube.com') || content.videoUrl.includes('youtu.be')
                  ? `https://www.youtube.com/embed/${content.videoUrl.includes('youtu.be') ? content.videoUrl.split('youtu.be/')[1] : content.videoUrl.split('v=')[1]?.split('&')[0]}`
                  : content.videoUrl}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {content.gallery && content.gallery.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-3xl font-bold mb-8">Galería de Imágenes</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.gallery.map((image: any, idx: number) => (
                <div key={idx} className="relative h-64 rounded-xl overflow-hidden border border-gray-800 hover:border-green-500/50 transition-colors">
                  <Image
                    src={urlFor(image).url()}
                    alt={image.alt || `Gallery ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      {content.benefits && content.benefits.length > 0 && (
        <section className="py-16 bg-gray-900/30">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-3xl font-bold mb-8">Beneficios</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {content.benefits.map((benefit: any, idx: number) => (
                <div
                  key={idx}
                  className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl"
                >
                  <h3 className="text-xl font-bold text-white mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-400">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How to Use Section */}
      {content.howToUse && (
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <h2 className="text-3xl font-bold mb-6">Cómo Usar</h2>
            <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-xl">
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {content.howToUse}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {content.faq && content.faq.length > 0 && (
        <section className="py-16 bg-gray-900/30">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h2 className="text-3xl font-bold mb-8">Preguntas Frecuentes</h2>
            <div className="space-y-4">
              {content.faq.map((item: any, idx: number) => (
                <details
                  key={idx}
                  className="group p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-green-500/50 transition-colors"
                >
                  <summary className="font-semibold cursor-pointer text-lg flex items-center justify-between">
                    {item.question}
                    <span className="ml-4 text-green-400 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <p className="mt-4 text-gray-400 leading-relaxed">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              ¿Listo para mejorar tu trading?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              {isFree
                ? 'Obtén acceso gratuito a este indicador ahora mismo'
                : 'Únete a miles de traders profesionales'}
            </p>
            <Link
              href={isFree ? '/signin' : '/pricing'}
              className="inline-block px-10 py-5 bg-green-500 hover:bg-green-600 rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-green-500/20"
            >
              {isFree ? 'Obtener Acceso Gratis' : 'Ver Planes Premium'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

