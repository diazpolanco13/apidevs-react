import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

// Cache de sesiones para evitar rate limiting (60 segundos)
const sessionCache = new Map<string, { user: any; timestamp: number }>();
const CACHE_TTL = 60000; // 60 segundos

// Request deduplication: evita múltiples llamadas simultáneas a getUser()
const pendingRequests = new Map<string, Promise<any>>();

// Función async para tracking de visitantes (no bloquea la respuesta)
async function trackVisitorAsync(
  request: NextRequest, 
  response: NextResponse, 
  pathname: string
): Promise<NextResponse> {
  try {
    // Importar dinámicamente para evitar circular dependencies
    const { trackVisitor, SESSION_COOKIE_NAME } = await import('@/lib/tracking/visitor-tracker');
    
    // Obtener sessionId existente de las cookies
    const existingSessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    
    // Trackear visitante (retorna nuevo sessionId si se creó uno)
    const newSessionId = await trackVisitor(request, pathname, existingSessionId);
    
    // Si se creó un nuevo sessionId, agregarlo a la respuesta
    if (newSessionId) {
      response.cookies.set(SESSION_COOKIE_NAME, newSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 año
        path: '/'
      });
    }
    
    return response;
  } catch (error) {
    // Silenciar errores para no romper la app
    if (process.env.NODE_ENV === 'development') {
      console.error('Track visitor error:', error);
    }
    return response;
  }
}

export const createClient = (request: NextRequest) => {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is updated, update the cookies for the request and response
          request.cookies.set({
            name,
            value,
            ...options
          });
          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          });
          response.cookies.set({
            name,
            value,
            ...options
          });
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the cookies for the request and response
          request.cookies.set({
            name,
            value: '',
            ...options
          });
          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          });
          response.cookies.set({
            name,
            value: '',
            ...options
          });
        }
      }
    }
  );

  return { supabase, response };
};

export const updateSession = async (request: NextRequest) => {
  const startTime = Date.now();
  
  try {
    // Check if this is a protected route that needs auth verification
    const { pathname } = request.nextUrl;
    const isPublicRoute = pathname === '/' || 
                          pathname.startsWith('/pricing') ||
                          pathname.startsWith('/signin') ||
                          pathname.startsWith('/signout') ||  // Skip auth check on signout
                          pathname.startsWith('/auth');
    
    // Only verify auth for protected routes or if auth cookies exist
    const hasAuthCookies = request.cookies.has('sb-zzieiqxlxfydvexalbsr-auth-token');
    
    // Skip auth check entirely for public routes without auth cookies
    // This saves ~50-100ms per request and prevents rate limit issues
    if (isPublicRoute && !hasAuthCookies) {
      const response = NextResponse.next({
        request: {
          headers: request.headers
        }
      });
      
      // Log in development only
      if (process.env.NODE_ENV === 'development') {
        const hasCookie = !!request.cookies.get('sb-zzieiqxlxfydvexalbsr-auth-token');
        if (hasCookie) {
          console.log(`⚡ Auth skipped for ${pathname} (public route, cookie present)`);
        }
      }
      
      return response;
    }
    
    const { supabase, response: initialResponse } = createClient(request);
    let response = initialResponse;

    // Verificar caché primero (evita rate limiting)
    const authToken = request.cookies.get('sb-zzieiqxlxfydvexalbsr-auth-token')?.value;
    if (authToken) {
      const cached = sessionCache.get(authToken);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        // Using cached auth
        return response;
      }
    }

    // Request deduplication: si ya hay un request en vuelo para este token, esperarlo
    let getUserPromise: Promise<any>;
    
    if (authToken && pendingRequests.has(authToken)) {
      // Reutilizar request existente
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Deduplicating auth request for ${pathname} - ${Date.now() - startTime}ms`);
      }
      getUserPromise = pendingRequests.get(authToken)!;
    } else {
      // Crear nuevo request y guardarlo
      getUserPromise = supabase.auth.getUser();
      if (authToken) {
        pendingRequests.set(authToken, getUserPromise);
      }
    }

    // Esperar resultado (con manejo de errores para limpiar pending)
    let user, error;
    try {
      const result = await getUserPromise;
      user = result.data?.user;
      error = result.error;
    } catch (e) {
      error = e;
    } finally {
      // SIEMPRE limpiar request pendiente
      if (authToken) {
        pendingRequests.delete(authToken);
      }
    }

    // Guardar en caché si es exitoso
    if (user && authToken) {
      sessionCache.set(authToken, { user, timestamp: Date.now() });
      
      // Limpiar caché antiguo (max 100 entradas)
      if (sessionCache.size > 100) {
        const oldestKey = sessionCache.keys().next().value;
        if (oldestKey) sessionCache.delete(oldestKey);
      }
    }

    // Only clear cookies on SPECIFIC critical errors that indicate corruption
    if (error && (
      error.message?.includes('refresh_token_not_found') ||
      error.message?.includes('invalid_grant')
    )) {
      console.warn('⚠️ COOKIE CORRUPTA DETECTADA - Limpiando cookies:', error.message);
      
      // Clear the invalid session cookies
      const clearedResponse = NextResponse.next({
        request: {
          headers: request.headers
        }
      });
      
      // Clear ALL auth cookies for this project
      clearedResponse.cookies.delete('sb-zzieiqxlxfydvexalbsr-auth-token');
      clearedResponse.cookies.delete('sb-zzieiqxlxfydvexalbsr-auth-token.0');
      clearedResponse.cookies.delete('sb-zzieiqxlxfydvexalbsr-auth-token.1');
      
      return clearedResponse;
    }

    // Log otros errores de auth en desarrollo (para detectar cookies problemáticas)
    if (error && process.env.NODE_ENV === 'development' && authToken) {
      console.warn('⚠️ Auth error (cookie presente pero inválida):', {
        path: pathname,
        error: error.message,
        cookiePresent: !!authToken
      });
    }

    // Log successful auth checks in development
    // Auth verified

    // Track visitor para páginas públicas (no admin, no auth)
    const shouldTrack = !pathname.startsWith('/admin') && 
                        !pathname.startsWith('/auth') &&
                        !pathname.startsWith('/api') &&
                        pathname !== '/signin' &&
                        pathname !== '/signout';

    if (shouldTrack) {
      // Ejecutar tracking y obtener respuesta con cookie actualizada
      response = await trackVisitorAsync(request, response, pathname);
    }

    return response;
  } catch (e) {
    // Log errors in production for monitoring (consider using a service like Sentry)
    console.error('Supabase middleware error:', {
      path: request.nextUrl.pathname,
      error: e,
      timestamp: new Date().toISOString()
    });
    
    // Don't clear cookies on general errors, just return the response
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    });
  }
};
