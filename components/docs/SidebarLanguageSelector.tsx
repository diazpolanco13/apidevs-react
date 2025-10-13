'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getTranslatedSlug } from '@/app/docs/actions';

interface Language {
  id: string;
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { id: 'es', code: 'ES', name: 'Español', flag: '🇪🇸' },
  { id: 'en', code: 'US', name: 'English', flag: '🇺🇸' },
  { id: 'fr', code: 'FR', name: 'Français', flag: '🇫🇷' },
  { id: 'zh', code: 'CN', name: '简体中文', flag: '🇨🇳' },
];

interface SidebarLanguageSelectorProps {
  currentLanguage: string;
  docsMap?: Record<string, string>;
}

export default function SidebarLanguageSelector({
  currentLanguage,
  docsMap = {},
}: SidebarLanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Encontrar el idioma actual
  const currentLang = languages.find((lang) => lang.id === currentLanguage) || languages[0];

  // Filtrar solo idiomas disponibles (es, en)
  const availableLanguages = languages.filter((lang) => ['es', 'en'].includes(lang.id));
  const comingSoonLanguages = languages.filter((lang) => !['es', 'en'].includes(lang.id));

  // Close dropdown cuando se hace click afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Persistir idioma seleccionado
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-docs-language', currentLanguage);
    }
  }, [currentLanguage]);

  const handleLanguageChange = async (newLanguageId: string) => {
    if (newLanguageId === currentLanguage || !['es', 'en'].includes(newLanguageId)) {
      setIsOpen(false);
      return;
    }

    setIsTransitioning(true);
    setIsOpen(false);

    try {
      // Extraer slug actual del pathname
      const pathParts = pathname.split('/');
      const docsIndex = pathParts.findIndex((part) => part === 'docs');
      const currentSlug = docsIndex !== -1 && pathParts[docsIndex + 2] ? pathParts[docsIndex + 2] : null;

      if (currentSlug) {
        // Obtener docId del map
        const currentDocId = docsMap[currentSlug];

        if (currentDocId) {
          // Intentar obtener el slug traducido
          const translatedSlug = await getTranslatedSlug(currentDocId, newLanguageId);

          if (translatedSlug) {
            router.push(`/docs/${newLanguageId}/${translatedSlug}`);
          } else {
            router.push(`/docs/${newLanguageId}`);
          }
        } else {
          router.push(`/docs/${newLanguageId}`);
        }
      } else {
        // Estamos en la landing page
        router.push(`/docs/${newLanguageId}`);
      }

      // Refresh para actualizar el sidebar y todo el contexto
      router.refresh();
    } catch (error) {
      console.error('Error changing language:', error);
      router.push(`/docs/${newLanguageId}`);
    } finally {
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button - Estilo Mintlify Premium */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isTransitioning}
        className={`
          w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-lg
          transition-all duration-200
          ${isOpen 
            ? 'bg-gray-200 dark:bg-gray-800/90 text-gray-900 dark:text-white shadow-lg' 
            : 'bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800/70'
          }
          ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}
          border border-gray-300 dark:border-gray-700/50 hover:border-gray-400 dark:hover:border-gray-600/50
        `}
        aria-label="Select language"
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-500 uppercase flex-shrink-0">{currentLang.code}</span>
          <span className="text-sm font-medium truncate">{currentLang.name}</span>
        </div>
        <svg
          className={`w-4 h-4 flex-shrink-0 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu - Estilo Mintlify Premium */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-[#1a1f2e] border border-gray-300 dark:border-gray-700/70 rounded-xl shadow-2xl shadow-black/40 overflow-hidden backdrop-blur-sm">
          {/* Available Languages */}
          <div className="py-1">
            {availableLanguages.map((language) => {
              const isSelected = language.id === currentLanguage;

              return (
                <button
                  key={language.id}
                  onClick={() => handleLanguageChange(language.id)}
                  disabled={isTransitioning}
                  className={`
                    w-full flex items-center gap-2.5 px-3.5 py-2 text-left transition-all duration-150
                    ${
                      isSelected
                        ? 'bg-gray-200 dark:bg-gray-800/60 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/40'
                    }
                    ${isTransitioning ? 'cursor-not-allowed opacity-50' : ''}
                  `}
                >
                  <span className="text-lg flex-shrink-0">{language.flag}</span>
                  <span className="text-sm font-medium flex-1">{language.name}</span>
                  {isSelected && (
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* Coming Soon Languages */}
          {comingSoonLanguages.length > 0 && (
            <>
              <div className="border-t border-gray-300 dark:border-gray-700/50 my-1" />
              <div className="py-1">
                {comingSoonLanguages.map((language) => (
                  <div
                    key={language.id}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  >
                    <span className="text-lg flex-shrink-0 opacity-50">{language.flag}</span>
                    <span className="text-sm font-medium flex-1">{language.name}</span>
                    <svg className="w-3 h-3 text-gray-500 dark:text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

