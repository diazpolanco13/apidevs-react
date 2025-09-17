'use client';

import { useState, useMemo } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  CreditCardIcon,
  CalendarIcon,
  ShoppingCartIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import Pagination from './Pagination';
import MobilePagination from './MobilePagination';
import PurchaseFilters, { FilterState, SortState } from './PurchaseFilters';

interface Purchase {
  id: string;
  order_number: string;
  order_date: string;
  order_status: string;
  payment_status: string;
  order_total_cents: number;
  product_name: string;
  product_category: string;
  payment_method: string;
  transaction_id: string;
  currency: string;
  revenue_impact: string;
  customer_segment: string;
  follow_up_opportunity: string;
  billing_country: string;
  card_last_4: string;
}

interface UserPurchaseHistoryProps {
  purchases: Purchase[];
}

export default function UserPurchaseHistory({ purchases }: UserPurchaseHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
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

  // Aplicar filtros y ordenamiento
  const filteredAndSortedPurchases = useMemo(() => {
    let filtered = [...purchases];

    // Aplicar filtros
    if (filters.status) {
      filtered = filtered.filter(p => p.order_status === filters.status);
    }
    
    if (filters.paymentMethod) {
      filtered = filtered.filter(p => 
        p.payment_method?.toLowerCase().includes(filters.paymentMethod.toLowerCase())
      );
    }
    
    if (filters.productName) {
      filtered = filtered.filter(p => 
        p.product_name?.toLowerCase().includes(filters.productName.toLowerCase())
      );
    }
    
    if (filters.dateRange) {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'last_7_days':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'last_30_days':
          filterDate.setDate(now.getDate() - 30);
          break;
        case 'last_90_days':
          filterDate.setDate(now.getDate() - 90);
          break;
        case 'last_year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
        case '2024':
        case '2023':
        case '2022':
        case '2021':
          const year = parseInt(filters.dateRange);
          filtered = filtered.filter(p => 
            new Date(p.order_date).getFullYear() === year
          );
          break;
      }
      
      if (['last_7_days', 'last_30_days', 'last_90_days', 'last_year'].includes(filters.dateRange)) {
        filtered = filtered.filter(p => new Date(p.order_date) >= filterDate);
      }
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sort.field) {
        case 'order_date':
          aValue = new Date(a.order_date);
          bValue = new Date(b.order_date);
          break;
        case 'order_total_cents':
          aValue = a.order_total_cents;
          bValue = b.order_total_cents;
          break;
        case 'order_number':
          aValue = a.order_number;
          bValue = b.order_number;
          break;
        case 'product_name':
          aValue = a.product_name;
          bValue = b.product_name;
          break;
        default:
          aValue = a.order_date;
          bValue = b.order_date;
      }
      
      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [purchases, filters, sort]);

  // Calcular datos de paginación
  const totalItems = purchases.length;
  const filteredItems = filteredAndSortedPurchases.length;
  const totalPages = Math.ceil(filteredItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPurchases = filteredAndSortedPurchases.slice(startIndex, endIndex);

  // Resetear a la primera página cuando cambian filtros o items por página
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: SortState) => {
    setSort(newSort);
    setCurrentPage(1);
  };

  // Asegurar que la página actual sea válida
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'cancelled':
      case 'refunded':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
      refunded: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };

    const labels = {
      completed: 'Completado',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado',
      pending: 'Pendiente',
      processing: 'Procesando'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getRevenueImpactBadge = (impact: string) => {
    const styles = {
      positive: 'bg-green-500/10 text-green-400',
      neutral: 'bg-gray-500/10 text-gray-400',
      negative: 'bg-red-500/10 text-red-400'
    };

    const labels = {
      positive: 'Positivo',
      neutral: 'Neutral',
      negative: 'Negativo'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${styles[impact as keyof typeof styles] || styles.neutral}`}>
        {labels[impact as keyof typeof labels] || impact}
      </span>
    );
  };

  if (purchases.length === 0) {
    return (
      <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Historial de Compras</h3>
        <div className="text-center py-8">
          <ShoppingCartIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Este usuario no tiene compras registradas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Historial de Compras ({totalItems})
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Todas las transacciones del usuario ordenadas por fecha
            </p>
          </div>
          {totalItems > 15 && (
            <div className="hidden lg:block text-sm text-gray-400">
              Página {currentPage} de {totalPages}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <PurchaseFilters
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        totalItems={totalItems}
        filteredItems={filteredItems}
      />

      {/* Table Header - Desktop only */}
      <div className="hidden lg:block border-b border-gray-700 py-3 px-4">
        <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
          <div className="col-span-1 text-center">Estado</div>
          <div className="col-span-3">Orden / Producto</div>
          <div className="col-span-2">Fecha</div>
          <div className="col-span-2">Método Pago</div>
          <div className="col-span-2">Transaction ID</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-1 text-right">Precio</div>
        </div>
      </div>

      {/* Purchase list */}
      <div className="divide-y divide-gray-700">
        {currentPurchases.map((purchase) => (
          <div key={purchase.id} className="p-4 hover:bg-gray-800/30 transition-colors">
            {/* Desktop: Diseño tipo tabla */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-3 items-center">
              {/* Status Icon */}
              <div className="col-span-1 flex justify-center">
                {getStatusIcon(purchase.order_status)}
              </div>

              {/* Order Number & Product */}
              <div className="col-span-3">
                <p className="text-sm font-medium text-white truncate">
                  #{purchase.order_number}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {purchase.product_name}
                </p>
              </div>

              {/* Date & Time */}
              <div className="col-span-2">
                <p className="text-xs text-gray-300">
                  {new Date(purchase.order_date).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: '2-digit'
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(purchase.order_date).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Payment Method & Country */}
              <div className="col-span-2">
                {purchase.payment_method && (
                  <div className="flex items-center text-xs text-gray-400 mb-1">
                    <CreditCardIcon className="h-3 w-3 mr-1" />
                    <span className="truncate">{purchase.payment_method}</span>
                  </div>
                )}
                {purchase.billing_country && (
                  <p className="text-xs text-gray-500">{purchase.billing_country}</p>
                )}
              </div>

              {/* Transaction ID */}
              <div className="col-span-2">
                {purchase.transaction_id && (
                  <p className="text-xs text-gray-500 font-mono">
                    {purchase.transaction_id.slice(-10)}
                  </p>
                )}
              </div>

              {/* Status Badge */}
              <div className="col-span-1 flex justify-center">
                {getStatusBadge(purchase.order_status)}
              </div>

              {/* Price */}
              <div className="col-span-1 flex justify-end">
                <div className="text-right">
                  <p className={`text-sm font-bold ${
                    purchase.order_status === 'completed' 
                      ? 'text-apidevs-primary' 
                      : purchase.order_status === 'cancelled' 
                        ? 'text-red-400'
                        : 'text-gray-400'
                  }`}>
                    ${(purchase.order_total_cents / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">USD</p>
                </div>
              </div>
            </div>

            {/* Mobile: Diseño optimizado */}
            <div className="lg:hidden">
              {/* Header Row */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(purchase.order_status)}
                  <div>
                    <p className="text-sm font-medium text-white">
                      #{purchase.order_number}
                    </p>
                    <p className="text-xs text-gray-400">
                      {purchase.product_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${
                    purchase.order_status === 'completed' 
                      ? 'text-apidevs-primary' 
                      : purchase.order_status === 'cancelled' 
                        ? 'text-red-400'
                        : 'text-gray-400'
                  }`}>
                    ${(purchase.order_total_cents / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">USD</p>
                </div>
              </div>

              {/* Details Row */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4 text-gray-400">
                  <span>
                    {new Date(purchase.order_date).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: '2-digit'
                    })}
                  </span>
                  {purchase.payment_method && (
                    <div className="flex items-center gap-1">
                      <CreditCardIcon className="h-3 w-3" />
                      <span>{purchase.payment_method}</span>
                    </div>
                  )}
                </div>
                {getStatusBadge(purchase.order_status)}
              </div>
            </div>
          </div>
          ))}
      </div>

      {/* Desktop Pagination */}
      {totalPages > 1 && (
        <div className="hidden lg:block">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredItems}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      )}

      {/* Mobile Pagination */}
      {totalPages > 1 && (
        <div className="lg:hidden">
          <MobilePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Summary footer */}
      <div className="p-4 bg-gray-800/30 border-t border-gray-700">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm">
          <span className="text-gray-400">
            {filteredAndSortedPurchases.filter(p => p.order_status === 'completed').length} completadas, {' '}
            {filteredAndSortedPurchases.filter(p => p.order_status === 'cancelled').length} canceladas
            {filteredItems !== totalItems && (
              <span className="ml-2 text-apidevs-primary">
                (filtrado de {totalItems})
              </span>
            )}
            {totalPages > 1 && (
              <span className="ml-2 text-gray-500">
                (mostrando {currentPurchases.length} de {filteredItems})
              </span>
            )}
          </span>
          <span className="text-white font-medium">
            Total válido: ${filteredAndSortedPurchases
              .filter(p => p.order_status === 'completed')
              .reduce((sum, p) => sum + (p.order_total_cents / 100), 0)
              .toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
