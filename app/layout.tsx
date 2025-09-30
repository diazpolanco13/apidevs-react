import { Metadata } from 'next';
import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/Navbar';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { ConfirmEmailDialog } from '@/components/ui/ConfirmEmailDialog';
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
  },
  icons: {
    icon: [
      { url: '/favicon_io/favicon.ico' },
      { url: '/favicon_io/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon_io/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/favicon_io/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'apple-touch-icon', url: '/favicon_io/apple-touch-icon.png' },
      { rel: 'android-chrome-192x192', url: '/favicon_io/android-chrome-192x192.png' },
      { rel: 'android-chrome-512x512', url: '/favicon_io/android-chrome-512x512.png' }
    ]
  }
};

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/favicon_io/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/favicon_io/site.webmanifest" />
        <meta name="theme-color" content="#00ff88" />
      </head>
      <body className={`bg-apidevs-dark ${workSans.variable} font-sans h-full`}>
        <Navbar />
        <main id="skip" className="">
          {children}
        </main>
        <Footer />
        <Suspense>
          <Toaster />
        </Suspense>
        <ConfirmEmailDialog />
      </body>
    </html>
  );
}
