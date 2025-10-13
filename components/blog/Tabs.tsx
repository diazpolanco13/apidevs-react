'use client';

import { useState } from 'react';

interface TabItem {
  label: string;
  content: string;
}

interface TabsProps {
  value: {
    items: TabItem[];
  };
}

export default function Tabs({ value }: TabsProps) {
  const { items = [] } = value;
  const [activeTab, setActiveTab] = useState(0);

  if (items.length === 0) return null;

  return (
    <div className="my-8">
      {/* Tab Headers */}
      <div className="flex flex-wrap gap-2 border-b border-gray-800/50 mb-6">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`
              px-4 py-2 font-medium text-sm transition-all duration-200
              border-b-2 -mb-px
              ${activeTab === index
                ? 'text-apidevs-primary border-apidevs-primary'
                : 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-700'
              }
            `}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-800/50">
        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
          {items[activeTab]?.content}
        </div>
      </div>
    </div>
  );
}

