import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export class TenantContextError extends Error {
  constructor(message: string, public code: 'UNAUTHORIZED' | 'NO_USER_RECORD' | 'NO_TENANT' | 'PENDING' | 'REJECTED') {
    super(message);
    this.name = 'TenantContextError';
  }
}

/**
 * Resolves the current tenant context from the authenticated user session.
 * Includes "self-healing" logic to link orphaned staff members on first login.
 */
export async function resolveTenantContext(): Promise<string> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new TenantContextError("Unauthorized: No active session found.", 'UNAUTHORIZED');
  }

  // 1. Try to find the user record with its associated staff invitation status and tenant status
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: {
      tenant: {
        select: { status: true }
      },
      staff: {
        select: { inviteAccepted: true }
      }
    }
  });

  // 2. Strict Check: If User record exists, they must have an accepted invite and approved tenant
  if (dbUser) {
    if (!dbUser.staff?.inviteAccepted) {
      throw new TenantContextError(`Access Denied: Invitation not accepted for ${user.email}`, 'UNAUTHORIZED');
    }

    if (dbUser.tenant.status === 'PENDING') {
      redirect('/pending-approval');
    }
    if (dbUser.tenant.status === 'REJECTED') {
      redirect('/rejected');
    }

    return dbUser.tenantId;
  }

  // 3. Optional: Self-healing for unlinked staff members (DEV MODE ONLY)
  const isDev = process.env.NODE_ENV === 'development';
  const enableSelfHealing = process.env.ENABLE_SELF_HEALING === 'true';

  if (isDev && enableSelfHealing) {
    console.log(`[DEV] User record missing for ${user.email}. Attempting self-healing...`);
    
    const staff = await prisma.staff.findUnique({
      where: { email: user.email },
      include: { user: true }
    });

    if (staff && !staff.userId) {
      console.log(`[DEV] Linking orphaned staff member ${staff.email} to Supabase ID ${user.id}`);
      
      const recoveredUser = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            supabaseId: user.id,
            email: user.email!,
            tenantId: staff.tenantId,
            role: 'USER'
          }
        });

        await tx.staff.update({
          where: { id: staff.id },
          data: { 
            userId: newUser.id,
            inviteAccepted: true,
            status: 'Online'
          }
        });

        return newUser;
      });

      return recoveredUser.tenantId;
    }
  }

  // 4. Default: No User record = No Access
  throw new TenantContextError(`Access Denied: No active enrollment found for ${user.email}. Please use your invitation link.`, 'NO_USER_RECORD');
}
