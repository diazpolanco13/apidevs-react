import { docsClient } from '@/sanity/lib/client';
import { SIDEBAR_DOCS_QUERY } from '@/sanity/lib/doc-queries';
import DocsSidebar from '@/components/docs/DocsSidebar';
import DocsHeader from '@/components/docs/DocsHeader';
import BackgroundEffects from '@/components/ui/BackgroundEffects';

// Configuración de idiomas soportados
const supportedLanguages = [
  { id: 'es', name: 'Español', flag: '🇪🇸' },
  { id: 'en', name: 'English', flag: '🇺🇸' },
] as const;

type SupportedLanguage = typeof supportedLanguages[number]['id'];

// Validar que el idioma sea soportado
function isValidLanguage(lang: string): lang is SupportedLanguage {
  return supportedLanguages.some(l => l.id === lang);
}

// Generar parámetros estáticos para todos los idiomas
export async function generateStaticParams() {
  return supportedLanguages.map((lang) => ({
    lang: lang.id,
  }));
}

// Metadata dinámico por idioma
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

  const languageInfo = supportedLanguages.find(l => l.id === lang);
  
  return {
    title: `Documentación ${languageInfo?.name} - APIDevs`,
    description: `Documentación completa de indicadores de trading en ${languageInfo?.name}`,
    openGraph: {
      title: `Documentación ${languageInfo?.name} - APIDevs`,
      description: `Documentación completa de indicadores de trading en ${languageInfo?.name}`,
      locale: lang === 'es' ? 'es_ES' : 'en_US',
    },
  };
}

export default async function DocsLanguageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  // Validar idioma
  if (!isValidLanguage(lang)) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Idioma no soportado</h1>
          <p className="text-gray-400 mb-8">El idioma "{lang}" no está disponible.</p>
          <a href="/docs/es" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
            Ir a Documentación en Español
          </a>
        </div>
      </div>
    );
  }

  // Fetch sidebar data para el idioma específico con manejo de errores
  let sidebarData;
  try {
    sidebarData = await docsClient.fetch(SIDEBAR_DOCS_QUERY, { language: lang });
  } catch (error) {
    console.error('Error fetching sidebar data:', error);
    // Fallback: datos vacíos si falla la query
    sidebarData = { categories: [] };
  }

  return (
    <div className="docs-layout min-h-screen relative bg-apidevs-dark">
      {/* Background Effects */}
      <BackgroundEffects variant="minimal" />
      
      {/* Header */}
      <DocsHeader currentLanguage={lang} />
      
      {/* Main Container */}
      <div className="max-w-[1800px] mx-auto pt-10 relative">
        <div className="flex">
          {/* Sidebar */}
          <DocsSidebar 
            sidebarData={sidebarData} 
            currentLanguage={lang}
          />
          
          {/* Main Content */}
          <main className="flex-1 relative z-10 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
