import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { rawPrisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get('tenantId')
  if (!tenantId) {
    return NextResponse.redirect(new URL('/select-tenant?error=missing', request.url))
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  console.log('[select-tenant] Auth user.id:', user.id, 'email:', user.email)

  // Step 1: Resolve internal DB user ID from Supabase auth ID
  const dbUser = await rawPrisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true },
  })

  console.log('[select-tenant] dbUser lookup result:', dbUser)

  if (!dbUser) {
    console.error('[select-tenant] No internal user found for supabaseId:', user.id)
    return NextResponse.redirect(new URL('/select-tenant?error=nouser', request.url))
  }

  // Step 2: Find tenant membership using internal user ID
  const membership = await rawPrisma.tenantMembership.findUnique({
    where: {
      userId_tenantId: {
        userId: dbUser.id,
        tenantId: tenantId,
      },
    },
    select: { role: true, status: true, isActive: true },
  })

  console.log('[select-tenant] Membership result:', membership)

  if (!membership) {
    console.error('[select-tenant] No membership found for userId:', dbUser.id, 'tenantId:', tenantId)
    return NextResponse.redirect(new URL('/select-tenant?error=nomembership', request.url))
  }

  if (!membership.isActive || membership.status !== 'ACTIVE') {
    console.error('[select-tenant] Membership inactive/suspended:', membership.status, 'isActive:', membership.isActive)
    return NextResponse.redirect(new URL('/select-tenant?error=inactive', request.url))
  }

  const role = String(membership.role)
  console.log('[select-tenant] Setting cookies — tenantId:', tenantId, 'role:', role)

  const response = NextResponse.redirect(new URL('/dashboard', request.url))

  const cookieOptions = {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  }

  response.cookies.set('active_tenant_id', tenantId, cookieOptions)
  response.cookies.set('user_role', role, cookieOptions)

  console.log('[select-tenant] ✅ Cookies set successfully on response')
  return response
}
