import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase keys are missing, allow public pages and let protected pages fail gracefully later
  if (!supabaseUrl || !supabaseKey) {
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
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
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
              headers: request.headers,
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

  // ── Admin route protection ──────────────────────────────────────────────
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isAdminLoginPage = request.nextUrl.pathname === '/admin/login';

  if (isAdminRoute && !isAdminLoginPage) {
    const adminSession = request.cookies.get('admin_session')?.value;
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSession || adminSession !== adminSecret) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    // Admin is authenticated — allow through without further Supabase checks
    return response;
  }
  // ── End admin route protection ──────────────────────────────────────────

  const { data: { user } } = await supabase.auth.getUser()

  const isPublicPage = request.nextUrl.pathname === '/' ||
                       request.nextUrl.pathname.startsWith('/login') || 
                       request.nextUrl.pathname.startsWith('/signup') ||
                       request.nextUrl.pathname.startsWith('/create-clinic') ||
                       request.nextUrl.pathname.startsWith('/pending-approval') ||
                       request.nextUrl.pathname.startsWith('/rejected') ||
                       request.nextUrl.pathname.startsWith('/unauthorized') ||
                       request.nextUrl.pathname.startsWith('/admin') // admin login is public to Supabase auth

  // Redirect to login if no user and not on a public page
  if (!user && !isPublicPage && !request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
