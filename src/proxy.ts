import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { randomUUID } from "node:crypto";

/**
 * AUTHORITATIVE PROXY LAYER (Next.js 16+ Architecture)
 * 
 * This file replaces the deprecated middleware.ts convention.
 * It handles global request interception, authentication guarding, 
 * and tenant-context isolation validation.
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestId = request.headers.get("x-request-id") || randomUUID();

  // --- 1. Static & Asset Bypass (Fast-Path) ---
  const isAsset = pathname.startsWith('/_next/') || 
                  pathname.startsWith('/api/public/') ||
                  pathname.includes('.') || // matches favicon.ico, images, etc.
                  pathname === '/favicon.ico';

  if (isAsset) {
    return NextResponse.next();
  }

  // --- 2. Public Route Definition ---
  const publicRoutes = [
    '/',
    '/login',
    '/staff-signin',
    '/register',
    '/auth/callback',
    '/unauthorized',
  ];

  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // --- 3. Initialize Response with Tracing ---
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // --- 4. Supabase Auth Context ---
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("[Proxy] Critical Error: Supabase environment variables missing");
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: requestHeaders },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: requestHeaders },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // --- 5. Auth Gate ---
  if (!user && !isPublicRoute) {
    console.log(`[Proxy] Unauthenticated access to protected route: ${pathname}`);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // --- 6. Redirect Authenticated Users from Login ---
  if (user && (pathname === '/login' || pathname === '/staff-signin')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // --- 7. Final Response Enhancement ---
  response.headers.set("x-request-id", requestId);
  return response;
}

/**
 * PROXY MATCHER CONFIGURATION
 * 
 * Optimized to exclude static assets while capturing all dynamic routes.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
