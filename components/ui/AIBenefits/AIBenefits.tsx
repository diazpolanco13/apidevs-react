'use client';

import { useState, useEffect, useRef } from 'react';
import BackgroundEffects from '@/components/ui/BackgroundEffects';

// Hook para animación de conteo (reutilizado del Hero)
function useCountAnimation(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function para suavizar la animación
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(start + (end - start) * easeOutQuart);
      
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration, start]);

  return { count, elementRef };
}

export default function AIBenefits() {
  // Hooks para animaciones de conteo
  const automatizacion = useCountAnimation(95, 2200);
  const monitoreo = useCountAnimation(24, 1800);
  const tiempo = useCountAnimation(2, 2000);
  const integracion = useCountAnimation(5, 1500);

  return (
    <section className="relative py-16 lg:py-20 bg-apidevs-dark overflow-hidden">
      {/* Background Effects */}
      <BackgroundEffects variant="section" />

      <div className="relative container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-apidevs-gray border border-apidevs-primary/20 rounded-full text-sm text-apidevs-primary font-medium mb-6">
            <span className="w-2 h-2 bg-apidevs-primary rounded-full mr-2 animate-pulse"></span>
            Tecnología Avanzada
          </div>

          {/* Title */}
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-primary">
              Algoritmos de trading potenciados con IA
            </span>
            <br />
            para automatizar tus señales de trading
          </h2>

          {/* Subtitle */}
          <p className="text-lg text-gray-400 leading-relaxed">
            Tecnología avanzada que trabaja mientras tú descansas. 
            Nuestros algoritmos procesan miles de datos en tiempo real para 
            ofrecerte las mejores oportunidades del mercado.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Automatización */}
          <div 
            ref={automatizacion.elementRef}
            className="group bg-apidevs-gray/80 backdrop-blur-sm border border-apidevs-primary/30 rounded-2xl p-6 text-center hover:border-apidevs-primary/60 hover:shadow-primary-lg hover:scale-105 transition-all duration-500 animate-in fade-in slide-in-from-bottom-6 duration-700"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
            <div className="text-4xl lg:text-5xl font-bold text-apidevs-primary mb-2">
              {automatizacion.count}%
            </div>
            <div className="text-sm font-medium text-white mb-2">
              Automatización
            </div>
            <div className="text-xs text-gray-400">
              en procesamiento de señales
            </div>
          </div>

          {/* Monitoreo 24/7 */}
          <div 
            ref={monitoreo.elementRef}
            className="group bg-apidevs-gray/80 backdrop-blur-sm border border-apidevs-primary/30 rounded-2xl p-6 text-center hover:border-apidevs-primary/60 hover:shadow-primary-lg hover:scale-105 transition-all duration-500 animate-in fade-in slide-in-from-bottom-6 duration-700 [animation-delay:100ms]"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
            </div>
            <div className="text-4xl lg:text-5xl font-bold text-apidevs-primary mb-2">
              {monitoreo.count}/7
            </div>
            <div className="text-sm font-medium text-white mb-2">
              Monitoreo Continuo
            </div>
            <div className="text-xs text-gray-400">
              automatizado de mercados
            </div>
          </div>

          {/* Tiempo de Ejecución */}
          <div 
            ref={tiempo.elementRef}
            className="group bg-apidevs-gray/80 backdrop-blur-sm border border-apidevs-primary/30 rounded-2xl p-6 text-center hover:border-apidevs-primary/60 hover:shadow-primary-lg hover:scale-105 transition-all duration-500 animate-in fade-in slide-in-from-bottom-6 duration-700 [animation-delay:200ms]"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                </svg>
              </div>
            </div>
            <div className="text-4xl lg:text-5xl font-bold text-apidevs-primary mb-2">
              &lt;{tiempo.count}
            </div>
            <div className="text-sm font-medium text-white mb-2">
              Segundos
            </div>
            <div className="text-xs text-gray-400">
              tiempo de ejecución de alertas
            </div>
          </div>

          {/* Integración */}
          <div 
            ref={integracion.elementRef}
            className="group bg-apidevs-gray/80 backdrop-blur-sm border border-apidevs-primary/30 rounded-2xl p-6 text-center hover:border-apidevs-primary/60 hover:shadow-primary-lg hover:scale-105 transition-all duration-500 animate-in fade-in slide-in-from-bottom-6 duration-700 [animation-delay:300ms]"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
              </div>
            </div>
            <div className="text-4xl lg:text-5xl font-bold text-apidevs-primary mb-2">
              {integracion.count} en 1
            </div>
            <div className="text-sm font-medium text-white mb-2">
              Herramientas
            </div>
            <div className="text-xs text-gray-400">
              integradas por indicador
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 bg-apidevs-primary/10 border border-apidevs-primary/30 rounded-full text-sm text-apidevs-primary">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Procesamiento en tiempo real con algoritmos optimizados
          </div>
        </div>
      </div>
    </section>
  );
}
