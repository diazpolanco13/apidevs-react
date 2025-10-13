'use client';

import { useEffect, useState } from 'react';

interface TocHeading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: TocHeading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    // Crear un Set para evitar duplicados de IDs
    const uniqueIds = new Set<string>();

    headings.forEach(({ id }) => {
      if (!uniqueIds.has(id)) {
        uniqueIds.add(id);
        const element = document.getElementById(id);
        if (element) observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  // No renderizar en móvil si no hay headings
  if (headings.length === 0) return null;

  return (
    <nav 
      className="fixed top-24 right-0 h-[calc(100vh-4rem)] w-64 p-6 overflow-y-auto border-l border-gray-200 dark:border-gray-800 hidden xl:block" 
      style={{ right: 'max(0px, calc((100vw - 1800px) / 2))' }}
      aria-label="Table of contents"
    >
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          On this page
        </h4>
        <ul className="space-y-2">
          {headings.map((heading) => {
            const isActive = activeId === heading.id;
            // Limitar indentación para evitar overflow
            const indent = Math.min((heading.level - 1) * 12, 36);
            return (
              <li
                key={heading.id}
                style={{ paddingLeft: `${indent}px` }}
              >
                <a
                  href={`#${heading.id}`}
                  className={`block text-xs sm:text-sm transition-colors py-1 border-l-2 pl-3 truncate ${
                    isActive
                      ? 'border-apidevs-purple dark:border-apidevs-primary text-apidevs-purple dark:text-apidevs-primary font-medium'
                      : 'border-transparent text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(heading.id);
                    if (element) {
                      element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }
                  }}
                  title={heading.text}
                >
                  {heading.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

