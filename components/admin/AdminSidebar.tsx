'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-gray-800 border-r border-gray-700">
      {/* Header */}
      <div className="flex items-center px-6 py-8 border-b border-gray-700">
        <div className="w-10 h-10 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-lg flex items-center justify-center mr-3">
          <span className="text-black font-bold text-xl">A</span>
        </div>
        <span className="text-xl font-bold text-white">Admin Panel</span>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link
          href="/admin"
          className={`${
            pathname === '/admin' 
              ? 'bg-apidevs-primary text-black font-semibold shadow-lg' 
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          } group flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200`}
        >
          <span className="mr-3">📊</span>
          Dashboard
        </Link>
        
        <Link
          href="/admin/users"
          className={`${
            pathname.startsWith('/admin/users')
              ? 'bg-apidevs-primary text-black font-semibold shadow-lg' 
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          } group flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200`}
        >
          <span className="mr-3">👥</span>
          Usuarios Legacy
        </Link>
        
        <Link
          href="/admin/purchases"
          className={`${
            pathname.startsWith('/admin/purchases')
              ? 'bg-apidevs-primary text-black font-semibold shadow-lg' 
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          } group flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200`}
        >
          <span className="mr-3">🛒</span>
          Compras
        </Link>
        
        <Link
          href="/admin/analytics"
          className={`${
            pathname.startsWith('/admin/analytics')
              ? 'bg-apidevs-primary text-black font-semibold shadow-lg' 
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          } group flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200`}
        >
          <span className="mr-3">📈</span>
          Analytics
        </Link>
      </nav>
      
      {/* Botón de Regreso */}
      <div className="px-4 py-4 border-t border-gray-700">
        <Link
          href="/"
          className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all duration-200 group"
        >
          <span className="mr-3">🏠</span>
          <span>Volver a APIDevs</span>
          <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">→</span>
        </Link>
      </div>
      
      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-700">
        <div className="flex items-center text-sm text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Sistema Operativo
        </div>
      </div>
    </div>
  );
}