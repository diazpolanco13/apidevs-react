'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const SimpleCookieBanner = dynamic(() => import('@/components/SimpleCookieBanner'), { ssr: false });
const ChatWidget = dynamic(() => import('@/components/chat-widget'), { ssr: false });

export default function ClientBootstrap() {
  const pathname = usePathname();
  
  // Ocultar widget en chat-v2 (ya tiene su propio chat)
  const hideWidget = pathname?.startsWith('/chat-v2');
  
  return (
    <>
      <SimpleCookieBanner />
      {!hideWidget && <ChatWidget />}
    </>
  );
}


