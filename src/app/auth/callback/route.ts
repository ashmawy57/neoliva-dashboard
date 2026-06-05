import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { resolvePostAuthRedirect } from '@/lib/auth/auth-orchestrator';

/**
 * AUTH CALLBACK ROUTE HANDLER
 *
 * Handles the OAuth/magic-link code exchange from Supabase.
 *
 * Security model:
 * - ALL membership validation is delegated to `resolvePostAuthRedirect()`
 *   in `auth-orchestrator.ts`, which runs the same FAIL-CLOSED pipeline
 *   as `resolveTenantContext()` used in the dashboard layout.
 * - This means SUSPENDED, DISABLED, REJECTED, INACTIVE, and INVALID_ROLE
 *   users are blocked at login, not just during mid-session access.
 * - This route does NOT import Prisma directly; it never touches the DB.
 *
 * Flow:
 *   1. Exchange the Supabase authorization code for a session.
 *   2. Verify the session produced a valid authenticated user.
 *   3. Delegate ALL validation + routing to resolvePostAuthRedirect().
 *   4. Redirect to the returned destination (error page or dashboard).
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  // Accept a `next` param from the original login URL for deep-link support.
  // resolvePostAuthRedirect() validates it against isSafePath() before use.
  const next = requestUrl.searchParams.get('next') ?? undefined;

  // ── 1. No code present ────────────────────────────────────────────────────
  if (!code) {
    console.warn('[AuthCallback] No authorization code in request URL.');
    return NextResponse.redirect(
      new URL('/auth/error?type=SESSION_EXPIRED', request.url)
    );
  }

  // ── 2. Exchange authorization code for a Supabase session ─────────────────
  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('[AuthCallback] Code exchange failed:', exchangeError.message);

    // Map known Supabase error messages to typed error codes for the UI.
    let errorType = 'UNKNOWN_ERROR';
    if (exchangeError.message.includes('expired'))   errorType = 'EMAIL_EXPIRED';
    if (exchangeError.message.includes('credentials')) errorType = 'INVALID_CREDENTIALS';
    if (exchangeError.message.includes('confirmed'))  errorType = 'EMAIL_NOT_CONFIRMED';

    return NextResponse.redirect(
      new URL(`/auth/error?type=${errorType}`, request.url)
    );
  }

  // ── 3. Verify the exchange produced an authenticated user ─────────────────
  //
  // We use getUser() (server-verified JWT) not getSession() (client-unverified)
  // to guarantee the identity of the user before any DB work.
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('[AuthCallback] getUser() failed after code exchange:', userError?.message);
    return NextResponse.redirect(
      new URL('/auth/error?type=SESSION_EXPIRED', request.url)
    );
  }

  // ── 4. Delegate ALL validation + routing to the unified orchestrator ───────
  //
  // resolvePostAuthRedirect() is the SINGLE SOURCE OF TRUTH for post-auth
  // routing decisions. It:
  //   a) Looks up the user's TenantMembership via rawPrisma (same as resolveTenantContext)
  //   b) Runs validateCallbackMembership() — enforcing SUSPENDED, DISABLED,
  //      REJECTED, MEMBERSHIP_INACTIVE, and INVALID_ROLE — which the old
  //      callback silently skipped
  //   c) Maps any failure to the correct error redirect path
  //   d) On success, applies role-based routing via getPostLoginDestination()
  try {
    const { destination, reason } = await resolvePostAuthRedirect(user.id, next);

    console.log(
      `[AuthCallback] Redirecting user ${user.email} → ${destination} (reason: ${reason})`
    );

    return NextResponse.redirect(new URL(destination, request.url));
  } catch (err) {
    // resolvePostAuthRedirect never throws — it always returns a destination.
    // This catch is a final safety net for genuinely unexpected runtime errors.
    console.error('[AuthCallback] Unexpected error in resolvePostAuthRedirect:', err);
    return NextResponse.redirect(
      new URL('/auth/error?type=UNKNOWN_ERROR', request.url)
    );
  }
}
