'use client';

import { useState, useEffect, ReactNode } from 'react';

interface ChartWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  delay?: number;
}

/**
 * Wrapper para componentes de Chart.js que previene errores en React 19
 * relacionados con _scrollZoom y otras propiedades internas
 */
export default function ChartWrapper({
  children,
  fallback,
  delay = 100
}: ChartWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Dar tiempo extra para que las librerías de gráficos se inicializen completamente
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!isMounted) {
    return (
      fallback || (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
            <div className="text-gray-400 text-sm">Cargando gráfico...</div>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}