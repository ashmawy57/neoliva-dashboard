/**
 * SUPABASE ADMIN CLIENT — SERVICE ROLE
 *
 * ⚠️  CRITICAL SECURITY NOTICE:
 * This client bypasses ALL Row Level Security (RLS) policies.
 * MUST ONLY be used in server-side code (Server Actions, Route Handlers, Edge Functions).
 * NEVER expose this client to the browser. NEVER include in client-side bundles.
 *
 * Primary use: Saga-pattern rollback of orphaned Supabase auth accounts
 * when the downstream Prisma transaction fails.
 */

import { createClient } from '@supabase/supabase-js';

let adminClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  // Lazy initialization — ensures env vars are loaded before access
  if (adminClient) return adminClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      '[SupabaseAdmin] CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not configured. ' +
      'Rollback operations will fail. Add it to your environment variables immediately.'
    );
  }

  adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}
