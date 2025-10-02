import { createClient } from '@/utils/supabase/server';

interface VisitorData {
  sessionId: string;
  ip: string;
  userAgent: string;
  referer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  currentPage: string;
  landingPage?: string;
}

interface GeoData {
  country?: string;
  country_name?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  postal_code?: string;
}

interface DeviceData {
  browser?: string;
  os?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet';
}

export const SESSION_COOKIE_NAME = 'apidevs_session_id';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutos

export async function trackVisitor(
  request: Request,
  pathname: string,
  existingSessionId?: string
): Promise<string | null> {
  try {
    const supabase = createClient();
    const url = new URL(request.url);

    // Obtener o crear session_id
    let sessionId = existingSessionId;
    const isNewSession = !sessionId;
    
    if (!sessionId) {
      sessionId = generateSessionId();
    }

    // Extraer datos de la request
    const ip = extractIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || undefined;

    // Extraer UTM parameters
    const utmSource = url.searchParams.get('utm_source') || undefined;
    const utmMedium = url.searchParams.get('utm_medium') || undefined;
    const utmCampaign = url.searchParams.get('utm_campaign') || undefined;
    const utmTerm = url.searchParams.get('utm_term') || undefined;
    const utmContent = url.searchParams.get('utm_content') || undefined;

    // Detectar dispositivo
    const deviceData = detectDevice(userAgent);

    // Buscar sesión existente
    const { data: existingSession } = await supabase
      .from('visitor_tracking')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (existingSession) {
      // Actualizar sesión existente
      await updateExistingSession(
        supabase,
        existingSession,
        pathname
      );
    } else {
      // Crear nueva sesión
      const geoData = await fetchGeoLocation(ip);
      
      await createNewSession(
        supabase,
        sessionId,
        {
          sessionId,
          ip,
          userAgent,
          referer,
          utmSource,
          utmMedium,
          utmCampaign,
          utmTerm,
          utmContent,
          currentPage: pathname,
          landingPage: pathname,
        },
        geoData,
        deviceData
      );
    }
    
    // Retornar sessionId (nuevo o existente)
    return isNewSession ? sessionId : null;
  } catch (error) {
    // Silenciar errores de tracking para no romper la app
    console.error('Error tracking visitor:', error);
    return null;
  }
}

function generateSessionId(): string {
  // Generar ID aleatorio compatible con Edge Runtime
  const random = Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15);
  return `sess_${random}_${Date.now()}`;
}

function extractIP(request: Request): string {
  // Intentar obtener IP de varios headers (en orden de prioridad)
  const headers = request.headers;
  
  const ip = 
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('cf-connecting-ip') || // Cloudflare
    headers.get('x-client-ip') ||
    '0.0.0.0';

  return ip.trim();
}

function detectDevice(userAgent: string): DeviceData {
  const ua = userAgent.toLowerCase();
  
  // Detectar tipo de dispositivo
  let device_type: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    device_type = 'tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
    device_type = 'mobile';
  }

  // Detectar browser
  let browser = 'Unknown';
  if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';

  // Detectar OS
  let os = 'Unknown';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

  return { browser, os, device_type };
}

async function fetchGeoLocation(ip: string): Promise<GeoData> {
  // No hacer requests para IPs locales
  if (ip === '0.0.0.0' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '::1') {
    return {};
  }

  try {
    // Usar ipapi.co (gratuito, 30k requests/mes)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 'User-Agent': 'APIDevs-Trading/1.0' },
      next: { revalidate: 86400 } // Cache 24 horas
    });

    if (!response.ok) {
      return {};
    }

    const data = await response.json();

    return {
      country: data.country_code,
      country_name: data.country_name,
      city: data.city,
      region: data.region,
      latitude: data.latitude,
      longitude: data.longitude,
      postal_code: data.postal,
    };
  } catch (error) {
    console.error('Error fetching geo location:', error);
    return {};
  }
}

async function createNewSession(
  supabase: any,
  sessionId: string,
  visitorData: VisitorData,
  geoData: GeoData,
  deviceData: DeviceData
) {
  const { error } = await supabase
    .from('visitor_tracking')
    .insert({
      session_id: sessionId,
      fingerprint: generateFingerprint(visitorData.ip, visitorData.userAgent),
      
      // Red
      ip_address: visitorData.ip,
      
      // Geolocalización
      ...geoData,
      
      // Dispositivo
      user_agent: visitorData.userAgent,
      browser: deviceData.browser,
      os: deviceData.os,
      device_type: deviceData.device_type,
      
      // Origen del tráfico
      referer: visitorData.referer,
      utm_source: visitorData.utmSource,
      utm_medium: visitorData.utmMedium,
      utm_campaign: visitorData.utmCampaign,
      utm_term: visitorData.utmTerm,
      utm_content: visitorData.utmContent,
      
      // Navegación
      landing_page: visitorData.landingPage,
      pages_visited: 1,
      
      // Conversión (inicialmente false)
      purchased: false,
      
      // Timestamps
      first_visit_at: new Date().toISOString(),
      last_visit_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error creating new session:', error);
  }
}

async function updateExistingSession(
  supabase: any,
  existingSession: any,
  currentPage: string
) {
  const now = new Date();
  const lastVisit = new Date(existingSession.last_visit_at);
  const timeDiff = now.getTime() - lastVisit.getTime();
  
  // Solo actualizar si han pasado más de 10 segundos (evitar spam)
  if (timeDiff < 10000) {
    return;
  }

  // Calcular time_on_site (segundos)
  const firstVisit = new Date(existingSession.first_visit_at);
  const timeOnSite = Math.floor((now.getTime() - firstVisit.getTime()) / 1000);

  const { error } = await supabase
    .from('visitor_tracking')
    .update({
      pages_visited: existingSession.pages_visited + 1,
      time_on_site: timeOnSite,
      last_visit_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('session_id', existingSession.session_id);

  if (error) {
    console.error('Error updating session:', error);
  }
}

function generateFingerprint(ip: string, userAgent: string): string {
  // Generar fingerprint simple sin crypto (compatible con Edge Runtime)
  const data = `${ip}-${userAgent}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).padStart(16, '0').substring(0, 32);
}

