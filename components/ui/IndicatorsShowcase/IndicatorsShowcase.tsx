'use client';

import { useState, useEffect, useRef } from 'react';
import BackgroundEffects from '@/components/ui/BackgroundEffects';

interface IndicatorsShowcaseProps {
  images?: string[];
  autoPlayInterval?: number;
  showDots?: boolean;
  pauseOnHover?: boolean;
}

// Imágenes reales de indicadores APIDevs
const defaultImages = [
  '/images/indicators/BTCUSDT.P_2025-09-12_17-00-39_cefde.png', // Indicador principal BTC/USDT
  '/images/indicators/rsi_scanner.png', // RSI Scanner en acción - REAL
  '/api/placeholder/1200/675', // Placeholder para backtesting
  '/api/placeholder/1200/675', // Placeholder para dashboard
  '/api/placeholder/1200/675'  // Placeholder para alertas en vivo
];

export default function IndicatorsShowcase({
  images = defaultImages,
  autoPlayInterval = 5000,
  showDots = true,
  pauseOnHover = true
}: IndicatorsShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);

  // Animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-play logic
  useEffect(() => {
    if (isPlaying && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, autoPlayInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, images.length, autoPlayInterval]);

  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsPlaying(false);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsPlaying(true);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <section className="relative min-h-[70vh] bg-apidevs-dark overflow-hidden">
      {/* Background Effects Superiores */}
      <BackgroundEffects variant="showcase" />
      
      {/* Particles Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-apidevs-primary rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div 
        ref={showcaseRef}
        className={`relative container mx-auto px-4 py-8 h-full flex items-center justify-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Main Showcase Container */}
        <div className="relative w-full max-w-6xl">
          {/* Glow Effect Container */}
          <div className="relative group">
            {/* Animated Border Glow */}
            <div className="absolute -inset-1 bg-gradient-primary rounded-2xl blur opacity-30 group-hover:opacity-50 animate-glow transition-opacity duration-500" />
            
            {/* Main Image Container */}
            <div className="relative bg-apidevs-gray/80 backdrop-blur-sm border border-apidevs-primary/30 rounded-2xl p-2 shadow-primary-lg overflow-hidden">
              {/* Images Carousel */}
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-apidevs-dark">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                      index === currentIndex
                        ? 'opacity-100 scale-100 z-10'
                        : 'opacity-0 scale-105 z-0'
                    }`}
                  >
                    {/* Imagen real del indicador o placeholder */}
                    {image.startsWith('/images/') ? (
                      /* Imagen real */
                      <div className="w-full h-full relative overflow-hidden">
                        <img 
                          src={image} 
                          alt={`Indicador APIDevs ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                          loading="lazy"
                        />
                        {/* Overlay sutil para mejorar legibilidad */}
                        <div className="absolute inset-0 bg-gradient-to-t from-apidevs-dark/10 via-transparent to-apidevs-dark/5 pointer-events-none" />
                        
                        {/* Indicator Label sobre imagen real */}
                        <div className="absolute bottom-2 right-2 bg-apidevs-primary/90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          Indicador {index + 1} - IA Calibrado
                        </div>
                      </div>
                    ) : (
                      /* Mock chart para placeholders */
                      <div className="w-full h-full bg-gradient-to-br from-apidevs-dark via-apidevs-gray to-apidevs-dark flex items-center justify-center relative overflow-hidden">
                      {/* Grid Pattern Background */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="w-full h-full" style={{
                          backgroundImage: `
                            linear-gradient(rgba(201, 217, 46, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(201, 217, 46, 0.1) 1px, transparent 1px)
                          `,
                          backgroundSize: '20px 20px'
                        }} />
                      </div>
                      
                      {/* Mock Trading Chart */}
                      <div className="relative w-full h-full flex items-center justify-center">
                        {/* Chart Container - MAXIMIZADO */}
                        <div className="w-full h-full bg-black/50 rounded-lg p-2 relative flex flex-col">
                          {/* Mock Chart Header */}
                          <div className="flex items-center justify-between mb-2 flex-shrink-0">
                            <div className="flex items-center space-x-4">
                              <div className="text-apidevs-primary font-bold">BTC/USDT</div>
                              <div className="text-green-400 text-sm">+2.34%</div>
                            </div>
                            <div className="text-apidevs-primary text-lg font-mono">$43,256.78</div>
                          </div>
                          
                          {/* Mock Chart Area - MAXIMIZADO */}
                          <div className="relative flex-1 bg-gradient-to-t from-apidevs-dark/50 to-transparent rounded">
                            <svg className="w-full h-full" viewBox="0 0 800 200">
                              <defs>
                                <linearGradient id={`chartGradient${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#C9D92E" stopOpacity="0.3" />
                                  <stop offset="100%" stopColor="#C9D92E" stopOpacity="0" />
                                </linearGradient>
                              </defs>
                              
                              {/* Mock Price Line */}
                              <path
                                d="M0,150 Q100,120 200,140 T400,100 T600,80 T800,60"
                                stroke="#C9D92E"
                                strokeWidth="2"
                                fill="none"
                                className="animate-pulse"
                              />
                              
                              {/* Fill Area */}
                              <path
                                d="M0,150 Q100,120 200,140 T400,100 T600,80 T800,60 L800,200 L0,200 Z"
                                fill={`url(#chartGradient${index})`}
                              />
                              
                              {/* Mock Buy/Sell Signals */}
                              <circle cx="200" cy="140" r="4" fill="#00ff00" className="animate-ping" />
                              <circle cx="400" cy="100" r="4" fill="#ff0000" className="animate-ping" style={{animationDelay: '1s'}} />
                              <circle cx="600" cy="80" r="4" fill="#00ff00" className="animate-ping" style={{animationDelay: '2s'}} />
                            </svg>
                            
                            {/* Floating Indicators */}
                            <div className="absolute top-4 left-4 bg-apidevs-primary text-black px-2 py-1 rounded text-xs font-bold animate-float">
                              RSI: 68.5
                            </div>
                            <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold animate-float" style={{animationDelay: '1s'}}>
                              MACD: +0.15
                            </div>
                            <div className="absolute bottom-4 left-4 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold animate-float" style={{animationDelay: '2s'}}>
                              BB: SQUEEZE
                            </div>
                          </div>
                          
                          {/* Indicator Label */}
                          <div className="absolute bottom-2 right-2 bg-apidevs-primary/90 text-black px-3 py-1 rounded-full text-xs font-bold">
                            Indicador {index + 1} - IA Calibrado
                          </div>
                        </div>
                      </div>
                      
                      {/* Reflection Effect */}
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-apidevs-dark/30 to-transparent" />
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-apidevs-dark/80 backdrop-blur-sm border border-apidevs-primary/30 rounded-full flex items-center justify-center text-apidevs-primary hover:bg-apidevs-primary/20 hover:scale-110 transition-all duration-300 z-20"
                  aria-label="Indicador anterior"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-apidevs-dark/80 backdrop-blur-sm border border-apidevs-primary/30 rounded-full flex items-center justify-center text-apidevs-primary hover:bg-apidevs-primary/20 hover:scale-110 transition-all duration-300 z-20"
                  aria-label="Siguiente indicador"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              {/* Dots Navigation */}
              {showDots && images.length > 1 && (
                <div className="flex justify-center items-center space-x-3 mt-3">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? 'bg-apidevs-primary scale-125 shadow-primary'
                          : 'bg-apidevs-primary/30 hover:bg-apidevs-primary/60 hover:scale-110'
                      }`}
                      aria-label={`Ir al indicador ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Subtle Info Badge */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-apidevs-primary text-black px-4 py-2 rounded-full text-sm font-bold shadow-primary-lg animate-float">
            ⚡ Indicadores Potenciados por IA
          </div>
        </div>
      </div>
      
      {/* Smooth Transition Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-apidevs-dark pointer-events-none"></div>
    </section>
  );
}
