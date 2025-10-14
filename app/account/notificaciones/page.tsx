import { createClient } from '@/utils/supabase/server';
import { getUser, getSubscription } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Bell, Lock, Zap, ArrowRight } from 'lucide-react';

export default async function NotificacionesPage() {
  const supabase = await createClient();
  const [user, subscription] = await Promise.all([
    getUser(supabase),
    getSubscription(supabase)
  ]);

  if (!user) {
    return redirect('/signin');
  }

  const userPlan = subscription?.prices?.products?.name || 'Free';
  const isPro = userPlan.toLowerCase().includes('pro');
  const isLifetime = userPlan.toLowerCase().includes('lifetime');
  const hasPremium = isPro || isLifetime;

  if (!hasPremium) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Notificaciones</h1>
          <p className="text-gray-400">Recibe alertas en tiempo real de tus indicadores</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <Lock className="w-10 h-10 text-white" />
            <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-2">
              <Zap className="w-5 h-5 text-black" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">Función Premium</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Las notificaciones en tiempo real son exclusivas para usuarios PRO. 
            Nunca pierdas una oportunidad de trading con alertas instantáneas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="px-8 py-4 bg-gradient-to-r from-apidevs-primary to-green-400 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-apidevs-primary/50 transition-all flex items-center justify-center gap-2"
            >
              Actualizar a PRO
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/account/suscripcion"
              className="px-8 py-4 border border-gray-700 hover:border-purple-500 text-white font-semibold rounded-xl transition-all"
            >
              Ver Planes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Notificaciones</h1>
        <p className="text-gray-400">Gestiona tus alertas y notificaciones</p>
      </div>

      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Notificaciones Activas</h3>
            <p className="text-sm text-gray-300">0 alertas configuradas</p>
          </div>
        </div>
      </div>

      <div className="text-center py-20">
        <Bell className="w-20 h-20 text-purple-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">Próximamente</h2>
        <p className="text-gray-400">
          Estamos desarrollando el sistema de notificaciones.
          Pronto podrás configurar alertas personalizadas.
        </p>
      </div>
    </div>
  );
}
