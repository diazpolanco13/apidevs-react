'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  categoryTitle?: string;
  excerpt?: string;
}

interface ClaudeStyleSearchProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage?: string;
}

export default function ClaudeStyleSearch({ 
  isOpen, 
  onClose, 
  currentLanguage = 'es' 
}: ClaudeStyleSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search con debounce
  useEffect(() => {
    if (!query.trim() || !isOpen) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/docs/search?q=${encodeURIComponent(query)}&lang=${currentLanguage}`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, currentLanguage, isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      router.push(`/docs/${currentLanguage}/${results[selectedIndex].slug}`);
      onClose();
    }
  }, [isOpen, onClose, results, selectedIndex, router, currentLanguage]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll cuando está abierto
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[10vh] px-4">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 slide-in-from-top-2 duration-200">
          {/* Search Input */}
          <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={currentLanguage === 'es' ? 'Buscar en la documentación...' : 'Search documentation...'}
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-base"
              autoFocus
            />
            <button
              onClick={onClose}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 font-mono"
            >
              ESC
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-apidevs-primary rounded-full animate-spin" />
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {currentLanguage === 'es' ? 'Buscando...' : 'Searching...'}
                </p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={result._id}
                    onClick={() => {
                      router.push(`/docs/${currentLanguage}/${result.slug}`);
                      onClose();
                    }}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      index === selectedIndex
                        ? 'bg-gray-100 dark:bg-gray-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white mb-1">
                          {result.title}
                        </div>
                        {result.categoryTitle && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {result.categoryTitle}
                          </div>
                        )}
                        {result.excerpt && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {result.excerpt}
                          </div>
                        )}
                      </div>
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            ) : query.trim() ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {currentLanguage === 'es' ? 'Sin resultados' : 'No results'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentLanguage === 'es' 
                    ? 'Intenta con otros términos de búsqueda'
                    : 'Try different search terms'}
                </p>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">💡</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {currentLanguage === 'es' ? 'Busca en la documentación' : 'Search documentation'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentLanguage === 'es' 
                    ? 'Escribe para comenzar a buscar'
                    : 'Start typing to search'}
                </p>
              </div>
            )}
          </div>

          {/* Footer con keyboard hints */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded font-mono">↑↓</kbd>
                  <span>{currentLanguage === 'es' ? 'Navegar' : 'Navigate'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded font-mono">↵</kbd>
                  <span>{currentLanguage === 'es' ? 'Seleccionar' : 'Select'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded font-mono">ESC</kbd>
                <span>{currentLanguage === 'es' ? 'Cerrar' : 'Close'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

