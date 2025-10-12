'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface Language {
  id: string;
  name: string;
  flag: string;
  nativeName: string;
}

const languages: Language[] = [
  {
    id: 'es',
    name: 'Español',
    flag: '🇪🇸',
    nativeName: 'Español'
  },
  {
    id: 'en',
    name: 'English',
    flag: '🇺🇸',
    nativeName: 'English'
  },
];

interface LanguageSwitcherProps {
  currentLanguage: string;
  currentSlug?: string;
  className?: string;
}

export default function LanguageSwitcher({ 
  currentLanguage, 
  currentSlug,
  className = ''
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const currentLang = languages.find(lang => lang.id === currentLanguage) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLanguageChange = async (newLanguageId: string) => {
    if (newLanguageId === currentLanguage) {
      setIsOpen(false);
      return;
    }

    setIsTransitioning(true);
    setIsOpen(false);

    try {
      // Extract current slug from pathname
      const pathParts = pathname.split('/');
      const docsIndex = pathParts.findIndex(part => part === 'docs');
      
      if (docsIndex !== -1 && pathParts[docsIndex + 1] && pathParts[docsIndex + 2]) {
        // We're on a specific doc page: /docs/[lang]/[slug]
        const currentSlug = pathParts[docsIndex + 2];
        router.push(`/docs/${newLanguageId}/${currentSlug}`);
      } else {
        // We're on the docs landing page: /docs/[lang]
        router.push(`/docs/${newLanguageId}`);
      }
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      // Reset transition state after a delay
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isTransitioning}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200
          bg-gray-900/50 border-gray-800 hover:border-gray-700 hover:bg-gray-900
          ${isOpen ? 'border-apidevs-primary/50 bg-gray-900' : ''}
          ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-label="Select language"
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span className="text-sm font-medium text-white hidden sm:inline">
          {currentLang.nativeName}
        </span>
        <ChevronDownIcon 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-800">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Select Language
            </h3>
          </div>

          {/* Language Options */}
          <div className="py-2">
            {languages.map((language) => {
              const isSelected = language.id === currentLanguage;
              
              return (
                <button
                  key={language.id}
                  onClick={() => handleLanguageChange(language.id)}
                  disabled={isTransitioning}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150
                    ${isSelected 
                      ? 'bg-apidevs-primary/10 text-apidevs-primary border-r-2 border-apidevs-primary' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                    ${isTransitioning ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  `}
                >
                  <span className="text-lg flex-shrink-0">{language.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{language.nativeName}</div>
                    <div className="text-xs text-gray-400">{language.name}</div>
                  </div>
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <svg className="w-4 h-4 text-apidevs-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-800 bg-gray-900/50">
            <p className="text-xs text-gray-500">
              More languages coming soon
            </p>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
