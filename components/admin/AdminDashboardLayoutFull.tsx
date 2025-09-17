'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
} from '@headlessui/react';
import {
  Bars3Icon,
  BellIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  HomeIcon,
  ShoppingCartIcon,
  UsersIcon,
  XMarkIcon,
  MegaphoneIcon,
  LinkIcon,
  ArrowLeftOnRectangleIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Usuarios Legacy', href: '/admin/users', icon: UsersIcon },
  { name: 'Compras', href: '/admin/purchases', icon: ShoppingCartIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Reportes', href: '/admin/reports', icon: DocumentDuplicateIcon },
];

const teams = [
  { id: 1, name: 'Usuarios Legacy', href: '/admin/users', initial: 'U' },
  { id: 2, name: 'Compras Históricas', href: '/admin/purchases', initial: 'C' },
  { id: 3, name: 'Analytics Pro', href: '/admin/analytics', initial: 'A' },
];

const userNavigation = [
  { name: 'Tu perfil', href: '/account' },
  { name: 'Volver a APIDevs', href: '/' },
  { name: 'Cerrar sesión', href: '/signin' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  user: any;
}

export default function AdminDashboardLayoutFull({ children, user }: AdminDashboardLayoutProps) {
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
      <div className="h-full bg-gray-900">
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
              <div className="relative flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4 ring ring-apidevs-primary/20 before:pointer-events-none before:absolute before:inset-0 before:bg-black/10">
                <div className="relative flex h-16 shrink-0 items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-black font-bold text-lg">A</span>
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
                                  ? 'bg-apidevs-primary/20 text-apidevs-primary'
                                  : 'text-gray-400 hover:bg-white/5 hover:text-white',
                                'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
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
                    <li className="mt-auto">
                      <Link
                        href="/admin/settings"
                        className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-300 hover:bg-white/5 hover:text-white"
                      >
                        <Cog6ToothIcon
                          aria-hidden="true"
                          className="size-6 shrink-0 text-gray-400 group-hover:text-white"
                        />
                        Configuración
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Desktop sidebar */}
        <div className="hidden bg-gray-900 lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-apidevs-primary/20 bg-black/10 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-black font-bold text-lg">A</span>
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
                              ? 'bg-apidevs-primary/20 text-apidevs-primary' 
                              : 'text-gray-400 hover:bg-white/5 hover:text-white',
                            'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition-all duration-200',
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
                <li className="mt-auto">
                  <Link
                    href="/admin/settings"
                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200"
                  >
                    <Cog6ToothIcon
                      aria-hidden="true"
                      className="size-6 shrink-0 text-gray-400 group-hover:text-white"
                    />
                    Configuración
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Header con buscador y menú de usuario */}
        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-apidevs-primary/20 bg-gray-900 px-4 sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="-m-2.5 p-2.5 text-gray-400 hover:text-white lg:hidden"
            >
              <span className="sr-only">Abrir sidebar</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>

            {/* Separator */}
            <div aria-hidden="true" className="h-6 w-px bg-white/10 lg:hidden" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              {/* Buscador */}
              <form action="#" method="GET" className="grid flex-1 grid-cols-1">
                <input
                  name="search"
                  placeholder="Buscar usuarios, órdenes, analytics..."
                  aria-label="Buscar"
                  className="col-start-1 row-start-1 block size-full bg-gray-900 pl-8 text-base text-white outline-none placeholder:text-gray-500 sm:text-sm/6 border-none focus:ring-2 focus:ring-apidevs-primary/50 rounded-md"
                />
                <MagnifyingGlassIcon
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 ml-2 size-5 self-center text-gray-400"
                />
              </form>
              
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                {/* Notificaciones */}
                <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-white relative">
                  <span className="sr-only">Ver notificaciones</span>
                  <BellIcon aria-hidden="true" className="size-6" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                    3
                  </span>
                </button>

                {/* Separator */}
                <div aria-hidden="true" className="hidden lg:block lg:h-6 lg:w-px lg:bg-white/10" />

                {/* Menú de usuario */}
                <Menu as="div" className="relative">
                  <MenuButton className="relative flex items-center">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Abrir menú de usuario</span>
                    <div className="size-8 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-sm">
                        {user?.email?.[0]?.toUpperCase() || 'A'}
                      </span>
                    </div>
                    <span className="hidden lg:flex lg:items-center">
                      <span aria-hidden="true" className="ml-4 text-sm/6 font-semibold text-white">
                        Admin Master
                      </span>
                      <ChevronDownIcon aria-hidden="true" className="ml-2 size-5 text-gray-500" />
                    </span>
                  </MenuButton>
                  <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-gray-800 py-2 outline outline-1 -outline-offset-1 outline-white/10 transition data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                  >
                    <div className="px-3 py-2 border-b border-gray-700">
                      <p className="text-sm text-white font-medium">Admin Master</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                    {userNavigation.map((item) => (
                      <MenuItem key={item.name}>
                        <Link
                          href={item.href}
                          className="block px-3 py-2 text-sm/6 text-white data-[focus]:bg-white/5 data-[focus]:outline-none hover:bg-white/5 transition-colors"
                        >
                          {item.name}
                        </Link>
                      </MenuItem>
                    ))}
                  </MenuItems>
                </Menu>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
