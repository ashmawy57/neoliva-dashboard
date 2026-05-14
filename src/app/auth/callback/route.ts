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
            memberships: {
              where: { status: 'ACTIVE' },
              include: { tenant: true },
              take: 1
            }
          }
        });

        if (!dbUser || dbUser.memberships.length === 0) {
          console.error('[AuthCallback] No active membership found for user:', user.id);
          // If no membership, maybe check for invitations
          return NextResponse.redirect(new URL('/auth/error?type=UNAUTHORIZED', request.url));
        }

        const primaryMembership = dbUser.memberships[0];
        const tenant = primaryMembership.tenant;
        const role = primaryMembership.role;

        // 3. Redirect based on Tenant Status
        if (tenant.status === 'PENDING') {
          return NextResponse.redirect(new URL('/auth/error?type=TENANT_PENDING', request.url));
        }

        if (tenant.status === 'REJECTED') {
          return NextResponse.redirect(new URL('/auth/error?type=ACCOUNT_SUSPENDED', request.url));
        }

        // 5. Smart Role-Based Redirects
        let redirectPath = next;
        if (next === '/dashboard') {
          switch (role) {
            case 'DOCTOR':
              redirectPath = '/dashboard/appointments';
              break;
            case 'ACCOUNTANT':
              redirectPath = '/dashboard/finance';
              break;
            case 'OWNER':
            case 'ADMIN':
            case 'MANAGER':
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
