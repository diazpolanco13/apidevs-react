'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from '@headlessui/react';
import {
  Bars3Icon,
  BellIcon,
  XMarkIcon,
  HomeIcon,
  UserIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { TrendingUp, Crown, Zap } from 'lucide-react';
import TierBadgeSmall from './TierBadgeSmall';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  premium?: boolean;
  premiumLevel?: 'pro' | 'lifetime';
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface AccountDashboardLayoutProps {
  children: React.ReactNode;
  user: any;
  subscription?: any;
  userProfile?: any;
  loyaltyTier?: string;
  isLegacy?: boolean;
}

export default function AccountDashboardLayout({ 
  children, 
  user, 
  subscription,
  userProfile,
  loyaltyTier,
  isLegacy
}: AccountDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Determinar plan del usuario
  const userPlan = subscription?.prices?.products?.name || 'Free';
  const isPro = userPlan.toLowerCase().includes('pro');
  const isLifetime = userPlan.toLowerCase().includes('lifetime');
  const hasPremium = isPro || isLifetime;

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/account', icon: HomeIcon },
    { name: 'Mi Perfil', href: '/account/perfil', icon: UserIcon },
    { name: 'Suscripción', href: '/account/suscripcion', icon: CreditCardIcon },
    { 
      name: 'Mis Indicadores', 
      href: '/account/indicadores', 
      icon: TrendingUp,
      premium: true,
      premiumLevel: 'pro',
      badge: 'PRO'
    },
    { 
      name: 'Notificaciones', 
      href: '/account/notificaciones', 
      icon: BellIcon,
      premium: true,
      premiumLevel: 'pro',
      badge: 'PRO'
    },
    { 
      name: 'Academia', 
      href: '/account/academia', 
      icon: AcademicCapIcon,
      premium: true,
      premiumLevel: 'lifetime',
      badge: 'LIFETIME'
    },
    { name: 'Configuración', href: '/account/configuracion', icon: Cog6ToothIcon },
  ];

  const isCurrentPage = (href: string) => {
    if (href === '/account') {
      return pathname === '/account';
    }
    return pathname?.startsWith(href);
  };

  const canAccessItem = (item: NavigationItem) => {
    if (!item.premium) return true;
    if (item.premiumLevel === 'lifetime') return isLifetime;
    if (item.premiumLevel === 'pro') return hasPremium;
    return true;
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const hasAccess = canAccessItem(item);
    const isCurrent = isCurrentPage(item.href);

    return (
      <li key={item.name}>
        <Link
          href={hasAccess ? item.href : '/account/suscripcion'}
          className={classNames(
            'group flex items-center gap-x-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg relative',
            isCurrent
              ? 'text-white bg-white/5'
              : 'text-gray-300 hover:text-white hover:bg-white/5',
            !hasAccess ? 'opacity-50 cursor-not-allowed' : ''
          )}
          style={isCurrent ? {
            borderLeft: '3px solid rgba(201, 217, 46, 1)',
            boxShadow: '0 0 15px rgba(201, 217, 46, 0.15)',
          } : {}}
          onClick={(e) => {
            if (!hasAccess) {
              e.preventDefault();
            }
          }}
        >
          <item.icon
            className={classNames(
              'h-5 w-5 shrink-0 transition-all duration-200',
              isCurrent 
                ? 'text-apidevs-primary' 
                : hasAccess 
                  ? 'text-gray-400 group-hover:text-apidevs-primary' 
                  : 'text-gray-500'
            )}
            style={isCurrent ? { filter: 'drop-shadow(0 0 8px rgba(201, 217, 46, 0.5))' } : {}}
          />
          <span className="flex-1">{item.name}</span>
          
          {item.badge && !hasAccess && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-apidevs-primary/20 text-apidevs-primary border border-apidevs-primary/30">
              {item.badge}
            </span>
          )}
          
          {!hasAccess && (
            <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          )}
        </Link>
      </li>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-apidevs-dark via-black to-apidevs-dark pt-16 sm:pt-7">
        {/* Mobile sidebar */}
        <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-30 lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                  <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                    <span className="sr-only">Cerrar sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" />
                  </button>
                </div>
              </TransitionChild>

              {/* Mobile Sidebar Content */}
              <div className="flex grow flex-col gap-y-4 overflow-y-auto px-4 pb-4 pt-4"
                   style={{
                     background: 'rgba(10, 10, 10, 0.95)',
                     backdropFilter: 'blur(20px)',
                     WebkitBackdropFilter: 'blur(20px)',
                     borderRight: '1px solid rgba(201, 217, 46, 0.15)'
                   }}>
                
                {/* Header */}
                <div className="px-2 py-3 border-b border-white/10">
                  <span className="text-base font-semibold text-white tracking-wide">MI CUENTA</span>
                </div>

                {/* Plan Badge */}
                <div className="mx-2 px-4 py-3 rounded-lg border border-apidevs-primary/20 bg-black/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Plan</span>
                    {isLifetime && <Crown className="w-4 h-4 text-purple-400" />}
                    {isPro && !isLifetime && <Zap className="w-4 h-4 text-apidevs-primary" />}
                  </div>
                  <span className="text-sm font-bold text-white">
                    {userPlan}
                  </span>
                  {!hasPremium && (
                    <Link 
                      href="/pricing"
                      className="mt-2 block text-xs text-apidevs-primary hover:text-green-400 transition-colors"
                    >
                      Actualizar →
                    </Link>
                  )}
                </div>

                {/* Tier Badge - Usuario especial */}
                {loyaltyTier && loyaltyTier !== 'free' && (
                  <div className="mx-2 px-4 py-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
                    <div className="mb-1">
                      <span className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Estatus VIP</span>
                      <TierBadgeSmall tier={loyaltyTier as any} isLegacy={isLegacy} />
                    </div>
                  </div>
                )}

                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-2">
                    {navigation.map((item) => renderNavigationItem(item))}
                  </ul>

                  {/* Volver a APIDevs */}
                  <div className="mt-auto pt-4 border-t border-white/10">
                    <Link
                      href="/"
                      className="group flex items-center gap-x-3 px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200 rounded-lg"
                    >
                      <HomeIcon className="h-5 w-5 text-gray-400 group-hover:text-apidevs-primary transition-colors" />
                      <span>Volver a APIDevs</span>
                      <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-apidevs-primary">→</span>
                    </Link>
                  </div>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:top-16 sm:lg:top-20 lg:bottom-0 lg:z-30 lg:flex lg:w-72 lg:flex-col"
             style={{
               background: 'rgba(10, 10, 10, 0.95)',
               backdropFilter: 'blur(20px)',
               WebkitBackdropFilter: 'blur(20px)',
               borderRight: '1px solid rgba(201, 217, 46, 0.15)'
             }}>
          <div className="flex grow flex-col gap-y-4 overflow-y-auto px-4 pb-4 pt-4">
            
            {/* Header */}
            <div className="px-2 py-3 border-b border-white/10">
              <span className="text-base font-semibold text-white tracking-wide">MI CUENTA</span>
            </div>

            {/* Plan Badge */}
            <div className="mx-2 px-4 py-3 rounded-lg border border-apidevs-primary/20 bg-black/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400 uppercase tracking-wider">Plan</span>
                {isLifetime && <Crown className="w-4 h-4 text-purple-400" />}
                {isPro && !isLifetime && <Zap className="w-4 h-4 text-apidevs-primary" />}
              </div>
              <span className="text-sm font-bold text-white">
                {userPlan}
              </span>
              {!hasPremium && (
                <Link 
                  href="/pricing"
                  className="mt-2 block text-xs text-apidevs-primary hover:text-green-400 transition-colors"
                >
                  Actualizar →
                </Link>
              )}
            </div>

            {/* Tier Badge - Usuario especial */}
            {loyaltyTier && loyaltyTier !== 'free' && (
              <div className="mx-2 px-4 py-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
                <div className="mb-1">
                  <span className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Estatus VIP</span>
                  <TierBadgeSmall tier={loyaltyTier as any} isLegacy={isLegacy} />
                </div>
              </div>
            )}

            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-2">
                {navigation.map((item) => renderNavigationItem(item))}
              </ul>

              {/* Volver a APIDevs */}
              <div className="mt-auto pt-4 border-t border-white/10">
                <Link
                  href="/"
                  className="group flex items-center gap-x-3 px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200 rounded-lg"
                >
                  <HomeIcon className="h-5 w-5 text-gray-400 group-hover:text-apidevs-primary transition-colors" />
                  <span>Volver a APIDevs</span>
                  <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-apidevs-primary">→</span>
                </Link>
              </div>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-72">
          {/* Botón hamburger mobile */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed top-[68px] sm:top-[84px] left-4 z-20 p-2.5 rounded-lg text-gray-300 hover:text-apidevs-primary transition-all duration-200"
            style={{
              background: 'rgba(10, 10, 10, 0.9)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(201, 217, 46, 0.2)'
            }}
          >
            <span className="sr-only">Abrir menú</span>
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Main content */}
          <main className="py-3 sm:py-4">
            <div className="px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
