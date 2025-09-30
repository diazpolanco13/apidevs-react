import { createClient } from '@/utils/supabase/server';
import { getUser, getSubscription } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Lock, Crown, ArrowRight } from 'lucide-react';

export default async function AcademiaPage() {
  const supabase = createClient();
  const [user, subscription] = await Promise.all([
    getUser(supabase),
    getSubscription(supabase)
  ]);

  if (!user) {
    return redirect('/signin');
  }

  const userPlan = subscription?.prices?.products?.name || 'Free';
  const isLifetime = userPlan.toLowerCase().includes('lifetime');

  if (!isLifetime) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Academia APIDevs</h1>
          <p className="text-gray-400">Contenido educativo exclusivo para miembros Lifetime</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <Lock className="w-10 h-10 text-white" />
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full p-2">
              <Crown className="w-5 h-5 text-black" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">Exclusivo para Lifetime</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            La Academia APIDevs es un beneficio exclusivo para miembros Lifetime. 
            Accede a cursos avanzados, webinars en vivo, y mentorías personalizadas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/pricing"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5" />
              Obtener Lifetime
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/account/suscripcion"
              className="px-8 py-4 border border-gray-700 hover:border-purple-500 text-white font-semibold rounded-xl transition-all"
            >
              Ver Planes
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-black/30 rounded-xl p-4">
              <GraduationCap className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="text-white font-semibold mb-2">Cursos Avanzados</h3>
              <p className="text-gray-400 text-sm">Formación profesional completa</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <Crown className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="text-white font-semibold mb-2">Webinars Exclusivos</h3>
              <p className="text-gray-400 text-sm">Sesiones en vivo con expertos</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <GraduationCap className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="text-white font-semibold mb-2">Mentoría Personal</h3>
              <p className="text-gray-400 text-sm">Acompañamiento individualizado</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Academia APIDevs</h1>
        <p className="text-gray-400">Tu centro de aprendizaje premium</p>
      </div>

      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Miembro Lifetime</h3>
            <p className="text-sm text-gray-300">Acceso completo a todos los recursos</p>
          </div>
        </div>
      </div>

      <div className="text-center py-20">
        <GraduationCap className="w-20 h-20 text-purple-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">Próximamente</h2>
        <p className="text-gray-400">
          Estamos preparando contenido educativo exclusivo para ti.
          La Academia estará disponible muy pronto.
        </p>
      </div>
    </div>
  );
}
