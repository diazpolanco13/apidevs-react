'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import APIDevsLogo from '@/components/icons/APIDevsLogo';
import ClaudeStyleSearch from './ClaudeStyleSearch';

interface ClaudeStyleNavbarProps {
  currentLanguage?: string;
}

export default function ClaudeStyleNavbar({ currentLanguage = 'es' }: ClaudeStyleNavbarProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('docs-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme((storedTheme as 'light' | 'dark') || (prefersDark ? 'dark' : 'light'));
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('docs-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const languages = [
    { id: 'es', name: 'Español', flag: '🇪🇸' },
    { id: 'en', name: 'English', flag: '🇺🇸' },
  ];

  const currentLang = languages.find(lang => lang.id === currentLanguage) || languages[0];

  // Keyboard shortcut for search (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <ClaudeStyleSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        currentLanguage={currentLanguage}
      />
      
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between h-14 px-8 sm:px-12 lg:px-16">
            {/* Left: Logo + Language */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <Link 
                href={`/docs/${currentLanguage}`}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <APIDevsLogo width={120} height={30} />
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Docs
                </span>
              </Link>

            {/* Language Selector */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-300 dark:hover:border-gray-600">
                <span className="font-medium">{currentLang.id.toUpperCase()}</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              <div className="absolute top-full left-0 mt-2 w-40 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {languages.map((lang) => {
                  // Construir URL correcta
                  const newPath = pathname.replace(`/docs/${currentLanguage}`, `/docs/${lang.id}`);
                  
                  return (
                    <Link
                      key={lang.id}
                      href={newPath}
                      className={`flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                        lang.id === currentLanguage 
                          ? 'text-apidevs-primary font-semibold bg-gray-50 dark:bg-gray-800/50' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>{lang.name}</span>
                      {lang.id === currentLanguage && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg transition-colors group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm text-gray-500 dark:text-gray-400 flex-1 text-left">
                {currentLanguage === 'es' ? 'Buscar...' : 'Search...'}
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>

          {/* Right: Quick Links + Theme Toggle */}
          <div className="flex items-center gap-4">
            {/* Quick Links */}
            <div className="hidden lg:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/discord"
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Discord
              </Link>
              <Link
                href="/support"
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {currentLanguage === 'es' ? 'Soporte' : 'Support'}
              </Link>
            </div>

            {/* Get Started Button */}
            <Link
              href="/pricing"
              className="hidden sm:flex items-center gap-1 px-4 py-1.5 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-all"
            >
              <span>{currentLanguage === 'es' ? 'Comenzar' : 'Get started'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            )}

            {/* Mobile Search Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          </div>
        </div>
      </nav>
    </>
  );
}

