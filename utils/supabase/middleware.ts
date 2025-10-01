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
    const { supabase, response } = createClient(request);

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const { data: { user }, error } = await supabase.auth.getUser();

    // Only clear cookies on SPECIFIC critical errors that indicate corruption
    // Don't clear for "Auth session missing!" which is normal for logged-out users
    if (error && (
      error.message?.includes('refresh_token_not_found') ||
      error.message?.includes('invalid_grant') ||
      error.status === 429 // Rate limit
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

    // For other errors (like "Auth session missing!"), just continue normally
    // This is expected for non-authenticated pages
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
