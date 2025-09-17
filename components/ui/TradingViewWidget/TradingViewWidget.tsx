'use client';

import { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  symbol?: string;
  width?: string | number;
  height?: string | number;
  interval?: string;
  theme?: 'light' | 'dark';
  style?: string;
  locale?: string;
  toolbar_bg?: string;
  enable_publishing?: boolean;
  hide_side_toolbar?: boolean;
  allow_symbol_change?: boolean;
  studies?: string[];
}

export default function TradingViewWidget({
  symbol = 'BINANCE:BTCUSDT',
  width = '100%',
  height = 500,
  interval = '1D',
  theme = 'dark',
  style = '1',
  locale = 'es',
  toolbar_bg = '#f1f3f6',
  enable_publishing = false,
  hide_side_toolbar = false,
  allow_symbol_change = true,
  studies = []
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Limpiar contenedor previo
      containerRef.current.innerHTML = '';

      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;
      
      script.innerHTML = JSON.stringify({
        autosize: false,
        width,
        height,
        symbol,
        interval,
        timezone: 'Etc/UTC',
        theme,
        style,
        locale,
        toolbar_bg,
        enable_publishing,
        hide_side_toolbar,
        allow_symbol_change,
        studies,
        container_id: 'tradingview_widget'
      });

      containerRef.current.appendChild(script);
    }

    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, width, height, interval, theme, style, locale, toolbar_bg, enable_publishing, hide_side_toolbar, allow_symbol_change, studies]);

  return (
    <div className="tradingview-widget-container">
      <div ref={containerRef} id="tradingview_widget" />
      <div className="tradingview-widget-copyright">
        <a 
          href={`https://www.tradingview.com/symbols/${symbol.replace(':', '-')}/`} 
          rel="noopener nofollow" 
          target="_blank"
          className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
        >
          <span className="blue-text">Gráfico {symbol}</span> por TradingView
        </a>
      </div>
    </div>
  );
}
