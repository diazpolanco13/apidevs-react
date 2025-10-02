'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CookiePreferences {
  essential: boolean; // Siempre true, no se puede desactivar
  analytics: boolean;
  marketing: boolean;
}

interface CookieConsentContextType {
  hasConsent: boolean;
  preferences: CookiePreferences;
  showBanner: boolean;
  acceptAll: () => void;
  rejectOptional: () => void;
  setCustomPreferences: (prefs: Partial<CookiePreferences>) => void;
  resetConsent: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const STORAGE_KEY = 'cookies_consent';
const PREFERENCES_KEY = 'cookie_preferences';

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
};

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [hasConsent, setHasConsent] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [showBanner, setShowBanner] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Cargar preferencias guardadas al montar
  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const savedConsent = localStorage.getItem(STORAGE_KEY);
      const savedPreferences = localStorage.getItem(PREFERENCES_KEY);

      if (savedConsent === 'accepted') {
        setHasConsent(true);
        setShowBanner(false);
        
        if (savedPreferences) {
          try {
            const parsed = JSON.parse(savedPreferences);
            setPreferences({ ...defaultPreferences, ...parsed });
          } catch (e) {
            console.error('Error parsing cookie preferences:', e);
          }
        }
      } else {
        // Mostrar banner después de 1 segundo para no ser intrusivo
        setTimeout(() => {
          setShowBanner(true);
        }, 1000);
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'accepted');
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
      
      // Guardar también flags individuales para acceso rápido
      localStorage.setItem('analytics_enabled', prefs.analytics.toString());
      localStorage.setItem('marketing_enabled', prefs.marketing.toString());
    }
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    
    setPreferences(allAccepted);
    setHasConsent(true);
    setShowBanner(false);
    savePreferences(allAccepted);
  };

  const rejectOptional = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    
    setPreferences(essentialOnly);
    setHasConsent(true);
    setShowBanner(false);
    savePreferences(essentialOnly);
  };

  const setCustomPreferences = (customPrefs: Partial<CookiePreferences>) => {
    const newPreferences: CookiePreferences = {
      essential: true, // Siempre true
      analytics: customPrefs.analytics ?? preferences.analytics,
      marketing: customPrefs.marketing ?? preferences.marketing,
    };
    
    setPreferences(newPreferences);
    setHasConsent(true);
    setShowBanner(false);
    savePreferences(newPreferences);
  };

  const resetConsent = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PREFERENCES_KEY);
      localStorage.removeItem('analytics_enabled');
      localStorage.removeItem('marketing_enabled');
    }
    
    setPreferences(defaultPreferences);
    setHasConsent(false);
    setShowBanner(true);
  };

  // No renderizar hasta que esté montado (evita hydration mismatch)
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <CookieConsentContext.Provider
      value={{
        hasConsent,
        preferences,
        showBanner,
        acceptAll,
        rejectOptional,
        setCustomPreferences,
        resetConsent,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}

