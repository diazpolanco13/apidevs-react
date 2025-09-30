import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { Mail, Bell, Shield, Palette, Globe } from 'lucide-react';

export default async function ConfiguracionPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

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
            <button className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg transition-colors">
              Cambiar
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl">
            <div>
              <div className="text-white font-medium mb-1">Contraseña</div>
              <div className="text-gray-400 text-sm">••••••••</div>
            </div>
            <button className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg transition-colors">
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
        <button className="px-4 py-2 text-sm text-red-400 hover:text-white border border-red-500/50 hover:border-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
          Eliminar Cuenta
        </button>
      </div>
    </div>
  );
}
