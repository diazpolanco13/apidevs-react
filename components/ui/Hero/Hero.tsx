'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import BackgroundEffects from '@/components/ui/BackgroundEffects';

// Hook para animación de conteo
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

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  
  // Hooks para animaciones de conteo con diferentes delays
  const indicadores = useCountAnimation(25, 2000);
  const usuarios = useCountAnimation(7000, 2500);
  const seguidores = useCountAnimation(4000, 2200);
  const puntos = useCountAnimation(7900, 2800);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative bg-apidevs-dark overflow-hidden">
      {/* Background Effects */}
      <BackgroundEffects variant="hero" />

      <div className="relative container mx-auto px-4 pt-24 pb-16 lg:pt-32 lg:pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-apidevs-gray border border-apidevs-primary/20 rounded-full text-sm text-apidevs-primary font-medium">
              <span className="w-2 h-2 bg-apidevs-primary rounded-full mr-2 animate-glow"></span>
              Plataforma líder en indicadores de trading
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Desarrollamos{' '}
                <span className="text-transparent bg-clip-text bg-gradient-primary animate-glow">
                  soluciones para traders
                </span>
                {' '}en todos los medios financieros
              </h1>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
              Si deseas convertirte en todo un profesional del trading y estás dispuesto a dominar 
              las herramientas con las que un grupo reducido de inversores lograron vencer al 
              mercado, entonces has llegado al lugar correcto.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-8">
              {/* Indicadores */}
              <div 
                ref={indicadores.elementRef}
                className="bg-apidevs-gray/80 backdrop-blur-sm border border-apidevs-primary/30 rounded-2xl p-4 text-center hover:border-apidevs-primary/60 hover:shadow-primary-sm hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700"
              >
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-apidevs-primary mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                  </svg>
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-apidevs-primary mb-1">
                  +{indicadores.count.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Indicadores</div>
              </div>

              {/* Usuarios */}
              <div 
                ref={usuarios.elementRef}
                className="bg-apidevs-gray/80 backdrop-blur-sm border border-apidevs-primary/30 rounded-2xl p-4 text-center hover:border-apidevs-primary/60 hover:shadow-primary-sm hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:100ms]"
              >
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-apidevs-primary mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 7c0-2.21-1.79-4-4-4S8 4.79 8 7s1.79 4 4 4 4-1.79 4-4zm-4 6c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-apidevs-primary mb-1">
                  +{usuarios.count.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Usuarios</div>
              </div>

              {/* Seguidores */}
              <div 
                ref={seguidores.elementRef}
                className="bg-apidevs-gray/80 backdrop-blur-sm border border-apidevs-primary/30 rounded-2xl p-4 text-center hover:border-apidevs-primary/60 hover:shadow-primary-sm hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:200ms]"
              >
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-apidevs-primary mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-apidevs-primary mb-1">
                  +{seguidores.count.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Seguidores</div>
              </div>

              {/* Puntos Scripts */}
              <div 
                ref={puntos.elementRef}
                className="bg-apidevs-gray/80 backdrop-blur-sm border border-apidevs-primary/30 rounded-2xl p-4 text-center hover:border-apidevs-primary/60 hover:shadow-primary-sm hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:300ms]"
              >
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-apidevs-primary mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-apidevs-primary mb-1">
                  +{puntos.count.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Puntos Scripts</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="bg-gradient-primary hover:shadow-primary-lg text-black font-semibold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105"
              >
                Comenzar ahora
              </Button>
              <Button
                variant="slim"
                className="border-2 border-apidevs-primary/30 text-apidevs-primary hover:bg-apidevs-primary/10 px-8 py-4 text-lg bg-transparent"
              >
                Ver demo
              </Button>
            </div>
          </div>

          {/* Trading Chart Mockup */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="relative bg-apidevs-gray rounded-2xl p-6 shadow-card-dark border border-apidevs-gray-dark">
              {/* Chart Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-apidevs-primary rounded-full"></div>
                </div>
                <div className="text-sm text-gray-400">BTC/USDT • 1H</div>
              </div>

              {/* Mock Chart */}
              <div className="relative h-64 bg-apidevs-dark rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-chart-gradient"></div>
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#C9D92E" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#C9D92E" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,150 Q50,120 100,140 T200,100 T300,80 T400,60"
                    stroke="#C9D92E"
                    strokeWidth="2"
                    fill="none"
                    className="animate-pulse"
                  />
                  <path
                    d="M0,150 Q50,120 100,140 T200,100 T300,80 T400,60 L400,200 L0,200 Z"
                    fill="url(#chartGradient)"
                  />
                </svg>
              </div>

              {/* Chart Stats */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-apidevs-dark rounded-lg p-3">
                  <div className="text-xs text-gray-400">Precio</div>
                  <div className="text-lg font-bold text-apidevs-primary">$43,256.78</div>
                  <div className="text-xs text-green-400">+2.34%</div>
                </div>
                <div className="bg-apidevs-dark rounded-lg p-3">
                  <div className="text-xs text-gray-400">Ganancia</div>
                  <div className="text-lg font-bold text-apidevs-primary">+$1,234</div>
                  <div className="text-xs text-green-400">+5.67%</div>
                </div>
              </div>
            </div>

            {/* Floating indicators */}
            <div className="absolute -top-4 -left-4 bg-apidevs-primary text-black px-3 py-1 rounded-full text-sm font-semibold animate-float">
              RSI: 68.5
            </div>
            <div className="absolute -bottom-4 -right-4 bg-apidevs-gray-light border border-apidevs-primary/30 px-3 py-1 rounded-full text-sm text-apidevs-primary animate-float [animation-delay:1s]">
              MACD: +0.15
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
