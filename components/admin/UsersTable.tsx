'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface User {
  id: string;
  email: string;
  full_name: string;
  country: string;
  city: string;
  wordpress_created_at: string;
  reactivation_status: string;
  customer_type: string;
}

interface UsersTableProps {
  users: User[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export default function UsersTable({ 
  users, 
  currentPage, 
  totalPages, 
  totalCount 
}: UsersTableProps) {
  const router = useRouter();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handlePageChange = (page: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    router.push(url.toString());
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      contacted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      reactivated: 'bg-green-500/20 text-green-400 border-green-500/30',
      declined: 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    const labels = {
      pending: 'Pendiente',
      contacted: 'Contactado',
      reactivated: 'Reactivado',
      declined: 'Rechazado'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCountryFlag = (countryCode: string) => {
    if (!countryCode) return '🌍';
    
    const flags: { [key: string]: string } = {
      'US': '🇺🇸', 'CA': '🇨🇦', 'MX': '🇲🇽', 'BR': '🇧🇷', 'AR': '🇦🇷',
      'CO': '🇨🇴', 'PE': '🇵🇪', 'CL': '🇨🇱', 'EC': '🇪🇨', 'VE': '🇻🇪',
      'ES': '🇪🇸', 'FR': '🇫🇷', 'DE': '🇩🇪', 'IT': '🇮🇹', 'GB': '🇬🇧',
      'NL': '🇳🇱', 'BE': '🇧🇪', 'CH': '🇨🇭', 'AT': '🇦🇹', 'SE': '🇸🇪',
      'NO': '🇳🇴', 'DK': '🇩🇰', 'AU': '🇦🇺', 'NZ': '🇳🇿', 'JP': '🇯🇵',
      'KR': '🇰🇷', 'CN': '🇨🇳', 'IN': '🇮🇳', 'ID': '🇮🇩', 'TH': '🇹🇭',
      'MY': '🇲🇾', 'SG': '🇸🇬', 'PH': '🇵🇭'
    };
    
    return flags[countryCode] || '🌍';
  };

  return (
    <div className="bg-black/30 backdrop-blur-xl border border-apidevs-primary/20 rounded-lg">
      {/* Header con acciones */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-white">
              Usuarios Legacy ({totalCount.toLocaleString()})
            </h2>
            {selectedUsers.length > 0 && (
              <span className="text-sm text-apidevs-primary">
                {selectedUsers.length} seleccionados
              </span>
            )}
          </div>
          
          {selectedUsers.length > 0 && (
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                Marcar para Campaña
              </button>
              <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors">
                Exportar CSV
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-600 text-apidevs-primary focus:ring-apidevs-primary"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Registro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map((user) => (
              <tr 
                key={user.id} 
                className="hover:bg-gray-800/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/admin/users/${user.id}`)}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectUser(user.id);
                    }}
                    className="rounded border-gray-600 text-apidevs-primary focus:ring-apidevs-primary"
                  />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-white">
                      {user.full_name || 'Sin nombre'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {user.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className="mr-2">{getCountryFlag(user.country)}</span>
                    <div>
                      <div className="text-sm text-white">
                        {user.city || 'Sin ciudad'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {user.country || 'Sin país'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {formatDate(user.wordpress_created_at)}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(user.reactivation_status)}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/admin/users/${user.id}`);
                    }}
                    className="text-apidevs-primary hover:text-apidevs-primary/80 text-sm font-medium"
                  >
                    Ver detalles →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="px-6 py-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Mostrando {((currentPage - 1) * 50) + 1} - {Math.min(currentPage * 50, totalCount)} de {totalCount.toLocaleString()} usuarios
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Anterior
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                if (page > totalPages) return null;
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-apidevs-primary text-black font-medium'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
