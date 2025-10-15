'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import ClaudeSidebar from './ClaudeSidebar';

interface SidebarPage {
  _id: string;
  title: string;
  slug: string;
  icon?: string;
  description?: string;
}

interface SidebarCategory {
  _id: string;
  title: string;
  slug: { current: string };
  icon?: string;
  pages: SidebarPage[];
}

interface ClaudeSidebarWrapperProps {
  categories: SidebarCategory[];
  currentLanguage: string;
}

export default function ClaudeSidebarWrapper({ 
  categories, 
  currentLanguage 
}: ClaudeSidebarWrapperProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // Obtener categoría del query param
  let selectedCategorySlug = searchParams.get('category');
  
  // Si no hay query param, intentar detectar la categoría desde la URL actual
  if (!selectedCategorySlug && pathname) {
    // Extraer el slug de la página de la URL: /docs/es/guia-de-inicio -> "guia-de-inicio"
    const pathParts = pathname.split('/');
    const pageSlug = pathParts[pathParts.length - 1];
    
    // Buscar en qué categoría está esta página
    if (pageSlug && pageSlug !== 'es' && pageSlug !== 'en') {
      for (const category of categories) {
        const pageExists = category.pages.some(page => page.slug === pageSlug);
        if (pageExists) {
          selectedCategorySlug = category.slug.current;
          break;
        }
      }
    }
  }

  return (
    <ClaudeSidebar 
      categories={categories}
      currentLanguage={currentLanguage}
      selectedCategorySlug={selectedCategorySlug || undefined}
    />
  );
}

