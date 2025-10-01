'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchBarProps {
  placeholder?: string;
}

export default function SearchBar({ placeholder = "Buscar por email, nombre o username..." }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Estado de filtros
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    country: searchParams.get('country') || '',
    customerType: searchParams.get('customerType') || '',
  });

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    } else {
      params.delete('search');
    }
    
    params.set('page', '1'); // Reset a primera página al buscar
    router.push(`?${params.toString()}`);
  }, [debouncedSearch]);

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleFilterChange = (filterName: string, value: string) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(filterName, value);
    } else {
      params.delete(filterName);
    }
    
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      country: '',
      customerType: '',
    });
    
    const params = new URLSearchParams(searchParams.toString());
    params.delete('status');
    params.delete('country');
    params.delete('customerType');
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v).length;

  return (
    <div className="space-y-4">
      {/* Barra de Búsqueda Principal */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-12 pr-12 py-3.5 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {/* Indicator de búsqueda activa */}
          {searchTerm && (
            <div className="absolute -bottom-6 left-0 text-xs text-gray-400">
              Buscando: <span className="text-purple-400 font-medium">{searchTerm}</span>
            </div>
          )}
        </div>

        {/* Botón de Filtros */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-6 py-3.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
            showFilters || activeFiltersCount > 0
              ? 'bg-purple-500 text-white hover:bg-purple-600'
              : 'bg-gray-900/50 border border-gray-700 text-gray-300 hover:bg-gray-800'
          }`}
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
          <span>Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Panel de Filtros Expandible */}
      {showFilters && (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 animate-slide-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Filtros Avanzados</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Estado de Reactivación */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estado de Reactivación
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">Todos los estados</option>
                <option value="pending">⏳ Pendiente</option>
                <option value="contacted">📧 Contactado</option>
                <option value="engaged">💬 Interesado</option>
                <option value="reactivated">✅ Reactivado</option>
                <option value="churned_final">❌ Churned</option>
              </select>
            </div>

            {/* País */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                País
              </label>
              <select
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">Todos los países</option>
                <option value="US">🇺🇸 Estados Unidos</option>
                <option value="MX">🇲🇽 México</option>
                <option value="CO">🇨🇴 Colombia</option>
                <option value="AR">🇦🇷 Argentina</option>
                <option value="ES">🇪🇸 España</option>
                <option value="VE">🇻🇪 Venezuela</option>
                <option value="PE">🇵🇪 Perú</option>
                <option value="CL">🇨🇱 Chile</option>
              </select>
            </div>

            {/* Tipo de Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Cliente
              </label>
              <select
                value={filters.customerType}
                onChange={(e) => handleFilterChange('customerType', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">Todos los tipos</option>
                <option value="legacy">👑 Legacy</option>
                <option value="new">✨ Nuevo</option>
                <option value="vip">💎 VIP</option>
              </select>
            </div>
          </div>

          {/* Resumen de Filtros Activos */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex flex-wrap gap-2">
                {filters.status && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                    Estado: {filters.status}
                  </span>
                )}
                {filters.country && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30">
                    País: {filters.country}
                  </span>
                )}
                {filters.customerType && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30">
                    Tipo: {filters.customerType}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

