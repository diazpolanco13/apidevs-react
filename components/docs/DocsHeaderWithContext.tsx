'use client';

import DocsHeader from './DocsHeader';

// Este componente ya no necesita context porque el selector de idioma
// se movió al sidebar del footer
export default function DocsHeaderWithContext() {
  return <DocsHeader />;
}

