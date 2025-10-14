import { createClient } from '@/utils/supabase/server';
import { getUser, getSubscription } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Mail, CreditCard, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import SuccessConfetti from './SuccessConfetti';

export default async function SuccessPage() {
  const supabase = await createClient();
  const [user, subscription] = await Promise.all([
    getUser(supabase),
    getSubscription(supabase)
  ]);

  if (!user) {
    return redirect('/signin');
  }

  const planName = subscription?.prices?.products?.name || 'Plan Premium';
  const amount = subscription?.prices?.unit_amount ? (subscription.prices.unit_amount / 100) : 0;
  const currency = subscription?.prices?.currency?.toUpperCase() || 'USD';
  const interval = subscription?.prices?.interval || 'month';
  const nextBilling = subscription?.current_period_end 
    ? new Date(subscription.current_period_end).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : null;

  return (
    <>
      <SuccessConfetti />
      
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          {/* Success Icon with Animation */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-apidevs-primary to-green-400 mb-6 animate-bounce-slow">
              <CheckCircle className="w-12 h-12 text-black" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              ¡Pago Exitoso! 🎉
            </h1>
            
            <p className="text-xl text-gray-300 mb-2">
              Bienvenido a <span className="text-apidevs-primary font-semibold">{planName}</span>
            </p>
            
            <div className="inline-flex items-center gap-2 text-gray-400">
              <Sparkles className="w-4 h-4 text-apidevs-primary" />
              <span>Tu cuenta ha sido activada exitosamente</span>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-3xl p-6 sm:p-8 backdrop-blur-xl mb-6">
            {/* Payment Summary */}
            <div className="border-b border-gray-700 pb-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Resumen de tu suscripción</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Plan</span>
                  <span className="text-white font-semibold">{planName}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Monto</span>
                  <span className="text-white font-bold text-xl">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: currency,
                      minimumFractionDigits: 2
                    }).format(amount)}
                    <span className="text-sm text-gray-400 font-normal ml-1">/{interval === 'year' ? 'año' : 'mes'}</span>
                  </span>
                </div>

                {nextBilling && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Próxima renovación</span>
                    <span className="text-white">{nextBilling}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Important Info */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Mail className="w-5 h-5 text-apidevs-primary" />
                Información importante
              </h3>
              
              <div className="space-y-3 text-gray-300">
                <div className="flex items-start gap-3 bg-apidevs-primary/10 border border-apidevs-primary/30 rounded-xl p-4">
                  <Mail className="w-5 h-5 text-apidevs-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium mb-1">Factura enviada</p>
                    <p className="text-sm text-gray-400">
                      Recibirás tu factura en <span className="text-white font-medium">{user.email}</span> en los próximos minutos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-800/50 rounded-xl p-4">
                  <CreditCard className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium mb-1">Acceso inmediato</p>
                    <p className="text-sm text-gray-400">
                      Ya puedes acceder a todos los indicadores premium y funciones exclusivas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-800/50 rounded-xl p-4">
                  <Calendar className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium mb-1">Renovación automática</p>
                    <p className="text-sm text-gray-400">
                      Tu suscripción se renovará automáticamente. Puedes cancelarla en cualquier momento desde tu cuenta.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              href="/account" 
              className="flex-1 bg-gradient-to-r from-apidevs-primary to-green-400 text-black font-semibold px-6 py-4 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Ir al Dashboard</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="/account/suscripcion" 
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-4 rounded-xl transition-all flex items-center justify-center gap-2 border border-gray-700"
            >
              <CreditCard className="w-5 h-5" />
              <span>Ver mi Suscripción</span>
            </Link>
          </div>

          {/* Support Note */}
          <p className="text-center text-sm text-gray-400 mt-6">
            ¿Necesitas ayuda? Contáctanos en{' '}
            <a href="mailto:support@apidevs.io" className="text-apidevs-primary hover:underline">
              support@apidevs.io
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

