import DocsHeader from '@/components/docs/DocsHeader';
import ClientBackgroundEffects from '@/components/ClientBackgroundEffects';

export const revalidate = 3600; // Revalidar cada hora

export default async function DocsLayout({
  children
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="docs-layout min-h-screen bg-apidevs-dark text-white relative">
      {/* Background Effects - Partículas espaciales */}
      <ClientBackgroundEffects variant="minimal" showGrid={false} showParticles={true} />

      {/* Top Navigation Bar */}
      <DocsHeader />

      {/* Contenedor centrado que engloba todo */}
      <div className="max-w-[1800px] mx-auto pt-8 sm:pt-10 relative">
        {/* Main Content - sin sidebar aquí, se maneja en [lang]/layout.tsx */}
        <main className="relative z-10 min-w-0 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

