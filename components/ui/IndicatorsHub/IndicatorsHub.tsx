'use client';

import { useState } from 'react';
import IndicatorCard from './IndicatorCard';
import { mockIndicators, menuCategories } from './data';
import { Indicator } from './types';

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
                <IndicatorCard key={indicator.id} indicator={indicator} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
