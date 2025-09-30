'use client';

import { useState } from 'react';
import { Mail, Bell, Shield, Palette, Globe, AlertTriangle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import type { User } from '@supabase/supabase-js';

interface ConfiguracionClientProps {
  user: User;
}

export default function ConfiguracionClient({ user }: ConfiguracionClientProps) {
  const router = useRouter();
  const supabase = createClient();

  // Estados para modales
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Estados para formularios
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [confirmDeleteText, setConfirmDeleteText] = useState('');

  // Estados para loading y errores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cambiar Email
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

      setSuccess('¡Email actualizado! Revisa tu correo para confirmar el cambio.');
      setNewEmail('');
      setTimeout(() => {
        setIsEmailModalOpen(false);
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Error al cambiar el email');
    } finally {
      setLoading(false);
    }
  };

  // Cambiar Contraseña
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccess('¡Contraseña actualizada correctamente!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar Cuenta
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (confirmDeleteText !== 'ELIMINAR') {
      setError('Por favor escribe "ELIMINAR" para confirmar');
      setLoading(false);
      return;
    }

    try {
      // Primero verificar la contraseña
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: deleteConfirmPassword
      });

      if (signInError) {
        setError('Contraseña incorrecta');
        setLoading(false);
        return;
      }

      // Eliminar datos del usuario de la base de datos
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (deleteError) throw deleteError;

      // Cerrar sesión y eliminar de auth
      await supabase.auth.signOut();

      // Redirigir al home
      router.push('/?deleted=true');
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la cuenta');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Configuración</h1>
        <p className="text-gray-400">Personaliza tu experiencia en APIDevs Trading</p>
      </div>

      {/* Account Settings */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Cuenta</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl">
            <div>
              <div className="text-white font-medium mb-1">Email</div>
              <div className="text-gray-400 text-sm">{user.email}</div>
            </div>
            <button 
              onClick={() => setIsEmailModalOpen(true)}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-700 hover:border-apidevs-primary/50 rounded-lg transition-colors"
            >
              Cambiar
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl">
            <div>
              <div className="text-white font-medium mb-1">Contraseña</div>
              <div className="text-gray-400 text-sm">••••••••</div>
            </div>
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-700 hover:border-apidevs-primary/50 rounded-lg transition-colors"
            >
              Cambiar
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Settings */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Notificaciones</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl">
            <div>
              <div className="text-white font-medium mb-1">Alertas de Trading</div>
              <div className="text-gray-400 text-sm">Recibe notificaciones de señales</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-apidevs-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-apidevs-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl">
            <div>
              <div className="text-white font-medium mb-1">Emails Promocionales</div>
              <div className="text-gray-400 text-sm">Novedades y ofertas especiales</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-apidevs-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-apidevs-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl">
            <div>
              <div className="text-white font-medium mb-1">Resumen Semanal</div>
              <div className="text-gray-400 text-sm">Estadísticas y análisis semanal</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-apidevs-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-apidevs-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Palette className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Apariencia</h2>
          </div>
          <div className="text-gray-400 text-sm">
            Próximamente: Personaliza colores y temas
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Idioma</h2>
          </div>
          <div className="text-gray-400 text-sm">
            Español (España)
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-gradient-to-br from-red-500/10 to-red-900/10 backdrop-blur-xl border border-red-500/30 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Zona de Peligro</h2>
        </div>
        <p className="text-gray-300 text-sm mb-4">
          Acciones irreversibles que afectan permanentemente tu cuenta.
        </p>
        <button 
          onClick={() => setIsDeleteModalOpen(true)}
          className="px-4 py-2 text-sm text-red-400 hover:text-white border border-red-500/50 hover:border-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          Eliminar Cuenta
        </button>
      </div>

      {/* Modal: Cambiar Email */}
      <Dialog open={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-2xl p-6">
            <Dialog.Title className="text-2xl font-bold text-white mb-4">
              Cambiar Email
            </Dialog.Title>

            <form onSubmit={handleEmailChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Actual
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-xl text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nuevo Email
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  placeholder="tu-nuevo-email@example.com"
                  className="w-full px-4 py-3 bg-black/30 border border-gray-700 focus:border-apidevs-primary rounded-xl text-white"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
                  {success}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-apidevs-primary to-green-400 hover:shadow-lg hover:shadow-apidevs-primary/50 text-black font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  {loading ? 'Cambiando...' : 'Cambiar Email'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Modal: Cambiar Contraseña */}
      <Dialog open={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-2xl p-6">
            <Dialog.Title className="text-2xl font-bold text-white mb-4">
              Cambiar Contraseña
            </Dialog.Title>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-3 bg-black/30 border border-gray-700 focus:border-apidevs-primary rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Repite tu nueva contraseña"
                  className="w-full px-4 py-3 bg-black/30 border border-gray-700 focus:border-apidevs-primary rounded-xl text-white"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
                  {success}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-apidevs-primary to-green-400 hover:shadow-lg hover:shadow-apidevs-primary/50 text-black font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Modal: Eliminar Cuenta */}
      <Dialog open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full bg-gradient-to-br from-red-900/50 to-gray-900 border border-red-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <Dialog.Title className="text-2xl font-bold text-white">
                Eliminar Cuenta
              </Dialog.Title>
            </div>

            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 font-semibold mb-2">⚠️ Esta acción es permanente</p>
              <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                <li>Se eliminarán todos tus datos</li>
                <li>Perderás acceso a tu suscripción</li>
                <li>No podrás recuperar tu cuenta</li>
              </ul>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Escribe <span className="text-red-400 font-bold">ELIMINAR</span> para confirmar
                </label>
                <input
                  type="text"
                  value={confirmDeleteText}
                  onChange={(e) => setConfirmDeleteText(e.target.value)}
                  required
                  placeholder="ELIMINAR"
                  className="w-full px-4 py-3 bg-black/30 border border-red-500/30 focus:border-red-500 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirma tu contraseña
                </label>
                <input
                  type="password"
                  value={deleteConfirmPassword}
                  onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                  required
                  placeholder="Tu contraseña actual"
                  className="w-full px-4 py-3 bg-black/30 border border-red-500/30 focus:border-red-500 rounded-xl text-white"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || confirmDeleteText !== 'ELIMINAR'}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Eliminando...' : 'Eliminar Cuenta'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

