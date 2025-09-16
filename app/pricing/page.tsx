import { Metadata } from 'next';
import Pricing from '@/components/ui/Pricing/Pricing';
import CountdownTimer from '@/components/ui/CountdownTimer';
import SocialProof from '@/components/ui/SocialProof';
import { createClient } from '@/utils/supabase/server';
import {
  getProducts,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';

export const metadata: Metadata = {
  title: 'Precios - Planes de Suscripción | APIDevs Trading Platform',
  description: 'Elige el plan perfecto para tu trading. Desde FREE hasta LIFETIME, accede a indicadores avanzados, scanners únicos y comunidad VIP de traders profesionales.',
  keywords: 'precios, planes, suscripción, trading, indicadores, TradingView, APIDevs',
  openGraph: {
    title: 'Planes de Suscripción | APIDevs Trading',
    description: 'Únete a 3,500+ traders profesionales. Indicadores avanzados, scanners de 160 criptos y comunidad VIP.',
    type: 'website',
  },
};

export default async function PricingPage() {
  const supabase = createClient();
  const [user, products, subscription] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
    getSubscription(supabase)
  ]);

  return (
    <main className="min-h-screen">
      <div className="pt-0">
        {/* Header Section with Countdown */}
        <div className="relative bg-gradient-to-b from-apidevs-dark via-black to-black overflow-hidden pb-24">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-96 h-96 bg-apidevs-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-300" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-apidevs-primary/5 to-purple-500/5 rounded-full blur-3xl" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
            {/* Title First */}
            <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-apidevs-primary to-white mb-6 animate-gradient">
              Precios
            </h1>
            
            {/* Badge */}
            <div className="inline-flex items-center justify-center px-6 py-2 mb-8 text-sm font-medium text-apidevs-primary bg-apidevs-primary/10 border border-apidevs-primary/30 rounded-full backdrop-blur-sm">
              <span className="w-4 h-4 mr-2">⚡</span>
              ÚNETE A 3,500+ TRADERS DE ÉLITE
            </div>
            
            {/* Description */}
            <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed mb-12">
              Únete a nuestra comunidad exclusiva en Telegram donde traders profesionales comparten estrategias en tiempo real, 
              reciben alertas VIP y acceden a herramientas de trading de próxima generación.
            </p>

            {/* Countdown Timer Integrado */}
            <CountdownTimer />
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="bg-gradient-to-b from-black via-black to-apidevs-dark">
          <Pricing
            user={user}
            products={products ?? []}
            subscription={subscription}
            showHeader={false}
          />
        </div>

        {/* Social Proof */}
        <div className="relative bg-gradient-to-b from-apidevs-dark to-black py-16">
          <SocialProof />
        </div>
      </div>
    </main>
  );
}
