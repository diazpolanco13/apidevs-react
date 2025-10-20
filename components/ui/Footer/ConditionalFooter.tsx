'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Ocultar footer en rutas del dashboard de usuario, admin, documentación y chat
  const hideFooter = 
    pathname?.startsWith('/account') || 
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/docs') ||
    pathname?.startsWith('/chat-v2');
  
  if (hideFooter) {
    return null;
  }
  
  return <Footer />;
}

