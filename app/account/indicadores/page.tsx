import { createClient } from '@/utils/supabase/server';
import { getUser, getSubscription } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, Lock, Zap, ArrowRight } from 'lucide-react';
import UserIndicatorsList from '@/components/account/UserIndicatorsList';

export default async function IndicadoresPage() {
  const supabase = createClient();
  const [user, subscription] = await Promise.all([
    getUser(supabase),
    getSubscription(supabase)
  ]);

  if (!user) {
    return redirect('/signin');
  }

  // Obtener los accesos a indicadores del usuario
  const { data: indicatorAccesses } = await supabase
    .from('indicator_access')
    .select(`
      id,
      status,
      granted_at,
      expires_at,
      duration_type,
      access_source,
      indicators:indicator_id (
        id,
        pine_id,
        name,
        description,
        category,
        access_tier,
        tradingview_url,
        public_script_url,
        image_1
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('granted_at', { ascending: false });

  const validAccesses = (indicatorAccesses || []) as any[];

  const userPlan = subscription?.prices?.products?.name || 'Free';
  const isPro = userPlan.toLowerCase().includes('pro');
  const isLifetime = userPlan.toLowerCase().includes('lifetime');
  const hasPremium = isPro || isLifetime || validAccesses.length > 0;

  // Si no tiene acceso premium, mostrar página de upgrade
  if (!hasPremium) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mis Indicadores</h1>
          <p className="text-gray-400">Accede a indicadores premium para potenciar tu trading</p>
        </div>

        <div className="bg-gradient-to-br from-apidevs-primary/10 to-green-400/10 backdrop-blur-xl border border-apidevs-primary/30 rounded-3xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <Lock className="w-10 h-10 text-black" />
            <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-2">
              <Zap className="w-5 h-5 text-black" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">Función Premium</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Desbloquea acceso a todos nuestros indicadores profesionales de trading. 
            Analiza el mercado con herramientas avanzadas y recibe señales en tiempo real.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/pricing"
              className="px-8 py-4 bg-gradient-to-r from-apidevs-primary to-green-400 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-apidevs-primary/50 transition-all flex items-center justify-center gap-2"
            >
              Actualizar a PRO
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/account/suscripcion"
              className="px-8 py-4 border border-gray-700 hover:border-apidevs-primary text-white font-semibold rounded-xl transition-all"
            >
              Ver Planes
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-black/30 rounded-xl p-4">
              <TrendingUp className="w-8 h-8 text-apidevs-primary mb-3" />
              <h3 className="text-white font-semibold mb-2">Indicadores Ilimitados</h3>
              <p className="text-gray-400 text-sm">Acceso completo a toda nuestra biblioteca</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <Zap className="w-8 h-8 text-apidevs-primary mb-3" />
              <h3 className="text-white font-semibold mb-2">Señales en Tiempo Real</h3>
              <p className="text-gray-400 text-sm">Notificaciones instantáneas de oportunidades</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <TrendingUp className="w-8 h-8 text-apidevs-primary mb-3" />
              <h3 className="text-white font-semibold mb-2">Análisis Avanzado</h3>
              <p className="text-gray-400 text-sm">Herramientas profesionales de análisis</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Usuario con acceso premium o con indicadores
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Mis Indicadores</h1>
        <p className="text-gray-400">Gestiona y configura tus indicadores de trading</p>
      </div>

      {validAccesses.length > 0 && (
        <div className="bg-gradient-to-r from-apidevs-primary/10 to-green-400/10 border border-apidevs-primary/30 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {validAccesses.length} {validAccesses.length === 1 ? 'Indicador Activo' : 'Indicadores Activos'}
                </h3>
                <p className="text-sm text-gray-300">Acceso completo a tus herramientas de trading</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <UserIndicatorsList accesses={validAccesses} />
    </div>
  );
}
