import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Server-side guard to enforce SUPER_ADMIN role.
 * Use this in Admin layouts or server components to protect routes.
 * 
 * @returns The authenticated Super Admin user
 */
export async function verifySuperAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  // Check for SUPER_ADMIN role in metadata
  // We check metadata because it's set by the system and can't be modified by the user directly
  const role = (user.app_metadata?.role || user.user_metadata?.role || '')?.toString().toUpperCase();
  if (role !== 'SUPER_ADMIN') {
    console.warn(`[AdminGuard] Unauthorized access attempt by ${user.email} (Role: ${role})`);
    redirect("/unauthorized");
  }

  return user;
}
