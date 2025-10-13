'use client';

import Link from 'next/link';

interface Card {
  title: string;
  icon?: string;
  description?: string;
  href?: string;
}

interface CardGroupProps {
  value: {
    title?: string;
    cols: number;
    cards: Card[];
  };
}

export default function CardGroup({ value }: CardGroupProps) {
  const { title, cols = 2, cards = [] } = value;

  const gridCols = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[cols] || 'md:grid-cols-2';

  return (
    <div className="my-8">
      {title && (
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      )}
      <div className={`grid ${gridCols} gap-4`}>
        {cards.map((card, index) => {
          const CardWrapper = card.href ? Link : 'div';
          const wrapperProps = card.href 
            ? { href: card.href, className: 'block group' }
            : { className: 'group' };

          return (
            <CardWrapper key={index} {...wrapperProps as any}>
              <div className="h-full p-5 bg-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-xl hover:border-gray-700 hover:bg-gray-900/60 transition-all duration-300">
                <div className="flex items-start gap-3">
                  {card.icon && (
                    <span className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      {card.icon}
                    </span>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-2 group-hover:text-apidevs-primary transition-colors">
                      {card.title}
                    </h4>
                    {card.description && (
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {card.description}
                      </p>
                    )}
                  </div>
                </div>
                {card.href && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-apidevs-primary group-hover:gap-3 transition-all">
                    <span>Ver más</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            </CardWrapper>
          );
        })}
      </div>
    </div>
  );
}

