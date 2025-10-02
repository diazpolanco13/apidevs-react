'use client';

import { useState, useMemo } from 'react';
import { ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';

interface Campaign {
  campaign_id: string;
  campaign_name: string;
  utm_source: string;
  utm_campaign: string;
  status: 'active' | 'paused' | 'completed';
  budget_cents: number;
  external_reach: number;
  external_spend_cents: number;
  total_visits: number;
  total_purchases: number;
  total_revenue_cents: number;
  conversion_rate: number;
  ctr: number;
  cac_cents: number;
  roas: number;
}

interface CampaignsTableProps {
  campaigns: Campaign[];
}

type SortField = 'campaign_name' | 'utm_source' | 'status' | 'external_spend_cents' | 
                 'total_revenue_cents' | 'roas' | 'cac_cents' | 'conversion_rate' | 
                 'total_visits' | 'total_purchases';
type SortDirection = 'asc' | 'desc';

export default function CampaignsTable({ campaigns }: CampaignsTableProps) {
  const [sortField, setSortField] = useState<SortField>('total_visits');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedCampaigns = useMemo(() => {
    let result = [...campaigns];

    // Filtrar por búsqueda
    if (searchTerm) {
      result = result.filter(c =>
        c.campaign_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.utm_source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.utm_campaign.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [campaigns, sortField, sortDirection, searchTerm]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cents / 100);
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      facebook: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      instagram: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      google: 'bg-red-500/20 text-red-400 border-red-500/30',
      tiktok: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      twitter: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      youtube: 'bg-red-600/20 text-red-400 border-red-600/30',
    };
    return colors[source.toLowerCase()] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    const labels: Record<string, string> = {
      active: 'Activa',
      paused: 'Pausada',
      completed: 'Completada',
    };
    return { style: styles[status] || styles.completed, label: labels[status] || status };
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-white transition-colors group"
    >
      {children}
      <ArrowUpDown className={`w-3 h-3 ${sortField === field ? 'text-purple-400' : 'text-gray-600 group-hover:text-gray-400'}`} />
    </button>
  );

  if (campaigns.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-gray-400 mb-2">No hay campañas registradas</div>
        <div className="text-sm text-gray-500">Las campañas aparecerán aquí cuando se registren visitas con UTM parameters</div>
      </div>
    );
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="p-6 border-b border-white/5">
        <input
          type="text"
          placeholder="Buscar por nombre, fuente o código de campaña..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <th className="p-4">
                <SortButton field="campaign_name">Campaña</SortButton>
              </th>
              <th className="p-4">
                <SortButton field="utm_source">Fuente</SortButton>
              </th>
              <th className="p-4">
                <SortButton field="status">Estado</SortButton>
              </th>
              <th className="p-4 text-right">
                <SortButton field="external_spend_cents">Gasto</SortButton>
              </th>
              <th className="p-4 text-right">
                <SortButton field="total_revenue_cents">Revenue</SortButton>
              </th>
              <th className="p-4 text-right">
                <SortButton field="roas">ROAS</SortButton>
              </th>
              <th className="p-4 text-right">
                <SortButton field="cac_cents">CAC</SortButton>
              </th>
              <th className="p-4 text-right">
                <SortButton field="conversion_rate">Conv. Rate</SortButton>
              </th>
              <th className="p-4 text-right">
                <SortButton field="total_visits">Visitas</SortButton>
              </th>
              <th className="p-4 text-right">
                <SortButton field="total_purchases">Compras</SortButton>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedCampaigns.map((campaign) => {
              const statusBadge = getStatusBadge(campaign.status);
              const isGoodROAS = campaign.roas >= 200;
              const isGoodConversion = campaign.conversion_rate >= 5;

              return (
                <tr
                  key={campaign.campaign_id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4">
                    <div className="font-medium text-white">{campaign.campaign_name}</div>
                    <div className="text-xs text-gray-500">{campaign.utm_campaign}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${getSourceColor(campaign.utm_source)}`}>
                      {campaign.utm_source}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${statusBadge.style}`}>
                      {statusBadge.label}
                    </span>
                  </td>
                  <td className="p-4 text-right text-white font-medium">
                    {formatCurrency(campaign.external_spend_cents)}
                  </td>
                  <td className="p-4 text-right text-white font-medium">
                    {formatCurrency(campaign.total_revenue_cents)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className={`font-bold ${isGoodROAS ? 'text-green-400' : 'text-red-400'}`}>
                        {campaign.roas.toFixed(0)}%
                      </span>
                      {isGoodROAS ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right text-white">
                    {formatCurrency(campaign.cac_cents)}
                  </td>
                  <td className="p-4 text-right">
                    <span className={`font-medium ${isGoodConversion ? 'text-green-400' : 'text-yellow-400'}`}>
                      {campaign.conversion_rate.toFixed(2)}%
                    </span>
                  </td>
                  <td className="p-4 text-right text-white">
                    {campaign.total_visits.toLocaleString()}
                  </td>
                  <td className="p-4 text-right text-white font-medium">
                    {campaign.total_purchases.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredAndSortedCampaigns.length === 0 && searchTerm && (
        <div className="p-8 text-center text-gray-400">
          No se encontraron campañas que coincidan con "{searchTerm}"
        </div>
      )}
    </div>
  );
}

