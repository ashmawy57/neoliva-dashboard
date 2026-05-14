import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { randomUUID } from "node:crypto";

/**
 * Global Proxy for Dental Clinic Dashboard (Next.js 16.2+ Replacement for Middleware)
 * 
 * Handles:
 * 1. Request Tracing (RequestId)
 * 2. Auth Proxy (Supabase Session Management)
 * 3. Protected Route Guards
 */
export async function proxy(request: NextRequest) {
  // --- 1. Request Tracing ---
  const requestId = request.headers.get("x-request-id") || randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  // --- 2. Initialize Response with Tracing Headers ---
  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase keys are missing, allow public pages and let protected pages fail gracefully later
  if (!supabaseUrl || !supabaseKey) {
    response.headers.set("x-request-id", requestId);
    return response;
  }

  // --- 3. Supabase Auth Logic ---
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh/Get User Session
  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname;

  // --- 4. Route Protection Logic ---
  const isApiRequest = pathname.startsWith('/api/');
  const isAdminRoute = pathname.startsWith('/admin');
  
  // Public Page Bypass
  const isPublicPage = pathname === '/' ||
                       pathname.startsWith('/login') || 
                       pathname.startsWith('/signup') ||
                       pathname.startsWith('/auth/') || 
                       pathname.startsWith('/create-clinic') ||
                       pathname.startsWith('/pending-approval') ||
                       pathname.startsWith('/rejected') ||
                       pathname.startsWith('/unauthorized') ||
                       (isAdminRoute && pathname === '/admin/login');

  if (isPublicPage) {
    response.headers.set("x-request-id", requestId);
    return response;
  }

  // AuthN Gate
  if (!user) {
    if (isApiRequest) {
      const apiResponse = NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
      apiResponse.headers.set("x-request-id", requestId);
      return apiResponse;
    }

    // Redirect to appropriate login page
    const loginPath = isAdminRoute ? '/admin/login' : '/login';
    const redirectUrl = new URL(loginPath, request.url);
    redirectUrl.searchParams.set('type', 'SESSION_EXPIRED');
    if (!isAdminRoute) {
      redirectUrl.searchParams.set('next', pathname);
    }
    
    const redirectResponse = NextResponse.redirect(redirectUrl);
    redirectResponse.headers.set("x-request-id", requestId);
    return redirectResponse;
  }

  // --- 5. Admin RBAC & Tenant Bypass ---
  if (isAdminRoute) {
    const role = (user.app_metadata?.role || user.user_metadata?.role || '')?.toString().toUpperCase();
    
    // STRICT CHECK: Only SUPER_ADMIN can access any /admin route
    if (role !== 'SUPER_ADMIN') {
      console.warn(`[Proxy] Unauthorized admin access attempt by ${user.email} (Role: ${role})`);
      const unauthorizedUrl = new URL('/unauthorized', request.url);
      const unauthorizedResponse = NextResponse.redirect(unauthorizedUrl);
      unauthorizedResponse.headers.set("x-request-id", requestId);
      return unauthorizedResponse;
    }

    // Authorized Super Admin: Bypass tenant check
    response.headers.set("x-request-id", requestId);
    return response;
  }

  // --- 6. Tenant-Scoped Route Protection ---
  // For all other private routes, we conceptually require a tenantId.
  // In this system, the tenantId is resolved from the database.
  // We'll let the application layer (tenant-context) handle the specific DB lookup,
  // but the proxy ensures that we aren't accidentally allowing non-admins into /admin.
  
  // Note: If you want to strictly block users without a tenantId in the proxy, 
  // you would need to check user.app_metadata.tenantId or similar here.


  // Finalize Response with Tracing
  response.headers.set("x-request-id", requestId);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
