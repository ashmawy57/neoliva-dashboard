"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { rawPrisma } from "@/lib/prisma";

export async function selectTenantAction(formData: FormData) {
  const tenantId = formData.get("tenantId") as string;
  if (!tenantId) {
    throw new Error("Missing tenantId");
  }

  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options });
      },
    },
  });

  // 1. Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || !user.email) {
    throw new Error("Unauthorized");
  }

  // 2. Get the DB user record
  const dbUser = await rawPrisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true }
  });

  if (!dbUser) {
    throw new Error("User record not found in database.");
  }

  console.log("selectTenantAction - dbUser.id:", dbUser.id, "tenantId:", tenantId);

  // 3. Verify user has active membership in this tenantId in tenant_memberships
  const membership = await rawPrisma.tenantMembership.findUnique({
    where: {
      userId_tenantId: {
        userId: dbUser.id,
        tenantId: tenantId,
      },
    },
  });

  console.log("selectTenantAction - Membership found:", membership);

  if (!membership || !membership.isActive || membership.status !== "ACTIVE") {
    throw new Error("Forbidden: User is not associated with this clinic or membership is inactive.");
  }

  const role = membership.role; // This is the UPPERCASE DB enum role value!

  console.log("Setting cookies - tenantId:", tenantId, "role:", membership?.role);

  // 4. Set two cookies
  cookieStore.set("active_tenant_id", tenantId, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  cookieStore.set("user_role", membership.role, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  // 5. Redirect to dashboard
  redirect("/dashboard");
}
