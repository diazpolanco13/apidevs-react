import Link from 'next/link';
import { client } from '@/sanity/lib/client';
import { ALL_DOCS_QUERY, type DocListItem } from '@/sanity/lib/doc-queries';

export const revalidate = 3600;

async function getAllDocs(): Promise<DocListItem[]> {
  try {
    const docs = await client.fetch<DocListItem[]>(
      ALL_DOCS_QUERY,
      {},
      {
        next: {
          revalidate: 3600,
          tags: ['all-docs']
        }
      }
    );
    return docs;
  } catch (error) {
    console.error('Error fetching docs:', error);
    return [];
  }
}

export default async function DocsPage() {
  const docs = await getAllDocs();

  // Agrupar por categoría
  const docsByCategory = docs.reduce((acc, doc) => {
    const category = doc.categoryTitle || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(doc);
    return acc;
  }, {} as Record<string, DocListItem[]>);

  return (
    <div className="max-w-5xl mx-auto px-8 py-16">
      {/* Hero */}
      <div className="mb-16">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-4">
          Documentation
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl">
          Everything you need to know about using APIDevs Trading Platform
        </p>
      </div>

      {/* Quick Start Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        <Link
          href="/docs/quickstart"
          className="group p-6 bg-gradient-to-br from-apidevs-primary/10 to-purple-500/10 border border-apidevs-primary/20 rounded-xl hover:border-apidevs-primary/40 transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🚀</span>
            <h3 className="text-xl font-bold text-white">Quick Start</h3>
          </div>
          <p className="text-gray-400">
            Get up and running in minutes with our quick start guide
          </p>
          <div className="mt-4 flex items-center gap-2 text-apidevs-primary font-medium">
            <span>Get started</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link
          href="/docs/api-reference"
          className="group p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl hover:border-purple-500/40 transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">📚</span>
            <h3 className="text-xl font-bold text-white">API Reference</h3>
          </div>
          <p className="text-gray-400">
            Complete reference for all our APIs and integrations
          </p>
          <div className="mt-4 flex items-center gap-2 text-purple-400 font-medium">
            <span>Explore API</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* All Docs by Category */}
      <div className="space-y-12">
        {Object.entries(docsByCategory).map(([category, categoryDocs]) => (
          <div key={category}>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-1 h-6 bg-apidevs-primary rounded-full"></span>
              {category}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {categoryDocs.map((doc) => (
                <Link
                  key={doc._id}
                  href={`/docs/${doc.slug}`}
                  className="group p-4 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-gray-700 hover:bg-gray-900 transition-all"
                >
                  <div className="flex items-start gap-3">
                    {doc.icon && (
                      <span className="text-xl flex-shrink-0">{doc.icon}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-1 group-hover:text-apidevs-primary transition-colors">
                        {doc.title}
                      </h3>
                      {doc.description && (
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {doc.description}
                        </p>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-apidevs-primary group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {docs.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            No documentation yet
          </h3>
          <p className="text-gray-400 mb-6">
            Documentation pages will appear here once they are created in Sanity Studio
          </p>
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 px-6 py-3 bg-apidevs-primary hover:bg-apidevs-primary-dark text-black font-semibold rounded-lg transition-colors"
          >
            <span>Open Sanity Studio</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}

