import { Metadata } from 'next';
import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/Navbar';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { PropsWithChildren, Suspense } from 'react';
import { getURL } from '@/utils/helpers';
import 'styles/main.css';

// Importar fuentes de Google Fonts
import { Work_Sans } from 'next/font/google';

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
  weight: ['300', '400', '500', '600', '700']
});

const title = 'APIDevs Trading Platform - Indicadores VIP de Trading';
const description = 'Plataforma líder en indicadores de trading con 18 herramientas VIP, scanners de 160 criptos, comunidad Discord y alertas en tiempo real.';

export const metadata: Metadata = {
  metadataBase: new URL(getURL()),
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description
  }
};

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Jeko:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`bg-apidevs-dark ${workSans.variable} font-sans`}>
        <Navbar />
        <main
          id="skip"
          className=""
        >
          {children}
        </main>
        <Footer />
        <Suspense>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
