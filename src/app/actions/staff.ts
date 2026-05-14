'use server'

import { revalidatePath } from 'next/cache'
import { StaffService } from "@/services/staff.service";
import { resolveTenantContext } from "@/lib/tenant-context";
import { requirePermission } from "@/lib/rbac";
import { PermissionCode } from "@/types/permissions";
import { EventService } from "@/services/event.service";

import { wrapAction } from "@/lib/observability/wrap-action";

const staffService = new StaffService();

/**
 * Server Action: Fetches all staff members.
 */
export async function getStaff() {
  try {
    await requirePermission(PermissionCode.STAFF_VIEW);
    const tenantId = await resolveTenantContext();
    const data = await staffService.getStaffList(tenantId);

    const getInitials = (name: string) => {
      const parts = name?.split(' ') || [];
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return (name?.[0] || 'S').toUpperCase();
    }

    const colors = [
      'from-blue-500 to-indigo-600',
      'from-violet-500 to-purple-600',
      'from-pink-500 to-rose-600',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600'
    ];

    return data.map((member, index) => {
      const colorIndex = index % colors.length;
      
      const formatRole = (roleStr: string) => {
        if (!roleStr) return 'Receptionist';
        return roleStr.charAt(0).toUpperCase() + roleStr.slice(1).toLowerCase();
      };

      return {
        id: member.id,
        name: member.name || 'Unknown',
        role: formatRole(member.role),
        title: member.title || 'Staff',
        phone: member.phone || '—',
        email: member.email || '—',
        avatar: getInitials(member.name),
        color: colors[colorIndex],
        status: member.status || 'Offline'
      }
    })
  } catch (error) {
    console.error('Error fetching staff:', error);
    return [];
  }
}

/**
 * Server Action: Creates a new staff member.
 */
export const createStaff = wrapAction(
  'STAFF_CREATE',
  async (formData: { name: string; role: string; title: string; email: string; phone: string; invite: boolean }) => {
    await requirePermission(PermissionCode.STAFF_MANAGE);
    const tenantId = await resolveTenantContext();
    const result = await staffService.createStaffMember(tenantId, formData);

    await EventService.trackEvent({
      tenantId,
      eventType: formData.invite ? 'STAFF_INVITED' : 'STAFF_ROLE_CHANGED', // Use role changed as fallback for non-invite creation
      entityType: 'STAFF',
      entityId: result.id,
      metadata: { role: formData.role, invited: formData.invite }
    });

    revalidatePath('/staff');
    return result;
  },
  { module: 'staff', entityType: 'STAFF' }
);

/**
 * Server Action: Updates a staff member.
 */
export const updateStaff = wrapAction(
  'STAFF_UPDATE',
  async (id: string, updates: Partial<{ name: string; role: string; title: string; email: string; phone: string; status: string }>) => {
    await requirePermission(PermissionCode.STAFF_MANAGE);
    const tenantId = await resolveTenantContext();
    const result = await staffService.updateStaffMember(tenantId, id, updates);

    if (updates.role) {
      await EventService.trackEvent({
        tenantId,
        eventType: 'STAFF_ROLE_CHANGED',
        entityType: 'STAFF',
        entityId: id,
        metadata: { newRole: updates.role }
      });
    }

    revalidatePath('/staff');
    return result;
  },
  { module: 'staff', entityType: 'STAFF' }
);

/**
 * Server Action: Deletes a staff member.
 */
export const deleteStaff = wrapAction(
  'STAFF_DELETE',
  async (id: string) => {
    await requirePermission(PermissionCode.STAFF_MANAGE);
    const tenantId = await resolveTenantContext();
    await staffService.deleteStaffMember(tenantId, id);

    await EventService.trackEvent({
      tenantId,
      eventType: 'STAFF_DELETED',
      entityType: 'STAFF',
      entityId: id
    });

    revalidatePath('/staff');
    return { success: true };
  },
  { module: 'staff', entityType: 'STAFF' }
);


