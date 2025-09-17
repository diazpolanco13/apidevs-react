// Tipos de datos para indicadores
export interface Indicator {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: 'free' | 'premium';
  type: 'indicator' | 'scanner' | 'tool';
  tags: string[];
  image: string;
  publishedAt: string;
  // TradingView Integration
  tradingViewUrl?: string; // URL del indicador en TradingView
  tradingViewSymbol?: string; // Símbolo para el widget (ej: "BINANCE:BTCUSDT")
  tradingViewScriptId?: string; // ID del script para embeds
}

export interface MenuCategory {
  id: string;
  label: string;
  icon: string;
  subcategories?: {
    id: string;
    label: string;
    type: 'indicator' | 'scanner' | 'tool';
  }[];
}
