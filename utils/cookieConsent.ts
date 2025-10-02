// ✅ Utilidad SIMPLE para manejar consentimiento de cookies
// Sin Context API - Solo LocalStorage directo

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = 'apidevs_cookie_consent';
const PREFERENCES_KEY = 'apidevs_cookie_preferences';

// Preferencias por defecto (TODAS activas - usuario puede desactivar)
const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: true,
  marketing: true,
};

/**
 * Verificar si el usuario ya dio su consentimiento
 */
export function hasGivenConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === 'accepted';
}

/**
 * Obtener las preferencias actuales del usuario
 */
export function getCookiePreferences(): CookiePreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  
  const saved = localStorage.getItem(PREFERENCES_KEY);
  if (!saved) return DEFAULT_PREFERENCES;
  
  try {
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Guardar preferencias del usuario
 */
export function saveCookiePreferences(prefs: CookiePreferences): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(STORAGE_KEY, 'accepted');
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  
  // Guardar flags individuales para acceso rápido
  localStorage.setItem('apidevs_analytics_enabled', prefs.analytics.toString());
  localStorage.setItem('apidevs_marketing_enabled', prefs.marketing.toString());
  
  // Disparar evento personalizado para que otros componentes se actualicen
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: prefs }));
  }
}

/**
 * Aceptar todas las cookies
 */
export function acceptAllCookies(): void {
  saveCookiePreferences({
    essential: true,
    analytics: true,
    marketing: true,
  });
}

/**
 * Aceptar solo cookies esenciales
 */
export function acceptEssentialOnly(): void {
  saveCookiePreferences({
    essential: true,
    analytics: false,
    marketing: false,
  });
}

/**
 * Resetear consentimiento (para testing)
 */
export function resetCookieConsent(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PREFERENCES_KEY);
  localStorage.removeItem('apidevs_analytics_enabled');
  localStorage.removeItem('apidevs_marketing_enabled');
  
  window.dispatchEvent(new CustomEvent('cookieConsentReset'));
}

/**
 * Verificar si analytics está habilitado
 */
export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('apidevs_analytics_enabled') === 'true';
}

/**
 * Verificar si marketing está habilitado
 */
export function hasMarketingConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('apidevs_marketing_enabled') === 'true';
}

