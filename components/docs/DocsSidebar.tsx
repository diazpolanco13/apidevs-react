'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import type { SidebarData } from '@/sanity/lib/doc-queries';

interface DocsSidebarProps {
  sidebarData: SidebarData;
}

export default function DocsSidebar({ sidebarData }: DocsSidebarProps) {
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(
      (sidebarData?.categories || [])
        .filter((cat) => cat.defaultExpanded)
        .map((cat) => cat._id)
    )
  );

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
    return pathname === `/docs/${slug}` || pathname.endsWith(`/${slug}`);
  };

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-64 bg-apidevs-dark/95 backdrop-blur-sm border-r border-gray-800/50 overflow-y-auto z-40">
      {/* Custom scrollbar styles */}
      <style jsx>{`
        aside::-webkit-scrollbar {
          width: 6px;
        }
        aside::-webkit-scrollbar-track {
          background: transparent;
        }
        aside::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 3px;
        }
        aside::-webkit-scrollbar-thumb:hover {
          background: #4B5563;
        }
      `}</style>

      {/* Search Area */}
      <div className="p-4 border-b border-gray-800/50">
        {/* Search Input Styled like Mintlify */}
        <button className="w-full flex items-center gap-3 px-3 py-2 bg-gray-900/50 hover:bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-400 transition-all group">
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
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-8">
        {(sidebarData?.categories || []).map((category) => {
          const isExpanded = expandedCategories.has(category._id);
          const hasPages = category.pages && category.pages.length > 0;

          return (
            <div key={category._id} className="space-y-1">
              {/* Category Header - Mintlify Style */}
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

              {/* Pages List - Mintlify Style */}
              {(!category.isCollapsible || isExpanded) && hasPages && (
                <div className="space-y-0.5">
                  {category.pages.map((page) => {
                    const active = isPageActive(page.slug);
                    return (
                      <Link
                        key={page._id}
                        href={`/docs/${page.slug}`}
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

      {/* Footer */}
      <div className="p-4 border-t border-gray-800/50">
        <Link
          href="/"
          className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-400 hover:text-apidevs-primary transition-colors rounded-md hover:bg-gray-900/50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Back to Home</span>
        </Link>
      </div>
    </aside>
  );
}
