'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { SidebarData } from '@/sanity/lib/doc-queries';

interface DocsSidebarProps {
  sidebarData: SidebarData;
}

export default function DocsSidebar({ sidebarData }: DocsSidebarProps) {
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(
      sidebarData.categories
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
    <aside className="fixed top-16 left-0 bottom-0 w-64 bg-black border-r border-gray-800 overflow-y-auto z-30 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/docs" className="flex items-center gap-2 group">
          <span className="text-2xl font-bold bg-gradient-to-r from-apidevs-primary to-purple-500 bg-clip-text text-transparent">
            APIDevs
          </span>
          <span className="text-gray-400 text-sm">Docs</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-6">
        {sidebarData.categories.map((category) => {
          const isExpanded = expandedCategories.has(category._id);
          const hasPages = category.pages && category.pages.length > 0;

          return (
            <div key={category._id} className="space-y-2">
              {/* Category Header */}
              <button
                onClick={() => category.isCollapsible && toggleCategory(category._id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  category.isCollapsible
                    ? 'hover:bg-gray-900 cursor-pointer'
                    : 'cursor-default'
                }`}
              >
                <div className="flex items-center gap-2">
                  {category.icon && (
                    <span className="text-base">{category.icon}</span>
                  )}
                  <span className="text-gray-300 uppercase tracking-wide text-xs">
                    {category.title}
                  </span>
                </div>
                {category.isCollapsible && hasPages && (
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${
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

              {/* Pages List */}
              {isExpanded && hasPages && (
                <div className="space-y-1 ml-1">
                  {category.pages.map((page) => {
                    const active = isPageActive(page.slug);
                    return (
                      <Link
                        key={page._id}
                        href={`/docs/${page.slug}`}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all group ${
                          active
                            ? 'bg-apidevs-primary/10 text-apidevs-primary border-l-2 border-apidevs-primary'
                            : 'text-gray-400 hover:text-white hover:bg-gray-900'
                        }`}
                      >
                        {page.icon && (
                          <span className="text-base flex-shrink-0">
                            {page.icon}
                          </span>
                        )}
                        <span className={`${active ? 'font-medium' : ''}`}>
                          {page.title}
                        </span>
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
      <div className="p-4 border-t border-gray-800 mt-auto">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-apidevs-primary transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Volver al inicio</span>
        </Link>
      </div>
    </aside>
  );
}

