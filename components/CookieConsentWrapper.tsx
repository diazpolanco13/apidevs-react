'use client';

import { CookieConsentProvider } from '@/contexts/CookieConsentContext';
import CookieBanner from '@/components/CookieBanner';
import { ReactNode } from 'react';

export default function CookieConsentWrapper({ children }: { children: ReactNode }) {
  return (
    <CookieConsentProvider>
      {children}
      <CookieBanner />
    </CookieConsentProvider>
  );
}

