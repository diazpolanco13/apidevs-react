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
  try {
    // Check if this is a protected route that needs auth verification
    const { pathname } = request.nextUrl;
    const isPublicRoute = pathname === '/' || 
                          pathname.startsWith('/pricing') ||
                          pathname.startsWith('/signin') ||
                          pathname.startsWith('/auth');
    
    const { supabase, response } = createClient(request);

    // Only verify auth for protected routes or if auth cookies exist
    const hasAuthCookies = request.cookies.has('sb-zzieiqxlxfydvexalbsr-auth-token');
    
    if (!isPublicRoute || hasAuthCookies) {
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
    }

    // For public routes without auth cookies, skip auth check entirely
    return response;
  } catch (e) {
    console.error('Supabase middleware error:', e);
    // Don't clear cookies on general errors, just return the response
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    });
  }
};
