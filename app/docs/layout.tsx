import { client } from '@/sanity/lib/client';
import { SIDEBAR_DOCS_QUERY, type SidebarData } from '@/sanity/lib/doc-queries';
import DocsSidebar from '@/components/docs/DocsSidebar';
import DocsSearch from '@/components/docs/DocsSearch';

export const revalidate = 3600; // Revalidar cada hora

async function getSidebarData(): Promise<SidebarData> {
  try {
    const data = await client.fetch<SidebarData>(
      SIDEBAR_DOCS_QUERY,
      {},
      {
        next: {
          revalidate: 3600,
          tags: ['docs-sidebar']
        }
      }
    );
    return data;
  } catch (error) {
    console.error('Error fetching sidebar data:', error);
    return { categories: [] };
  }
}

export default async function DocsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const sidebarData = await getSidebarData();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-sm border-b border-gray-800 z-40">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <a href="/" className="text-xl font-bold">
              <span className="bg-gradient-to-r from-apidevs-primary to-purple-500 bg-clip-text text-transparent">
                APIDevs
              </span>
            </a>
            
            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-6">
              <a
                href="/docs"
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Documentation
              </a>
              <a
                href="/indicadores"
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Indicators
              </a>
              <a
                href="/pricing"
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Pricing
              </a>
            </nav>
          </div>

          {/* Search + CTA */}
          <div className="flex items-center gap-4">
            <DocsSearch />
            <a
              href="/signin"
              className="hidden sm:block px-4 py-2 bg-apidevs-primary hover:bg-apidevs-primary-dark text-black font-semibold rounded-lg transition-colors text-sm"
            >
              Get started
            </a>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <DocsSidebar sidebarData={sidebarData} />

      {/* Main Content */}
      <main className="ml-64 pt-16">
        {children}
      </main>
    </div>
  );
}

