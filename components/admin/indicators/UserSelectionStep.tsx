'use client';

import { useState, useEffect } from 'react';
import { Search, Users, Check } from 'lucide-react';

type User = {
  id: string;
  email: string;
  full_name: string | null;
  tradingview_username: string | null;
  customer_tier: string | null;
  is_legacy_user: boolean;
  total_lifetime_spent: number;
  purchase_count: number;
};

type UserSelectionStepProps = {
  selectedUsers: User[];
  onSelectionChange: (users: User[]) => void;
};

export default function UserSelectionStep({
  selectedUsers,
  onSelectionChange
}: UserSelectionStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterLegacy, setFilterLegacy] = useState<string>('all');

  // Cargar usuarios iniciales
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Cargar TODOS los usuarios (sin límite, o con límite alto)
      const response = await fetch('/api/admin/users/search?q=&limit=1000');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Buscar usuarios en tiempo real
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      loadUsers();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/users/search?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error buscando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuarios por tier y legacy
  const filteredUsers = users.filter((user) => {
    const matchesTier =
      filterTier === 'all' || user.customer_tier === filterTier;
    
    let matchesLegacy = true;
    if (filterLegacy === 'active') {
      matchesLegacy = !user.is_legacy_user;
    } else if (filterLegacy === 'legacy') {
      matchesLegacy = user.is_legacy_user && user.purchase_count === 0;
    } else if (filterLegacy === 'recovered') {
      matchesLegacy = user.is_legacy_user && user.purchase_count > 0;
    }

    return matchesTier && matchesLegacy;
  });

  // Toggle selección de usuario
  const toggleUserSelection = (user: User) => {
    const isSelected = selectedUsers.some((u) => u.id === user.id);
    if (isSelected) {
      onSelectionChange(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      onSelectionChange([...selectedUsers, user]);
    }
  };

  // Seleccionar todos los filtrados
  const selectAllFiltered = () => {
    const allIds = new Set(selectedUsers.map((u) => u.id));
    const newUsers = filteredUsers.filter((u) => !allIds.has(u.id));
    onSelectionChange([...selectedUsers, ...newUsers]);
  };

  // Deseleccionar todos
  const deselectAll = () => {
    onSelectionChange([]);
  };

  const isUserSelected = (userId: string) =>
    selectedUsers.some((u) => u.id === userId);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar por email, nombre o username de TradingView..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:border-apidevs-primary focus:outline-none focus:ring-2 focus:ring-apidevs-primary/20"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Tier Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Filtrar por Tier
            </label>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-white focus:border-apidevs-primary focus:outline-none focus:ring-2 focus:ring-apidevs-primary/20"
            >
              <option value="all">Todos los tiers</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
              <option value="diamond">Diamond</option>
            </select>
          </div>

          {/* Legacy Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Tipo de Usuario
            </label>
            <select
              value={filterLegacy}
              onChange={(e) => setFilterLegacy(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-white focus:border-apidevs-primary focus:outline-none focus:ring-2 focus:ring-apidevs-primary/20"
            >
              <option value="all">Todos</option>
              <option value="active">Usuarios Activos (Nuevos)</option>
              <option value="legacy">Legacy (Sin compras)</option>
              <option value="recovered">⭐ Recuperados (Legacy que compró)</option>
            </select>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-end gap-2">
            <button
              onClick={selectAllFiltered}
              disabled={filteredUsers.length === 0}
              className="rounded-lg border border-emerald-600 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
            >
              Seleccionar todos ({filteredUsers.length})
            </button>
            <button
              onClick={deselectAll}
              disabled={selectedUsers.length === 0}
              className="rounded-lg border border-red-600 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
            >
              Deseleccionar todos
            </button>
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-4">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-purple-400" />
          <div>
            <p className="font-medium text-purple-300">
              {selectedUsers.length} usuario{selectedUsers.length !== 1 ? 's' : ''}{' '}
              seleccionado{selectedUsers.length !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-purple-400/70">
              De {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''}{' '}
              filtrado{filteredUsers.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg border border-zinc-800">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-zinc-800/95 backdrop-blur-sm">
              <tr className="border-b border-zinc-700">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  <Check className="h-4 w-4" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Usuario
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  TradingView
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Tier
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-900/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const selected = isUserSelected(user.id);

                  return (
                    <tr
                      key={user.id}
                      onClick={() => toggleUserSelection(user)}
                      className={`cursor-pointer transition-colors ${
                        selected
                          ? 'bg-emerald-500/10 hover:bg-emerald-500/20'
                          : 'hover:bg-zinc-800/50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
                            selected
                              ? 'border-emerald-500 bg-emerald-500'
                              : 'border-zinc-600'
                          }`}
                        >
                          {selected && <Check className="h-4 w-4 text-white" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-white">
                          {user.full_name || 'Sin nombre'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-300">{user.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-400">
                          {user.tradingview_username || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium uppercase bg-zinc-700/50 text-gray-300">
                          {user.customer_tier || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.is_legacy_user ? (
                          // Solo es "Recuperado" si está en tabla 'users' Y tiene compras
                          // Si está en 'legacy_users' con compras, es solo "Legacy"
                          (user as any).source === 'registered' && user.purchase_count > 0 ? (
                            <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-400">
                              ⭐ Recuperado
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-amber-500/20 text-amber-400">
                              Legacy
                            </span>
                          )
                        ) : (
                          <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-400">
                            Activo
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

