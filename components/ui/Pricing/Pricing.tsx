'use client';

import Button from '@/components/ui/Button';
import LogoCloud from '@/components/ui/LogoCloud';
import BackgroundEffects from '@/components/ui/BackgroundEffects';
import type { Tables } from '@/types_db';
import { getStripe } from '@/utils/stripe/client';
import { checkoutWithStripe } from '@/utils/stripe/server';
import { getErrorRedirect } from '@/utils/helpers';
import { User } from '@supabase/supabase-js';
import cn from 'classnames';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { Check, Star, Shield, Zap, TrendingUp, Award, Clock, Users } from 'lucide-react';

type Subscription = Tables<'subscriptions'>;
type Product = Tables<'products'>;
type Price = Tables<'prices'>;
interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface Props {
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
}

type BillingInterval = 'lifetime' | 'year' | 'month';

export default function Pricing({ user, products, subscription }: Props) {
  const router = useRouter();
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const currentPath = usePathname();

  // Filtrar productos de prueba y obtener solo los productos principales
  const mainProducts = products.filter(product => 
    product.name?.includes('APIDevs Trading Indicators') && 
    !product.name?.includes('Test')
  );

  const handleStripeCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      return router.push('/signin/signup');
    }

    const { errorRedirect, sessionId } = await checkoutWithStripe(
      price,
      currentPath
    );

    if (errorRedirect) {
      setPriceIdLoading(undefined);
      return router.push(errorRedirect);
    }

    if (!sessionId) {
      setPriceIdLoading(undefined);
      return router.push(
        getErrorRedirect(
          currentPath,
          'An unknown error occurred.',
          'Please try again later or contact a system administrator.'
        )
      );
    }

    const stripe = await getStripe();
    stripe?.redirectToCheckout({ sessionId });

    setPriceIdLoading(undefined);
  };

  // Obtener el producto principal (no lifetime)
  const mainProduct = mainProducts.find(p => !p.name?.includes('Lifetime'));
  const lifetimeProduct = mainProducts.find(p => p.name?.includes('Lifetime'));

  // Obtener precios específicos
  const monthlyPrice = mainProduct?.prices?.find(price => 
    price.interval === 'month' && price.interval_count === 1
  );
  const semiannualPrice = mainProduct?.prices?.find(price => 
    price.interval === 'month' && price.interval_count === 6
  );
  const yearlyPrice = mainProduct?.prices?.find(price => 
    price.interval === 'year' && price.interval_count === 1
  );
  
  // Para Lifetime, buscar precio que no tenga intervalo (pago único) o usar el primer precio
  const lifetimePrice = lifetimeProduct?.prices?.find(price => 
    !price.interval || price.interval === null
  ) || lifetimeProduct?.prices?.[0];

  // Si no hay producto Lifetime en Stripe, crear uno mock para desarrollo
  const lifetimePriceMock = !lifetimePrice ? {
    id: 'price_lifetime_mock',
    unit_amount: 99900, // $999.00
    currency: 'usd',
    interval: null,
    interval_count: null,
    product_id: 'prod_lifetime_mock'
  } as Price : lifetimePrice;

  // Usar el precio mock si no hay precio real
  const finalLifetimePrice = lifetimePrice || lifetimePriceMock;

  if (!mainProduct) {
    return (
      <section className="bg-apidevs-dark">
        <div className="max-w-6xl px-4 py-8 mx-auto sm:py-24 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-col sm:align-center"></div>
          <p className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            Los planes de suscripción se están cargando...
          </p>
        </div>
        <LogoCloud />
      </section>
    );
  }
  return (
    <section className="relative bg-gradient-to-b from-apidevs-dark via-black to-apidevs-dark overflow-hidden py-16">
      {/* Efectos de fondo épicos */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-apidevs-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-300" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-apidevs-primary/5 to-purple-500/5 rounded-full blur-3xl animate-spin-slow" />
        <BackgroundEffects variant="minimal" />
      </div>
      
      {/* Header épico */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <div className="inline-flex items-center justify-center px-6 py-2 mb-8 text-sm font-medium text-apidevs-primary bg-apidevs-primary/10 border border-apidevs-primary/30 rounded-full backdrop-blur-sm">
          <Zap className="w-4 h-4 mr-2" />
          ÚNETE A 3,500+ TRADERS DE ÉLITE
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-apidevs-primary to-white mb-6 animate-gradient">
          Elige tu plan
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
          Accede a nuestra comunidad exclusiva en Discord donde traders profesionales comparten estrategias en tiempo real, 
          reciben memorias personalizadas y obtienen alertas VIP antes que nadie.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Plan Mensual */}
          {monthlyPrice && (
            <div className="group relative h-full">
              {/* Glow effect on hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-apidevs-primary/50 to-green-500/50 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              
              <div className="relative h-full flex flex-col bg-gradient-to-b from-gray-900/90 to-black/90 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 hover:border-apidevs-primary/50 transition-all duration-500 hover:transform hover:scale-105">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-3">PLAN MENSUAL</h3>
                  <div className="inline-flex items-center px-3 py-1 bg-gray-800/50 rounded-full">
                    <Clock className="w-4 h-4 text-apidevs-primary mr-2" />
                    <span className="text-sm text-gray-300">Inicia Ahora</span>
                  </div>
                </div>
                
                <div className="text-center mb-8">
                  <div className="text-gray-500 line-through text-sm mb-2">$50</div>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-white">${((monthlyPrice.unit_amount || 0) / 100).toFixed(0)}</span>
                    <span className="text-lg text-gray-400 ml-2">.50</span>
                    <span className="text-gray-400 ml-2">/Mes</span>
                  </div>
                </div>

                <Button
                  variant="slim"
                  type="button"
                  loading={priceIdLoading === monthlyPrice.id}
                  onClick={() => handleStripeCheckout(monthlyPrice)}
                  className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-apidevs-primary hover:to-green-500 text-white font-bold py-4 rounded-2xl mb-8 transition-all duration-300 shadow-xl hover:shadow-apidevs-primary/30"
                >
                  Suscríbete
                </Button>

                <div className="space-y-4 mt-auto">
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-apidevs-primary mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">18 Indicadores [VIP]</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-apidevs-primary mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">2 Scanners [160 CRIPTOS]</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-apidevs-primary mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">2 Scanners [160 MULTIMARKET]</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-apidevs-primary mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Activación inmediata (3 a 10 minutos)</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-apidevs-primary mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Acceso a nuestra comunidad VIP en Discord</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-apidevs-primary mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Grupo de Alertas [Telegram y Discord]</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-apidevs-primary mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Mentorías cada semana</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-apidevs-primary mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Soporte técnico 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Plan Semestral */}
          {semiannualPrice && (
            <div className="group relative h-full">
              {/* Glow effect on hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/50 to-cyan-500/50 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              
              <div className="relative h-full flex flex-col bg-gradient-to-b from-gray-900/90 to-black/90 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 hover:border-blue-500/50 transition-all duration-500 hover:transform hover:scale-105">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-3">PLAN SEMESTRAL</h3>
                  <div className="inline-flex items-center px-3 py-1 bg-blue-900/30 rounded-full">
                    <TrendingUp className="w-4 h-4 text-blue-400 mr-2" />
                    <span className="text-sm text-blue-300">Ahorra 54%</span>
                  </div>
                </div>
                
                <div className="text-center mb-8">
                  <div className="text-gray-500 line-through text-sm mb-2">$300</div>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-white">${((semiannualPrice.unit_amount || 0) / 100).toFixed(0)}</span>
                    <span className="text-gray-400 ml-2">/6 Meses</span>
                  </div>
                </div>

                <Button
                  variant="slim"
                  type="button"
                  loading={priceIdLoading === semiannualPrice.id}
                  onClick={() => handleStripeCheckout(semiannualPrice)}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-4 rounded-2xl mb-8 transition-all duration-300 shadow-xl hover:shadow-blue-500/30"
                >
                  Suscríbete
                </Button>

                <div className="space-y-4 mt-auto">
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">18 Indicadores [VIP]</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">2 Scanners [160 CRIPTOS]</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">2 Scanners [160 MULTIMARKET]</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Activación inmediata (3 a 10 minutos)</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Acceso a nuestra comunidad VIP en Discord</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Grupo de Alertas [Telegram y Discord]</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Mentorías cada semana</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Soporte técnico 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Plan Anual - DESTACADO */}
          {yearlyPrice && (
            <div className="group relative h-full z-10">
              {/* Badge MÁS POPULAR */}
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-gradient-to-r from-apidevs-primary to-green-400 text-black px-6 py-2 rounded-full font-bold text-sm shadow-lg animate-pulse">
                  <Star className="w-4 h-4 inline mr-1" />
                  MÁS POPULAR
                </div>
              </div>
              
              {/* Glow effect permanente */}
              <div className="absolute -inset-1 bg-gradient-to-r from-apidevs-primary via-green-400 to-apidevs-primary rounded-3xl blur-lg opacity-75 animate-pulse"></div>
              
              <div className="relative h-full flex flex-col bg-gradient-to-b from-apidevs-primary/10 to-black/95 backdrop-blur-xl border-2 border-apidevs-primary rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-8 mt-6">
                  <h3 className="text-3xl font-bold text-white mb-3">PLAN ANUAL</h3>
                  <div className="inline-flex items-center px-4 py-2 bg-apidevs-primary/20 rounded-full">
                    <Award className="w-5 h-5 text-apidevs-primary mr-2" />
                    <span className="text-sm text-apidevs-primary font-semibold">Ahorra 58.5%</span>
                  </div>
                </div>
                
                <div className="text-center mb-8">
                  <div className="text-gray-500 line-through text-sm mb-2">$600</div>
                  <div className="flex items-baseline justify-center">
                    <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-apidevs-primary to-green-400">
                      ${((yearlyPrice.unit_amount || 0) / 100).toFixed(0)}
                    </span>
                    <span className="text-gray-300 ml-2">/Año</span>
                  </div>
                </div>

                <Button
                  variant="slim"
                  type="button"
                  loading={priceIdLoading === yearlyPrice.id}
                  onClick={() => handleStripeCheckout(yearlyPrice)}
                  className="w-full bg-gradient-to-r from-apidevs-primary to-green-400 hover:from-green-400 hover:to-apidevs-primary text-black font-bold py-5 rounded-2xl mb-8 transition-all duration-300 shadow-2xl hover:shadow-apidevs-primary/50 transform hover:scale-105"
                >
                  <Zap className="w-5 h-5 inline mr-2" />
                  Suscríbete Ahora
                </Button>

                <div className="space-y-4 mt-auto">
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-apidevs-primary mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-200 text-sm font-medium">18 Indicadores [VIP]</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-apidevs-primary mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-200 text-sm font-medium">2 Scanners [160 CRIPTOS]</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-apidevs-primary mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-200 text-sm font-medium">2 Scanners [160 MULTIMARKET]</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-apidevs-primary mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-200 text-sm font-medium">Activación inmediata (3 a 10 minutos)</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-apidevs-primary mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-200 text-sm font-medium">Acceso a nuestra comunidad VIP en Discord</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-apidevs-primary mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-200 text-sm font-medium">Grupo de Alertas [Telegram y Discord]</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-apidevs-primary mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-200 text-sm font-medium">Mentorías cada semana</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-apidevs-primary mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-200 text-sm font-medium">Soporte técnico 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Plan Lifetime - Fila separada */}
        {finalLifetimePrice && (
          <div className="max-w-5xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
            <div className="group relative">
              {/* Glow effect on hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-3xl blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
              
              <div className="relative bg-gradient-to-b from-purple-900/20 to-black/90 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 lg:p-10 hover:border-purple-400/50 transition-all duration-500">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  {/* Columna izquierda - Info */}
                  <div>
                    <div className="mb-6">
                      <div className="inline-flex items-center px-4 py-2 bg-purple-900/30 rounded-full mb-4">
                        <Shield className="w-4 h-4 text-purple-400 mr-2" />
                        <span className="text-sm font-semibold text-purple-300">LIFETIME PLAN</span>
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-3">
                        ¿Estás listo para llevar tu trading al siguiente nivel sin preocuparte por pagos recurrentes?
                      </h3>
                      <p className="text-purple-300 text-base leading-relaxed">
                        Con nuestro Plan de por vida de APIDevs, obtienes acceso completo y exclusivo a todas 
                        nuestras herramientas y recursos premium sin tarifas mensuales ni anuales, ¡para siempre!
                      </p>
                    </div>
                  </div>

                  {/* Columna derecha - Precio y CTA */}
                  <div className="text-center lg:text-right">
                    <div className="mb-6">
                      <div className="text-gray-500 line-through text-lg mb-2">$1500</div>
                      <div className="flex items-baseline justify-center lg:justify-end">
                        <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                          ${((finalLifetimePrice.unit_amount || 0) / 100).toFixed(0)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-sm text-purple-300">en 10 cuotas de $99</span>
                      </div>
                    </div>

                    <Button
                      variant="slim"
                      type="button"
                      loading={priceIdLoading === finalLifetimePrice.id}
                      onClick={() => handleStripeCheckout(finalLifetimePrice)}
                      className="w-full lg:w-auto px-12 bg-gradient-to-r from-apidevs-primary to-green-400 hover:from-green-400 hover:to-apidevs-primary text-black font-bold py-5 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-apidevs-primary/30"
                    >
                      Comprar Ahora
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Garantía - Sección épica */}
        <div className="mt-16 relative">
          {/* Efecto de fondo */}
          <div className="absolute inset-0 bg-gradient-to-r from-apidevs-primary/5 via-transparent to-apidevs-primary/5 blur-3xl"></div>
          
          <div className="relative max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-black/50 via-apidevs-primary/5 to-black/50 backdrop-blur-xl border border-apidevs-primary/30 rounded-3xl p-10 shadow-2xl hover:shadow-apidevs-primary/20 transition-all duration-500">
              <div className="flex flex-col lg:flex-row items-center">
                {/* Badge de garantía */}
                <div className="flex-shrink-0 mb-8 lg:mb-0 lg:mr-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-apidevs-primary rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <div className="relative w-32 h-32 bg-gradient-to-br from-apidevs-primary via-green-400 to-apidevs-primary rounded-full flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-transform duration-500">
                      <div className="text-center">
                        <div className="text-black font-bold text-3xl">30</div>
                        <div className="text-black font-bold text-sm">DÍAS</div>
                        <div className="text-black text-xs font-semibold">GARANTÍA</div>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                      <div className="bg-green-500 rounded-full p-2">
                        <Check className="w-6 h-6 text-black" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Contenido */}
                <div className="text-center lg:text-left flex-1">
                  <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                    Te ofrecemos una Garantía de Satisfacción de{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-apidevs-primary to-green-400">
                      30 Días.
                    </span>
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    Nuestros planes conceden acceso a todos nuestros servicios y herramientas. Si en 30 días no te 
                    encuentras satisfecho con tu suscripción te devolvemos tu dinero. También puedes cancelar tu 
                    suscripción en cualquier momento con un solo clic desde tu cuenta de usuario. Aprende más en nuestra{' '}
                    <span className="text-apidevs-primary cursor-pointer hover:underline">política de reembolso</span>.
                  </p>
                  
                  {/* Badges de confianza */}
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    <div className="inline-flex items-center px-4 py-2 bg-black/50 border border-gray-700 rounded-full">
                      <Shield className="w-4 h-4 text-apidevs-primary mr-2" />
                      <span className="text-sm text-gray-300">100% Riesgo Cero</span>
                    </div>
                    <div className="inline-flex items-center px-4 py-2 bg-black/50 border border-gray-700 rounded-full">
                      <Star className="w-4 h-4 text-yellow-500 mr-2" />
                      <span className="text-sm text-gray-300">3,500+ Traders</span>
                    </div>
                    <div className="inline-flex items-center px-4 py-2 bg-black/50 border border-gray-700 rounded-full">
                      <Zap className="w-4 h-4 text-apidevs-primary mr-2" />
                      <span className="text-sm text-gray-300">Cancelación Inmediata</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
