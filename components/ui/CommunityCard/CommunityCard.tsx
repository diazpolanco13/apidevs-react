'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';

interface CommunityCardProps {
  images?: string[];
  autoPlayInterval?: number;
  showDots?: boolean;
  pauseOnHover?: boolean;
}

// Imágenes para comunidad y mentorías
const defaultImages = [
  '/images/indicators/BTCUSDT.P_2025-09-12_17-00-39_cefde.png', // Comunidad trading
  '/images/indicators/rsi_scanner.png', // Alertas comunidad
  '/api/placeholder/800/600', // Placeholder para más contenido comunidad
];

export default function CommunityCard({
  images = defaultImages,
  autoPlayInterval = 4000,
  showDots = true,
  pauseOnHover = true
}: CommunityCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Array<{left: string; top: string; delay: string; duration: string}>>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Generar partículas solo en el cliente
  useEffect(() => {
    setMounted(true);
    const generatedParticles = [...Array(8)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${8 + Math.random() * 4}s`
    }));
    setParticles(generatedParticles);
  }, []);

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
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'unset'; // Restore scroll
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
        {mounted && particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-500 rounded-full opacity-10 animate-float"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration
            }}
          />
        ))}
        
        {/* Subtle glow effects */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-500/2 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 left-1/5 w-48 h-48 bg-purple-500/3 rounded-full blur-3xl animate-float-reverse [animation-delay:3s]" />
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
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-10 group-hover:opacity-15 animate-glow transition-opacity duration-500" />
            
            {/* Card Content */}
            <div className="relative bg-apidevs-gray/80 backdrop-blur-sm border border-purple-500/10 rounded-3xl p-6 lg:p-8 shadow-card-dark overflow-hidden">
              
              {/* Desktop Layout: Grid 2 columns */}
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                
                {/* Image Carousel - Left Side */}
                <div 
                  className="relative order-2 lg:order-1"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Carousel Container */}
                  <div className="relative aspect-video overflow-hidden rounded-2xl bg-apidevs-dark border border-apidevs-primary/5 cursor-pointer hover:border-apidevs-primary/10 transition-colors duration-300"
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
                          <div className="w-full h-full relative">
                            <img 
                              src={image} 
                              alt={`Estrategia ganadora ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {/* Overlay sutil */}
                            <div className="absolute inset-0 bg-gradient-to-t from-apidevs-dark/20 via-transparent to-apidevs-dark/10 pointer-events-none" />
                            
                            {/* Strategy Label */}
                            <div className="absolute bottom-3 right-3 bg-apidevs-primary/90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-xs font-bold">
                              Estrategia {index + 1}
                            </div>
                            
                            {/* Click to expand hint */}
                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-90 transition-opacity duration-300">
                              Click para ampliar
                            </div>
                          </div>
                        ) : (
                          /* Mock Strategy Chart */
                          <div className="w-full h-full bg-gradient-to-br from-apidevs-dark via-apidevs-gray to-apidevs-dark flex items-center justify-center relative">
                            {/* Grid Pattern */}
                            <div className="absolute inset-0 opacity-5">
                              <div className="w-full h-full" style={{
                                backgroundImage: `
                                  linear-gradient(rgba(201, 217, 46, 0.1) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(201, 217, 46, 0.1) 1px, transparent 1px)
                                `,
                                backgroundSize: '20px 20px'
                              }} />
                            </div>
                            
                            {/* Mock Winning Strategy */}
                            <div className="relative w-full h-full flex items-center justify-center p-4">
                              <div className="w-full h-full bg-black/40 rounded-lg p-3 relative">
                                {/* Mock Chart */}
                                <svg className="w-full h-full" viewBox="0 0 400 200">
                                  <defs>
                                    <linearGradient id={`strategyGradient${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                      <stop offset="0%" stopColor="#C9D92E" stopOpacity="0.4" />
                                      <stop offset="100%" stopColor="#C9D92E" stopOpacity="0" />
                                    </linearGradient>
                                  </defs>
                                  
                                  {/* Winning trend line */}
                                  <path
                                    d="M0,160 Q50,140 100,120 T200,80 T300,60 T400,40"
                                    stroke="#C9D92E"
                                    strokeWidth="2"
                                    fill="none"
                                    opacity="0.8"
                                  />
                                  
                                  {/* Fill area */}
                                  <path
                                    d="M0,160 Q50,140 100,120 T200,80 T300,60 T400,40 L400,200 L0,200 Z"
                                    fill={`url(#strategyGradient${index})`}
                                    opacity="0.6"
                                  />
                                  
                                  {/* Win signals */}
                                  <circle cx="100" cy="120" r="2" fill="#00ff00" opacity="0.7" />
                                  <circle cx="200" cy="80" r="2" fill="#00ff00" opacity="0.7" />
                                  <circle cx="300" cy="60" r="2" fill="#00ff00" opacity="0.7" />
                                </svg>
                                
                                {/* Strategy Label */}
                                <div className="absolute bottom-2 right-2 bg-green-500/80 text-white px-2 py-1 rounded text-xs font-bold">
                                  +87% WIN
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
                                ? 'bg-apidevs-primary scale-125'
                                : 'bg-white/30 hover:bg-white/60'
                            }`}
                            aria-label={`Ver estrategia ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content - Right Side */}
                <div className="space-y-6 order-1 lg:order-2">
                  {/* Badge */}
                  <div className="inline-flex items-center px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-sm text-purple-400 font-medium">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></span>
                    Comunidad VIP
                  </div>

                  {/* Main Headline */}
                  <div className="space-y-4">
                    <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold font-jeko leading-tight">
                      Únete a{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-glow">
                        3,500+ Traders
                      </span>
                      {' '}de Élite
                    </h2>
                  </div>

                  {/* Description */}
                  <p className="text-lg text-gray-300 leading-relaxed">
                    Únete a nuestra comunidad exclusiva en Telegram donde traders profesionales comparten estrategias en tiempo real, reciben mentorías personalizadas y obtienen alertas VIP antes que nadie.
                  </p>

                  {/* Benefits List */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-apidevs-primary rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-gray-200">
                        <span className="font-semibold text-apidevs-primary">IA identifica patrones</span> invisibles al ojo humano
                      </p>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-apidevs-primary rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-gray-200">
                        <span className="font-semibold text-apidevs-primary">Calibración automática</span> según volatilidad del mercado
                      </p>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-apidevs-primary rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-gray-200">
                        <span className="font-semibold text-apidevs-primary">Precisión optimizada</span> por machine learning
                      </p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4">
                    <Button
                      className="bg-gradient-primary hover:shadow-primary-lg text-black font-bold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105 group"
                    >
                      <span className="flex items-center">
                        Accede a la IA - Solo 48 Horas
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
                      <span className="text-apidevs-primary font-semibold">7,000+ traders</span> ya usan nuestras estrategias
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL FULLSCREEN */}
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
              className="absolute top-3 right-3 z-10 w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors duration-300 group border border-purple-500/20"
              aria-label="Cerrar modal"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                {/* Previous Arrow */}
                <button
                  onClick={prevModalSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 border border-purple-500/20"
                  aria-label="Imagen anterior"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Next Arrow */}
                <button
                  onClick={nextModalSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 border border-purple-500/20"
                  aria-label="Imagen siguiente"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Main Image Container - Compacto y adaptativo */}
            <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden bg-apidevs-dark border border-apidevs-primary/20 shadow-2xl" style={{aspectRatio: '16/10'}}>
              
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
                    {/* Imagen real o placeholder */}
                    {image.startsWith('/images/') ? (
                      <div className="w-full h-full relative">
                        <img 
                          src={image} 
                          alt={`Estrategia ganadora ${index + 1} - Vista ampliada`}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                        
                        {/* Strategy Info Overlay */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="bg-black/80 backdrop-blur-md rounded-xl p-3 border border-apidevs-primary/20">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-xl font-bold text-white mb-1">
                                  Estrategia {index + 1} - Calibrada por IA
                                </h3>
                                <p className="text-gray-300 text-sm">
                                  Algoritmo optimizado para máxima precisión en tiempo real
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="bg-apidevs-primary text-black px-3 py-1 rounded-full text-sm font-bold mb-1">
                                  ACTIVA
                                </div>
                                <div className="text-apidevs-primary text-xs font-semibold">
                                  +87% Precisión
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Mock Strategy Chart - Fullscreen Version */
                      <div className="w-full h-full bg-gradient-to-br from-apidevs-dark via-apidevs-gray to-apidevs-dark flex items-center justify-center relative">
                        {/* Enhanced Grid Pattern */}
                        <div className="absolute inset-0 opacity-15">
                          <div className="w-full h-full" style={{
                            backgroundImage: `
                              linear-gradient(rgba(201, 217, 46, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(201, 217, 46, 0.1) 1px, transparent 1px)
                            `,
                            backgroundSize: '40px 40px'
                          }} />
                        </div>
                        
                        {/* Enhanced Mock Chart */}
                        <div className="relative w-full h-full flex items-center justify-center p-8">
                          <div className="w-full h-full bg-black/60 rounded-2xl p-6 relative border border-apidevs-primary/20">
                            {/* Enhanced SVG Chart */}
                            <svg className="w-full h-full" viewBox="0 0 800 400">
                              <defs>
                                <linearGradient id={`modalStrategyGradient${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#C9D92E" stopOpacity="0.6" />
                                  <stop offset="100%" stopColor="#C9D92E" stopOpacity="0" />
                                </linearGradient>
                              </defs>
                              
                              {/* Enhanced winning trend line */}
                              <path
                                d="M0,320 Q100,280 200,240 T400,160 T600,120 T800,80"
                                stroke="#C9D92E"
                                strokeWidth="4"
                                fill="none"
                                className="animate-pulse"
                              />
                              
                              {/* Enhanced fill area */}
                              <path
                                d="M0,320 Q100,280 200,240 T400,160 T600,120 T800,80 L800,400 L0,400 Z"
                                fill={`url(#modalStrategyGradient${index})`}
                              />
                              
                              {/* Enhanced win signals */}
                              <circle cx="200" cy="240" r="6" fill="#00ff00" className="animate-ping" />
                              <circle cx="400" cy="160" r="6" fill="#00ff00" className="animate-ping" style={{animationDelay: '1s'}} />
                              <circle cx="600" cy="120" r="6" fill="#00ff00" className="animate-ping" style={{animationDelay: '2s'}} />
                            </svg>
                            
                            {/* Enhanced Strategy Info */}
                            <div className="absolute bottom-4 left-4 right-4">
                              <div className="bg-black/80 backdrop-blur-md rounded-xl p-3 border border-apidevs-primary/20">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-lg font-bold text-white mb-1">
                                      Estrategia {index + 1} - Simulación IA
                                    </h3>
                                    <p className="text-gray-300 text-sm">
                                      Patrón optimizado con machine learning
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold mb-1">
                                      +87% WIN
                                    </div>
                                    <div className="text-apidevs-primary text-xs font-semibold">
                                      IA Calibrada
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
                          ? 'bg-apidevs-primary scale-125 shadow-lg'
                          : 'bg-white/40 hover:bg-white/70 hover:scale-110'
                      }`}
                      aria-label={`Ver estrategia ${index + 1} en modal`}
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
