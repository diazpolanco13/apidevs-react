'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface MobilePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function MobilePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: MobilePaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-800/30 border-t border-gray-700">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800 disabled:hover:text-gray-400 transition-colors"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        <span>Anterior</span>
      </button>

      {/* Page Info */}
      <div className="flex flex-col items-center gap-1">
        <div className="text-sm font-medium text-white">
          Página {currentPage} de {totalPages}
        </div>
        <div className="text-xs text-gray-400">
          {startItem}-{endItem} de {totalItems}
        </div>
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800 disabled:hover:text-gray-400 transition-colors"
      >
        <span>Siguiente</span>
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
