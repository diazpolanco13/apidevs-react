'use client';

import { useState, useEffect } from 'react';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { Cookie, X, Settings, Shield, BarChart3, Target, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CookieBanner() {
  const { showBanner, acceptAll, rejectOptional, setCustomPreferences, preferences } = useCookieConsent();
  const [showSettings, setShowSettings] = useState(false);
  const [customPrefs, setCustomPrefs] = useState(preferences);
  const [mounted, setMounted] = useState(false);

  // Solo renderizar en el cliente para evitar hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !showBanner) return null;

  const handleCustomSave = () => {
    setCustomPreferences(customPrefs);
  };

  if (showSettings) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-apidevs-primary" />
                <h2 className="text-xl font-bold text-white">Preferencias de Cookies</h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
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
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Siempre activo
                    </div>
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
                        checked={customPrefs.analytics}
                        onChange={(e) => setCustomPrefs({ ...customPrefs, analytics: e.target.checked })}
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
                        checked={customPrefs.marketing}
                        onChange={(e) => setCustomPrefs({ ...customPrefs, marketing: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    Utilizadas para mostrar contenido relevante. Actualmente no utilizamos estas cookies.
                  </p>
                  <div className="text-xs text-gray-500">
                    Incluye: publicidad personalizada, retargeting (futuro)
                  </div>
                </div>
              </div>
            </div>

            {/* Info adicional */}
            <div className="bg-white/5 rounded-lg p-4 text-sm text-gray-400">
              <p className="mb-2">
                📋 Para más información, consulta nuestra{' '}
                <Link href="/privacy" className="text-apidevs-primary hover:underline">
                  Política de Privacidad
                </Link>
                {' '}y{' '}
                <Link href="/cookies" className="text-apidevs-primary hover:underline">
                  Política de Cookies
                </Link>
                .
              </p>
              <p>
                🔒 Puedes cambiar estas preferencias en cualquier momento desde tu configuración de cuenta.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm border-t border-white/10 p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={rejectOptional}
                className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-all"
              >
                Solo Esenciales
              </button>
              <button
                onClick={handleCustomSave}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-apidevs-primary to-green-400 hover:from-green-400 hover:to-apidevs-primary text-black font-semibold rounded-xl transition-all"
              >
                Guardar Preferencias
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-6xl mx-auto bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl shadow-2xl backdrop-blur-xl">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Icon */}
            <div className="hidden md:block w-16 h-16 bg-gradient-to-br from-apidevs-primary/20 to-green-400/20 rounded-2xl flex-shrink-0 flex items-center justify-center border border-apidevs-primary/30">
              <Cookie className="w-8 h-8 text-apidevs-primary" />
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 md:hidden">
                <Cookie className="w-5 h-5 text-apidevs-primary" />
                <h3 className="text-lg font-bold text-white">Cookies y Privacidad</h3>
              </div>
              <h3 className="hidden md:block text-xl font-bold text-white mb-2">
                🍪 Usamos cookies para mejorar tu experiencia
              </h3>
              <p className="text-gray-300 text-sm md:text-base">
                Utilizamos cookies esenciales para el funcionamiento del sitio y cookies opcionales 
                para analytics. No vendemos tu información ni la compartimos con terceros.{' '}
                <Link href="/cookies" className="text-apidevs-primary hover:underline font-medium">
                  Más información
                </Link>
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:flex-shrink-0">
              <button
                onClick={() => setShowSettings(true)}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 border border-gray-700"
              >
                <Settings className="w-4 h-4" />
                <span>Personalizar</span>
              </button>
              <button
                onClick={rejectOptional}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-all"
              >
                Solo Esenciales
              </button>
              <button
                onClick={acceptAll}
                className="px-6 py-3 bg-gradient-to-r from-apidevs-primary to-green-400 hover:from-green-400 hover:to-apidevs-primary text-black font-semibold rounded-xl transition-all shadow-lg shadow-apidevs-primary/20"
              >
                Aceptar Todas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

