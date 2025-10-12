import { notFound } from 'next/navigation';
import { docsClient } from '@/sanity/lib/client';
import { ALL_DOCS_QUERY } from '@/sanity/lib/doc-queries';
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

  const languageNames = {
    es: 'Español',
    en: 'English',
  };

  return {
    title: `Documentación ${languageNames[lang]} - APIDevs`,
    description: `Documentación completa de indicadores de trading en ${languageNames[lang]}`,
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

  // Fetch todos los documentos para este idioma
  const docs = await docsClient.fetch(ALL_DOCS_QUERY, { language: lang });

  // Agrupar por categoría
  const docsByCategory = docs.reduce((acc: any, doc: any) => {
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

  const languageNames = {
    es: 'Español',
    en: 'English',
  };

  const languageFlags = {
    es: '🇪🇸',
    en: '🇺🇸',
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 lg:pt-24 lg:pb-16">
      {/* Header */}
      <header className="mb-8 lg:mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{languageFlags[lang]}</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Documentación {languageNames[lang]}
          </h1>
        </div>
        <p className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed max-w-3xl">
          {lang === 'es' 
            ? 'Bienvenido a la documentación completa de APIDevs. Aquí encontrarás guías, tutoriales y recursos para dominar nuestros indicadores de trading.'
            : 'Welcome to APIDevs complete documentation. Here you\'ll find guides, tutorials and resources to master our trading indicators.'
          }
        </p>
      </header>

      {/* Categories Grid */}
      <div className="space-y-8">
        {Object.entries(docsByCategory).map(([categorySlug, category]: [string, any]) => (
          <section key={categorySlug} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">{category.icon}</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {category.title}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.docs.map((doc: any) => (
                <Link
                  key={doc._id}
                  href={`/docs/${lang}/${doc.slug}`}
                  className="group p-4 sm:p-6 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-gray-700 hover:bg-gray-900 transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-lg flex-shrink-0">{doc.icon || '📄'}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white group-hover:text-apidevs-primary transition-colors text-sm sm:text-base mb-2">
                        {doc.title}
                      </h3>
                      {doc.description && (
                        <p className="text-xs sm:text-sm text-gray-400 line-clamp-3">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {doc.publishedAt && (
                    <div className="text-xs text-gray-500 mt-3">
                      {new Date(doc.publishedAt).toLocaleDateString(
                        lang === 'es' ? 'es-ES' : 'en-US',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Empty State */}
      {docs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {lang === 'es' ? 'Documentación en desarrollo' : 'Documentation in development'}
          </h3>
          <p className="text-gray-400 mb-6">
            {lang === 'es' 
              ? 'Estamos trabajando en la documentación para este idioma. Pronto estará disponible.'
              : 'We\'re working on documentation for this language. It will be available soon.'
            }
          </p>
          <Link
            href="/docs/es"
            className="inline-flex items-center gap-2 px-4 py-2 bg-apidevs-primary text-black font-medium rounded-lg hover:bg-apidevs-primary/90 transition-colors"
          >
            <span>🇪🇸</span>
            {lang === 'es' ? 'Ver Documentación en Español' : 'View Documentation in Spanish'}
          </Link>
        </div>
      )}
    </div>
  );
}
