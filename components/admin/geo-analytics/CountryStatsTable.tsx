'use client';

import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CountryData {
  country: string;
  country_name: string;
  total_visits: number;
  total_purchases: number;
  total_revenue_cents: number;
  conversion_rate: number;
  avg_time_on_site: number;
  avg_pages_visited: number;
}

type SortField = 'country_name' | 'total_visits' | 'total_purchases' | 'conversion_rate' | 'total_revenue_cents';
type SortDirection = 'asc' | 'desc';

interface CountryStatsTableProps {
  countries: CountryData[];
}

export default function CountryStatsTable({ countries }: CountryStatsTableProps) {
  const [sortField, setSortField] = useState<SortField>('total_visits');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Función para cambiar el ordenamiento
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filtrar y ordenar países
  const filteredAndSortedCountries = countries
    .filter(country => 
      country.country_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.country.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'country_name') {
        aValue = aValue || '';
        bValue = bValue || '';
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Helper function para obtener emoji de bandera
  const getFlagEmoji = (countryCode: string): string => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  // Helper function para color de conversion rate
  const getConversionColor = (rate: number) => {
    if (rate >= 50) return 'text-green-400';
    if (rate >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Helper function para formatear tiempo
  const formatTime = (seconds: number) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Componente de header ordenable
  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th 
      className="px-6 py-4 text-left cursor-pointer hover:bg-white/5 transition-colors group"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wider">
        {children}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          {sortField === field ? (
            sortDirection === 'asc' ? (
              <ArrowUp className="w-4 h-4 text-purple-400" />
            ) : (
              <ArrowDown className="w-4 h-4 text-purple-400" />
            )
          ) : (
            <ArrowUpDown className="w-4 h-4 text-gray-600" />
          )}
        </div>
      </div>
    </th>
  );

  return (
    <div>
      {/* Buscador */}
      <div className="p-6 border-b border-white/5">
        <input
          type="text"
          placeholder="Buscar por país..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
        />
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-black/20 border-b border-white/10">
            <tr>
              <SortableHeader field="country_name">
                País
              </SortableHeader>
              <SortableHeader field="total_visits">
                Visitas
              </SortableHeader>
              <SortableHeader field="total_purchases">
                Compras
              </SortableHeader>
              <SortableHeader field="conversion_rate">
                Conversión
              </SortableHeader>
              <SortableHeader field="total_revenue_cents">
                Revenue
              </SortableHeader>
              <th className="px-6 py-4 text-left">
                <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Avg. Time
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredAndSortedCountries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  No se encontraron países
                </td>
              </tr>
            ) : (
              filteredAndSortedCountries.map((country, index) => (
                <tr 
                  key={country.country}
                  className="hover:bg-white/5 transition-colors"
                >
                  {/* País */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFlagEmoji(country.country)}</span>
                      <div>
                        <div className="font-medium text-white">{country.country_name}</div>
                        <div className="text-xs text-gray-500">{country.country}</div>
                      </div>
                    </div>
                  </td>

                  {/* Visitas */}
                  <td className="px-6 py-4">
                    <div className="text-white font-semibold">
                      {country.total_visits.toLocaleString()}
                    </div>
                    {country.avg_pages_visited > 0 && (
                      <div className="text-xs text-gray-500">
                        {country.avg_pages_visited.toFixed(1)} páginas/visita
                      </div>
                    )}
                  </td>

                  {/* Compras */}
                  <td className="px-6 py-4">
                    <div className="text-white font-semibold">
                      {country.total_purchases}
                    </div>
                  </td>

                  {/* Conversion Rate */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${getConversionColor(country.conversion_rate)}`}>
                        {country.conversion_rate.toFixed(1)}%
                      </span>
                      {country.conversion_rate >= 50 && <TrendingUp className="w-4 h-4 text-green-400" />}
                      {country.conversion_rate < 30 && <TrendingDown className="w-4 h-4 text-red-400" />}
                      {country.conversion_rate >= 30 && country.conversion_rate < 50 && <Minus className="w-4 h-4 text-yellow-400" />}
                    </div>
                  </td>

                  {/* Revenue */}
                  <td className="px-6 py-4">
                    <div className="text-green-400 font-bold">
                      ${(country.total_revenue_cents / 100).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                  </td>

                  {/* Avg Time */}
                  <td className="px-6 py-4">
                    <div className="text-gray-300">
                      {formatTime(country.avg_time_on_site)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer con totales */}
      <div className="p-6 border-t border-white/10 bg-black/20">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Mostrando <span className="text-white font-semibold">{filteredAndSortedCountries.length}</span> de <span className="text-white font-semibold">{countries.length}</span> países
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-gray-400">Total Visitas: </span>
              <span className="text-white font-bold">
                {filteredAndSortedCountries.reduce((sum, c) => sum + c.total_visits, 0).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Total Compras: </span>
              <span className="text-white font-bold">
                {filteredAndSortedCountries.reduce((sum, c) => sum + c.total_purchases, 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Total Revenue: </span>
              <span className="text-green-400 font-bold">
                ${(filteredAndSortedCountries.reduce((sum, c) => sum + c.total_revenue_cents, 0) / 100).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

