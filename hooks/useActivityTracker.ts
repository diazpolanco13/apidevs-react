/**
 * useActivityTracker Hook
 * 
 * Hook personalizado para registrar la actividad del usuario en tiempo real.
 * 
 * EJEMPLOS DE USO:
 * 
 * 1. Trackear vista de página:
 *    const { trackPageView } = useActivityTracker();
 *    useEffect(() => {
 *      trackPageView('Dashboard Principal');
 *    }, []);
 * 
 * 2. Trackear clicks:
 *    const { trackEvent } = useActivityTracker();
 *    <button onClick={() => trackEvent('button_click', 'Checkout', 'Start Checkout')}>
 * 
 * 3. Trackear inicio de sesión:
 *    await trackEvent('login', 'Auth', 'User logged in successfully');
 * 
 * @TODO: Implementar cuando esté listo para producción
 */

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface ActivityEvent {
  event_type: string;
  event_category: 'navigation' | 'auth' | 'commerce' | 'interaction' | 'system';
  event_action: string;
  event_label?: string;
  page_url: string;
  page_title?: string;
  referrer?: string;
  metadata?: Record<string, any>;
}

export function useActivityTracker() {
  const supabase = createClient();
  const [sessionId] = useState(() => {
    // Obtener o crear session ID desde localStorage
    if (typeof window !== 'undefined') {
      let sid = localStorage.getItem('activity_session_id');
      if (!sid) {
        sid = crypto.randomUUID();
        localStorage.setItem('activity_session_id', sid);
        localStorage.setItem('session_start', Date.now().toString());
      }
      return sid;
    }
    return crypto.randomUUID();
  });

  /**
   * Detecta información del dispositivo y navegador
   */
  const getDeviceInfo = () => {
    if (typeof window === 'undefined') return {};

    const ua = navigator.userAgent;
    let device_type = 'desktop';
    
    if (/mobile/i.test(ua)) device_type = 'mobile';
    if (/tablet|ipad/i.test(ua)) device_type = 'tablet';

    // Detectar navegador
    let browser = 'unknown';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    // Detectar OS
    let os = 'unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';

    return {
      user_agent: ua,
      device_type,
      browser,
      os
    };
  };

  /**
   * Calcula la duración de la sesión actual
   */
  const getSessionDuration = () => {
    if (typeof window === 'undefined') return 0;
    const start = localStorage.getItem('session_start');
    if (!start) return 0;
    return Math.floor((Date.now() - parseInt(start)) / 1000);
  };

  /**
   * Verifica si el usuario ha dado consentimiento para analytics
   */
  const hasAnalyticsConsent = () => {
    if (typeof window === 'undefined') return false;
    const analyticsEnabled = localStorage.getItem('analytics_enabled');
    return analyticsEnabled === 'true';
  };

  /**
   * Trackea un evento genérico
   */
  const trackEvent = async (
    event_type: string,
    event_category: ActivityEvent['event_category'],
    event_action: string,
    event_label?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      // ⚠️ IMPORTANTE: Verificar consentimiento antes de trackear
      if (!hasAnalyticsConsent()) {
        console.log('🍪 Analytics tracking disabled - no consent');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Solo trackear usuarios autenticados

      const deviceInfo = getDeviceInfo();
      const sessionDuration = getSessionDuration();

      const eventData = {
        user_id: user.id,
        event_type,
        event_category,
        event_action,
        event_label,
        page_url: window.location.href,
        page_title: document.title,
        referrer: document.referrer || null,
        session_id: sessionId,
        session_duration: sessionDuration,
        metadata: metadata || {},
        ...deviceInfo
      };

      // Insertar en Supabase
      const { error } = await supabase
        .from('user_activity_events')
        .insert([eventData] as any);

      if (error) {
        console.error('Error tracking event:', error);
      }
    } catch (error) {
      console.error('Error in trackEvent:', error);
    }
  };

  /**
   * Trackea una vista de página
   */
  const trackPageView = async (pageTitle?: string) => {
    await trackEvent(
      'page_view',
      'navigation',
      'Page viewed',
      pageTitle || document.title
    );
  };

  /**
   * Trackea un click en un botón
   */
  const trackButtonClick = async (buttonName: string, metadata?: Record<string, any>) => {
    await trackEvent(
      'button_click',
      'interaction',
      `Button clicked: ${buttonName}`,
      buttonName,
      metadata
    );
  };

  /**
   * Trackea inicio de sesión
   */
  const trackLogin = async (method: 'email' | 'oauth' | 'magic_link') => {
    await trackEvent(
      'login',
      'auth',
      'User logged in',
      method,
      { login_method: method }
    );
  };

  /**
   * Trackea cierre de sesión
   */
  const trackLogout = async () => {
    await trackEvent(
      'logout',
      'auth',
      'User logged out'
    );
  };

  /**
   * Trackea inicio de checkout
   */
  const trackCheckoutStart = async (productName: string, amount: number) => {
    await trackEvent(
      'checkout_start',
      'commerce',
      'Checkout initiated',
      productName,
      { product: productName, amount }
    );
  };

  /**
   * Trackea compra completada
   */
  const trackPurchase = async (orderNumber: string, amount: number, productName: string) => {
    await trackEvent(
      'purchase',
      'commerce',
      'Purchase completed',
      productName,
      { order_number: orderNumber, amount, product: productName }
    );
  };

  // Auto-track page views cuando el componente se monta
  // @TODO: Descomentar cuando esté listo para producción
  // useEffect(() => {
  //   trackPageView();
  // }, []);

  return {
    trackEvent,
    trackPageView,
    trackButtonClick,
    trackLogin,
    trackLogout,
    trackCheckoutStart,
    trackPurchase,
    sessionId
  };
}

