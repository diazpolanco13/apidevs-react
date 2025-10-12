'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchResult {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  categoryTitle?: string;
  categorySlug?: string;
  excerpt?: string;
}

export default function DocsSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Detectar Ctrl+K o Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        setResults([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevenir scroll cuando modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Buscar con debounce
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/docs/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.results || []);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Navegación con teclado
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = results[selectedIndex];
      if (selected) {
        router.push(`/docs/${selected.slug}`);
        setIsOpen(false);
        setQuery('');
        setResults([]);
      }
    }
  }, [results, selectedIndex, router]);

  const handleResultClick = (slug: string) => {
    router.push(`/docs/${slug}`);
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  return (
    <>
      {/* Search Button - Desktop */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-900/50 hover:bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-400 hover:text-white transition-all group w-full max-w-xl"
        aria-label="Search documentation"
      >
        <svg
          className="w-4 h-4 text-gray-500 group-hover:text-gray-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span className="truncate">Search...</span>
        <kbd className="ml-auto px-2 py-0.5 bg-gray-800/50 border border-gray-700/50 rounded text-xs text-gray-500 font-mono hidden lg:block">
          ⌘K
        </kbd>
      </button>

      {/* Mobile Search Icon */}
      <button
        onClick={() => setIsOpen(true)}
        className="sm:hidden p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-900/50"
        aria-label="Search"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/0 backdrop-blur-md z-[60] flex items-start justify-center pt-16 sm:pt-20 px-4"
          onClick={() => {
            setIsOpen(false);
            setQuery('');
            setResults([]);
          }}
        >
          <div
            className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-800">
              <svg
                className="w-5 h-5 text-gray-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Buscar en documentación..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-base sm:text-lg"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                  }}
                  className="text-gray-500 hover:text-gray-400 p-1"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setQuery('');
                  setResults([]);
                }}
                className="text-gray-500 hover:text-gray-400 p-1"
                aria-label="Close search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {isLoading && (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center gap-2 text-gray-400">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm">Buscando...</span>
                  </div>
                </div>
              )}

              {!isLoading && !query && (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800/50 rounded-full mb-4">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Escribe para buscar en la documentación
                  </p>
                  <p className="text-gray-600 text-xs mt-2">
                    Mínimo 2 caracteres
                  </p>
                </div>
              )}

              {!isLoading && query && results.length === 0 && (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800/50 rounded-full mb-4">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">
                    No se encontraron resultados para &quot;{query}&quot;
                  </p>
                  <p className="text-gray-600 text-xs mt-2">
                    Intenta con otros términos
                  </p>
                </div>
              )}

              {!isLoading && results.length > 0 && (
                <div className="py-2">
                  {results.map((result, index) => (
                    <button
                      key={result._id}
                      onClick={() => handleResultClick(result.slug)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-800/50 transition-colors border-l-2 ${
                        index === selectedIndex
                          ? 'border-apidevs-primary bg-gray-800/30'
                          : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm mb-1 truncate">
                            {result.title}
                          </h4>
                          {result.description && (
                            <p className="text-gray-400 text-xs line-clamp-2 mb-1">
                              {result.description}
                            </p>
                          )}
                          {result.excerpt && !result.description && (
                            <p className="text-gray-400 text-xs line-clamp-2 mb-1">
                              {result.excerpt}...
                            </p>
                          )}
                          {result.categoryTitle && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                              {result.categoryTitle}
                            </span>
                          )}
                        </div>
                        <svg
                          className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer - Shortcuts */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800 text-xs text-gray-500">
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 sm:px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-400 text-xs">↑↓</kbd>
                  <span className="hidden sm:inline">Navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 sm:px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-400 text-xs">↵</kbd>
                  <span className="hidden sm:inline">Select</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 sm:px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-400 text-xs">ESC</kbd>
                <span className="hidden sm:inline">Close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
