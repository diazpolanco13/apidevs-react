import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

// Idiomas soportados
const supportedLanguages = ['es', 'en'] as const;
const defaultLanguage = 'es';

// Función para detectar idioma preferido del usuario
function detectUserLanguage(request: NextRequest): string {
  // 1. Verificar si ya tiene un idioma en la URL
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/docs/')) {
    const segments = pathname.split('/');
    const langSegment = segments[2]; // /docs/[lang]/...
    if (langSegment && supportedLanguages.includes(langSegment as any)) {
      return langSegment;
    }
  }

  // 2. Verificar cookie de idioma
  const languageCookie = request.cookies.get('preferred-language');
  if (languageCookie && supportedLanguages.includes(languageCookie.value as any)) {
    return languageCookie.value;
  }

  // 3. Detectar desde Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    // Parsear Accept-Language header
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [code, quality] = lang.trim().split(';q=');
        return {
          code: code.split('-')[0].toLowerCase(), // es-ES -> es
          quality: quality ? parseFloat(quality) : 1.0
        };
      })
      .sort((a, b) => b.quality - a.quality);

    // Buscar el primer idioma soportado
    for (const lang of languages) {
      if (supportedLanguages.includes(lang.code as any)) {
        return lang.code;
      }
    }
  }

  // 4. Fallback al idioma por defecto
  return defaultLanguage;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Manejar redirección de /docs a /docs/[lang] (solo si es exactamente /docs)
  if (pathname === '/docs') {
    const detectedLanguage = detectUserLanguage(request);
    const redirectUrl = new URL(`/docs/${detectedLanguage}`, request.url);
    
    // Crear respuesta de redirección
    const response = NextResponse.redirect(redirectUrl);
    
    // Establecer cookie de idioma preferido
    response.cookies.set('preferred-language', detectedLanguage, {
      maxAge: 60 * 60 * 24 * 365, // 1 año
      httpOnly: false, // Permitir acceso desde JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    return response;
  }

  // Para rutas /docs/[lang] y /docs/[lang]/[slug], ejecutar middleware de Supabase normalmente
  // (NO redirigir estas rutas)
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match specific paths:
     * - /docs (for redirection to /docs/[lang])
     * - All other routes except static files
     */
    '/docs',
    '/((?!_next|__nextjs|api/|_static|_vercel|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff|woff2|ttf|eot|json)$).*)'
  ]
};
