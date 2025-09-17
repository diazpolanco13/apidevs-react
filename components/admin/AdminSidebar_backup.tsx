'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  HomeIcon,
  UsersIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  MegaphoneIcon,
  HandshakeIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Usuarios Legacy', href: '/admin/users', icon: UsersIcon },
  { name: 'Compras', href: '/admin/purchases', icon: ShoppingCartIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Campañas', href: '/admin/campaigns', icon: MegaphoneIcon },
  { name: 'Partnerships', href: '/admin/partnerships', icon: HandshakeIcon },
  { name: 'Configuración', href: '/admin/settings', icon: CogIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500 rounded-md"
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 flex md:hidden ${
          isOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'
        } transition-transform duration-300`}
      >
        <div className="w-64 bg-apidevs-dark border-r border-gray-700">
          <div className="flex items-center justify-center h-16 border-b border-gray-700">
            <span className="text-2xl font-bold text-white">APIDevs Admin</span>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  ${pathname === item.href ? 'bg-apidevs-primary text-black' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200
                `}
              >
                <item.icon
                  className={`
                    ${pathname === item.href ? 'text-black' : 'text-gray-400 group-hover:text-gray-300'}
                    mr-3 flex-shrink-0 h-6 w-6 transition-colors duration-200
                  `}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex-shrink-0 w-14" aria-hidden="true">
          {/* Dummy element to make sidebar wider */}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow border-r border-gray-700 bg-apidevs-dark pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-2xl font-bold text-white">APIDevs Admin</span>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    ${pathname === item.href ? 'bg-apidevs-primary text-black' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200
                  `}
                >
                  <item.icon
                    className={`
                      ${pathname === item.href ? 'text-black' : 'text-gray-400 group-hover:text-gray-300'}
                      mr-3 flex-shrink-0 h-6 w-6 transition-colors duration-200
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
