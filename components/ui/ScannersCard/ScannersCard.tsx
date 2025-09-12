'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';

interface ScannersCardProps {
  images?: string[];
  autoPlayInterval?: number;
  showDots?: boolean;
  pauseOnHover?: boolean;
}

// Imágenes para scanners IA
const defaultImages = [
  '/images/indicators/rsi_scanner.png', // RSI Scanner
  '/images/indicators/BTCUSDT.P_2025-09-12_17-00-39_cefde.png', // Scanner BTC
  '/api/placeholder/800/600', // Placeholder para más scanners
];

export default function ScannersCard({
  images = defaultImages,
  autoPlayInterval = 4000,
  showDots = true,
  pauseOnHover = true
}: ScannersCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Animación de entrada
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

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

  // Modal functions
  const openModal = (imageIndex: number) => {
    setModalImageIndex(imageIndex);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  const goToModalSlide = (index: number) => {
    setModalImageIndex(index);
  };

  const nextModalSlide = () => {
    setModalImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevModalSlide = () => {
    setModalImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isModalOpen]);

  return (
    <section className="relative py-16 lg:py-20 bg-apidevs-dark overflow-hidden">
      {/* Background Effects Sutiles */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-500 rounded-full opacity-10 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
        
        {/* Subtle glow effects */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/2 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/5 w-48 h-48 bg-blue-500/3 rounded-full blur-3xl animate-float-reverse [animation-delay:3s]" />
      </div>

      <div 
        ref={cardRef}
        className={`relative container mx-auto px-4 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Main Card */}
        <div className="relative max-w-7xl mx-auto">
          {/* Glow Effect Container */}
          <div className="relative group">
            {/* Animated Border Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-500 rounded-3xl blur opacity-10 group-hover:opacity-15 animate-glow transition-opacity duration-500" />
            
            {/* Card Content */}
            <div className="relative bg-apidevs-gray/80 backdrop-blur-sm border border-blue-500/10 rounded-3xl p-6 lg:p-8 shadow-card-dark overflow-hidden">
              
              {/* Desktop Layout: Grid 2 columns - IMAGEN DERECHA */}
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                
                {/* Content - Left Side */}
                <div className="space-y-6 order-1">
                  {/* Badge */}
                  <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-sm text-blue-400 font-medium">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
                    Scanners IA Avanzados
                  </div>

                  {/* Main Headline */}
                  <div className="space-y-4">
                    <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold font-jeko leading-tight">
                      Detecta{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-primary animate-glow">
                        160 Criptos
                      </span>
                      {' '}en Tiempo Real
                    </h2>
                  </div>

                  {/* Description */}
                  <p className="text-lg text-gray-300 leading-relaxed">
                    Nuestros scanners de IA monitorean continuamente 160 criptomonedas, detectando patrones y oportunidades que los traders manuales jamás podrían identificar. Recibe alertas instantáneas cuando se activan las condiciones perfectas.
                  </p>

                  {/* Benefits List */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-gray-200">
                        <span className="font-semibold text-blue-400">Monitoreo 24/7</span> de 160 criptomonedas simultáneamente
                      </p>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-gray-200">
                        <span className="font-semibold text-blue-400">Alertas instantáneas</span> cuando se detectan oportunidades
                      </p>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-gray-200">
                        <span className="font-semibold text-blue-400">Filtros personalizables</span> según tu estrategia de trading
                      </p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4">
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-lg text-white font-bold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105 group"
                    >
                      <span className="flex items-center">
                        Activar Scanners IA - Gratis 7 Días
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </Button>
                  </div>

                  {/* Social Proof */}
                  <div className="flex items-center space-x-4 pt-2">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm text-gray-400">
                      <span className="text-blue-400 font-semibold">5,200+ traders</span> usan nuestros scanners diariamente
                    </p>
                  </div>
                </div>

                {/* Image Carousel - Right Side */}
                <div 
                  className="relative order-2"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Carousel Container */}
                  <div className="relative aspect-video overflow-hidden rounded-2xl bg-apidevs-dark border border-blue-500/10 cursor-pointer hover:border-blue-500/20 transition-colors duration-300"
                       onClick={() => openModal(currentIndex)}>
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                          index === currentIndex
                            ? 'opacity-100 scale-100 z-10'
                            : 'opacity-0 scale-105 z-0'
                        }`}
                      >
                        {/* Imagen real o placeholder */}
                        {image.startsWith('/images/') ? (
                          <div className="w-full h-full relative group">
                            <img 
                              src={image} 
                              alt={`Scanner IA ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {/* Overlay sutil */}
                            <div className="absolute inset-0 bg-gradient-to-t from-apidevs-dark/20 via-transparent to-apidevs-dark/10 pointer-events-none" />
                            
                            {/* Scanner Label */}
                            <div className="absolute bottom-3 right-3 bg-blue-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                              Scanner {index + 1}
                            </div>
                            
                            {/* Click to expand hint */}
                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-90 transition-opacity duration-300">
                              Click para ampliar
                            </div>
                          </div>
                        ) : (
                          /* Mock Scanner Display */
                          <div className="w-full h-full bg-gradient-to-br from-apidevs-dark via-apidevs-gray to-apidevs-dark flex items-center justify-center relative">
                            {/* Grid Pattern */}
                            <div className="absolute inset-0 opacity-5">
                              <div className="w-full h-full" style={{
                                backgroundImage: `
                                  linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                                `,
                                backgroundSize: '20px 20px'
                              }} />
                            </div>
                            
                            {/* Mock Scanner Interface */}
                            <div className="relative w-full h-full flex items-center justify-center p-4">
                              <div className="w-full h-full bg-black/40 rounded-lg p-3 relative">
                                {/* Mock Scanner Data */}
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-blue-400 text-sm font-bold">SCANNER IA ACTIVO</span>
                                    <span className="text-green-400 text-xs">160 CRYPTOS</span>
                                  </div>
                                  
                                  {/* Mock crypto list */}
                                  {['BTC/USDT', 'ETH/USDT', 'ADA/USDT', 'SOL/USDT'].map((crypto, i) => (
                                    <div key={crypto} className="flex justify-between text-xs">
                                      <span className="text-gray-300">{crypto}</span>
                                      <span className={`${i % 2 === 0 ? 'text-green-400' : 'text-blue-400'}`}>
                                        {i % 2 === 0 ? '+' : '●'} SEÑAL
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Scanner Label */}
                                <div className="absolute bottom-2 right-2 bg-blue-500/80 text-white px-2 py-1 rounded text-xs font-bold">
                                  ESCANEANDO
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Navigation Dots */}
                    {showDots && images.length > 1 && (
                      <div className="absolute bottom-3 left-3 flex space-x-2">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              index === currentIndex
                                ? 'bg-blue-500 scale-125'
                                : 'bg-white/30 hover:bg-white/60'
                            }`}
                            aria-label={`Ver scanner ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL FULLSCREEN - Reutilizado con colores azules */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <div className="relative w-full h-full max-w-6xl max-h-[85vh] p-3 flex items-center justify-center">
            
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 z-10 w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors duration-300 group border border-blue-500/20"
              aria-label="Cerrar modal"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevModalSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 border border-blue-500/20"
                  aria-label="Imagen anterior"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={nextModalSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 border border-blue-500/20"
                  aria-label="Imagen siguiente"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Main Image Container */}
            <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden bg-apidevs-dark border border-blue-500/20 shadow-2xl" style={{aspectRatio: '16/10'}}>
              
              {/* Image Display */}
              <div className="relative w-full h-full">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                      index === modalImageIndex
                        ? 'opacity-100 scale-100 z-10'
                        : 'opacity-0 scale-105 z-0'
                    }`}
                  >
                    {image.startsWith('/images/') ? (
                      <div className="w-full h-full relative">
                        <img 
                          src={image} 
                          alt={`Scanner IA ${index + 1} - Vista ampliada`}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                        
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="bg-black/80 backdrop-blur-md rounded-xl p-3 border border-blue-500/20">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-xl font-bold text-white mb-1">
                                  Scanner {index + 1} - Powered by IA
                                </h3>
                                <p className="text-gray-300 text-sm">
                                  Detección automática de patrones en tiempo real
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold mb-1">
                                  ACTIVO
                                </div>
                                <div className="text-blue-400 text-xs font-semibold">
                                  160 Cryptos
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-apidevs-dark via-apidevs-gray to-apidevs-dark flex items-center justify-center relative">
                        <div className="absolute inset-0 opacity-15">
                          <div className="w-full h-full" style={{
                            backgroundImage: `
                              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                            `,
                            backgroundSize: '40px 40px'
                          }} />
                        </div>
                        
                        <div className="relative w-full h-full flex items-center justify-center p-8">
                          <div className="w-full h-full bg-black/60 rounded-2xl p-6 relative border border-blue-500/20">
                            <div className="space-y-4">
                              <div className="text-center">
                                <h3 className="text-2xl font-bold text-white mb-2">Scanner IA {index + 1}</h3>
                                <p className="text-blue-400 text-sm">Simulación - 160 Criptomonedas Monitoreadas</p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                {['BTC/USDT', 'ETH/USDT', 'ADA/USDT', 'SOL/USDT', 'MATIC/USDT', 'DOT/USDT'].map((crypto, i) => (
                                  <div key={crypto} className="flex justify-between bg-black/40 p-2 rounded">
                                    <span className="text-gray-300">{crypto}</span>
                                    <span className="text-blue-400">● SCAN</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="absolute bottom-4 left-4 right-4">
                              <div className="bg-black/80 backdrop-blur-md rounded-xl p-3 border border-blue-500/20">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-lg font-bold text-white mb-1">
                                      Scanner {index + 1} - Simulación IA
                                    </h3>
                                    <p className="text-gray-300 text-sm">
                                      Monitoreo continuo de oportunidades
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold mb-1">
                                      ESCANEANDO
                                    </div>
                                    <div className="text-blue-400 text-xs font-semibold">
                                      IA Activa
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Modal Navigation Dots */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToModalSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === modalImageIndex
                          ? 'bg-blue-500 scale-125 shadow-lg'
                          : 'bg-white/40 hover:bg-white/70 hover:scale-110'
                      }`}
                      aria-label={`Ver scanner ${index + 1} en modal`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Modal Instructions */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center text-white/70 text-xs">
              <p>Usa las flechas para navegar • ESC para cerrar</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
