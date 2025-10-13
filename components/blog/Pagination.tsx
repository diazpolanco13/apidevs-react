'use client';

import { useMemo } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ currentPage, totalPages, onPageChange, className = '' }: PaginationProps) {
  
  // Generar array de páginas visibles
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Número máximo de botones visibles
    
    if (totalPages <= maxVisible) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar: 1 ... 4 5 [6] 7 8 ... 10
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Páginas alrededor de la actual
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`group relative px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
          currentPage === 1
            ? 'bg-gray-900/50 text-gray-600 cursor-not-allowed'
            : 'bg-gray-900/80 text-white hover:bg-gray-800 hover:scale-105 hover:shadow-lg'
        }`}
      >
        <div className="flex items-center gap-2">
          <svg 
            className={`w-4 h-4 transition-transform ${currentPage !== 1 ? 'group-hover:-translate-x-1' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Anterior</span>
        </div>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-2">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500 select-none">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`relative px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                isActive
                  ? 'bg-apidevs-primary text-black shadow-lg shadow-apidevs-primary/20 scale-110'
                  : 'bg-gray-900/80 text-gray-300 hover:bg-gray-800 hover:text-white hover:scale-105 hover:shadow-lg'
              }`}
            >
              {/* Glow effect para página activa */}
              {isActive && (
                <div className="absolute -inset-0.5 bg-gradient-to-r from-apidevs-primary via-yellow-400 to-apidevs-primary rounded-lg blur opacity-30 animate-pulse"></div>
              )}
              <span className="relative">{pageNum}</span>
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`group relative px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
          currentPage === totalPages
            ? 'bg-gray-900/50 text-gray-600 cursor-not-allowed'
            : 'bg-gray-900/80 text-white hover:bg-gray-800 hover:scale-105 hover:shadow-lg'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">Siguiente</span>
          <svg 
            className={`w-4 h-4 transition-transform ${currentPage !== totalPages ? 'group-hover:translate-x-1' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </div>
  );
}

