'use client';

import { useState } from 'react';
import IndicatorCard from './IndicatorCard';
import { menuCategories } from './data';
import type { IndicatorListItem } from '@/sanity/lib/queries';

interface IndicatorsHubProps {
  initialIndicators: IndicatorListItem[];
}

export default function IndicatorsHub({ initialIndicators }: IndicatorsHubProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const indicators = initialIndicators;

  // Filtrar indicadores
  const filteredIndicators = indicators.filter(indicator => {
    // Filtro por tier (free/premium)
    const categoryMatch = selectedCategory === 'all' || 
      (selectedCategory === 'free' && indicator.access_tier === 'free') ||
      (selectedCategory === 'premium' && indicator.access_tier === 'premium');
    
    const searchMatch = searchQuery === '' || 
      indicator.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      indicator.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (indicator.tags && indicator.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    return categoryMatch && searchMatch;
  });

  // Calcular stats
  const totalIndicators = indicators.length;
  const freeCount = indicators.filter(i => i.access_tier === 'free').length;
  const premiumCount = indicators.filter(i => i.access_tier === 'premium').length;

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
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        
        {/* HERO SECTION */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-apidevs-primary/10 border border-apidevs-primary/20 rounded-full mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-apidevs-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-apidevs-primary"></span>
            </span>
            <span className="text-xs font-medium text-apidevs-primary">
              Plataforma líder en indicadores de trading
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Biblioteca de{' '}
            <span className="text-apidevs-primary">
              Indicadores
            </span>
          </h1>
          
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Herramientas profesionales de análisis técnico para TradingView. 
            Desarrolladas por traders expertos para maximizar tus resultados.
          </p>

          {/* SEARCH BAR - Colores APIDevs */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-0.5 bg-apidevs-primary rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar indicadores, scanners o herramientas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-5 py-3.5 bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50 focus:border-apidevs-primary/50 hover:border-gray-600 transition-all duration-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-apidevs-primary transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FILTROS - Elegantes y compactos */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filtrar por:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {menuCategories.map((category) => {
              const isActive = selectedCategory === category.id && !selectedType;
              const count = category.id === 'all' 
                ? totalIndicators 
                : category.id === 'free' 
                  ? freeCount 
                  : premiumCount;
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`group relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-apidevs-primary text-black shadow-md'
                      : 'bg-gray-800/60 text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-700/50 hover:border-gray-600'
                  }`}
                >
                  <span className="text-base">{category.icon}</span>
                  <span>{category.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                    isActive 
                      ? 'bg-black/20 text-black' 
                      : 'bg-gray-700/50 text-gray-400 group-hover:bg-gray-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Subfiltros por Tipo */}
          {selectedCategory !== 'all' && (
            <div className="mt-4 pl-3 border-l-2 border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {menuCategories
                  .find(cat => cat.id === selectedCategory)
                  ?.subcategories?.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => handleCategoryClick(selectedCategory, sub.type)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedType === sub.type
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-gray-800/40 text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-gray-700/50'
                    }`}
                  >
                    <span className="text-sm">{getTypeIcon(sub.type)}</span>
                    <span>{sub.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RESULTADOS HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">
              {selectedCategory === 'all' 
                ? 'Todos los productos' 
                : selectedType 
                  ? `${selectedCategory === 'free' ? 'Gratuitos' : 'Premium'} - ${selectedType === 'indicator' ? 'Indicadores' : selectedType === 'scanner' ? 'Scanners' : 'Herramientas'}`
                  : selectedCategory === 'free' ? 'Productos Gratuitos' : 'Productos Premium'
              }
            </h2>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 bg-apidevs-primary rounded-full"></span>
              {filteredIndicators.length} {filteredIndicators.length === 1 ? 'producto encontrado' : 'productos encontrados'}
            </p>
          </div>
        </div>

        {/* GRID DE PRODUCTOS */}
        <div>
          {filteredIndicators.length === 0 ? (
            <div className="text-center py-16 bg-gray-900/20 rounded-2xl border border-gray-800/50">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">No se encontraron productos</h3>
              <p className="text-gray-500 mb-6">Intenta cambiar los filtros o términos de búsqueda.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedType(null);
                  setSearchQuery('');
                }}
                className="px-5 py-2.5 bg-apidevs-primary hover:bg-apidevs-primary-dark text-black font-semibold rounded-lg transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredIndicators.map((indicator, index) => (
                <div
                  key={indicator._id}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  className="animate-fade-in-up"
                >
                  <IndicatorCard indicator={indicator} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
