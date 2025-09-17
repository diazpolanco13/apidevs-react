'use client';

import { useState } from 'react';
import { 
  FunnelIcon, 
  ArrowsUpDownIcon,
  XMarkIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface UserFiltersProps {
  onFilterChange: (filters: UserFilterState) => void;
  onSortChange: (sort: UserSortState) => void;
  totalItems: number;
  filteredItems: number;
}

export interface UserFilterState {
  reactivationStatus: string;
  country: string;
  customerType: string;
  migrationStatus: string;
  searchTerm: string;
}

export interface UserSortState {
  field: string;
  direction: 'asc' | 'desc';
}

export default function UserFilters({ 
  onFilterChange, 
  onSortChange, 
  totalItems, 
  filteredItems 
}: UserFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<UserFilterState>({
    reactivationStatus: '',
    country: '',
    customerType: '',
    migrationStatus: '',
    searchTerm: ''
  });
  const [sort, setSort] = useState<UserSortState>({
    field: 'wordpress_created_at',
    direction: 'desc'
  });

  const handleFilterChange = (key: keyof UserFilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (field: string) => {
    const newDirection: 'asc' | 'desc' = sort.field === field && sort.direction === 'desc' ? 'asc' : 'desc';
    const newSort: UserSortState = { field, direction: newDirection };
    setSort(newSort);
    onSortChange(newSort);
  };

  const clearFilters = () => {
    const emptyFilters: UserFilterState = {
      reactivationStatus: '',
      country: '',
      customerType: '',
      migrationStatus: '',
      searchTerm: ''
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-black/20 backdrop-blur-xl border-b border-gray-700">
      {/* Filter Toggle Bar */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-apidevs-primary text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filtros</span>
            {hasActiveFilters && (
              <span className="bg-black/20 text-xs px-1.5 py-0.5 rounded-full">
                {Object.values(filters).filter(v => v !== '').length}
              </span>
            )}
          </button>

          {/* Quick Sort Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-gray-400">Ordenar:</span>
            <button
              onClick={() => handleSortChange('wordpress_created_at')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                sort.field === 'wordpress_created_at'
                  ? 'bg-apidevs-primary/20 text-apidevs-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="h-3 w-3" />
              Registro
              {sort.field === 'wordpress_created_at' && (
                <ArrowsUpDownIcon className={`h-3 w-3 ${sort.direction === 'desc' ? 'rotate-180' : ''}`} />
              )}
            </button>
            <button
              onClick={() => handleSortChange('full_name')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                sort.field === 'full_name'
                  ? 'bg-apidevs-primary/20 text-apidevs-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserIcon className="h-3 w-3" />
              Nombre
              {sort.field === 'full_name' && (
                <ArrowsUpDownIcon className={`h-3 w-3 ${sort.direction === 'desc' ? 'rotate-180' : ''}`} />
              )}
            </button>
            <button
              onClick={() => handleSortChange('country')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                sort.field === 'country'
                  ? 'bg-apidevs-primary/20 text-apidevs-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <MapPinIcon className="h-3 w-3" />
              País
              {sort.field === 'country' && (
                <ArrowsUpDownIcon className={`h-3 w-3 ${sort.direction === 'desc' ? 'rotate-180' : ''}`} />
              )}
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="text-sm text-gray-400">
          {filteredItems !== totalItems ? (
            <span>{filteredItems} de {totalItems} usuarios</span>
          ) : (
            <span>{totalItems} usuarios</span>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="border-t border-gray-700 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Buscar</label>
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                placeholder="Nombre, email, username..."
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-apidevs-primary focus:border-transparent placeholder-gray-500"
              />
            </div>

            {/* Reactivation Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Estado Reactivación</label>
              <select
                value={filters.reactivationStatus}
                onChange={(e) => handleFilterChange('reactivationStatus', e.target.value)}
                title="Filtrar por estado de reactivación"
                aria-label="Estado de reactivación"
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-apidevs-primary focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="contacted">Contactado</option>
                <option value="reactivated">Reactivado</option>
                <option value="declined">Rechazado</option>
              </select>
            </div>

            {/* Country Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">País</label>
              <select
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                title="Filtrar por país"
                aria-label="País"
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-apidevs-primary focus:border-transparent"
              >
                <option value="">Todos los países</option>
                <option value="US">Estados Unidos</option>
                <option value="ES">España</option>
                <option value="MX">México</option>
                <option value="AR">Argentina</option>
                <option value="CO">Colombia</option>
                <option value="PE">Perú</option>
                <option value="CL">Chile</option>
                <option value="VE">Venezuela</option>
                <option value="EC">Ecuador</option>
                <option value="UY">Uruguay</option>
                <option value="other">Otros</option>
              </select>
            </div>

            {/* Customer Type Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Tipo Cliente</label>
              <select
                value={filters.customerType}
                onChange={(e) => handleFilterChange('customerType', e.target.value)}
                title="Filtrar por tipo de cliente"
                aria-label="Tipo de cliente"
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-apidevs-primary focus:border-transparent"
              >
                <option value="">Todos los tipos</option>
                <option value="legacy">Legacy</option>
                <option value="premium">Premium</option>
                <option value="standard">Standard</option>
              </select>
            </div>

            {/* Migration Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Estado Migración</label>
              <select
                value={filters.migrationStatus}
                onChange={(e) => handleFilterChange('migrationStatus', e.target.value)}
                title="Filtrar por estado de migración"
                aria-label="Estado de migración"
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-apidevs-primary focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="imported">Importado</option>
                <option value="verified">Verificado</option>
                <option value="active">Activo</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
                Limpiar filtros
              </button>
              
              <div className="text-xs text-gray-500">
                {filteredItems} resultado{filteredItems !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
