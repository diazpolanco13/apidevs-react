import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

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
        console.log(`⚡ Skipped auth check for ${pathname} (no cookies) - ${Date.now() - startTime}ms`);
      }
      
      return response;
    }
    
    const { supabase, response } = createClient(request);

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const { data: { user }, error } = await supabase.auth.getUser();

    // Only clear cookies on SPECIFIC critical errors that indicate corruption
    if (error && (
      error.message?.includes('refresh_token_not_found') ||
      error.message?.includes('invalid_grant')
    )) {
      console.warn('Auth error requiring cookie reset:', error.message);
      
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

    // Log successful auth checks in development
    if (process.env.NODE_ENV === 'development' && user) {
      console.log(`✅ Auth verified for ${pathname} - ${Date.now() - startTime}ms`);
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
