export const revalidate = 3600; // Revalidar cada hora

export default async function DocsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Este layout ya no necesita navbar ni efectos
  // Todo se maneja en [lang]/layout.tsx
  return <>{children}</>;
}

