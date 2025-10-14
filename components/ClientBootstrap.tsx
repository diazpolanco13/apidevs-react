'use client';

import dynamic from 'next/dynamic';

const SimpleCookieBanner = dynamic(() => import('@/components/SimpleCookieBanner'), { ssr: false });
const ChatWidget = dynamic(() => import('@/components/chat-widget'), { ssr: false });

export default function ClientBootstrap() {
  return (
    <>
      <SimpleCookieBanner />
      <ChatWidget />
    </>
  );
}


