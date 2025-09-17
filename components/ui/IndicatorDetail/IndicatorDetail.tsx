'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Indicator } from '@/components/ui/IndicatorsHub/types';
import TradingViewScriptEmbed from '@/components/ui/TradingViewScriptEmbed';
import IndicatorEducation from '@/components/ui/IndicatorEducation';
import SetupInstructionsModal from '@/components/ui/SetupInstructionsModal';

interface IndicatorDetailProps {
  indicator: Indicator;
}

export default function IndicatorDetail({ indicator }: IndicatorDetailProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getCategoryBadge = (category: string) => {
    const colors = {
      free: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      premium: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    };
    const labels = {
      free: 'GRATUITO',
      premium: 'PREMIUM'
    };
    return { color: colors[category as keyof typeof colors], label: labels[category as keyof typeof labels] };
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      indicator: '📈',
      scanner: '🔍',
      tool: '🛠️'
    };
    return icons[type as keyof typeof icons] || '📊';
  };

  const badge = getCategoryBadge(indicator.category);

  // Contenido específico basado en el indicador (simulado)
  const getIndicatorContent = () => {
    const baseContent = {
      howToTrade: [
        {
          title: "Configuración Inicial",
          content: "Agrega el indicador a tu gráfico de TradingView y ajusta los parámetros según tu estilo de trading."
        },
        {
          title: "Identificación de Señales",
          content: "El indicador genera señales automáticas que aparecen directamente en tu gráfico con alertas visuales."
        },
        {
          title: "Gestión de Riesgo",
          content: "Utiliza los niveles sugeridos para establecer stop-loss y take-profit de manera efectiva."
        }
      ],
      features: [
        "Alertas automáticas en tiempo real",
        "Compatible con todos los timeframes",
        "Configuración personalizable",
        "Backtesting integrado",
        "Soporte para múltiples activos"
      ],
      faq: [
        {
          question: "¿Funciona en todos los mercados?",
          answer: "Sí, este indicador está optimizado para funcionar en Forex, Crypto, Acciones y Commodities."
        },
        {
          question: "¿Necesito experiencia previa?",
          answer: "No, el indicador está diseñado para ser intuitivo tanto para principiantes como para traders experimentados."
        },
        {
          question: "¿Incluye alertas?",
          answer: "Sí, incluye alertas por email, SMS y notificaciones push directamente en TradingView."
        }
      ]
    };

    // Personalizar contenido según el tipo
    if (indicator.type === 'scanner') {
      baseContent.howToTrade[1].content = "El scanner analiza múltiples activos simultáneamente y te muestra las mejores oportunidades del momento.";
      baseContent.features.push("Análisis de 160+ criptomonedas", "Filtros avanzados por volatilidad");
    } else if (indicator.type === 'tool') {
      baseContent.howToTrade[0].content = "Utiliza la herramienta directamente desde tu navegador o intégrala en tu flujo de trabajo de trading.";
      baseContent.features.push("Calculadora integrada", "Exportación de resultados");
    }

    return baseContent;
  };

  const content = getIndicatorContent();

  return (
    <div className="min-h-screen pt-20">
      <div className="px-8 sm:px-12 lg:px-16 xl:px-20 2xl:px-24">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">
              Inicio
            </Link>
            <span className="mx-2">/</span>
            <Link href="/indicadores" className="hover:text-white transition-colors">
              Indicadores
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{indicator.title}</span>
          </nav>
        </div>

        {/* Hero Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Imagen Principal */}
            <div className="order-2 lg:order-1">
              <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden bg-gray-900 border border-gray-800">
                <Image
                  src={indicator.image}
                  alt={indicator.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Información Principal */}
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-4 mb-6">
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${badge.color}`}>
                  {badge.label}
                </span>
                <span className="text-2xl" title={indicator.type}>
                  {getTypeIcon(indicator.type)}
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                {indicator.title}
              </h1>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                {indicator.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-3 mb-8">
                {indicator.tags.map(tag => (
                  <span key={tag} className="px-3 py-2 bg-gray-800 text-gray-300 text-sm rounded-lg border border-gray-700">
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {indicator.category === 'free' ? (
                  <Link
                    href="#download"
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 text-center"
                  >
                    Descargar Gratis
                  </Link>
                ) : (
                  <Link
                    href="/pricing"
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 hover:scale-105 text-center"
                  >
                    Obtener Acceso Premium
                  </Link>
                )}
                
                <Link
                  href="/indicadores"
                  className="px-8 py-4 border-2 border-gray-600 text-gray-300 font-bold rounded-xl hover:bg-gray-800 hover:border-gray-500 transition-all duration-300 text-center"
                >
                  Ver Más Indicadores
                </Link>
              </div>

              {/* Metadata */}
              <div className="mt-8 pt-8 border-t border-gray-800">
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="text-gray-500">Publicado:</span>
                    <p className="text-white font-medium">
                      {new Date(indicator.publishedAt).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Plataforma:</span>
                    <p className="text-white font-medium">TradingView</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TradingView Script Embed */}
        {indicator.tradingViewScriptId && (
          <div className="mb-16">
            <div className="bg-gray-900/30 rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Vista Previa Interactiva
                </h2>
                <div className="flex items-center text-sm text-gray-400">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Embed directo desde TradingView
                </div>
              </div>
              
              <div className="rounded-xl overflow-hidden border border-gray-700 bg-gray-800">
                <TradingViewScriptEmbed
                  scriptId={indicator.tradingViewScriptId}
                  height={500}
                />
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-gray-400 text-sm">
                  Este es el indicador real funcionando en TradingView. 
                  <Link 
                    href={indicator.tradingViewUrl || '#'} 
                    target="_blank" 
                    className="text-green-400 hover:text-green-300 ml-1"
                  >
                    Ver en TradingView →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Access Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                {indicator.category === 'free' 
                  ? '¡Accede a este indicador GRATIS!' 
                  : 'Obtén Acceso Premium'
                }
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                {indicator.category === 'free' 
                  ? 'Este indicador está disponible sin costo en TradingView. Solo agrégalo a tus favoritos para comenzar a usarlo.'
                  : 'Únete a miles de traders que ya están usando nuestros indicadores profesionales para mejorar sus resultados.'
                }
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {indicator.category === 'free' ? (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 flex items-center justify-center"
                  >
                    <span className="mr-2">Obtener Acceso Gratuito</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                ) : (
                  <Link
                    href="/pricing"
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 hover:scale-105 text-center flex items-center justify-center"
                  >
                    <span className="mr-2">Ver Planes Premium</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                )}
                
                <Link
                  href="/indicadores"
                  className="px-8 py-4 border-2 border-gray-600 text-gray-300 font-bold rounded-xl hover:bg-gray-800 hover:border-gray-500 transition-all duration-300 text-center"
                >
                  Explorar Más Indicadores
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Educational Content Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">
            Cómo Funciona {indicator.title}
          </h2>
          <IndicatorEducation indicator={indicator} />
        </div>

        {/* How to Trade Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">
            ¿Cómo usar {indicator.title}?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.howToTrade.map((step, index) => (
              <div key={index} className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">{step.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">
            Características Principales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.features.map((feature, index) => (
              <div key={index} className="flex items-center p-4 bg-gray-900/30 rounded-lg border border-gray-800">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">
            Preguntas Frecuentes
          </h2>
          
          <div className="space-y-6">
            {content.faq.map((item, index) => (
              <div key={index} className="bg-gray-900/30 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {item.question}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Setup Instructions Modal */}
      <SetupInstructionsModal
        indicator={indicator}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
