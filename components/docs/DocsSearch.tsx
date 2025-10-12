'use client';

import { useState } from 'react';

export default function DocsSearch() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Search Button - Mintlify Style */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-900/50 hover:bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-400 hover:text-white transition-all group w-64"
      >
        <svg
          className="w-4 h-4 text-gray-500 group-hover:text-gray-400"
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
        <span>Search...</span>
        <kbd className="ml-auto px-2 py-0.5 bg-gray-800/50 border border-gray-700/50 rounded text-xs text-gray-500 font-mono">
          Ctrl K
        </kbd>
      </button>

      {/* Mobile Search Icon */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
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
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-800">
              <svg
                className="w-5 h-5 text-gray-500"
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
                className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-lg"
                autoFocus
              />
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Results */}
            <div className="p-4 text-center text-gray-500 text-sm">
              Type to search documentation...
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800 text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-400">↑↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-400">↵</kbd>
                  <span>Select</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-400">ESC</kbd>
                <span>Close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
