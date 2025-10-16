'use client';

import { useState } from 'react';
import { 
  UserPlus, 
  Search, 
  Filter,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import Image from 'next/image';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role_id: string;
  avatar_url: string | null;
  status: string;
  last_login_at: string | null;
  created_at: string;
  admin_roles: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    permissions: Record<string, boolean>;
    is_system_role: boolean;
  };
}

interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  permissions: Record<string, boolean>;
  is_system_role: boolean;
}

interface AdministradoresTabProps {
  admins: AdminUser[];
  roles: Role[];
  currentUserId: string;
}

export default function AdministradoresTab({ admins, roles, currentUserId }: AdministradoresTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filtrar administradores
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch = 
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || admin.status === filterStatus;
    const matchesRole = filterRole === 'all' || admin.role_id === filterRole;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Activo
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
            <XCircle className="w-3 h-3" />
            Suspendido
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <Clock className="w-3 h-3" />
            Pendiente
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Sección 1: Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{admins.length}</p>
              <p className="text-xs text-gray-400">Total Administradores</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 backdrop-blur-xl border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {admins.filter(a => a.status === 'active').length}
              </p>
              <p className="text-xs text-gray-400">Activos</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 backdrop-blur-xl border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {admins.filter(a => a.status === 'pending').length}
              </p>
              <p className="text-xs text-gray-400">Pendientes</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 backdrop-blur-xl border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{roles.length}</p>
              <p className="text-xs text-gray-400">Roles Disponibles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección 2: Filtros y búsqueda */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Buscador */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Filtro por Estado */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="suspended">Suspendidos</option>
            <option value="pending">Pendientes</option>
          </select>

          {/* Filtro por Rol */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="all">Todos los roles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          {/* Botón Crear */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/50"
          >
            <UserPlus className="w-5 h-5" />
            Nuevo Admin
          </button>
        </div>
      </div>

      {/* Sección 3: Tabla de administradores */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">
            Lista de Administradores ({filteredAdmins.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Administrador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Último acceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-gray-500">No se encontraron administradores</p>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr 
                    key={admin.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    {/* Administrador */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center overflow-hidden">
                          {admin.avatar_url ? (
                            <Image
                              src={admin.avatar_url}
                              alt={admin.full_name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-purple-400 font-bold text-sm">
                              {admin.full_name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {admin.full_name}
                            {admin.id === currentUserId && (
                              <span className="ml-2 text-xs text-purple-400">(Tú)</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">{admin.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Rol */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-300">
                          {admin.admin_roles.name}
                        </span>
                        {admin.admin_roles.is_system_role && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            Sistema
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4">
                      {getStatusBadge(admin.status)}
                    </td>

                    {/* Último acceso */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-400">
                        {formatDate(admin.last_login_at)}
                      </span>
                    </td>

                    {/* Creado */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-400">
                        {formatDate(admin.created_at)}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                        {admin.admin_roles.slug !== 'super-admin' && admin.id !== currentUserId && (
                          <button
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Suspender"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                        <button
                          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                          title="Más opciones"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sección 4: Gestión de Roles */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          Roles y Permisos Disponibles
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => {
            const permissionsCount = Object.values(role.permissions).filter(v => v === true).length;
            
            return (
              <div
                key={role.id}
                className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 hover:border-purple-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <h4 className="font-bold text-white">{role.name}</h4>
                  </div>
                  {role.is_system_role && (
                    <span className="px-2 py-1 text-[10px] font-bold rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Sistema
                    </span>
                  )}
                </div>

                {role.description && (
                  <p className="text-xs text-gray-400 mb-3">
                    {role.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {permissionsCount} permisos activos
                  </span>
                  <button className="text-xs text-purple-400 hover:text-purple-300 font-medium">
                    Ver detalles →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Crear Admin (placeholder por ahora) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Crear Nuevo Administrador</h3>
            <p className="text-gray-400 mb-6">
              La funcionalidad de crear administradores estará disponible una vez que se implementen los endpoints de API correspondientes.
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

