'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SidebarLanguageSelector from './SidebarLanguageSelector';
import type { SidebarData } from '@/sanity/lib/doc-queries';
import LanguageSwitcher from './LanguageSwitcher';

interface DocsSidebarProps {
  sidebarData: SidebarData;
  currentLanguage?: string;
  docsMap?: Record<string, string>;
}

export default function DocsSidebar({ sidebarData, currentLanguage = 'es', docsMap = {} }: DocsSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(
      (sidebarData?.categories || [])
        .filter((cat) => cat.defaultExpanded)
        .map((cat) => cat._id)
    )
  );

  // Cerrar sidebar móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevenir scroll del body cuando el sidebar móvil está abierto
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const isPageActive = (slug: string) => {
    return pathname === `/docs/${currentLanguage}/${slug}` || pathname.endsWith(`/${slug}`);
  };

  // Componente de contenido del sidebar (reutilizable)
  const SidebarContent = () => (
    <>
      {/* Navigation */}
      <nav className="p-4 space-y-6 flex-1 overflow-y-auto docs-sidebar-nav">
        {(sidebarData?.categories || []).map((category) => {
          const isExpanded = expandedCategories.has(category._id);
          const hasPages = category.pages && category.pages.length > 0;

          return (
            <div key={category._id} className="space-y-1">
              {/* Category Header */}
              {category.isCollapsible ? (
                <button
                  onClick={() => toggleCategory(category._id)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-gray-400 hover:text-white uppercase tracking-wider transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {category.icon && (
                      <span className="text-sm">{category.icon}</span>
                    )}
                    <span>{category.title}</span>
                  </div>
                  {hasPages && (
                    <svg
                      className={`w-3 h-3 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </button>
              ) : (
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    {category.icon && (
                      <span className="text-sm">{category.icon}</span>
                    )}
                    <span>{category.title}</span>
                  </div>
                </div>
              )}

              {/* Pages List */}
              {(!category.isCollapsible || isExpanded) && hasPages && (
                <div className="space-y-0.5">
                  {category.pages.map((page) => {
                    const active = isPageActive(page.slug);
                    return (
                      <Link
                        key={page._id}
                        href={`/docs/${currentLanguage}/${page.slug}`}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-all group relative ${
                          active
                            ? 'bg-apidevs-primary/10 text-apidevs-primary font-medium before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-apidevs-primary before:rounded-r'
                            : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
                        }`}
                      >
                        {page.icon && (
                          <span className="text-base flex-shrink-0">
                            {page.icon}
                          </span>
                        )}
                        <span className="truncate">{page.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer - Estilo Mintlify Premium */}
      <div className="p-4 border-t border-gray-800/50 space-y-2">
        {/* Language Selector */}
        <SidebarLanguageSelector 
          currentLanguage={currentLanguage}
          docsMap={docsMap}
        />
        
        {/* Theme Toggle - Estilo Mintlify Premium */}
        <button
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-gray-900/40 border border-gray-700/50 text-gray-300 hover:bg-gray-800/70 hover:border-gray-600/50 transition-all duration-200 group"
          onClick={() => {
            // TODO: Implementar dark/light mode
            console.log('Theme toggle - Coming soon!');
          }}
          title="Theme toggle (Coming soon)"
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {/* Moon Icon */}
            <svg 
              className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-gray-300 transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
              />
            </svg>
            <span className="text-sm font-medium truncate">Dark mode</span>
          </div>
          {/* Optional Sun Icon on hover */}
          <svg 
            className="w-4 h-4 flex-shrink-0 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
            />
          </svg>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - Hidden en móvil, visible desde lg */}
      <aside className="hidden lg:flex lg:flex-col sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-apidevs-dark/95 backdrop-blur-sm border-r border-gray-800/50 overflow-hidden z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar - Visible en móvil, hidden desde lg */}
      {isMobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Sidebar Drawer */}
          <aside className="lg:hidden fixed top-16 left-0 bottom-0 w-72 bg-apidevs-dark border-r border-gray-800/50 z-50 flex flex-col animate-slide-in-left">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Mobile Toggle Button - Flotante en la esquina */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed bottom-6 left-6 z-30 p-4 bg-apidevs-primary hover:bg-apidevs-primary/90 text-black rounded-full shadow-2xl shadow-apidevs-primary/30 transition-all"
        aria-label="Toggle sidebar"
      >
        {isMobileOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
    </>
  );
}
