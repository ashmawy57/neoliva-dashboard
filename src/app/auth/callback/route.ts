import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // 1. Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return NextResponse.redirect(new URL('/login?error=Session+establishment+failed', request.url));
      }

      // 2. Resolve tenant context manually here for precise redirect control
      try {
        const dbUser = await prisma.user.findUnique({
          where: { supabaseId: user.id },
          include: {
            tenant: true,
            staff: true
          }
        });

        if (!dbUser) {
          console.error('[AuthCallback] No DB User record found for supabaseId:', user.id);
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }

        // 3. Redirect based on Tenant Status
        if (dbUser.tenant.status === 'PENDING') {
          return NextResponse.redirect(new URL('/pending-approval', request.url));
        }

        if (dbUser.tenant.status === 'REJECTED') {
          return NextResponse.redirect(new URL('/rejected', request.url));
        }

        // 4. Check staff invitation for non-admins
        if (dbUser.role !== 'ADMIN') {
          if (!dbUser.staff || !dbUser.staff.inviteAccepted) {
            return NextResponse.redirect(new URL('/login?error=Please+accept+your+invitation+first', request.url));
          }
        }

        // 5. All good -> proceed to dashboard or requested page
        return NextResponse.redirect(new URL(next, request.url));

      } catch (err) {
        console.error('[AuthCallback] Database lookup error:', err);
        return NextResponse.redirect(new URL('/login?error=Server+error+during+sign-in', request.url));
      }
    } else {
      console.error('Error exchanging code for session:', error.message);
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url));
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(new URL('/login?error=Invalid+auth+code', request.url));
}
