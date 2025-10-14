'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SignOut } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import APIDevsLogo from '@/components/icons/APIDevsLogo';
import { useRouter, usePathname } from 'next/navigation';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import { useState, useEffect } from 'react';
import s from './Navbar.module.css';
import StatusSelector, { getStatusBadgeConfig } from './StatusSelector';

interface NavlinksProps {
  user?: any;
  avatarUrl?: string | null;
  userStatus?: string;
  unreadNotifications?: number;
  subscriptionType?: string | null;
}

export default function Navlinks({ user, avatarUrl, userStatus = 'online', unreadNotifications = 0, subscriptionType = null }: NavlinksProps) {
  const router = getRedirectMethod() === 'client' ? useRouter() : null;
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');
  const [currentStatus, setCurrentStatus] = useState(userStatus);
  const [mounted, setMounted] = useState(false);
  
  // Obtener configuración del badge según el estado
  const statusBadge = getStatusBadgeConfig(currentStatus);
  
  // Detectar si estamos en rutas del dashboard
  const isInDashboard = pathname?.startsWith('/account') || pathname?.startsWith('/admin');

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);
  
  // Sincronizar status cuando cambia desde el servidor
  useEffect(() => {
    setCurrentStatus(userStatus);
  }, [userStatus]);

  // Función para obtener el texto del tipo de usuario
  const getUserTypeLabel = () => {
    if (!subscriptionType) return 'Usuario Free';
    
    switch (subscriptionType) {
      case 'lifetime':
        return 'Usuario Lifetime';
      case 'pro':
        return 'Usuario Pro';
      default:
        return 'Usuario Free';
    }
  };

  return (
    <div className="relative flex flex-row justify-between items-center h-16 sm:h-16 md:h-20">
      {/* Mobile Menu Button - Oculto en dashboard */}
      {!isInDashboard && (
        <button
          className="lg:hidden flex items-center p-2 border rounded-md text-gray-300 border-gray-600 hover:text-apidevs-primary hover:border-apidevs-primary mr-2 sm:mr-3"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Abrir menú de navegación"
          title="Menú"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      <div className="flex items-center flex-1">
        <Link href="/" className={`${s.logo} focus:outline-none`} aria-label="APIDevs Trading">
          {/* Logo responsive - tamaño balanceado */}
          <div className="block sm:hidden">
            <APIDevsLogo width={130} height={32} />
          </div>
          <div className="hidden sm:block md:hidden">
            <APIDevsLogo width={145} height={36} />
          </div>
          <div className="hidden md:block">
            <APIDevsLogo width={160} height={40} />
          </div>
        </Link>
        <nav className="ml-8 space-x-6 lg:flex items-center hidden">
          <Link href="/" className={s.link}>
            Inicio
          </Link>
          
          {/* Herramientas Dropdown */}
          <div className="relative group">
            <button className={`${s.link} flex items-center`}>
              Herramientas
              <svg className="w-4 h-4 ml-1 transition-transform group-hover:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="absolute left-0 mt-2 w-56 backdrop-blur-xl bg-apidevs-dark/90 border border-apidevs-primary/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              <div className="py-2">
                <Link href="/indicadores" className="block px-4 py-2 text-sm text-gray-300 hover:bg-apidevs-primary/10 hover:text-apidevs-primary transition-colors">
                  <div className="font-medium">Indicadores VIP</div>
                  <div className="text-xs text-gray-400">25+ indicadores premium</div>
                </Link>
                <Link href="/scanners" className="block px-4 py-2 text-sm text-gray-300 hover:bg-apidevs-primary/10 hover:text-apidevs-primary transition-colors">
                  <div className="font-medium">Scanners</div>
                  <div className="text-xs text-gray-400">160 criptos + multimarket</div>
                </Link>
                <Link href="/alertas" className="block px-4 py-2 text-sm text-gray-300 hover:bg-apidevs-primary/10 hover:text-apidevs-primary transition-colors">
                  <div className="font-medium">Alertas</div>
                  <div className="text-xs text-gray-400">Telegram premium</div>
                </Link>
                <Link href="/backtesting" className="block px-4 py-2 text-sm text-gray-300 hover:bg-apidevs-primary/10 hover:text-apidevs-primary transition-colors">
                  <div className="font-medium">Backtesting</div>
                  <div className="text-xs text-gray-400">Prueba estrategias</div>
                </Link>
              </div>
            </div>
          </div>

          {/* Recursos Dropdown */}
          <div className="relative group">
            <button className={`${s.link} flex items-center`}>
              Recursos
              <svg className="w-4 h-4 ml-1 transition-transform group-hover:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="absolute left-0 mt-2 w-56 backdrop-blur-xl bg-apidevs-dark/90 border border-apidevs-primary/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              <div className="py-2">
                <Link href="/docs" className="block px-4 py-2 text-sm text-gray-300 hover:bg-apidevs-primary/10 hover:text-apidevs-primary transition-colors">
                  <div className="font-medium">Documentación</div>
                  <div className="text-xs text-gray-400">Guías de uso</div>
                </Link>
                <Link href="/blog" className="block px-4 py-2 text-sm text-gray-300 hover:bg-apidevs-primary/10 hover:text-apidevs-primary transition-colors">
                  <div className="font-medium">Blog</div>
                  <div className="text-xs text-gray-400">Análisis y estrategias</div>
                </Link>
                <Link href="/tutoriales" className="block px-4 py-2 text-sm text-gray-300 hover:bg-apidevs-primary/10 hover:text-apidevs-primary transition-colors">
                  <div className="font-medium">Tutoriales</div>
                  <div className="text-xs text-gray-400">Videos educativos</div>
                </Link>
                <Link href="/comunidad" className="block px-4 py-2 text-sm text-gray-300 hover:bg-apidevs-primary/10 hover:text-apidevs-primary transition-colors">
                  <div className="font-medium">Comunidad</div>
                  <div className="text-xs text-gray-400">Telegram VIP</div>
                </Link>
              </div>
            </div>
          </div>

          <Link href="/pricing" className={s.link}>
            Precios
          </Link>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && !isInDashboard && (
        <div className="lg:hidden absolute top-full left-0 w-full backdrop-blur-xl bg-apidevs-dark/95 border-t border-apidevs-primary/20 z-50">
          <div className="px-6 py-4 space-y-3">
            <Link href="/" className="block py-2 text-gray-300 hover:text-apidevs-primary">Inicio</Link>
            <div className="space-y-2">
              <div className="font-medium text-apidevs-primary">Herramientas</div>
              <Link href="/indicadores" className="block py-1 pl-4 text-sm text-gray-400 hover:text-apidevs-primary">Indicadores VIP</Link>
              <Link href="/scanners" className="block py-1 pl-4 text-sm text-gray-400 hover:text-apidevs-primary">Scanners</Link>
              <Link href="/alertas" className="block py-1 pl-4 text-sm text-gray-400 hover:text-apidevs-primary">Alertas</Link>
              <Link href="/backtesting" className="block py-1 pl-4 text-sm text-gray-400 hover:text-apidevs-primary">Backtesting</Link>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-apidevs-primary">Recursos</div>
              <Link href="/docs" className="block py-1 pl-4 text-sm text-gray-400 hover:text-apidevs-primary">Documentación</Link>
              <Link href="/blog" className="block py-1 pl-4 text-sm text-gray-400 hover:text-apidevs-primary">Blog</Link>
              <Link href="/tutoriales" className="block py-1 pl-4 text-sm text-gray-400 hover:text-apidevs-primary">Tutoriales</Link>
              <Link href="/comunidad" className="block py-1 pl-4 text-sm text-gray-400 hover:text-apidevs-primary">Comunidad</Link>
            </div>
            <Link href="/pricing" className="block py-2 text-gray-300 hover:text-apidevs-primary">Precios</Link>
            {user && (
              <Link href="/account" className="block py-2 text-gray-300 hover:text-apidevs-primary">Mi Cuenta</Link>
            )}
            {/* 🔒 Admin móvil solo para usuario master */}
            {user?.email === 'api@apidevs.io' && (
              <Link href="/admin" className="block py-2 text-orange-300 hover:text-orange-400">🛡️ Panel Admin</Link>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end items-center space-x-2 sm:space-x-4">
        {user ? (
          <div className="relative group">
            <button className="flex items-center space-x-1 sm:space-x-2 p-1 rounded-full hover:bg-apidevs-primary/10 transition-colors">
              <span className="relative inline-block">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="TradingView Profile"
                    width={40}
                    height={40}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full outline outline-2 -outline-offset-1 outline-apidevs-primary/50 object-cover shadow-lg shadow-apidevs-primary/30"
                    priority
                    unoptimized={avatarUrl.includes('tradingview.com')}
                  />
                ) : (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-primary rounded-full outline outline-2 -outline-offset-1 outline-apidevs-primary/50 flex items-center justify-center text-black font-semibold text-sm sm:text-base shadow-lg shadow-apidevs-primary/30">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                {/* Indicador de estado dinámico - renderizado solo en cliente */}
                {mounted ? (
                  <span className={`absolute bottom-0 right-0 block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${statusBadge.color} ring-2 ring-apidevs-dark ${statusBadge.animate ? 'animate-pulse' : ''}`} />
                ) : (
                  // Fallback durante SSR
                  <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 ring-2 ring-apidevs-dark" />
                )}
                {/* Badge de notificaciones - solo en cliente */}
                {mounted && unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full ring-2 ring-apidevs-dark animate-pulse">
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </span>
                )}
              </span>
            </button>
            <div className="absolute right-0 mt-2 w-48 backdrop-blur-xl bg-apidevs-dark/95 border border-apidevs-primary/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              <div className="py-2">
                <div className="px-4 py-2 border-b border-apidevs-primary/20">
                  <div className="text-sm font-medium text-white truncate">{user.email}</div>
                  <div className="text-xs text-gray-400">{getUserTypeLabel()}</div>
                </div>
                <Link href="/account" className="block px-4 py-2 text-sm text-gray-300 hover:bg-apidevs-primary/10 hover:text-apidevs-primary transition-colors">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Mi Cuenta
                  </div>
                </Link>
                
                {/* 🔒 Enlace Admin Solo para Usuario Master */}
                {user?.email === 'api@apidevs.io' && (
                  <Link href="/admin" className="block px-4 py-2 text-sm text-orange-300 hover:bg-orange-500/10 hover:text-orange-400 transition-colors">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Panel Admin
                    </div>
                  </Link>
                )}
                <Link href="/account/configuracion" className="block px-4 py-2 text-sm text-gray-300 hover:bg-apidevs-primary/10 hover:text-apidevs-primary transition-colors">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    Configuración
                  </div>
                </Link>
                {/* Selector de Estado - solo en cliente */}
                {mounted && user?.id && (
                  <StatusSelector 
                    currentStatus={currentStatus} 
                    userId={user.id}
                    onStatusChange={(newStatus) => setCurrentStatus(newStatus)}
                  />
                )}
                <div className="border-t border-apidevs-primary/20 mt-2 pt-2">
                  <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
                    <input type="hidden" name="pathName" value={currentPath} />
                    <button type="submit" className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                        Cerrar sesión
                      </div>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Link href="/signin" className={`${s.link} bg-apidevs-primary/10 border border-apidevs-primary/30 px-2 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-apidevs-primary/20 text-sm sm:text-base`}>
            <span className="hidden sm:inline">Iniciar sesión</span>
            <span className="sm:hidden">Entrar</span>
          </Link>
        )}
      </div>
    </div>
  );
}
