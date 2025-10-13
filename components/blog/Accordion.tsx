'use client';

import { useState } from 'react';

interface AccordionProps {
  value: {
    title: string;
    content: string;
    defaultOpen?: boolean;
  };
}

export default function Accordion({ value }: AccordionProps) {
  const { title, content, defaultOpen = false } = value;
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="my-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl hover:border-gray-700 hover:bg-gray-900/50 transition-all duration-300 group"
      >
        <span className="font-semibold text-white text-left">{title}</span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ml-3 ${
            isOpen ? 'rotate-180' : ''
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
      </button>

      <div
        className={`
          overflow-hidden transition-all duration-300
          ${isOpen ? 'max-h-[2000px] opacity-100 mt-2' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="p-5 bg-gray-900/20 backdrop-blur-sm border border-gray-800/30 rounded-xl">
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}

