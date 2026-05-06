'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAllTenants() {
  return await prisma.tenant.findMany({
    include: {
      _count: {
        select: { users: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateTenantStatus(tenantId: string, status: 'APPROVED' | 'REJECTED') {
  console.log(`[ADMIN] Updating tenant ${tenantId} to ${status}...`);
  try {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { status }
    });
    console.log(`[ADMIN] Tenant ${tenantId} updated successfully.`);
    
    revalidatePath('/admin/clinics');
    return { success: true };
  } catch (error) {
    console.error(`[ADMIN] Failed to update tenant:`, error);
    throw error;
  }
}
