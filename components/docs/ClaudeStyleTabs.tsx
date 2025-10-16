'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface Category {
  _id: string;
  title: string;
  slug: { current: string };
  icon?: string;
  order: number;
}

interface ClaudeStyleTabsProps {
  categories: Category[];
  currentLanguage?: string;
}

export default function ClaudeStyleTabs({ categories, currentLanguage = 'es' }: ClaudeStyleTabsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Ordenar categorías por order
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  // Agregar "Welcome" como primera tab
  const tabs = [
    {
      _id: 'welcome',
      title: currentLanguage === 'es' ? 'Bienvenida' : 'Welcome',
      slug: { current: '' }, // Root de docs
      icon: '',
      order: -1,
    },
    ...sortedCategories,
  ];

  // Leer query params en mount y actualizaciones
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    setSelectedCategory(category || '');
  }, [pathname]);

  const isTabActive = (tabSlug: string) => {
    return selectedCategory === tabSlug;
  };

  const handleTabClick = (tabSlug: string) => {
    if (tabSlug === '') {
      // Welcome tab - ir a la página principal sin query params
      router.push(`/docs/${currentLanguage}`);
      setSelectedCategory('');
    } else {
      // Otras tabs - navegar con query param
      router.push(`/docs/${currentLanguage}?category=${tabSlug}`);
      setSelectedCategory(tabSlug);
    }
  };

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 100);
    }
  };

  return (
    <div className="fixed top-14 left-0 right-0 z-40 bg-white dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1400px] mx-auto">
          <div className="px-8 sm:px-12 lg:px-16 relative">
          {/* Left Scroll Button */}
          {showLeftScroll && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-8 sm:left-12 lg:left-16 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-white dark:from-[#0A0A0A] to-transparent flex items-center justify-start"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

        {/* Tabs Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex items-center gap-1 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map((tab) => {
            const active = isTabActive(tab.slug.current);

            return (
              <button
                key={tab._id}
                onClick={() => handleTabClick(tab.slug.current)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                  border-b-2 transition-all duration-200
                  ${active
                    ? 'border-apidevs-primary text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        {showRightScroll && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-8 sm:right-12 lg:right-16 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-white dark:from-[#0A0A0A] to-transparent flex items-center justify-end"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
          </div>
        </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
