import { Indicator, MenuCategory } from './types';

// Datos mock de indicadores
export const mockIndicators: Indicator[] = [
  {
    id: '1',
    slug: 'rsi-divergence-pro',
    title: 'RSI Divergence Pro',
    description: 'Detector avanzado de divergencias RSI con alertas automáticas y filtros de tendencia.',
    category: 'premium',
    type: 'indicator',
    tags: ['RSI', 'Divergencias', 'Señales'],
    image: '/images/indicators/rsi_scanner.png',
    publishedAt: '2025-09-15',
    tradingViewSymbol: 'BINANCE:BTCUSDT',
    tradingViewUrl: 'https://www.tradingview.com/script/premium-rsi-divergence-pro/',
    tradingViewScriptId: 'premium-rsi-divergence-pro'
  },
  {
    id: '2',
    slug: 'ai-trend-scanner',
    title: 'AI Trend Scanner',
    description: 'Scanner inteligente que analiza 160+ criptomonedas usando algoritmos de IA para detectar tendencias.',
    category: 'premium',
    type: 'scanner',
    tags: ['IA', 'Scanner', 'Tendencias'],
    image: '/images/indicators/solo_scanner.png',
    publishedAt: '2025-09-10'
  },
  {
    id: '3',
    slug: 'support-resistance-classic',
    title: 'Support & Resistance Classic',
    description: 'Herramienta clásica para identificar niveles de soporte y resistencia automáticamente.',
    category: 'free',
    type: 'indicator',
    tags: ['Soporte', 'Resistencia', 'Niveles'],
    image: '/images/indicators/BTCUSDT.P_2025-09-12_17-00-39_cefde.png',
    publishedAt: '2025-09-05'
  },
  {
    id: '4',
    slug: 'volume-profile-advanced',
    title: 'Volume Profile Advanced',
    description: 'Análisis avanzado de volumen por precio con zonas de alto volumen y puntos de control.',
    category: 'premium',
    type: 'indicator',
    tags: ['Volumen', 'Profile', 'Zonas'],
    image: '/images/indicators/rsi_scanner.png',
    publishedAt: '2025-09-01'
  },
  {
    id: '5',
    slug: 'fibonacci-retracement-auto',
    title: 'Fibonacci Retracement Auto',
    description: 'Retrocesos de Fibonacci automáticos con niveles de extensión y confluencias.',
    category: 'free',
    type: 'indicator',
    tags: ['Fibonacci', 'Retrocesos', 'Niveles'],
    image: '/images/indicators/solo_scanner.png',
    publishedAt: '2025-08-28'
  },
  {
    id: '6',
    slug: 'smart-money-concepts',
    title: 'Smart Money Concepts',
    description: 'Indicador exclusivo que identifica movimientos de dinero inteligente y zonas institucionales.',
    category: 'premium',
    type: 'indicator',
    tags: ['SMC', 'Institucional', 'Zonas'],
    image: '/images/indicators/BTCUSDT.P_2025-09-12_17-00-39_cefde.png',
    publishedAt: '2025-08-25'
  },
  {
    id: '7',
    slug: 'crypto-screener-pro',
    title: 'Crypto Screener Pro',
    description: 'Escáner avanzado para 500+ criptomonedas con filtros personalizables y alertas en tiempo real.',
    category: 'premium',
    type: 'scanner',
    tags: ['Crypto', 'Screener', 'Filtros'],
    image: '/images/indicators/rsi_scanner.png',
    publishedAt: '2025-09-12'
  },
  {
    id: '8',
    slug: 'position-calculator',
    title: 'Position Size Calculator',
    description: 'Calculadora automática de tamaño de posición basada en riesgo y capital disponible.',
    category: 'free',
    type: 'tool',
    tags: ['Calculadora', 'Riesgo', 'Posición'],
    image: '/images/indicators/solo_scanner.png',
    publishedAt: '2025-09-08',
    tradingViewSymbol: 'BINANCE:BTCUSDT',
    tradingViewUrl: 'https://www.tradingview.com/script/laRupsVf-Rally-Base-Drop-Signals-LuxAlgo/',
    tradingViewScriptId: 'laRupsVf'
  },
  {
    id: '9',
    slug: 'risk-reward-analyzer',
    title: 'Risk Reward Analyzer',
    description: 'Herramienta avanzada para analizar y optimizar la relación riesgo-beneficio de tus trades.',
    category: 'premium',
    type: 'tool',
    tags: ['Riesgo', 'Beneficio', 'Análisis'],
    image: '/images/indicators/BTCUSDT.P_2025-09-12_17-00-39_cefde.png',
    publishedAt: '2025-09-03'
  }
];

// Estructura de menú lateral
export const menuCategories: MenuCategory[] = [
  {
    id: 'all',
    label: 'Todos los productos',
    icon: '📊'
  },
  {
    id: 'free',
    label: 'Gratuitos',
    icon: '🆓',
    subcategories: [
      { id: 'free-indicator', label: 'Indicadores', type: 'indicator' },
      { id: 'free-scanner', label: 'Scanners', type: 'scanner' },
      { id: 'free-tool', label: 'Herramientas', type: 'tool' }
    ]
  },
  {
    id: 'premium',
    label: 'Premium',
    icon: '⭐',
    subcategories: [
      { id: 'premium-indicator', label: 'Indicadores', type: 'indicator' },
      { id: 'premium-scanner', label: 'Scanners', type: 'scanner' },
      { id: 'premium-tool', label: 'Herramientas', type: 'tool' }
    ]
  }
];
