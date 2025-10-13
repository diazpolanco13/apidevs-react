'use client';

import { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: string;
}

interface TableOfContentsProps {
  headings: Heading[];
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
      { rootMargin: '-20% 0px -35% 0px' }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
      <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
        En este artículo
      </h4>
      
      <ul className="space-y-2">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          const indent = heading.level === 'h3' ? 'ml-4' : heading.level === 'h4' ? 'ml-8' : '';
          
          return (
            <li key={heading.id} className={indent}>
              <a
                href={`#${heading.id}`}
                className={`block text-sm py-1 transition-colors ${
                  isActive
                    ? 'text-apidevs-primary font-medium'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(heading.id)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

