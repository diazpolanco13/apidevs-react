'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface UsersFiltersProps {
  countries: string[];
  currentSearch: string;
  currentCountry: string;
  currentStatus: string;
}

export default function UsersFilters({ 
  countries, 
  currentSearch, 
  currentCountry, 
  currentStatus 
}: UsersFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(currentSearch);
  const [country, setCountry] = useState(currentCountry);
  const [status, setStatus] = useState(currentStatus);

  // Actualizar URL cuando cambien los filtros
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    
    if (country) {
      params.set('country', country);
    } else {
      params.delete('country');
    }
    
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    
    // Reset page when filters change
    params.delete('page');
    
    router.push(`/admin/users?${params.toString()}`);
  }, [search, country, status, router, searchParams]);

  const clearFilters = () => {
    setSearch('');
    setCountry('');
    setStatus('');
  };

  return (
    <div className="bg-black/30 backdrop-blur-xl border border-apidevs-primary/20 rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Búsqueda */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Buscar Usuario
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Email, nombre o username..."
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apidevs-primary focus:border-transparent"
          />
        </div>

        {/* País */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            País
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            aria-label="Filtrar por país"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-apidevs-primary focus:border-transparent"
          >
            <option value="">Todos los países</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {getCountryName(c)}
              </option>
            ))}
          </select>
        </div>

        {/* Estado de Reactivación */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Estado
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filtrar por estado de reactivación"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-apidevs-primary focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="contacted">Contactado</option>
            <option value="reactivated">Reactivado</option>
            <option value="declined">Rechazado</option>
          </select>
        </div>

        {/* Botón Limpiar */}
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper para convertir código de país a nombre
function getCountryName(code: string): string {
  const countries: { [key: string]: string } = {
    'AE': 'Emiratos Árabes Unidos',
    'AR': 'Argentina',
    'AT': 'Austria',
    'AU': 'Australia',
    'BD': 'Bangladesh',
    'BE': 'Bélgica',
    'BO': 'Bolivia',
    'BR': 'Brasil',
    'CA': 'Canadá',
    'CH': 'Suiza',
    'CL': 'Chile',
    'CO': 'Colombia',
    'CR': 'Costa Rica',
    'DE': 'Alemania',
    'DK': 'Dinamarca',
    'DO': 'República Dominicana',
    'EC': 'Ecuador',
    'EG': 'Egipto',
    'ES': 'España',
    'FR': 'Francia',
    'GB': 'Reino Unido',
    'GT': 'Guatemala',
    'HN': 'Honduras',
    'ID': 'Indonesia',
    'IE': 'Irlanda',
    'IN': 'India',
    'IT': 'Italia',
    'JP': 'Japón',
    'KR': 'Corea del Sur',
    'MX': 'México',
    'MY': 'Malasia',
    'NL': 'Países Bajos',
    'NO': 'Noruega',
    'NZ': 'Nueva Zelanda',
    'PA': 'Panamá',
    'PE': 'Perú',
    'PH': 'Filipinas',
    'PL': 'Polonia',
    'PT': 'Portugal',
    'PY': 'Paraguay',
    'RO': 'Rumania',
    'SE': 'Suecia',
    'SG': 'Singapur',
    'TH': 'Tailandia',
    'TR': 'Turquía',
    'US': 'Estados Unidos',
    'UY': 'Uruguay',
    'VE': 'Venezuela',
    'ZA': 'Sudáfrica'
  };
  
  return countries[code] || code;
}
