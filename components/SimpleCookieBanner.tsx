'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X, Settings, Shield, BarChart3, Target } from 'lucide-react';
import {
  hasGivenConsent,
  getCookiePreferences,
  saveCookiePreferences,
  acceptAllCookies,
  acceptEssentialOnly,
  type CookiePreferences
} from '@/utils/cookieConsent';

export default function SimpleCookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    marketing: true,
  });
  const [mounted, setMounted] = useState(false);

  // Solo renderizar en cliente para evitar hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Verificar si ya dio consentimiento
    const hasConsent = hasGivenConsent();
    
    if (!hasConsent) {
      // Mostrar banner después de 1 segundo
      setTimeout(() => {
        setShowBanner(true);
      }, 1000);
    }
    
    // Cargar preferencias actuales
    setPreferences(getCookiePreferences());
  }, []);

  // No renderizar nada hasta que esté montado
  if (!mounted || !showBanner) {
    return null;
  }

  const handleAcceptAll = () => {
    acceptAllCookies();
    setShowBanner(false);
  };

  const handleEssentialOnly = () => {
    acceptEssentialOnly();
    setShowBanner(false);
  };

  const handleSaveCustom = () => {
    saveCookiePreferences(preferences);
    setShowSettings(false);
    setShowBanner(false);
  };

  // Modal de configuración PREMIUM estilo dashboard
  if (showSettings) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-apidevs-dark/95 backdrop-blur-lg animate-fade-in duration-300">
        <div className="relative max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
          {/* Glow effect externo - Azul suave y confiable */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-3xl animate-pulse"></div>
          
          <div className="relative bg-[#1a1f2e]/98 backdrop-blur-xl border-2 border-blue-500/40 rounded-2xl shadow-2xl shadow-blue-500/30 overflow-y-auto max-h-[90vh]">
            {/* Borde superior brillante - Azul profesional */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            
            {/* Header Premium */}
            <div className="sticky top-0 bg-[#1a1f2e]/98 backdrop-blur-xl border-b border-blue-500/30 p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Icon con glow azul confiable */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/30 rounded-xl blur-lg"></div>
                    <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-xl flex items-center justify-center border-2 border-blue-500/50 shadow-lg shadow-blue-500/50">
                      <Settings className="w-5 h-5 text-blue-400 drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      Preferencias de Cookies
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
                      </span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Configura tu experiencia</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="group relative p-2 hover:bg-white/10 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-500/30"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
            {/* Essential Cookies */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">Cookies Esenciales</h3>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium">
                      Siempre activo
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    Necesarias para el funcionamiento básico del sitio. No se pueden desactivar.
                  </p>
                  <div className="text-xs text-gray-500">
                    Incluye: autenticación, sesión, seguridad
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">Cookies de Analytics</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    Nos ayudan a entender cómo usas la aplicación para mejorar tu experiencia.
                  </p>
                  <div className="text-xs text-gray-500">
                    Incluye: páginas visitadas, tiempo en el sitio, interacciones
                  </div>
                </div>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">Cookies de Marketing</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    Utilizadas para mostrar contenido relevante. Actualmente no utilizamos estas cookies.
                  </p>
                  <div className="text-xs text-gray-500">
                    Incluye: publicidad personalizada (futuro)
                  </div>
                </div>
              </div>
            </div>

              {/* Info adicional */}
              <div className="bg-white/5 rounded-lg p-4 text-sm text-gray-400">
                <p>
                  📋 Para más información, consulta nuestra{' '}
                  <Link href="/cookies" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                    Política de Cookies
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Footer Premium */}
            <div className="sticky bottom-0 bg-[#1a1f2e]/98 backdrop-blur-xl border-t border-blue-500/30 p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleEssentialOnly}
                className="group relative flex-1 px-6 py-3 bg-[#1a1f2e] hover:bg-[#242936] text-white font-medium rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative z-10">Solo Esenciales</span>
              </button>
              <button
                onClick={handleSaveCustom}
                className="group relative flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-size-200 hover:bg-right text-white font-bold rounded-xl transition-all duration-500 shadow-xl shadow-blue-500/50 hover:shadow-2xl hover:shadow-purple-500/70 overflow-hidden border-2 border-blue-500/50"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative z-10 drop-shadow-lg">✨ Guardar Preferencias</span>
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Banner principal con diseño PREMIUM - Azul confiable
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-slide-up duration-500">
      <div className="max-w-6xl mx-auto relative">
        {/* Glow effect suave y profesional */}
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-3xl blur-2xl animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent rounded-2xl blur-xl"></div>
        
        <div className="relative bg-[#1a1f2e]/95 backdrop-blur-xl border-2 border-blue-500/40 rounded-2xl shadow-2xl shadow-blue-500/20 overflow-hidden">
          {/* Borde superior brillante azul */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          
          {/* Efecto de resplandor interno azul/morado */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
          
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Icon Premium con glow azul confiable */}
              <div className="hidden md:flex relative group">
                {/* Glow rings azules suaves */}
                <div className="absolute inset-0 bg-blue-500/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="absolute inset-0 bg-purple-500/20 rounded-2xl blur-2xl animate-pulse"></div>
                
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-2xl flex items-center justify-center border-2 border-blue-500/50 shadow-lg shadow-blue-500/50">
                  <Cookie className="w-8 h-8 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 md:hidden">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-xl flex items-center justify-center border border-blue-500/50">
                    <Cookie className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Cookies y Privacidad</h3>
                </div>
                <h3 className="hidden md:block text-xl font-bold text-white mb-3 flex items-center gap-3">
                  🍪 Usamos cookies para mejorar tu experiencia
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-400 shadow-lg shadow-blue-400/50"></span>
                  </span>
                </h3>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                  Utilizamos cookies esenciales para el funcionamiento del sitio y cookies opcionales 
                  para analytics. <span className="text-white">No vendemos tu información.</span>{' '}
                  <Link href="/cookies" className="inline-flex items-center gap-1 text-blue-400 hover:text-purple-400 font-semibold transition-all duration-300 group">
                    Más información
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </p>
              </div>

              {/* Actions Premium azul confiable */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:flex-shrink-0">
                <button
                  onClick={() => setShowSettings(true)}
                  className="group relative px-6 py-3 bg-[#1a1f2e] hover:bg-[#242936] text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-white/20 hover:border-blue-500/50 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300 relative z-10" />
                  <span className="relative z-10">Personalizar</span>
                </button>
                <button
                  onClick={handleEssentialOnly}
                  className="group relative px-6 py-3 bg-[#1a1f2e] hover:bg-[#242936] text-white font-medium rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="relative z-10">Solo Esenciales</span>
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-size-200 hover:bg-right text-white font-bold rounded-xl transition-all duration-500 shadow-xl shadow-blue-500/50 hover:shadow-2xl hover:shadow-purple-500/70 overflow-hidden border-2 border-blue-500/50"
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="relative z-10 drop-shadow-lg">✨ Aceptar Todas</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

