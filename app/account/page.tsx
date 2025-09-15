import CustomerPortalForm from '@/components/ui/AccountForms/CustomerPortalForm';
import EmailForm from '@/components/ui/AccountForms/EmailForm';
import NameForm from '@/components/ui/AccountForms/NameForm';
import EditProfileClient from './EditProfileClient';
import EditLocationClient from './EditLocationClient';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { checkOnboardingStatus } from '@/utils/auth-helpers/onboarding';
import {
  getUserDetails,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';
import { User, TrendingUp, MapPin, Phone, Shield, CheckCircle } from 'lucide-react';

export default async function Account() {
  const supabase = createClient();
  const [user, userDetails, subscription] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase),
    getSubscription(supabase)
  ]);

  if (!user) {
    return redirect('/signin');
  }

  // Check onboarding status and get extended profile
  const { completed, profile } = await checkOnboardingStatus(user.id);
  
  if (!completed) {
    return redirect('/onboarding');
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-apidevs-dark via-black to-apidevs-dark">
      {/* Header */}
      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8">
        <div className="sm:align-center sm:flex sm:flex-col">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-full mb-6 mx-auto">
            <User className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl mb-4">
            ¡Bienvenido, {profile?.full_name?.split(' ')[0] || 'Trader'}!
          </h1>
          <p className="max-w-2xl m-auto mt-5 text-xl text-gray-200 sm:text-center sm:text-2xl">
            Tu cuenta está configurada y lista para el trading profesional
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Editable Profile Card */}
          <div className="bg-gradient-to-br from-apidevs-primary/10 to-blue-500/10 backdrop-blur-xl border border-apidevs-primary/30 rounded-3xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-apidevs-primary to-blue-500 rounded-full flex items-center justify-center mr-4">
                <User className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-2xl font-bold text-white">Perfil de Usuario</h2>
              <div className="ml-auto">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Verificado
                </span>
              </div>
            </div>
            
            <EditProfileClient 
              userId={user.id}
              initialData={{
                full_name: profile?.full_name || '',
                tradingview_username: profile?.tradingview_username || ''
              }}
            />
          </div>

          {/* Location Info Card */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Ubicación</h2>
            </div>
            
            <EditLocationClient 
              userId={user.id}
              initialData={{
                country: profile?.country || '',
                city: profile?.city || '',
                phone: profile?.phone || '',
                postal_code: profile?.postal_code || '',
                address: profile?.address || '',
                timezone: profile?.timezone || ''
              }}
            />
          </div>

          {/* Subscription Card */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-gray-700 rounded-3xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Suscripción y Facturación</h2>
              </div>
              
              <div className="space-y-6">
                {/* Plan Status */}
                <div className="bg-black/30 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Tu Plan Actual</h3>
                    {subscription ? (
                      <span className="px-3 py-1 bg-apidevs-primary/20 text-apidevs-primary rounded-full text-sm font-medium">
                        {subscription.prices?.products?.name}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                        Sin Suscripción
                      </span>
                    )}
                  </div>
                  
                  <div className="text-gray-300 mb-4">
                    {subscription
                      ? `Estás suscrito al plan ${subscription.prices?.products?.name}.`
                      : 'No tienes una suscripción activa actualmente.'
                    }
                  </div>

                  {subscription && (
                    <div className="text-2xl font-bold text-white mb-4">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: subscription.prices?.currency || 'USD',
                        minimumFractionDigits: 0
                      }).format((subscription.prices?.unit_amount || 0) / 100)}
                      <span className="text-sm text-gray-400 ml-1">
                        /{subscription.prices?.interval}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    {!subscription ? (
                      <a
                        href="/#pricing"
                        className="px-6 py-3 bg-gradient-to-r from-apidevs-primary to-green-400 hover:from-green-400 hover:to-apidevs-primary text-black font-semibold rounded-2xl transition-all transform hover:scale-105 text-center inline-block"
                      >
                        Elegir Plan
                      </a>
                    ) : (
                      <CustomerPortalForm subscription={subscription} />
                    )}
                  </div>
                </div>

                {/* Account Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-black/30 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Configuración de Cuenta</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <div className="text-white font-medium">{user.email}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Soporte</h4>
                    <div className="text-gray-300 text-sm">
                      ¿Necesitas ayuda? Contáctanos a través de nuestros canales de soporte.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="mt-8 bg-gradient-to-r from-green-500/10 to-apidevs-primary/10 border border-green-500/30 rounded-3xl p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500 mr-4" />
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">¡Configuración Completa!</h3>
              <p className="text-gray-300">
                Tu perfil está listo. Ahora puedes acceder a todos nuestros indicadores de trading usando tu usuario de TradingView: <span className="text-apidevs-primary font-semibold">{profile?.tradingview_username}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
