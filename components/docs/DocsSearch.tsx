'use client';

import { useState, useEffect } from 'react';

export default function DocsSearch() {
  const [isOpen, setIsOpen] = useState(false);

  // Detectar Ctrl+K o Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
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

  return (
    <>
      {/* Search Button - Desktop */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-900/50 hover:bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-400 hover:text-white transition-all group w-48 lg:w-64"
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
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-start justify-center pt-16 sm:pt-20 px-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
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
                placeholder="Search documentation..."
                className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-base sm:text-lg"
                autoFocus
              />
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-400 p-1"
                aria-label="Close search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Results Placeholder */}
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800/50 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">
                La búsqueda estará disponible próximamente
              </p>
              <p className="text-gray-600 text-xs mt-2">
                Funcionalidad en desarrollo
              </p>
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
