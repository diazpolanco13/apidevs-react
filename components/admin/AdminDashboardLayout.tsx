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
  XMarkIcon,
  HomeIcon,
  UserIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UsersIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { Shield, TrendingUp, Package, Megaphone, BarChart3 } from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  userName?: string;
}

export default function AdminDashboardLayout({ 
  children,
  userName = 'Admin'
}: AdminDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Usuarios', href: '/admin/users', icon: UsersIcon },
    { name: 'Compras', href: '/admin/compras', icon: Package },
    { name: 'Indicadores', href: '/admin/indicadores', icon: BarChart3 },
    { name: 'Campañas', href: '/admin/campaigns', icon: Megaphone },
    { name: 'Geo-Analytics', href: '/admin/geo-analytics', icon: GlobeAltIcon },
    { name: 'Reportes', href: '/admin', icon: TrendingUp, badge: 'Próximamente' },
    { name: 'Configuración', href: '/admin', icon: Cog6ToothIcon, badge: 'Próximamente' },
  ];

  const isCurrentPage = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const isCurrent = isCurrentPage(item.href);

    return (
      <li key={item.name}>
        <Link
          href={item.href}
          className={classNames(
            'group flex items-center gap-x-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg relative',
            isCurrent
              ? 'text-white bg-white/5'
              : 'text-gray-300 hover:text-white hover:bg-white/5'
          )}
          style={isCurrent ? {
            borderLeft: '3px solid rgba(147, 51, 234, 1)',
            boxShadow: '0 0 15px rgba(147, 51, 234, 0.15)',
          } : {}}
        >
          <item.icon
            className={classNames(
              'h-5 w-5 shrink-0 transition-all duration-200',
              isCurrent 
                ? 'text-purple-500' 
                : 'text-gray-400 group-hover:text-purple-500'
            )}
            style={isCurrent ? { filter: 'drop-shadow(0 0 8px rgba(147, 51, 234, 0.5))' } : {}}
          />
          <span className="flex-1">{item.name}</span>
          
          {item.badge && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
              {item.badge}
            </span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-apidevs-dark via-black to-apidevs-dark pt-16 sm:pt-20">
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
                     borderRight: '1px solid rgba(147, 51, 234, 0.15)'
                   }}>
                
                {/* Header */}
                <div className="px-2 py-3 border-b border-white/10">
                  <span className="text-base font-semibold text-white tracking-wide">PANEL ADMIN</span>
                </div>

                {/* Admin Badge */}
                <div className="mx-2 px-4 py-3 rounded-lg border border-purple-500/20 bg-purple-500/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Acceso Total</span>
                  </div>
                  <span className="text-sm font-bold text-white">Admin Master</span>
                </div>

                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-2">
                    {navigation.map((item) => renderNavigationItem(item))}
                  </ul>

                  {/* Mi Cuenta Personal */}
                  <div className="mt-auto pt-4 border-t border-white/10">
                    <Link
                      href="/account"
                      className="group flex items-center gap-x-3 px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200 rounded-lg"
                    >
                      <UserIcon className="h-5 w-5 text-gray-400 group-hover:text-apidevs-primary transition-colors" />
                      <span>Mi Cuenta Personal</span>
                      <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-apidevs-primary">→</span>
                    </Link>
                  </div>

                  {/* Volver a APIDevs */}
                  <div className="pt-2">
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
               borderRight: '1px solid rgba(147, 51, 234, 0.15)'
             }}>
          <div className="flex grow flex-col gap-y-4 overflow-y-auto px-4 pb-4 pt-4">
            
            {/* Header */}
            <div className="px-2 py-3 border-b border-white/10">
              <span className="text-base font-semibold text-white tracking-wide">PANEL ADMIN</span>
            </div>

            {/* Admin Badge */}
            <div className="mx-2 px-4 py-3 rounded-lg border border-purple-500/20 bg-purple-500/5">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400 uppercase tracking-wider">Acceso Total</span>
              </div>
              <span className="text-sm font-bold text-white">Admin Master</span>
            </div>

            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-2">
                {navigation.map((item) => renderNavigationItem(item))}
              </ul>

              {/* Mi Cuenta Personal */}
              <div className="mt-auto pt-4 border-t border-white/10">
                <Link
                  href="/account"
                  className="group flex items-center gap-x-3 px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200 rounded-lg"
                >
                  <UserIcon className="h-5 w-5 text-gray-400 group-hover:text-apidevs-primary transition-colors" />
                  <span>Mi Cuenta Personal</span>
                  <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-apidevs-primary">→</span>
                </Link>
              </div>

              {/* Volver a APIDevs */}
              <div className="pt-2">
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
          {/* Botón hamburger mobile - Discreto */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed top-[72px] sm:top-[88px] left-3 z-20 p-2 rounded-md text-gray-400 hover:text-purple-500 hover:bg-white/5 transition-all duration-200"
            style={{
              background: 'rgba(15, 15, 15, 0.6)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            <span className="sr-only">Abrir menú</span>
            <Bars3Icon className="h-5 w-5" />
          </button>

          {/* Main content */}
          <main className="py-3 sm:py-4">
            <div className="px-4 sm:px-6 lg:px-8">
              {/* Contenedor con max-width para pantallas ultra wide */}
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

