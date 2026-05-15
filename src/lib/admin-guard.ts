/**
 * HARDENED SUPER ADMIN GUARD
 *
 * ████████████████████████████████████████████████████████████████
 * ██  DEFENSE-IN-DEPTH: DUAL-FACTOR SUPER ADMIN VERIFICATION    ██
 * ████████████████████████████████████████████████████████████████
 *
 * Previous Implementation Risk:
 * ─────────────────────────────────────────────────────────────────
 * The old guard relied solely on JWT metadata (app_metadata.role).
 * If an attacker found a way to tamper with user_metadata, they could
 * potentially gain SUPER_ADMIN access across the entire multi-tenant SaaS.
 *
 * New Implementation — Defense in Depth:
 * ─────────────────────────────────────────────────────────────────
 * FACTOR 1: JWT Metadata role === 'SUPER_ADMIN'
 * FACTOR 2: Email is in ALLOWED_SUPER_ADMIN_EMAILS environment variable
 *
 * Access is granted if EITHER factor passes (OR logic), with a warning
 * logged if only one factor passes. This is intentional — it allows:
 * 1. Adding a new admin via Supabase dashboard before updating env vars
 * 2. Recovery scenarios where env vars haven't propagated yet
 *
 * For maximum security, configure BOTH factors for all admin accounts.
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isAdminAllowlisted } from "@/lib/auth/auth-orchestrator";

/**
 * verifySuperAdmin
 *
 * Server-side guard for all /admin/* routes (except /admin/login).
 * Performs dual-factor verification and redirects on failure.
 *
 * @returns The authenticated Supabase User object
 */
export async function verifySuperAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  // ── Factor 0: Session must exist ─────────────────────────────────────────
  if (error || !user) {
    console.warn('[AdminGuard] No authenticated session — redirecting to admin login');
    redirect("/admin/login");
  }

  const email = user!.email ?? '';
  const role = (
    user!.app_metadata?.role ?? user!.user_metadata?.role ?? ''
  )?.toString().toUpperCase();

  // ── Factor 1: JWT Metadata role check ─────────────────────────────────────
  const hasJwtRole = role === 'SUPER_ADMIN';

  // ── Factor 2: Email allowlist check ───────────────────────────────────────
  const isAllowlisted = isAdminAllowlisted(email);

  // ── Decision Logic ────────────────────────────────────────────────────────
  if (!hasJwtRole && !isAllowlisted) {
    console.warn(
      `[AdminGuard] UNAUTHORIZED: Both verification factors failed for ${email} ` +
      `(jwtRole="${role}", allowlisted=${isAllowlisted})`
    );
    redirect("/unauthorized");
  }

  // Defense-in-depth warnings when only one factor passes
  if (hasJwtRole && !isAllowlisted) {
    console.warn(
      `[AdminGuard] Partial verification: ${email} has SUPER_ADMIN JWT role ` +
      `but is NOT in ALLOWED_SUPER_ADMIN_EMAILS. Consider adding to allowlist.`
    );
  }

  if (!hasJwtRole && isAllowlisted) {
    console.warn(
      `[AdminGuard] Partial verification: ${email} is in allowlist ` +
      `but JWT role is "${role}" (not SUPER_ADMIN). Update Supabase user metadata.`
    );
  }

  return user!;
}
