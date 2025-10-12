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

  if (headings.length === 0) return null;

  return (
    <nav className="absolute top-0 right-0 bottom-0 w-64 p-6 overflow-y-auto border-l border-gray-800 hidden xl:block">
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          On this page
        </h4>
        <ul className="space-y-2">
          {headings.map((heading) => {
            const isActive = activeId === heading.id;
            return (
              <li
                key={heading.id}
                style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
              >
                <a
                  href={`#${heading.id}`}
                  className={`block text-sm transition-colors py-1 border-l-2 pl-3 ${
                    isActive
                      ? 'border-apidevs-primary text-apidevs-primary font-medium'
                      : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(heading.id)?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
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

