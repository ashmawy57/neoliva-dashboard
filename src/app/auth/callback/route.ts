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
        return NextResponse.redirect(new URL('/auth/error?type=SESSION_EXPIRED', request.url));
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
          // Self-healing attempt or redirect to registration
          return NextResponse.redirect(new URL('/auth/error?type=UNKNOWN_ERROR', request.url));
        }

        // 3. Redirect based on Tenant Status
        if (dbUser.tenant.status === 'PENDING') {
          return NextResponse.redirect(new URL('/auth/error?type=TENANT_PENDING', request.url));
        }

        if (dbUser.tenant.status === 'REJECTED') {
          return NextResponse.redirect(new URL('/auth/error?type=ACCOUNT_SUSPENDED', request.url));
        }

        // 4. Check staff invitation for non-admins
        if (dbUser.role !== 'ADMIN' && dbUser.role !== 'OWNER') {
          if (!dbUser.staff || !dbUser.staff.inviteAccepted) {
            return NextResponse.redirect(new URL('/auth/error?type=INVITE_EXPIRED', request.url));
          }
        }

        // 5. Smart Role-Based Redirects
        let redirectPath = next;
        if (next === '/dashboard') {
          switch (dbUser.role) {
            case 'DOCTOR':
              redirectPath = '/dashboard/appointments';
              break;
            case 'ACCOUNTANT':
              redirectPath = '/dashboard/finance';
              break;
            default:
              redirectPath = '/dashboard';
          }
        }

        return NextResponse.redirect(new URL(redirectPath, request.url));

      } catch (err) {
        console.error('[AuthCallback] Database lookup error:', err);
        return NextResponse.redirect(new URL('/auth/error?type=UNKNOWN_ERROR', request.url));
      }
    } else {
      console.error('Error exchanging code for session:', error.message);
      
      // Smart Error Mapping
      let errorType = 'UNKNOWN_ERROR';
      if (error.message.includes('expired')) errorType = 'EMAIL_EXPIRED';
      if (error.message.includes('credentials')) errorType = 'INVALID_CREDENTIALS';
      if (error.message.includes('confirmed')) errorType = 'EMAIL_NOT_CONFIRMED';

      return NextResponse.redirect(new URL(`/auth/error?type=${errorType}`, request.url));
    }
  }

  return NextResponse.redirect(new URL('/auth/error?type=UNKNOWN_ERROR', request.url));
}
