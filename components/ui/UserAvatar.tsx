'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { SignOut } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';

interface UserAvatarProps {
  user?: any;
  avatarUrl?: string | null;
  userStatus?: string;
  unreadNotifications?: number;
  subscriptionType?: string | null;
  compact?: boolean; // Versión compacta para docs navbar
}

export default function UserAvatar({ 
  user, 
  avatarUrl, 
  userStatus = 'online', 
  unreadNotifications = 0,
  subscriptionType = null,
  compact = false
}: UserAvatarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getUserTypeLabel = () => {
    if (!mounted) return 'Cargando...';
    if (subscriptionType === 'lifetime') return '👑 Lifetime VIP';
    if (subscriptionType === 'pro_annual') return '⚡ PRO Anual';
    if (subscriptionType === 'pro_monthly') return '⚡ PRO Mensual';
    return '🎁 Plan Gratuito';
  };

  const getStatusColor = () => {
    switch (userStatus) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-green-500';
    }
  };

  if (!user) {
    return (
      <Link 
        href="/signin" 
        className={`inline-flex items-center justify-center ${
          compact 
            ? 'px-3 py-1.5 text-sm' 
            : 'px-4 py-2'
        } font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-all`}
      >
        Iniciar sesión
      </Link>
    );
  }

  return (
    <div className="relative group">
      <button className={`flex items-center ${compact ? 'space-x-1' : 'space-x-2'} p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}>
        <span className="relative inline-block">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Profile"
              width={compact ? 32 : 40}
              height={compact ? 32 : 40}
              className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full outline outline-2 -outline-offset-1 outline-apidevs-primary/50 dark:outline-apidevs-primary/50 object-cover shadow-lg`}
              priority
              unoptimized={avatarUrl.includes('tradingview.com')}
            />
          ) : (
            <div className={`${compact ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base'} bg-gradient-to-br from-apidevs-primary to-purple-500 rounded-full outline outline-2 -outline-offset-1 outline-apidevs-primary/50 flex items-center justify-center text-gray-900 font-semibold shadow-lg`}>
              {user.email?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          {/* Indicador de estado */}
          {mounted && (
            <span className={`absolute bottom-0 right-0 block ${compact ? 'w-2 h-2' : 'w-3 h-3'} rounded-full ${getStatusColor()} ring-2 ring-white dark:ring-gray-900`} />
          )}
          {/* Badge de notificaciones */}
          {mounted && unreadNotifications > 0 && (
            <span className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse`}>
              {unreadNotifications > 99 ? '99+' : unreadNotifications}
            </span>
          )}
        </span>
      </button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-56 backdrop-blur-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1.5">
          {/* User Info */}
          <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.email}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{getUserTypeLabel()}</div>
          </div>

          {/* Menu Items */}
          <Link 
            href="/account" 
            className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Mi Cuenta
          </Link>

          {/* Admin Link - Solo para usuario master */}
          {user?.email === 'api@apidevs.io' && (
            <Link 
              href="/admin" 
              className="flex items-center px-4 py-2.5 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
            >
              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Panel Admin
            </Link>
          )}

          <Link 
            href="/account/configuracion" 
            className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Configuración
          </Link>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-1.5" />

          {/* Sign Out */}
          <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
            <input type="hidden" name="pathName" value={pathname} />
            <button 
              type="submit" 
              className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

