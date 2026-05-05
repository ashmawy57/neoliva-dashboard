'use server'

import { revalidatePath } from 'next/cache'
import { StaffService } from "@/services/staff.service";
import { resolveTenantContext } from "@/lib/tenant-context";

const staffService = new StaffService();

export async function getStaff() {
  try {
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

export async function createStaff(formData: { name: string; role: string; title: string; email: string; phone: string; invite: boolean }) {
  try {
    const tenantId = await resolveTenantContext();
    const data = await staffService.createStaffMember(tenantId, formData);

    revalidatePath('/staff');
    return data;
  } catch (error: any) {
    console.error('Error creating staff:', error);
    throw new Error('Failed to create staff member');
  }
}

export async function updateStaff(id: string, updates: Partial<{ name: string; role: string; title: string; email: string; phone: string; status: string }>) {
  try {
    const tenantId = await resolveTenantContext();
    const data = await staffService.updateStaffMember(tenantId, id, updates);

    revalidatePath('/staff');
    return data;
  } catch (error: any) {
    console.error('Error updating staff:', error);
    throw new Error('Failed to update staff member');
  }
}

export async function deleteStaff(id: string) {
  try {
    const tenantId = await resolveTenantContext();
    await staffService.deleteStaffMember(tenantId, id);

    revalidatePath('/staff');
    return true;
  } catch (error: any) {
    console.error('Error deleting staff:', error);
    throw new Error('Failed to delete staff member');
  }
}

