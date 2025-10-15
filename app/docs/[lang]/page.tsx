import { notFound } from 'next/navigation';
import { docsClient } from '@/sanity/lib/client';
import { WELCOME_PAGE_QUERY, ALL_DOCS_QUERY } from '@/sanity/lib/doc-queries';
import { PortableText } from '@portabletext/react';
import { portableTextComponents } from '@/components/docs/PortableTextComponents';
import Link from 'next/link';

// Configuración de idiomas soportados
const supportedLanguages = ['es', 'en'] as const;

type SupportedLanguage = typeof supportedLanguages[number];

function isValidLanguage(lang: string): lang is SupportedLanguage {
  return supportedLanguages.includes(lang as SupportedLanguage);
}

export async function generateStaticParams() {
  return supportedLanguages.map((lang) => ({
    lang,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  
  if (!isValidLanguage(lang)) {
    return {
      title: 'Documentación no encontrada - APIDevs',
    };
  }

  // Fetch welcome page para metadata
  const welcomePage = await docsClient.fetch(WELCOME_PAGE_QUERY, { language: lang });

  return {
    title: welcomePage?.seo?.metaTitle || `${welcomePage?.title} - APIDevs`,
    description: welcomePage?.seo?.metaDescription || welcomePage?.description,
    keywords: welcomePage?.seo?.keywords,
  };
}

export default async function DocsLanguagePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isValidLanguage(lang)) {
    notFound();
  }

  // Fetch welcome page y documentos (excluyendo la misma página de bienvenida)
  const [welcomePage, docs] = await Promise.all([
    docsClient.fetch(WELCOME_PAGE_QUERY, { language: lang }),
    docsClient.fetch(ALL_DOCS_QUERY, { language: lang })
  ]);

  if (!welcomePage) {
    // Fallback si no existe welcome page
    return (
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 lg:pt-24 lg:pb-16 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          {lang === 'es' ? 'Documentación no disponible' : 'Documentation not available'}
        </h1>
        <p className="text-gray-400">
          {lang === 'es' 
            ? 'Por favor, crea una página de bienvenida en Sanity Studio.'
            : 'Please create a welcome page in Sanity Studio.'
          }
        </p>
      </div>
    );
  }
  
  // Filtrar la página de bienvenida de los docs para no duplicarla
  const filteredDocs = docs.filter((doc: any) => doc._id !== welcomePage._id);

  // Agrupar por categoría
  const docsByCategory = filteredDocs.reduce((acc: any, doc: any) => {
    const categorySlug = doc.categorySlug || 'uncategorized';
    if (!acc[categorySlug]) {
      acc[categorySlug] = {
        title: doc.categoryTitle || 'Sin Categoría',
        icon: doc.categoryIcon || '📄',
        docs: [],
      };
    }
    acc[categorySlug].docs.push(doc);
    return acc;
  }, {});

  const languageFlags = {
    es: '🇪🇸',
    en: '🇺🇸',
  };

  return (
    <div className="w-full pb-16">
      {/* Header con contenido de Sanity */}
      <header className="mb-12 lg:mb-16 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-4xl">{welcomePage.icon || '📚'}</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
            {welcomePage.title}
          </h1>
        </div>
        {welcomePage.description && (
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
            {welcomePage.description}
          </p>
        )}
      </header>

      {/* Contenido rico de la página de bienvenida */}
      {welcomePage.content && welcomePage.content.length > 0 && (
        <div className="mb-16 prose prose-invert prose-lg max-w-none">
          <PortableText 
            value={welcomePage.content} 
            components={portableTextComponents}
          />
        </div>
      )}

      {/* Documentos por categoría */}
      {Object.keys(docsByCategory).length > 0 && (
        <div className="space-y-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {lang === 'es' ? 'Toda la Documentación' : 'All Documentation'}
          </h2>
          
          {Object.entries(docsByCategory).map(([categorySlug, category]: [string, any]) => (
            <div key={categorySlug}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-1 h-6 bg-apidevs-primary rounded-full"></span>
                <span className="text-lg">{category.icon}</span>
                {category.title}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {category.docs.map((doc: any) => (
                  <Link
                    key={doc._id}
                    href={`/docs/${lang}/${doc.slug}`}
                    className="group flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/30 hover:bg-gray-100 dark:hover:bg-gray-900/50 border border-gray-200 dark:border-gray-800/50 hover:border-apidevs-primary/30 rounded-lg transition-all"
                  >
                    {doc.icon && (
                      <span className="text-xl flex-shrink-0">{doc.icon}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-apidevs-primary transition-colors truncate">
                        {doc.title}
                      </h4>
                      {doc.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">
                          {doc.description}
                        </p>
                      )}
                    </div>
                    <svg 
                      className="w-5 h-5 text-gray-400 dark:text-gray-600 group-hover:text-apidevs-primary transition-colors flex-shrink-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredDocs.length === 0 && (
        <div className="text-center py-16 px-4">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {lang === 'es' ? 'Sin documentos aún' : 'No documents yet'}
          </h3>
          <p className="text-gray-400 max-w-md mx-auto">
            {lang === 'es' 
              ? 'Los documentos aparecerán aquí cuando se publiquen en Sanity Studio.'
              : 'Documents will appear here when published in Sanity Studio.'
            }
          </p>
        </div>
      )}
    </div>
  );
}
