import { client } from '@/sanity/lib/client';
import { SIDEBAR_DOCS_QUERY, type SidebarData } from '@/sanity/lib/doc-queries';
import DocsSidebar from '@/components/docs/DocsSidebar';
import DocsHeader from '@/components/docs/DocsHeader';

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
      <DocsHeader />

      {/* Sidebar */}
      <DocsSidebar sidebarData={sidebarData} />

      {/* Main Content */}
      <main className="ml-64 pt-16">
        {children}
      </main>
    </div>
  );
}

