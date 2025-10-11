'use client';

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  DollarSign, 
  Clock, 
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Mail,
  RotateCcw,
  Download
} from 'lucide-react';
import { CancellationDetail, CancellationAnalytics, CancellationFilters, CANCELLATION_REASONS } from '@/types/cancellations';

interface CancellationsTabProps {
  // Props adicionales si las necesitas
}

export default function CancellationsTab({}: CancellationsTabProps) {
  const [cancellations, setCancellations] = useState<CancellationDetail[]>([]);
  const [analytics, setAnalytics] = useState<CancellationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [filters, setFilters] = useState<CancellationFilters>({
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit: 50,
    offset: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Cargar datos iniciales
  useEffect(() => {
    loadCancellations();
  }, [filters]);

  // Cargar analytics solo una vez al montar el componente
  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadCancellations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/admin/cancellations?${params}`);
      const data = await response.json();

      if (response.ok) {
        setCancellations(data.cancellations);
        setTotalCount(data.totalCount);
      } else {
        console.error('Error loading cancellations:', data.error);
      }
    } catch (error) {
      console.error('Error loading cancellations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await fetch('/api/admin/cancellations/analytics');
      const data = await response.json();

      if (response.ok) {
        setAnalytics(data);
      } else {
        console.error('Error loading analytics:', data.error);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof CancellationFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0 // Reset pagination when filters change
    }));
  };

  const handleSort = (sortBy: CancellationFilters['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  };

  const getReasonLabel = (reason: string) => {
    const reasonObj = CANCELLATION_REASONS.find(r => r.value === reason);
    return reasonObj?.label || reason;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header con Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-400 truncate">Cancelaciones Totales</p>
              <p className="text-xl sm:text-2xl font-bold text-white truncate">
                {analyticsLoading ? '...' : analytics?.totalCancellations || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-400 truncate">Tiempo Promedio</p>
              <p className="text-xl sm:text-2xl font-bold text-white truncate">
                {analyticsLoading ? '...' : `${analytics?.avgDaysActive || 0} días`}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-400 truncate">Revenue Perdido</p>
              <p className="text-xl sm:text-2xl font-bold text-white truncate">
                {analyticsLoading ? '...' : formatCurrency(analytics?.revenueLost || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-400 truncate">Razón Principal</p>
              <p className="text-sm font-semibold text-white truncate">
                {analyticsLoading ? '...' : getReasonLabel(analytics?.topReasons[0]?.reason || '')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Filtros y Búsqueda</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filtros
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por email o ID de suscripción..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-apidevs-primary"
            />
          </div>
          <button
            onClick={loadCancellations}
            className="px-4 py-2 bg-apidevs-primary hover:bg-green-400 text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 flex-shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            Buscar
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Razón</label>
              <select
                value={filters.reason || ''}
                onChange={(e) => handleFilterChange('reason', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-apidevs-primary"
              >
                <option value="">Todas las razones</option>
                {CANCELLATION_REASONS.map(reason => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Fecha desde</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-apidevs-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Fecha hasta</label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-apidevs-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Lista de Cancelaciones */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Cancelaciones ({totalCount})
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleSort('created_at')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors whitespace-nowrap ${
                  filters.sortBy === 'created_at' 
                    ? 'bg-apidevs-primary text-black' 
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Fecha
              </button>
              <button
                onClick={() => handleSort('days_active')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors whitespace-nowrap ${
                  filters.sortBy === 'days_active' 
                    ? 'bg-apidevs-primary text-black' 
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Tiempo Activo
              </button>
              <button
                onClick={() => handleSort('revenue_lost')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors whitespace-nowrap ${
                  filters.sortBy === 'revenue_lost' 
                    ? 'bg-apidevs-primary text-black' 
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Revenue
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-800">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Cargando cancelaciones...</p>
            </div>
          ) : cancellations.length === 0 ? (
            <div className="p-8 text-center">
              <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No se encontraron cancelaciones con los filtros aplicados</p>
            </div>
          ) : (
            cancellations.map((cancellation) => (
              <div key={cancellation.id} className="p-6 hover:bg-gray-800/30 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-lg">
                        {getReasonLabel(cancellation.reason)}
                      </span>
                      <span className="text-sm text-gray-400">
                        {formatDate(cancellation.created_at)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-400">Usuario</p>
                        <p className="text-white font-medium">{cancellation.user_email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Plan</p>
                        <p className="text-white font-medium">{cancellation.product_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Tiempo Activo</p>
                        <p className="text-white font-medium">{cancellation.days_active} días</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Revenue Perdido</p>
                        <p className="text-red-400 font-medium">{formatCurrency(cancellation.revenue_lost, cancellation.currency)}</p>
                      </div>
                    </div>

                    {cancellation.feedback && (
                      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Comentario del usuario:</p>
                        <p className="text-gray-300 text-sm">{cancellation.feedback}</p>
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                      <span>ID: {cancellation.subscription_id}</span>
                      <span>•</span>
                      <span>Estado: {cancellation.subscription_status}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center lg:justify-start gap-2 flex-shrink-0">
                    <button
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Contactar usuario"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
                      title="Reactivar suscripción"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
