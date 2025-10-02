'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, ChevronLeft, ChevronRight, ExternalLink, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import { Purchase } from '@/types/purchases';

interface PurchasesTableProps {
  purchases: Purchase[];
}

export default function PurchasesTable({ purchases }: PurchasesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const itemsPerPage = 10;

  // Filtrar compras
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      purchase.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.order_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Paginación
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPurchases = filteredPurchases.slice(startIndex, endIndex);

  // Formatear moneda
  // NOTA: amount ya viene en centavos desde page.tsx, NO dividir de nuevo
  const formatCurrency = (amountInCents: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amountInCents / 100);
  };

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const badges = {
      completed: { icon: CheckCircle, label: 'Completado', color: 'text-green-400 bg-green-500/10 border-green-500/30' },
      pending: { icon: Clock, label: 'Pendiente', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
      refunded: { icon: RefreshCw, label: 'Reembolsado', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
      failed: { icon: XCircle, label: 'Fallido', color: 'text-red-400 bg-red-500/10 border-red-500/30' }
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  // Type badge
  const getTypeBadge = (type: string) => {
    const types = {
      subscription: { label: 'Suscripción', color: 'text-blue-400 bg-blue-500/10' },
      'one-time': { label: 'One-Time', color: 'text-purple-400 bg-purple-500/10' },
      lifetime: { label: 'Lifetime', color: 'text-orange-400 bg-orange-500/10' }
    };

    const typeInfo = types[type as keyof typeof types] || types['one-time'];

    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${typeInfo.color}`}>
        {typeInfo.label}
      </span>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por email, nombre, producto..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50 focus:border-apidevs-primary transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 pr-8 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50 focus:border-apidevs-primary transition-all cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            <option value="completed">Completado</option>
            <option value="pending">Pendiente</option>
            <option value="refunded">Reembolsado</option>
            <option value="failed">Fallido</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Cliente</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Producto</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Monto</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentPurchases.length > 0 ? (
              currentPurchases.map((purchase) => (
                <tr 
                  key={purchase.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  {/* Cliente */}
                  <td className="py-4 px-4">
                    <div>
                      <div className="text-sm font-medium text-white">{purchase.customer_name}</div>
                      <div className="text-xs text-gray-500">{purchase.customer_email}</div>
                    </div>
                  </td>

                  {/* Producto */}
                  <td className="py-4 px-4">
                    <div className="text-sm text-white max-w-xs truncate">{purchase.product_name}</div>
                    <div className="text-xs text-gray-500">#{purchase.order_number}</div>
                  </td>

                  {/* Tipo */}
                  <td className="py-4 px-4">
                    {getTypeBadge(purchase.type)}
                  </td>

                  {/* Monto */}
                  <td className="py-4 px-4">
                    <div className="text-sm font-semibold text-white">{formatCurrency(purchase.amount)}</div>
                    {(!!purchase.amount_refunded && purchase.amount_refunded > 0) && (
                      <div className="text-xs text-orange-400">-{formatCurrency(purchase.amount_refunded)} reemb.</div>
                    )}
                  </td>

                  {/* Estado */}
                  <td className="py-4 px-4">
                    {getStatusBadge(purchase.status)}
                  </td>

                  {/* Fecha */}
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-400">{formatDate(purchase.created_at)}</div>
                  </td>

                  {/* Acciones */}
                  <td className="py-4 px-4 text-right">
                    <Link
                      href={`/admin/compras/${purchase.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-xs text-gray-300 hover:text-white transition-all"
                    >
                      <span>Ver</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="text-gray-500 mb-2">No se encontraron compras</div>
                  <div className="text-xs text-gray-600">Intenta ajustar los filtros de búsqueda</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700/50">
          <div className="text-sm text-gray-400">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredPurchases.length)} de {filteredPurchases.length}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`
                        min-w-[32px] px-2 py-1 rounded-lg text-sm font-medium transition-all
                        ${page === currentPage
                          ? 'bg-apidevs-primary text-black'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                        }
                      `}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="text-gray-600">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

