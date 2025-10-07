'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Calendar, 
  TrendingUp, 
  Users, 
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';

type AccessRecord = {
  id: string;
  status: string;
  granted_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  duration_type: string | null;
  access_source: string;
  error_message: string | null;
  tradingview_response: any;
  renewal_count: number;
  last_renewed_at: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    tradingview_username: string | null;
  } | null;
  indicator: {
    id: string;
    name: string;
    pine_id: string;
    category: string;
    access_tier: string;
  } | null;
  granted_by_user: {
    id: string;
    email: string;
    full_name: string | null;
  } | null;
  revoked_by_user: {
    id: string;
    email: string;
    full_name: string | null;
  } | null;
};

type AccessStats = {
  period_days: number;
  total_operations: number;
  successful_operations: number;
  failed_operations: number;
  success_rate: number;
  unique_users: number;
  unique_indicators: number;
  active_accesses: number;
  expired_accesses: number;
  revoked_accesses: number;
  by_source: {
    manual: number;
    purchase: number;
    stripe: number; // 🆕 Compras automáticas vía Stripe
    trial: number;
    bulk: number;
    renewal: number;
    promo: number;
    admin_bulk: number;
  };
  by_operation: {
    grants: number;
    revokes: number;
    renewals: number;
  };
};

export default function HistorialTab() {
  const [stats, setStats] = useState<AccessStats | null>(null);
  const [records, setRecords] = useState<AccessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  
  // Filtros
  const [filterSource, setFilterSource] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para exportación
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Refs para evitar llamadas duplicadas
  const statsLoadedRef = useRef(false);
  const loadingStatsRef = useRef(false);
  const loadingRecordsRef = useRef(false);

  // Cargar estadísticas al montar
  useEffect(() => {
    if (!statsLoadedRef.current && !loadingStatsRef.current) {
      loadStats();
    }
  }, []);

  // Cargar registros cuando cambien filtros o página
  useEffect(() => {
    if (!loadingRecordsRef.current) {
      loadRecords();
    }
  }, [currentPage, filterSource, filterStatus, filterDateFrom, filterDateTo, searchQuery]);

  const loadStats = async () => {
    if (loadingStatsRef.current) return;
    
    loadingStatsRef.current = true;
    try {
      const response = await fetch('/api/admin/access-stats?period=30');
      const data = await response.json();
      
      if (data.success !== false) {
        setStats(data);
        statsLoadedRef.current = true;
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
      loadingStatsRef.current = false;
    }
  };

  const loadRecords = async () => {
    if (loadingRecordsRef.current) return;
    
    loadingRecordsRef.current = true;
    setLoadingRecords(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString()
      });

      if (filterSource) params.append('access_source', filterSource);
      if (filterStatus) params.append('status', filterStatus);
      if (filterDateFrom) params.append('date_from', filterDateFrom);
      if (filterDateTo) params.append('date_to', filterDateTo);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/access-audit?${params}`);
      const data = await response.json();

      if (data.success) {
        setRecords(data.records);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error cargando registros:', error);
    } finally {
      setLoadingRecords(false);
      loadingRecordsRef.current = false;
    }
  };

  const clearFilters = () => {
    setFilterSource('');
    setFilterStatus('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const exportToCSV = async () => {
    setExporting(true);
    setExportError(null);
    setExportSuccess(false);
    
    try {
      const filters: any = {};
      if (filterSource) filters.access_source = filterSource;
      if (filterStatus) filters.status = filterStatus;
      if (filterDateFrom) filters.date_from = filterDateFrom;
      if (filterDateTo) filters.date_to = filterDateTo;

      const response = await fetch('/api/admin/access-audit/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error exportando');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `historial-accesos-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error exportando:', error);
      setExportError(error.message || 'Error al exportar. Intenta de nuevo.');
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: any }> = {
      active: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle2 },
      granted: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: CheckCircle2 },
      pending: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Clock },
      expired: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: Clock },
      revoked: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle },
      failed: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const getSourceBadge = (source: string) => {
    const colors: Record<string, string> = {
      manual: 'bg-purple-500/20 text-purple-400',
      purchase: 'bg-green-500/20 text-green-400',
      stripe: 'bg-green-500/20 text-green-400', // 🆕 Compras automáticas vía Stripe
      trial: 'bg-blue-500/20 text-blue-400',
      bulk: 'bg-orange-500/20 text-orange-400',
      admin_bulk: 'bg-orange-500/20 text-orange-400',
      renewal: 'bg-cyan-500/20 text-cyan-400',
      promo: 'bg-pink-500/20 text-pink-400'
    };

    return (
      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${colors[source] || 'bg-gray-500/20 text-gray-400'}`}>
        {source}
      </span>
    );
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apidevs-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-apidevs-primary" />
              <span className="text-xs text-gray-400">Últimos 30 días</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {(stats.total_operations || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Operaciones</div>
            <div className="mt-2 text-xs text-emerald-400">
              {stats.success_rate || 0}% tasa de éxito
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <span className="text-xs text-gray-400">Activos ahora</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {(stats.active_accesses || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Accesos Activos</div>
            <div className="mt-2 text-xs text-gray-400">
              {stats.expired_accesses || 0} expirados (7d)
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-xs text-gray-400">Únicos</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {(stats.unique_users || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Usuarios Afectados</div>
            <div className="mt-2 text-xs text-gray-400">
              {stats.unique_indicators || 0} indicadores
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <span className="text-xs text-gray-400">Distribución</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Manual:</span>
                <span className="text-white font-medium">{(stats.by_source?.manual || 0) + (stats.by_source?.admin_bulk || 0)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Stripe (Auto):</span>
                <span className="text-white font-medium">{stats.by_source?.stripe || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Compras:</span>
                <span className="text-white font-medium">{stats.by_source?.purchase || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Renovaciones:</span>
                <span className="text-white font-medium">{stats.by_operation?.renewals || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Búsqueda */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por email o username de TradingView..."
              className="w-full pl-11 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-apidevs-primary transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-700/50 mb-4"></div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-white hover:text-apidevs-primary transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filtros Avanzados
            {(filterSource || filterStatus || filterDateFrom || filterDateTo) && (
              <span className="ml-2 px-2 py-0.5 bg-apidevs-primary/20 text-apidevs-primary rounded-full text-xs">
                Activos
              </span>
            )}
          </button>

          <div className="flex items-center gap-2">
            {/* Mensajes de feedback */}
            {exportSuccess && (
              <div className="flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-400 rounded-lg text-xs">
                <CheckCircle2 className="w-3 h-3" />
                ¡CSV exportado exitosamente!
              </div>
            )}
            {exportError && (
              <div className="flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-400 rounded-lg text-xs">
                <XCircle className="w-3 h-3" />
                {exportError}
              </div>
            )}
            
            <button
              onClick={clearFilters}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Limpiar filtros
            </button>
            <button
              onClick={exportToCSV}
              disabled={exporting}
              className="flex items-center gap-1 px-3 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Exportar a CSV"
            >
              {exporting ? (
                <>
                  <div className="w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="w-3 h-3" />
                  Exportar CSV
                </>
              )}
            </button>
            <button
              onClick={loadRecords}
              className="flex items-center gap-1 px-3 py-1 bg-apidevs-primary/10 hover:bg-apidevs-primary/20 text-apidevs-primary rounded-lg text-xs transition-colors"
            >
              <Activity className="w-3 h-3" />
              Actualizar
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-gray-700/50">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Fuente de Acceso</label>
              <select
                value={filterSource}
                onChange={(e) => {
                  setFilterSource(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-apidevs-primary"
              >
                <option value="">Todas</option>
                <option value="manual">Manual</option>
                <option value="admin_bulk">Admin Bulk</option>
                <option value="stripe">Stripe (Automático)</option>
                <option value="purchase">Compra</option>
                <option value="trial">Trial</option>
                <option value="renewal">Renovación</option>
                <option value="promo">Promoción</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-apidevs-primary"
              >
                <option value="">Todos</option>
                <option value="active">Activo</option>
                <option value="granted">Concedido</option>
                <option value="pending">Pendiente</option>
                <option value="expired">Expirado</option>
                <option value="revoked">Revocado</option>
                <option value="failed">Fallido</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Fecha Desde</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => {
                  setFilterDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-apidevs-primary"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Fecha Hasta</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => {
                  setFilterDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-apidevs-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabla de Registros */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Historial de Operaciones
            </h3>
            <div className="text-sm text-gray-400">
              {total.toLocaleString()} registros totales
            </div>
          </div>
        </div>

        {loadingRecords ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apidevs-primary"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No hay registros para mostrar</p>
            <p className="text-sm text-gray-500 mt-1">
              Prueba ajustando los filtros
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Indicador
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Fuente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Duración
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Expira
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {formatDate(record.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-white font-medium">
                          {record.user?.email || 'N/A'}
                        </div>
                        {record.user?.tradingview_username && (
                          <div className="text-xs text-gray-400">
                            @{record.user.tradingview_username}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-white">
                          {record.indicator?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {record.indicator?.access_tier}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="px-4 py-3">
                        {getSourceBadge(record.access_source)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {record.duration_type || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {formatDate(record.expires_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="px-4 py-3 border-t border-gray-700/50 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Página {currentPage} de {totalPages} · Mostrando {records.length} de {total.toLocaleString()} registros
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-apidevs-primary text-white'
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

