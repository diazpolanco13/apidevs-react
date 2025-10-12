import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function DocsPage() {
  // Redirigir a la nueva estructura con idioma español por defecto
  redirect('/docs/es');
}
