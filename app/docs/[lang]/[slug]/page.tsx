import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { docsClient } from '@/sanity/lib/client';
import {
  DOC_BY_SLUG_QUERY,
  DOC_SLUGS_QUERY,
  type DocPage
} from '@/sanity/lib/doc-queries';
import { portableTextComponents } from '@/components/docs/PortableTextComponents';
import TableOfContentsRight from '@/components/docs/TableOfContentsRight';

// Configuración de idiomas soportados
const supportedLanguages = ['es', 'en'] as const;

type SupportedLanguage = typeof supportedLanguages[number];

function isValidLanguage(lang: string): lang is SupportedLanguage {
  return supportedLanguages.includes(lang as SupportedLanguage);
}

export const revalidate = 0; // Development: siempre fresh data
export const dynamicParams = true; // Permitir rutas dinámicas en dev

export async function generateStaticParams() {
  const languages = supportedLanguages;
  const slugsPromises = languages.map(async (lang) => {
    const slugs = await docsClient.fetch<string[]>(DOC_SLUGS_QUERY, { language: lang });
    return slugs.map((slug) => ({ lang, slug }));
  });
  
  const allParams = await Promise.all(slugsPromises);
  return allParams.flat();
}

async function getDocBySlug(slug: string, language: string): Promise<DocPage | null> {
  try {
    const doc = await docsClient.fetch<DocPage>(
      DOC_BY_SLUG_QUERY,
      { slug, language },
      {
        next: {
          revalidate: 0, // Development: siempre fresh data
          tags: [`doc:${slug}:${language}`]
        }
      }
    );
    return doc;
  } catch (error) {
    console.error('Error fetching doc:', error);
    return null;
  }
}

// Extraer headings del contenido para TOC
function extractHeadings(content: any[]): Array<{ id: string; text: string; level: number }> {
  if (!content || !Array.isArray(content)) return [];

  try {
    const existingIds = new Set<string>();

    return content
      .filter((block) => block?._type === 'block' && ['h1', 'h2', 'h3', 'h4'].includes(block?.style))
      .map((block) => {
        const text = block?.children
          ?.map((child: any) => child?.text || '')
          .join('') || '';

        // Generar ID único evitando duplicados
        let id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Si el ID ya existe, agregar un sufijo numérico
        let counter = 1;
        let uniqueId = id;
        while (existingIds.has(uniqueId)) {
          uniqueId = `${id}-${counter}`;
          counter++;
        }
        existingIds.add(uniqueId);

        return {
          id: uniqueId,
          text,
          level: parseInt(block?.style?.replace('h', '') || '1')
        };
      });
  } catch (error) {
    console.error('Error extracting headings:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;

  if (!isValidLanguage(lang)) {
    return {
      title: 'Documentación no encontrada - APIDevs',
    };
  }

  const doc = await getDocBySlug(slug, lang);

  if (!doc) {
    return {
      title: 'Documentación no encontrada - APIDevs',
    };
  }

  const languageNames = {
    es: 'Español',
    en: 'English',
  };

  return {
    title: `${doc.title} - ${languageNames[lang]} - APIDevs`,
    description: doc.description || doc.seo?.metaDescription,
    keywords: doc.seo?.keywords,
    openGraph: {
      title: `${doc.title} - ${languageNames[lang]}`,
      description: doc.description || doc.seo?.metaDescription,
      locale: lang === 'es' ? 'es_ES' : 'en_US',
      images: (doc.seo as any)?.ogImage ? [{ url: (doc.seo as any).ogImage }] : undefined,
    },
  };
}

export default async function DocPage({
  params
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;

  if (!isValidLanguage(lang)) {
    notFound();
  }

  try {
    const doc = await getDocBySlug(slug, lang);

    if (!doc) {
      notFound();
    }

    const headings = extractHeadings(doc.content);
    const lastUpdated = doc.updatedAt
      ? new Date(doc.updatedAt).toLocaleDateString(
          lang === 'es' ? 'es-ES' : 'en-US',
          {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }
        )
      : null;

    const languageNames = {
      es: 'Español',
      en: 'English',
    };

    const languageFlags = {
      es: '🇪🇸',
      en: '🇺🇸',
    };

    return (
      <div className="flex gap-8">
        {/* Main Content */}
        <article className="flex-1 pb-16 max-w-3xl min-w-0">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-6 flex-wrap">
            <Link href={`/docs/${lang}`} className="hover:text-gray-900 dark:hover:text-white transition-colors">
              {languageFlags[lang]} Docs
            </Link>
            <span>/</span>
            {doc.category && (
              <>
                <Link
                  href={`/docs/${lang}?category=${doc.category.slug}`}
                  className="hover:text-gray-900 dark:hover:text-white transition-colors truncate"
                >
                  {doc.category.title}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-900 dark:text-white truncate">{doc.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-8 lg:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {doc.title}
            </h1>
            {doc.description && (
              <p className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-400 leading-relaxed">
                {doc.description}
              </p>
            )}
            {lastUpdated && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-4">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {lang === 'es' ? 'Última actualización:' : 'Last updated:'} {lastUpdated}
                </span>
              </div>
            )}
          </header>

          {/* Content */}
          <div className="prose prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none">
            <PortableText value={doc.content} components={portableTextComponents} />
          </div>

          {/* Navigation */}
          {(doc.previousPage || doc.nextPage) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-12 lg:mt-16 pt-6 lg:pt-8 border-t border-gray-800">
              {doc.previousPage ? (
                <Link
                  href={`/docs/${lang}/${doc.previousPage.slug}`}
                  className="group p-3 sm:p-4 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-gray-700 hover:bg-gray-900 transition-all"
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {lang === 'es' ? 'Anterior' : 'Previous'}
                  </div>
                  <div className="flex items-center gap-2 text-white group-hover:text-apidevs-primary transition-colors">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium text-sm truncate">{doc.previousPage.title}</span>
                  </div>
                </Link>
              ) : (
                <div className="hidden sm:block"></div>
              )}
              {doc.nextPage && (
                <Link
                  href={`/docs/${lang}/${doc.nextPage.slug}`}
                  className="group p-3 sm:p-4 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-gray-700 hover:bg-gray-900 transition-all text-right"
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {lang === 'es' ? 'Siguiente' : 'Next'}
                  </div>
                  <div className="flex items-center justify-end gap-2 text-white group-hover:text-apidevs-primary transition-colors">
                    <span className="font-medium text-sm truncate">{doc.nextPage.title}</span>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              )}
            </div>
          )}

          {/* Related Pages */}
          {doc.relatedPages && doc.relatedPages.length > 0 && (
            <div className="mt-12 lg:mt-16 pt-6 lg:pt-8 border-t border-gray-800">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
                {lang === 'es' ? 'Artículos Relacionados' : 'Related Articles'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {doc.relatedPages.map((page) => (
                  <Link
                    key={page.slug}
                    href={`/docs/${lang}/${page.slug}`}
                    className="group p-3 sm:p-4 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-gray-700 hover:bg-gray-900 transition-all"
                  >
                    <h4 className="font-semibold text-white mb-1 group-hover:text-apidevs-primary transition-colors text-sm sm:text-base">
                      {page.title}
                    </h4>
                    {page.description && (
                      <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">
                        {page.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Table of Contents - DERECHO */}
        <TableOfContentsRight content={doc.content} />
      </div>
    );
  } catch (error) {
    console.error('Error in DocPage:', error);
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            {lang === 'es' ? 'Error interno del servidor' : 'Internal server error'}
          </h1>
          <p className="text-gray-400 mb-8">
            {lang === 'es' 
              ? 'Ha ocurrido un error al cargar el documento.'
              : 'An error occurred while loading the document.'
            }
          </p>
          <Link href={`/docs/${lang}`} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
            {lang === 'es' ? 'Volver a Docs' : 'Back to Docs'}
          </Link>
        </div>
      </div>
    );
  }
}
