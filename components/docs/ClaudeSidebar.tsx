'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarPage {
  _id: string;
  title: string;
  slug: string;
  icon?: string;
  description?: string;
}

interface SidebarCategory {
  _id: string;
  title: string;
  slug: { current: string };
  icon?: string;
  pages: SidebarPage[];
}

interface ClaudeSidebarProps {
  categories: SidebarCategory[];
  currentLanguage: string;
  selectedCategorySlug?: string;
}

export default function ClaudeSidebar({ 
  categories, 
  currentLanguage,
  selectedCategorySlug 
}: ClaudeSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Cerrar sidebar móvil al cambiar de ruta
  // IMPORTANTE: useEffect debe estar ANTES de cualquier return condicional
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Encontrar la categoría seleccionada
  const selectedCategory = selectedCategorySlug 
    ? categories.find(cat => cat.slug.current === selectedCategorySlug)
    : null;

  const isPageActive = (slug: string) => {
    return pathname.includes(`/docs/${currentLanguage}/${slug}`);
  };

  // Si no hay categoría seleccionada, no mostrar sidebar
  if (!selectedCategory) {
    return null;
  }

  return (
    <>
      {/* Mobile Toggle Button - Solo visible en móvil */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed bottom-4 left-4 z-50 p-3 bg-apidevs-primary text-black rounded-full shadow-lg hover:bg-apidevs-primary/90 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay móvil */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar MÓVIL - Fixed overlay en pantallas pequeñas */}
      {isMobileOpen && (
        <aside
          className="lg:hidden fixed top-28 left-0 z-50 w-72 h-[calc(100vh-7rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto shadow-2xl"
        >
          <div className="p-6">
            {/* Pages List - Estilo Claude (solo títulos) */}
            <nav className="space-y-0.5">
              {selectedCategory.pages.map((page) => {
                const active = isPageActive(page.slug);
                
                return (
                  <Link
                    key={page._id}
                    href={`/docs/${currentLanguage}/${page.slug}`}
                    className={`
                      group block px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${active
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }
                    `}
                  >
                    {page.title}
                  </Link>
                );
              })}
            </nav>

            {/* Empty State */}
            {selectedCategory.pages.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                {currentLanguage === 'es' 
                  ? 'No hay páginas en esta categoría'
                  : 'No pages in this category'}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Sidebar DESKTOP - Alineado con contenido */}
      <aside
        className={`
          w-72 flex-shrink-0
          hidden lg:block
          sticky top-28 self-start
          h-[calc(100vh-7rem)]
          border-r border-gray-200 dark:border-gray-800
          overflow-y-auto
        `}
      >
        <div className="p-6">
          {/* Pages List - Estilo Claude (solo títulos) */}
          <nav className="space-y-0.5">
            {selectedCategory.pages.map((page) => {
              const active = isPageActive(page.slug);
              
              return (
                <Link
                  key={page._id}
                  href={`/docs/${currentLanguage}/${page.slug}`}
                  className={`
                    group block px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${active
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }
                  `}
                >
                  {page.title}
                </Link>
              );
            })}
          </nav>

          {/* Empty State */}
          {selectedCategory.pages.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
              {currentLanguage === 'es' 
                ? 'No hay páginas en esta categoría'
                : 'No pages in this category'}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

