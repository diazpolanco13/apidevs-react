import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { client } from '@/sanity/lib/client';
import {
  DOC_BY_SLUG_QUERY,
  DOC_SLUGS_QUERY,
  type DocPage
} from '@/sanity/lib/doc-queries';
import { portableTextComponents } from '@/components/docs/PortableTextComponents';
import TableOfContents from '@/components/docs/TableOfContents';

export const revalidate = 0; // Development: siempre fresh data
export const dynamicParams = true; // Permitir rutas dinámicas en dev

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(DOC_SLUGS_QUERY);
  return slugs.map((slug) => ({ slug }));
}

async function getDocBySlug(slug: string): Promise<DocPage | null> {
  try {
    const doc = await client.fetch<DocPage>(
      DOC_BY_SLUG_QUERY,
      { slug },
      {
        next: {
          revalidate: 0, // Development: siempre fresh data
          tags: [`doc:${slug}`]
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

export default async function DocPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const doc = await getDocBySlug(slug);

    if (!doc) {
      notFound();
    }

    const headings = extractHeadings(doc.content);
    const lastUpdated = doc.updatedAt
      ? new Date(doc.updatedAt).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : null;

    return (
      <>
        {/* Main Content */}
        <article className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 xl:pr-80">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-6 flex-wrap">
            <Link href="/docs" className="hover:text-white transition-colors">
              Docs
            </Link>
            <span>/</span>
            {doc.category && (
              <>
                <Link
                  href={`/docs?category=${doc.category.slug}`}
                  className="hover:text-white transition-colors truncate"
                >
                  {doc.category.title}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-white truncate">{doc.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-8 lg:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              {doc.title}
            </h1>
            {doc.description && (
              <p className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed">
                {doc.description}
              </p>
            )}
            {lastUpdated && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mt-4">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Last updated: {lastUpdated}</span>
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
                  href={`/docs/${doc.previousPage.slug}`}
                  className="group p-3 sm:p-4 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-gray-700 hover:bg-gray-900 transition-all"
                >
                  <div className="text-xs text-gray-500 mb-1">Previous</div>
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
                  href={`/docs/${doc.nextPage.slug}`}
                  className="group p-3 sm:p-4 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-gray-700 hover:bg-gray-900 transition-all text-right"
                >
                  <div className="text-xs text-gray-500 mb-1">Next</div>
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
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {doc.relatedPages.map((page) => (
                  <Link
                    key={page.slug}
                    href={`/docs/${page.slug}`}
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

        {/* Table of Contents - Fixed Right Side */}
        <TableOfContents headings={headings} />
      </>
    );
  } catch (error) {
    console.error('Error in DocPage:', error);
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error interno del servidor</h1>
          <p className="text-gray-400 mb-8">Ha ocurrido un error al cargar el documento.</p>
          <Link href="/docs" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
            Volver a Docs
          </Link>
        </div>
      </div>
    );
  }
}

