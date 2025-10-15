import { docsClient } from '@/sanity/lib/client';
import { groq } from 'next-sanity';
import ClaudeStyleNavbar from '@/components/docs/ClaudeStyleNavbar';
import ClaudeStyleTabs from '@/components/docs/ClaudeStyleTabs';
import ClaudeSidebarWrapper from '@/components/docs/ClaudeSidebarWrapper';
import BackgroundEffects from '@/components/ui/BackgroundEffects';
import { ThemeProvider } from '@/components/docs/ThemeProvider';

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

  // Fetch categorías con sus páginas para tabs y sidebar
  let categories = [];
  
  try {
    const categoriesQuery = groq`
      *[_type == "docCategory" && language == $language] | order(order asc) {
        _id,
        title,
        slug,
        icon,
        order,
        "pages": *[_type == "documentation" && category._ref == ^._id && language == $language && !(slug.current in ["bienvenido-a-apidevs", "welcome"])] | order(order asc) {
          _id,
          title,
          "slug": slug.current,
          icon,
          description,
          order
        }
      }
    `;
    categories = await docsClient.fetch(categoriesQuery, { language: lang });
  } catch (error) {
    console.error('Error fetching categories:', error);
    categories = [];
  }

  return (
    <ThemeProvider>
      <div className="docs-layout min-h-screen relative bg-white dark:bg-[#0A0A0A] transition-colors duration-200">
        {/* Background Effects */}
        <BackgroundEffects variant="minimal" />
        
        {/* Claude Style Navbar */}
        <ClaudeStyleNavbar currentLanguage={lang} />
        
        {/* Claude Style Navigation Tabs */}
        <ClaudeStyleTabs categories={categories} currentLanguage={lang} />
        
        {/* Main Content with Sidebar - con padding-top para navbar + tabs */}
        <div className="pt-28 relative">
          {/* Contenedor centrado que engloba sidebar + contenido + TOC */}
          <div className="max-w-[1400px] mx-auto px-8 sm:px-12 lg:px-16">
            <div className="flex gap-8">
              {/* Sidebar IZQUIERDO - Lista de páginas de la categoría */}
              <ClaudeSidebarWrapper 
                categories={categories}
                currentLanguage={lang}
              />
              
              {/* Content Container - Centro */}
              <main className="flex-1 relative z-10 min-w-0">
                {children}
              </main>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
