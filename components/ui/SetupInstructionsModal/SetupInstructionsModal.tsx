'use client';

import { useState } from 'react';
import { Indicator } from '@/components/ui/IndicatorsHub/types';

interface SetupInstructionsModalProps {
  indicator: Indicator;
  isOpen: boolean;
  onClose: () => void;
}

export default function SetupInstructionsModal({ 
  indicator, 
  isOpen, 
  onClose 
}: SetupInstructionsModalProps) {
  if (!isOpen) return null;

  const handleGetAccess = () => {
    // Abrir TradingView en nueva pestaña
    if (indicator.tradingViewUrl) {
      window.open(indicator.tradingViewUrl, '_blank', 'noopener,noreferrer');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-white mb-6">
          Instrucciones de Configuración
        </h2>

        {/* Instructions */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start">
            <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
              1
            </div>
            <p className="text-gray-300 leading-relaxed">
              Haz clic en el botón "Obtener Acceso" a continuación
            </p>
          </div>

          <div className="flex items-start">
            <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
              2
            </div>
            <p className="text-gray-300 leading-relaxed">
              Serás redirigido a TradingView donde podrás hacer clic en "Agregar a Indicadores Favoritos"
            </p>
          </div>

          <div className="flex items-start">
            <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
              3
            </div>
            <p className="text-gray-300 leading-relaxed">
              Luego podrás acceder al indicador en TradingView desde tu Gráfico → Indicadores → Favoritos
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleGetAccess}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 flex items-center justify-center"
        >
          <span className="mr-2">Obtener Acceso</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>

        {/* Info Footer */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-blue-300 text-sm leading-relaxed">
              <strong>Indicador Gratuito:</strong> Este indicador está disponible sin costo en TradingView. Solo necesitas agregarlo a tus favoritos para usarlo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
