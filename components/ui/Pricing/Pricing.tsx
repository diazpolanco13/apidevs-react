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
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('yearly');
  const currentPath = usePathname();

  // Filtrar productos de prueba y obtener solo los productos principales
  const mainProducts = products.filter(product => 
    product.name?.includes('APIDevs Trading Indicators') && 
    !product.name?.includes('Test')
  );

  const handleStripeCheckout = async (price: Price) => {
    console.log('Starting checkout with price:', price);
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

  // Mock para PRO cuando no hay yearlyPrice
  const proPriceMock = !yearlyPrice ? {
    id: 'price_pro_mock',
    unit_amount: 39000, // $390.00 anual
    currency: 'usd',
    interval: 'year',
    interval_count: 1,
    product_id: 'prod_pro_mock'
  } as Price : yearlyPrice;

  const finalProPrice = yearlyPrice || proPriceMock;

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
        
        <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
          Únete a nuestra comunidad exclusiva en Telegram donde traders profesionales comparten estrategias en tiempo real, 
          reciben alertas VIP y acceden a herramientas de trading de próxima generación.
        </p>

        {/* Toggle Billing Interval */}
        <div className="mt-12 flex justify-center">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-2 inline-flex">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                billingInterval === 'monthly'
                  ? 'bg-gray-700 text-white shadow-lg'
                  : 'text-gray-300 hover:text-gray-100'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative ${
                billingInterval === 'yearly'
                  ? 'bg-gradient-to-r from-apidevs-primary to-green-400 text-black shadow-lg'
                  : 'text-gray-300 hover:text-gray-100'
              }`}
            >
              Anual
              <span className="absolute -top-2 -right-2 bg-apidevs-primary text-black text-xs px-2 py-0.5 rounded-full font-bold">
                -16%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          
          {/* Plan FREE */}
          <div className="group relative">
            {/* Glow effect on hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-apidevs-primary/30 to-green-500/30 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            
            <div className="relative flex flex-col bg-gradient-to-b from-gray-900/90 to-black/90 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 hover:border-apidevs-primary/30 transition-all duration-500 hover:transform hover:scale-105 h-full">
              {/* Header - Altura fija exacta */}
              <div className="text-center mb-8 h-[140px] flex flex-col justify-between">
                <h3 className="text-3xl font-bold text-white">PLAN FREE</h3>
                <div className="inline-flex items-center px-4 py-2 bg-apidevs-primary/10 rounded-full mx-auto h-[36px]">
                  <Clock className="w-4 h-4 text-apidevs-primary mr-2" />
                  <span className="text-sm text-apidevs-primary font-semibold">Inicia Gratis</span>
                </div>
              </div>
              
              {/* Pricing - Altura fija exacta */}
              <div className="text-center mb-8 h-[100px] flex flex-col justify-center">
                <div className="text-gray-400 line-through text-sm mb-2">$29</div>
                <div className="flex items-baseline justify-center">
                  <span className="text-6xl font-bold text-white leading-none">$0</span>
                  <span className="text-gray-200 ml-2 text-lg">/Siempre</span>
                </div>
              </div>

              {/* Button - Altura fija exacta */}
              <div className="mb-8 h-[60px] flex items-center">
                <Button
                  variant="slim"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!user) {
                      router.push('/signin/signup?plan=free');
                    } else {
                      // Si el usuario ya está logueado, redirigir a account
                      router.push('/account');
                    }
                  }}
                  className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-apidevs-primary hover:to-green-500 text-white font-bold py-5 rounded-3xl transition-all duration-300 shadow-xl hover:shadow-apidevs-primary/30 h-[60px]"
                >
                  Comenzar Gratis
                </Button>
              </div>

              {/* Features - Flex grow */}
              <div className="space-y-4 flex-grow">
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-apidevs-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-200 text-sm font-medium">5 Indicadores clásicos</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-apidevs-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-200 text-sm font-medium">Telegram Community</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-apidevs-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-200 text-sm font-medium">Tutoriales básicos</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-apidevs-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-200 text-sm font-medium">Alertas básicas (2-3 por semana)</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-apidevs-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-200 text-sm font-medium">Documentación completa</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-apidevs-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-200 text-sm font-medium">Acceso inmediato</span>
                </div>
              </div>
            </div>
          </div>

          {/* Plan PRO - POPULAR */}
          <div className="group relative z-10">
            {/* Badge MÁS POPULAR */}
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg animate-pulse">
                <Star className="w-4 h-4 inline mr-1" />
                POPULAR
              </div>
            </div>
            
            {/* Glow effect permanente */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-3xl blur-lg opacity-75 animate-pulse"></div>
            
            <div className="relative flex flex-col bg-gradient-to-b from-blue-500/10 to-black/95 backdrop-blur-xl border-2 border-blue-500 rounded-3xl p-8 shadow-2xl h-full">
              {/* Header - Altura fija exacta */}
              <div className="text-center mb-8 mt-6 h-[140px] flex flex-col justify-between">
                <h3 className="text-3xl font-bold text-white">PLAN PRO</h3>
                <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 rounded-full mx-auto h-[36px]">
                  <Award className="w-5 h-5 text-blue-400 mr-2" />
                  <span className="text-sm text-blue-300 font-semibold">Para Traders Serios</span>
                </div>
              </div>
              
              {/* Pricing - Altura fija exacta */}
              <div className="text-center mb-8 h-[100px] flex flex-col justify-center">
                <div className="text-gray-400 line-through text-sm mb-2">
                  {billingInterval === 'monthly' ? '$49' : '$468'}
                </div>
                <div className="flex items-baseline justify-center">
                  <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 leading-none">
                    ${billingInterval === 'monthly' ? '39' : '390'}
                  </span>
                  <span className="text-gray-200 ml-2 text-lg">
                    {billingInterval === 'monthly' ? '/mes' : '/año'}
                  </span>
                </div>
                {billingInterval === 'yearly' && (
                  <div className="mt-2 text-sm text-blue-300 font-medium">
                    Equivale a $32.50/mes • Ahorra $78 (16%)
                  </div>
                )}
                {billingInterval === 'monthly' && (
                  <div className="mt-2 text-sm text-gray-300">
                    Facturación mensual
                  </div>
                )}
              </div>

              {/* Button - Altura fija exacta */}
              <div className="mb-8 h-[60px] flex items-center">
                <Button
                  variant="slim"
                  type="button"
                  loading={priceIdLoading === (billingInterval === 'monthly' ? monthlyPrice?.id : yearlyPrice?.id)}
                  onClick={() => {
                    const selectedPrice = billingInterval === 'monthly' ? monthlyPrice : yearlyPrice;
                    if (selectedPrice) {
                      handleStripeCheckout(selectedPrice);
                    } else {
                      router.push('/signin/signup?plan=pro');
                    }
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-5 rounded-3xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 h-[60px]"
                >
                  <Zap className="w-5 h-5 inline mr-2" />
                  Suscríbete Ahora
                </Button>
              </div>

              {/* Features - Flex grow */}
              <div className="space-y-4 flex-grow">
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-200 text-sm font-medium">18 Indicadores avanzados</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-200 text-sm font-medium">Scanners únicos (160 criptos)</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-200 text-sm font-medium">Scanners multimarket (160)</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-200 text-sm font-medium">Telegram VIP (Grupo privado)</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-200 text-sm font-medium">Alertas premium tiempo real</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-200 text-sm font-medium">Mentorías semanales</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-200 text-sm font-medium">Soporte técnico 24/7</span>
                </div>
              </div>
            </div>
          </div>

          {/* Plan LIFETIME - EXCLUSIVO */}
          <div className="group relative">
            {/* Badge EXCLUSIVO */}
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">
                <Shield className="w-4 h-4 inline mr-1" />
                EXCLUSIVO
              </div>
            </div>
            
            {/* Glow effect on hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/50 to-pink-500/50 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            
            <div className="relative flex flex-col bg-gradient-to-b from-purple-900/20 to-black/90 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 hover:border-purple-400/50 transition-all duration-500 hover:transform hover:scale-105 h-full">
              {/* Header - Altura fija exacta */}
              <div className="text-center mb-8 mt-6 h-[140px] flex flex-col justify-between">
                <h3 className="text-3xl font-bold text-white">PLAN LIFETIME</h3>
                <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 rounded-full mx-auto h-[36px]">
                  <Award className="w-5 h-5 text-purple-400 mr-2" />
                  <span className="text-sm text-purple-300 font-semibold">Acceso de por vida</span>
                </div>
              </div>
              
              {/* Pricing - Altura fija exacta */}
              <div className="text-center mb-8 h-[100px] flex flex-col justify-center">
                <div className="text-gray-400 line-through text-sm mb-2">$1,999</div>
                <div className="flex items-baseline justify-center">
                  <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 leading-none">
                    ${finalLifetimePrice ? ((finalLifetimePrice.unit_amount || 0) / 100).toFixed(0) : '1299'}
                  </span>
                  <span className="text-gray-200 ml-2 text-lg">/Único</span>
                </div>
                <div className="mt-2 text-sm text-purple-300 font-medium">
                  10 cuotas de $129 disponibles
                </div>
              </div>

              {/* Button - Altura fija exacta */}
              <div className="mb-8 h-[60px] flex items-center">
                <Button
                  variant="slim"
                  type="button"
                  loading={priceIdLoading === finalLifetimePrice.id}
                  onClick={() => lifetimePrice ? handleStripeCheckout(finalLifetimePrice) : router.push('/signin/signup?plan=lifetime')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-5 rounded-3xl transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 h-[60px]"
                >
                  <Shield className="w-5 h-5 inline mr-2" />
                  Acceso Exclusivo
                </Button>
              </div>

              {/* Features - Flex grow */}
              <div className="space-y-4 flex-grow">
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-purple-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-200 text-sm font-medium">Todo lo anterior + Premium</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-purple-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-200 text-sm font-medium">Telegram personal (Chat directo)</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-purple-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-200 text-sm font-medium">Productos personalizados</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-purple-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-200 text-sm font-medium">Consultoría 1-on-1 mensual</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-purple-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-200 text-sm font-medium">Beta access exclusivo</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-purple-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-200 text-sm font-medium">Configuraciones personalizadas</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-purple-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-200 text-sm font-medium">Acceso de por vida garantizado</span>
                </div>
              </div>
            </div>
          </div>

        </div>


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
                  <p className="text-gray-200 text-lg leading-relaxed mb-6">
                    Nuestros planes conceden acceso a todos nuestros servicios y herramientas. Si en 30 días no te 
                    encuentras satisfecho con tu suscripción te devolvemos tu dinero. También puedes cancelar tu 
                    suscripción en cualquier momento con un solo clic desde tu cuenta de usuario. Aprende más en nuestra{' '}
                    <span className="text-apidevs-primary cursor-pointer hover:underline">política de reembolso</span>.
                  </p>
                  
                  {/* Badges de confianza */}
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    <div className="inline-flex items-center px-4 py-2 bg-black/50 border border-gray-700 rounded-full">
                      <Shield className="w-4 h-4 text-apidevs-primary mr-2" />
                      <span className="text-sm text-gray-200">100% Riesgo Cero</span>
                    </div>
                    <div className="inline-flex items-center px-4 py-2 bg-black/50 border border-gray-700 rounded-full">
                      <Star className="w-4 h-4 text-yellow-500 mr-2" />
                      <span className="text-sm text-gray-200">3,500+ Traders</span>
                    </div>
                    <div className="inline-flex items-center px-4 py-2 bg-black/50 border border-gray-700 rounded-full">
                      <Zap className="w-4 h-4 text-apidevs-primary mr-2" />
                      <span className="text-sm text-gray-200">Cancelación Inmediata</span>
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
