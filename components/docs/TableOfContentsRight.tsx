'use client';

import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsRightProps {
  content?: any; // Portable Text content
}

export default function TableOfContentsRight({ content }: TableOfContentsRightProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extraer headings del DOM
    const headings = document.querySelectorAll('article h2, article h3');
    const items: TocItem[] = Array.from(headings).map((heading, index) => ({
      id: heading.id || `heading-${index}`, // Fallback si no hay ID
      text: heading.textContent || '',
      level: parseInt(heading.tagName.substring(1)),
    }));
    setTocItems(items);

    // Intersection Observer para detectar el heading activo
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -66%' }
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [content]);

  // Si no hay headings, no mostrar el TOC
  if (tocItems.length === 0) {
    return null;
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside className="hidden xl:block sticky top-28 w-64 h-[calc(100vh-7rem)] overflow-y-auto flex-shrink-0">
      <div className="p-6">
        <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
          En esta página
        </h4>
        <nav>
          <ul className="space-y-2 text-sm">
            {tocItems.map((item, index) => (
              <li
                key={`${item.id}-${index}`}
                className={`
                  ${item.level === 3 ? 'pl-4' : ''}
                `}
              >
                <button
                  onClick={() => scrollToHeading(item.id)}
                  className={`
                    text-left w-full py-1 transition-colors
                    ${activeId === item.id
                      ? 'text-apidevs-primary font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }
                  `}
                >
                  {item.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

