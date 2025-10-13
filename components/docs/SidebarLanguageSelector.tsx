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
      {/* Trigger Button - EXACTO tu imagen */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isTransitioning}
        className={`
          w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg
          border-2 transition-all duration-200
          ${isOpen 
            ? 'bg-[#2d3748] border-apidevs-primary text-white' 
            : 'bg-[#1a202c] border-transparent text-gray-300 hover:bg-[#2d3748]'
          }
          ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        aria-label="Select language"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-xs font-bold text-gray-500 flex-shrink-0 w-6">{currentLang.code}</span>
          <span className="text-sm font-medium truncate">{currentLang.name}</span>
        </div>
        <svg
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu - EXACTO tu imagen */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1e293b] border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
          {/* Available Languages */}
          <div className="py-1.5">
            {availableLanguages.map((language) => {
              const isSelected = language.id === currentLanguage;

              return (
                <button
                  key={language.id}
                  onClick={() => handleLanguageChange(language.id)}
                  disabled={isTransitioning}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150
                    ${
                      isSelected
                        ? 'bg-[#2d3748] text-apidevs-primary'
                        : 'text-gray-300 hover:bg-[#2d3748]'
                    }
                    ${isTransitioning ? 'cursor-not-allowed opacity-50' : ''}
                  `}
                >
                  <span className="text-xs font-bold text-gray-500 flex-shrink-0 w-6">{language.code}</span>
                  <span className="text-sm font-medium flex-1">{language.name}</span>
                  {isSelected && (
                    <svg className="w-5 h-5 text-apidevs-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
              <div className="border-t border-gray-700/50" />
              <div className="py-1.5">
                {comingSoonLanguages.map((language) => (
                  <div
                    key={language.id}
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-600 cursor-not-allowed opacity-50"
                  >
                    <span className="text-xs font-bold flex-shrink-0 w-6">{language.code}</span>
                    <span className="text-sm font-medium flex-1">{language.name}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wide text-gray-600 flex-shrink-0">SOON</span>
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

