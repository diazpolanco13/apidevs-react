'use client';

import { usePathname } from 'next/navigation';
import DocsHeader from './DocsHeader';

interface DocsHeaderWithContextProps {
  currentLanguage: string;
  docsMap?: Record<string, string>; // slug -> docId mapping
}

export default function DocsHeaderWithContext({ 
  currentLanguage,
  docsMap = {}
}: DocsHeaderWithContextProps) {
  const pathname = usePathname();
  
  // Extraer el slug actual del pathname
  const pathParts = pathname.split('/');
  const docsIndex = pathParts.findIndex(part => part === 'docs');
  const currentSlug = docsIndex !== -1 && pathParts[docsIndex + 2] ? pathParts[docsIndex + 2] : null;
  
  // Obtener el docId desde el map
  const currentDocId = currentSlug ? docsMap[currentSlug] : undefined;

  return (
    <DocsHeader 
      currentLanguage={currentLanguage}
      currentDocId={currentDocId}
    />
  );
}

