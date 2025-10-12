import { client } from '@/sanity/lib/client';
import { SIDEBAR_DOCS_QUERY, type SidebarData } from '@/sanity/lib/doc-queries';
import DocsSidebar from '@/components/docs/DocsSidebar';
import DocsHeader from '@/components/docs/DocsHeader';
import dynamic from 'next/dynamic';

// Cargar BackgroundEffects dinámicamente (es client component)
const BackgroundEffects = dynamic(
  () => import('@/components/ui/BackgroundEffects'),
  { ssr: false }
);

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
    <div className="docs-layout min-h-screen bg-apidevs-dark text-white relative">
      {/* Background Effects - Partículas espaciales */}
      <BackgroundEffects variant="minimal" showGrid={false} showParticles={true} />

      {/* Top Navigation Bar */}
      <DocsHeader />

      {/* Contenedor centrado que engloba todo */}
      <div className="max-w-[1800px] mx-auto pt-16 relative">
        <div className="flex">
          {/* Sidebar */}
          <DocsSidebar sidebarData={sidebarData} />

          {/* Main Content - flex-1 para tomar espacio restante */}
          <main className="flex-1 relative z-10 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

