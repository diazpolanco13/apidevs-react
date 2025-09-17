'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react';
import {
  Bars3Icon,
  HomeIcon,
  UsersIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  MegaphoneIcon,
  LinkIcon,
  CogIcon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
// import { Toaster } from '@/components/ui/Toasts/toaster';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Usuarios Legacy', href: '/admin/users', icon: UsersIcon },
  { name: 'Compras', href: '/admin/purchases', icon: ShoppingCartIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Campañas', href: '/admin/campaigns', icon: MegaphoneIcon },
  { name: 'Partnerships', href: '/admin/partnerships', icon: LinkIcon },
  { name: 'Configuración', href: '/admin/settings', icon: CogIcon },
];

const teams = [
  { id: 1, name: 'Usuarios Legacy', href: '/admin/users', initial: 'U', current: false },
  { id: 2, name: 'Compras Históricas', href: '/admin/purchases', initial: 'C', current: false },
  { id: 3, name: 'Analytics', href: '/admin/analytics', initial: 'A', current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  user: any;
}

export default function AdminDashboardLayout({ children, user }: AdminDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isCurrentPage = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      <div className="h-full">
        <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
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
                    <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                  </button>
                </div>
              </TransitionChild>

              {/* Mobile Sidebar */}
              <div className="relative flex grow flex-col gap-y-5 overflow-y-auto bg-apidevs-dark px-6 pb-2 ring ring-apidevs-primary/20">
                <div className="relative flex h-16 shrink-0 items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-black font-bold text-xl">A</span>
                    </div>
                    <span className="text-xl font-bold text-white">APIDevs Admin</span>
                  </div>
                </div>
                <nav className="relative flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              className={classNames(
                                isCurrentPage(item.href)
                                  ? 'bg-apidevs-primary/20 text-apidevs-primary border-r-2 border-apidevs-primary'
                                  : 'text-gray-400 hover:bg-white/5 hover:text-white',
                                'group flex gap-x-3 rounded-l-md p-2 text-sm/6 font-semibold',
                              )}
                            >
                              <item.icon
                                aria-hidden="true"
                                className={classNames(
                                  isCurrentPage(item.href) ? 'text-apidevs-primary' : 'text-gray-400 group-hover:text-white',
                                  'size-6 shrink-0',
                                )}
                              />
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                    <li>
                      <div className="text-xs/6 font-semibold text-gray-400">Gestión Rápida</div>
                      <ul role="list" className="-mx-2 mt-2 space-y-1">
                        {teams.map((team) => (
                          <li key={team.name}>
                            <Link
                              href={team.href}
                              className={classNames(
                                isCurrentPage(team.href)
                                  ? 'bg-white/5 text-white'
                                  : 'text-gray-400 hover:bg-white/5 hover:text-white',
                                'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                              )}
                            >
                              <span
                                className={classNames(
                                  isCurrentPage(team.href)
                                    ? 'border-apidevs-primary/30 text-apidevs-primary bg-apidevs-primary/10'
                                    : 'border-white/10 text-gray-400 group-hover:border-white/20 group-hover:text-white bg-white/5',
                                  'flex size-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium',
                                )}
                              >
                                {team.initial}
                              </span>
                              <span className="truncate">{team.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Desktop sidebar */}
        <div className="hidden bg-apidevs-dark lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-apidevs-primary/20 bg-black/10 px-6">
            <div className="flex h-16 shrink-0 items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-black font-bold text-xl">A</span>
                </div>
                <span className="text-xl font-bold text-white">APIDevs Admin</span>
              </div>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={classNames(
                            isCurrentPage(item.href)
                              ? 'bg-apidevs-primary/20 text-apidevs-primary border-r-2 border-apidevs-primary'
                              : 'text-gray-400 hover:bg-white/5 hover:text-white',
                            'group flex gap-x-3 rounded-l-md p-2 text-sm/6 font-semibold transition-all duration-200',
                          )}
                        >
                          <item.icon
                            aria-hidden="true"
                            className={classNames(
                              isCurrentPage(item.href) ? 'text-apidevs-primary' : 'text-gray-400 group-hover:text-white',
                              'size-6 shrink-0',
                            )}
                          />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                <li>
                  <div className="text-xs/6 font-semibold text-gray-400">Gestión Rápida</div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {teams.map((team) => (
                      <li key={team.name}>
                        <Link
                          href={team.href}
                          className={classNames(
                            isCurrentPage(team.href)
                              ? 'bg-white/5 text-white'
                              : 'text-gray-400 hover:bg-white/5 hover:text-white',
                            'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition-all duration-200',
                          )}
                        >
                          <span
                            className={classNames(
                              isCurrentPage(team.href)
                                ? 'border-apidevs-primary/30 text-apidevs-primary bg-apidevs-primary/10'
                                : 'border-white/10 text-gray-400 group-hover:border-white/20 group-hover:text-white bg-white/5',
                              'flex size-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium',
                            )}
                          >
                            {team.initial}
                          </span>
                          <span className="truncate">{team.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                
                {/* Botón Volver a APIDevs */}
                <li className="-mx-6 mt-auto">
                  <Link
                    href="/"
                    className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-200 group"
                  >
                    <ArrowLeftOnRectangleIcon className="size-6 text-gray-400 group-hover:text-white" />
                    <span>Volver a APIDevs</span>
                    <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </Link>
                </li>

                {/* Usuario Admin */}
                <li className="-mx-6">
                  <div className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-white border-t border-white/10">
                    <div className="size-8 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-sm">
                        {user?.email?.[0]?.toUpperCase() || 'A'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-sm">Admin Master</span>
                      <span className="text-gray-400 text-xs">{user?.email}</span>
                    </div>
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-apidevs-dark px-4 py-4 after:pointer-events-none after:absolute after:inset-0 after:border-b after:border-apidevs-primary/20 after:bg-black/10 sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="-m-2.5 p-2.5 text-gray-400 hover:text-white lg:hidden"
          >
            <span className="sr-only">Abrir sidebar</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
          <div className="flex-1 text-sm/6 font-semibold text-white">Dashboard APIDevs</div>
          <div className="size-8 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-sm">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </span>
          </div>
        </div>

        <main className="py-10 lg:pl-72">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      {/* <Toaster /> */}
    </>
  );
}
