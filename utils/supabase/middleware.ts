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

    // Handle refresh token errors gracefully
    if (error && error.message?.includes('refresh_token_not_found')) {
      // Clear the invalid session cookies
      const clearedResponse = NextResponse.next({
        request: {
          headers: request.headers
        }
      });
      
      // Clear auth cookies for this project
      clearedResponse.cookies.delete('sb-zzieiqxlxfydvexalbsr-auth-token');
      clearedResponse.cookies.delete('sb-zzieiqxlxfydvexalbsr-auth-token.0');
      clearedResponse.cookies.delete('sb-zzieiqxlxfydvexalbsr-auth-token.1');
      
      return clearedResponse;
    }

    return response;
  } catch (e) {
    console.error('Supabase middleware error:', e);
    // Return clean response if there's any error
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    });
  }
};
