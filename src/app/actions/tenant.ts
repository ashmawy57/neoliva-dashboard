'use server'

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createClinicRequest(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  const supabase = await createClient();
  
  // Use the production URL from env, fallback to localhost for dev
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // 1. Create Supabase User
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    }
  });

  if (authError || !authData.user) {
    return { error: authError?.message || "Failed to create authentication account" };
  }

  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // 2. Create Tenant, User, and Staff in a transaction
    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name,
          slug,
          status: 'PENDING'
        }
      });

      const staff = await tx.staff.create({
        data: {
          name,
          email,
          role: 'ADMIN',
          tenantId: tenant.id,
          inviteAccepted: true,
          status: 'Online'
        }
      });

      await tx.user.create({
        data: {
          supabaseId: authData.user!.id,
          email,
          tenantId: tenant.id,
          role: 'ADMIN',
          staffId: staff.id
        }
      });
    });

    // 3. Success -> Redirect
    // Note: User is now signed up in Supabase but their Tenant is PENDING
    // Dashboard layout will catch this and redirect to /pending-approval
  } catch (error: any) {
    console.error("Clinic creation error:", error);
    // Cleanup Supabase user if DB fails? (Optional)
    return { error: "Failed to create clinic request. Please try again." };
  }

  redirect("/pending-approval");
}

export async function updateTenantStatus(tenantId: string, status: 'APPROVED' | 'REJECTED') {
  // TODO: Check if current user is a SUPER_ADMIN
  // For now, we assume simple access
  
  try {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { status }
    });
    
    revalidatePath("/admin/clinics");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update tenant status" };
  }
}
