'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DocsSearch from './DocsSearch';

interface DocsHeaderProps {
  onMenuToggle?: () => void;
}

export default function DocsHeader({ onMenuToggle }: DocsHeaderProps = {}) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Detectar tema actual
    const theme = localStorage.getItem('docs-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(theme === 'dark' || (!theme && prefersDark));
    
    // Observar cambios en el tema
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 dark:bg-apidevs-dark/95 border-b border-gray-200 dark:border-gray-800/50 z-50 backdrop-blur-xl">
      <div className="h-full px-4 flex items-center max-w-screen-2xl mx-auto gap-4">
        {/* Left Side - Logo + Mobile Menu */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Mobile Menu Button - Solo visible en móvil */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/50"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo - Render único basado en estado del cliente */}
          <Link href="/" className="flex items-center gap-2">
            {mounted && (
              <Image 
                src={isDark ? "/logos/logo-horizontal-blanco.png" : "/logos/logo-horizontal-negro.png"}
                alt="APIDevs" 
                width={120}
                height={28}
                className="h-6 sm:h-7 w-auto"
                priority
              />
            )}
            {!mounted && (
              <Image 
                src="/logos/logo-horizontal-blanco.png"
                alt="APIDevs" 
                width={120}
                height={28}
                className="h-6 sm:h-7 w-auto"
                priority
              />
            )}
          </Link>
        </div>

        {/* Center - Search (toma todo el espacio disponible) */}
        <div className="flex-1 flex justify-center max-w-2xl mx-auto">
          <DocsSearch />
        </div>

        {/* Right Side - CTA Button */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* CTA Button */}
          <Link
            href="/signin"
            className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-apidevs-primary hover:bg-apidevs-primary/90 text-black font-semibold rounded-lg transition-all text-xs sm:text-sm shadow-lg shadow-apidevs-primary/20 whitespace-nowrap"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
