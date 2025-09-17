'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  HomeIcon,
  UsersIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  MegaphoneIcon,
  LinkIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Usuarios Legacy', href: '/admin/users', icon: UsersIcon },
  { name: 'Compras', href: '/admin/purchases', icon: ShoppingCartIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Campañas', href: '/admin/campaigns', icon: MegaphoneIcon },
  { name: 'Partnerships', href: '/admin/partnerships', icon: LinkIcon },
  { name: 'Configuración', href: '/admin/settings', icon: CogIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  user: any;
}

export default function AdminDashboardLayoutSimple({ children, user }: AdminDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isCurrentPage = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="h-full bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/80 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-black font-bold">A</span>
            </div>
            <span className="text-white font-bold">APIDevs Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={classNames(
                    isCurrentPage(item.href)
                      ? 'bg-green-500/20 text-green-400 border-r-2 border-green-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800',
                    'flex items-center gap-3 p-3 rounded-l-md transition-colors'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:bg-gray-900">
        <div className="flex items-center p-4 border-b border-gray-700">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-black font-bold">A</span>
          </div>
          <span className="text-white font-bold">APIDevs Admin</span>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={classNames(
                    isCurrentPage(item.href)
                      ? 'bg-green-500/20 text-green-400 border-r-2 border-green-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800',
                    'flex items-center gap-3 p-3 rounded-l-md transition-colors'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Botón Volver */}
          <div className="mt-8 pt-4 border-t border-gray-700">
            <Link
              href="/"
              className="flex items-center gap-3 p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              Volver a APIDevs
            </Link>
          </div>
          
          {/* Usuario */}
          <div className="mt-4 p-3 border-t border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">
                  {user?.email?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
              <div>
                <div className="text-white text-sm font-medium">Admin Master</div>
                <div className="text-gray-400 text-xs">{user?.email}</div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <span className="text-white font-bold">APIDevs Admin</span>
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-sm">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
