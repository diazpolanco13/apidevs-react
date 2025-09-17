'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow border-r border-gray-700 bg-gray-800 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <span className="text-2xl font-bold text-white">APIDevs Admin</span>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            <Link
              href="/admin"
              className={`${pathname === '/admin' ? 'bg-green-500 text-black' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md"
            >
              Usuarios Legacy
            </Link>
            <Link
              href="/admin/purchases"
              className="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md"
            >
              Compras
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}