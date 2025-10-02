import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/* (Next.js internals)
     * - __nextjs* (Next.js dev tools)
     * - static files
     * - favicon
     * - api routes (handled separately)
     * Only run on actual page routes
     */
    '/((?!_next|__nextjs|api/|_static|_vercel|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff|woff2|ttf|eot|json)$).*)'
  ]
};
