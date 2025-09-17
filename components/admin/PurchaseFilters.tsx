'use client';

import { useState } from 'react';
import { 
  FunnelIcon, 
  ArrowsUpDownIcon,
  XMarkIcon,
  CalendarIcon,
  CreditCardIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface PurchaseFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  onSortChange: (sort: SortState) => void;
  totalItems: number;
  filteredItems: number;
}

export interface FilterState {
  status: string;
  paymentMethod: string;
  dateRange: string;
  productName: string;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

export default function PurchaseFilters({ 
  onFilterChange, 
  onSortChange, 
  totalItems, 
  filteredItems 
}: PurchaseFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    paymentMethod: '',
    dateRange: '',
    productName: ''
  });
  const [sort, setSort] = useState<SortState>({
    field: 'order_date',
    direction: 'desc'
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (field: string) => {
    const newDirection: 'asc' | 'desc' = sort.field === field && sort.direction === 'desc' ? 'asc' : 'desc';
    const newSort: SortState = { field, direction: newDirection };
    setSort(newSort);
    onSortChange(newSort);
  };

  const clearFilters = () => {
    const emptyFilters = {
      status: '',
      paymentMethod: '',
      dateRange: '',
      productName: ''
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
              onClick={() => handleSortChange('order_date')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                sort.field === 'order_date'
                  ? 'bg-apidevs-primary/20 text-apidevs-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="h-3 w-3" />
              Fecha
              {sort.field === 'order_date' && (
                <ArrowsUpDownIcon className={`h-3 w-3 ${sort.direction === 'desc' ? 'rotate-180' : ''}`} />
              )}
            </button>
            <button
              onClick={() => handleSortChange('order_total_cents')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                sort.field === 'order_total_cents'
                  ? 'bg-apidevs-primary/20 text-apidevs-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              $
              {sort.field === 'order_total_cents' && (
                <ArrowsUpDownIcon className={`h-3 w-3 ${sort.direction === 'desc' ? 'rotate-180' : ''}`} />
              )}
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="text-sm text-gray-400">
          {filteredItems !== totalItems ? (
            <span>{filteredItems} de {totalItems} compras</span>
          ) : (
            <span>{totalItems} compras</span>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="border-t border-gray-700 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Estado</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                title="Filtrar por estado de la orden"
                aria-label="Estado de la orden"
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-apidevs-primary focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
                <option value="processing">Procesando</option>
                <option value="pending">Pendiente</option>
              </select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Método de Pago</label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                title="Filtrar por método de pago"
                aria-label="Método de pago"
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-apidevs-primary focus:border-transparent"
              >
                <option value="">Todos los métodos</option>
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
                <option value="other">Otros</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Período</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                title="Filtrar por período de tiempo"
                aria-label="Período de tiempo"
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-apidevs-primary focus:border-transparent"
              >
                <option value="">Todas las fechas</option>
                <option value="last_7_days">Últimos 7 días</option>
                <option value="last_30_days">Últimos 30 días</option>
                <option value="last_90_days">Últimos 90 días</option>
                <option value="last_year">Último año</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
              </select>
            </div>

            {/* Product Search */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Producto</label>
              <input
                type="text"
                value={filters.productName}
                onChange={(e) => handleFilterChange('productName', e.target.value)}
                placeholder="Buscar producto..."
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-apidevs-primary focus:border-transparent placeholder-gray-500"
              />
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
