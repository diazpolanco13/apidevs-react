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
    <div className="min-h-screen bg-apidevs-dark">
      {/* Hero Section - Mintlify Style */}
      <div className="border-b border-gray-800/50 bg-gradient-to-b from-gray-900/20 to-transparent">
        <div className="max-w-4xl mx-auto px-8 py-16 md:py-24">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Documentation
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
            Everything you need to know about using APIDevs Trading Platform
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Quick Start Cards - Mintlify Style */}
        <div className="grid md:grid-cols-2 gap-4 mb-16">
          <Link
            href="/docs/quickstart"
            className="group relative overflow-hidden p-6 bg-gradient-to-br from-apidevs-primary/5 to-transparent border border-gray-800 hover:border-apidevs-primary/30 rounded-xl transition-all hover:shadow-lg hover:shadow-apidevs-primary/5"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 bg-apidevs-primary/10 rounded-lg">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-lg font-bold text-white">Quick Start</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                Get up and running in minutes with our quick start guide
              </p>
              <div className="flex items-center gap-2 text-apidevs-primary font-medium text-sm">
                <span>Get started</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-apidevs-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link
            href="/docs/api-reference"
            className="group relative overflow-hidden p-6 bg-gradient-to-br from-purple-500/5 to-transparent border border-gray-800 hover:border-purple-500/30 rounded-xl transition-all hover:shadow-lg hover:shadow-purple-500/5"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-500/10 rounded-lg">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="text-lg font-bold text-white">API Reference</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                Complete reference for all our APIs and integrations
              </p>
              <div className="flex items-center gap-2 text-purple-400 font-medium text-sm">
                <span>Explore API</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>

        {/* All Docs by Category - Mintlify Style */}
        {Object.keys(docsByCategory).length > 0 && (
          <div className="space-y-12">
            {Object.entries(docsByCategory).map(([category, categoryDocs]) => (
              <div key={category}>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-1 h-5 bg-apidevs-primary rounded-full"></span>
                  {category}
                </h2>
                <div className="grid gap-3">
                  {categoryDocs.map((doc) => (
                    <Link
                      key={doc._id}
                      href={`/docs/${doc.slug}`}
                      className="group flex items-center gap-3 p-4 bg-gray-900/30 hover:bg-gray-900/50 border border-gray-800/50 hover:border-gray-700 rounded-lg transition-all"
                    >
                      {doc.icon && (
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-800/50 rounded-md flex-shrink-0">
                          <span className="text-lg">{doc.icon}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white group-hover:text-apidevs-primary transition-colors mb-0.5">
                          {doc.title}
                        </h3>
                        {doc.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {doc.description}
                          </p>
                        )}
                      </div>
                      <svg className="w-5 h-5 text-gray-600 group-hover:text-apidevs-primary group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State - Mintlify Style */}
        {docs.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900/50 rounded-2xl mb-6">
              <span className="text-4xl">📝</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              No documentation yet
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
              Documentation pages will appear here once they are created in Sanity Studio
            </p>
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 px-6 py-3 bg-apidevs-primary hover:bg-apidevs-primary/90 text-black font-semibold rounded-lg transition-all shadow-lg shadow-apidevs-primary/20"
            >
              <span>Open Sanity Studio</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
