import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { randomUUID } from "crypto";

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
                  pathname.includes('.') || 
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
    '/admin/login',
  ];

  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // --- 3. Initialize Headers ---
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  // --- 4. Supabase Auth Context ---
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("[Proxy][CRITICAL] Supabase environment variables missing. Request dropped.");
    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  }

  // Temporary response to hold cookie changes
  let response = NextResponse.next({
    request: { headers: requestHeaders }
  });

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
          // Instead of creating a new response every time, we update the existing one
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  );

  let { data: { user } } = await supabase.auth.getUser();

  // --- 5. Silent Session Refresh Logic ---
  if (!user) {
    const appRefreshToken = request.cookies.get('app_refresh_token')?.value;
    
    if (appRefreshToken) {
      if (process.env.AUTH_DEBUG === 'true') {
        console.log(`[AUTH_DEBUG][Proxy] User null, attempting silent refresh...`);
      }

      try {
        const { SessionService } = await import('@/lib/auth/session-service');
        const { supabaseRefreshToken, newAppRefreshToken, session: dbSession } = 
          await SessionService.refreshSession(
            appRefreshToken, 
            request.headers.get('x-forwarded-for') || undefined,
            request.headers.get('user-agent') || undefined
          );

        if (supabaseRefreshToken) {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
            refresh_token: supabaseRefreshToken
          });

          if (!refreshError && refreshData.user) {
            user = refreshData.user;
            
            if (refreshData.session?.refresh_token) {
              await SessionService.updateSupabaseToken(dbSession.id, refreshData.session.refresh_token);
            }

            response.cookies.set('app_refresh_token', newAppRefreshToken, {
              path: '/',
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 90
            });

            if (process.env.AUTH_DEBUG === 'true') {
              console.log(`[AUTH_DEBUG][Proxy] Silent refresh SUCCESS for ${user.email}`);
            }
          }
        }
      } catch (err) {
        if (process.env.AUTH_DEBUG === 'true') {
          console.warn(`[AUTH_DEBUG][Proxy] Silent refresh FAILED: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
    }
  }

  if (process.env.AUTH_DEBUG === 'true') {
    console.log(`[AUTH_DEBUG][Proxy] Path: ${pathname} | Auth: ${!!user} | RID: ${requestId}`);
  }

  // --- 6. Auth Gate ---
  console.log(`[PROXY][PATH] ${pathname}`);
  console.log(`[PROXY][ROLE] ${user ? 'Authenticated' : 'Public'}`);

  if (!user && !isPublicRoute) {
    const isAdminRoute = pathname.startsWith('/admin');
    const redirectPath = isAdminRoute ? '/admin/login' : '/login';
    
    console.log(`[PROXY][REDIRECT] ${pathname} -> ${redirectPath} (Unauthorized)`);
    
    const loginUrl = new URL(redirectPath, request.url);
    loginUrl.searchParams.set('next', pathname);
    
    const authResponse = NextResponse.redirect(loginUrl);
    authResponse.cookies.delete('app_refresh_token');
    return authResponse;
  }

  // --- 7. Redirect Authenticated Users from Login ---
  if (user && (pathname === '/login' || pathname === '/staff-signin')) {
    console.log(`[PROXY][REDIRECT] ${pathname} -> /dashboard (Already Authenticated)`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  console.log(`[PROXY][NEXT] ${pathname} allowed`);
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
