'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Tipos de datos
interface Indicator {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: 'free' | 'premium';
  type: 'indicator' | 'scanner' | 'tool';
  tags: string[];
  image: string;
  publishedAt: string;
}

// Datos mock de indicadores
const mockIndicators: Indicator[] = [
  {
    id: '1',
    slug: 'rsi-divergence-pro',
    title: 'RSI Divergence Pro',
    description: 'Detector avanzado de divergencias RSI con alertas automáticas y filtros de tendencia.',
    category: 'premium',
    type: 'indicator',
    tags: ['RSI', 'Divergencias', 'Señales'],
    image: '/images/indicators/rsi_scanner.png',
    publishedAt: '2025-09-15'
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
    publishedAt: '2025-09-08'
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
const menuCategories = [
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

export default function IndicatorsHub() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar indicadores
  const filteredIndicators = mockIndicators.filter(indicator => {
    const categoryMatch = selectedCategory === 'all' || indicator.category === selectedCategory;
    const typeMatch = !selectedType || indicator.type === selectedType;
    const searchMatch = searchQuery === '' || 
      indicator.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      indicator.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      indicator.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return categoryMatch && typeMatch && searchMatch;
  });

  const getCategoryBadge = (category: string) => {
    const colors = {
      free: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      premium: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    };
    const labels = {
      free: 'GRATUITO',
      premium: 'PREMIUM'
    };
    return { color: colors[category as keyof typeof colors], label: labels[category as keyof typeof labels] };
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      indicator: '📈',
      scanner: '🔍',
      tool: '🛠️'
    };
    return icons[type as keyof typeof icons] || '📊';
  };

  const handleCategoryClick = (categoryId: string, type?: string) => {
    setSelectedCategory(categoryId);
    setSelectedType(type || null);
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="px-8 sm:px-12 lg:px-16 xl:px-20 2xl:px-24">
        {/* Header y Buscador */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Biblioteca de Indicadores
          </h1>
          <p className="text-gray-400 mb-6">
            Herramientas profesionales de análisis técnico para TradingView
          </p>
          
          {/* Buscador Principal */}
          <div className="relative max-w-lg mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar indicadores, scanners o herramientas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filtros Horizontales */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Categorías</label>
              <div className="flex flex-wrap gap-2">
                {menuCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id && !selectedType
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtros por Tipo (solo si hay categoría seleccionada) */}
            {selectedCategory !== 'all' && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Tipo</label>
                <div className="flex flex-wrap gap-2">
                  {menuCategories
                    .find(cat => cat.id === selectedCategory)
                    ?.subcategories?.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleCategoryClick(selectedCategory, sub.type)}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedType === sub.type
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span className="mr-2">{getTypeIcon(sub.type)}</span>
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Título de sección dinámico */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-1">
            {selectedCategory === 'all' 
              ? 'Todos los productos' 
              : selectedType 
                ? `${selectedCategory === 'free' ? 'Gratuitos' : 'Premium'} - ${selectedType === 'indicator' ? 'Indicadores' : selectedType === 'scanner' ? 'Scanners' : 'Herramientas'}`
                : selectedCategory === 'free' ? 'Productos Gratuitos' : 'Productos Premium'
            }
          </h2>
          <p className="text-gray-500 text-sm">
            {filteredIndicators.length} productos encontrados
          </p>
        </div>

        {/* Grid de Productos - 3 columnas */}
        <div className="mb-16">
          {filteredIndicators.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">No se encontraron productos</h3>
              <p className="text-gray-500">Intenta cambiar los filtros o términos de búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {filteredIndicators.map((indicator) => (
                <Link key={indicator.id} href={`/indicadores/${indicator.slug}`}>
                  <div className="group bg-gray-900/40 rounded-xl overflow-hidden hover:bg-gray-800/60 transition-all duration-300 border border-gray-800/50 hover:border-gray-700 hover:shadow-xl">
                    {/* Imagen más grande */}
                    <div className="relative h-56 overflow-hidden bg-gray-800">
                      <Image
                        src={indicator.image}
                        alt={indicator.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Badge de Categoría */}
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getCategoryBadge(indicator.category).color}`}>
                          {getCategoryBadge(indicator.category).label}
                        </span>
                      </div>

                      {/* Tipo de producto */}
                      <div className="absolute top-4 right-4">
                        <span className="text-xl bg-black/60 px-2 py-1 rounded-lg" title={indicator.type}>
                          {getTypeIcon(indicator.type)}
                        </span>
                      </div>
                    </div>

                    {/* Contenido más espacioso */}
                    <div className="p-7">
                      <h3 className="text-xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors">
                        {indicator.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">
                        {indicator.description}
                      </p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {indicator.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-800/60 text-gray-300 text-xs rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          {new Date(indicator.publishedAt).toLocaleDateString('es-ES', { 
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                        <span className="text-green-400 font-medium group-hover:text-green-300 transition-colors">
                          Ver detalles →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
