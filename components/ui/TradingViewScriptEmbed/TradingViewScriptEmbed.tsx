'use client';

import { useEffect, useRef } from 'react';

interface TradingViewScriptEmbedProps {
  scriptId: string;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export default function TradingViewScriptEmbed({
  scriptId,
  width = '100%',
  height = 500,
  className = ''
}: TradingViewScriptEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && scriptId) {
      // Limpiar contenedor previo
      containerRef.current.innerHTML = '';

      // Crear iframe para el embed del script específico
      const iframe = document.createElement('iframe');
      iframe.src = `https://s.tradingview.com/embed/${scriptId}`;
      iframe.width = typeof width === 'number' ? width.toString() : width;
      iframe.height = typeof height === 'number' ? height.toString() : height;
      iframe.style.border = 'none';
      iframe.style.borderRadius = '12px';
      iframe.style.backgroundColor = '#1a1a1a';
      iframe.frameBorder = '0';
      (iframe as any).allowTransparency = true; // TypeScript workaround
      iframe.scrolling = 'no';
      iframe.allow = 'encrypted-media';

      containerRef.current.appendChild(iframe);
    }

    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [scriptId, width, height]);

  if (!scriptId) {
    return (
      <div 
        className={`bg-gray-800 rounded-xl p-8 text-center min-h-[400px] ${className}`}
      >
        <div className="text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg font-medium">Vista previa del indicador</p>
          <p className="text-sm">El embed se cargará cuando esté disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`tradingview-script-embed ${className}`}>
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
