import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { StaffRole } from "@prisma/client";

export type Permission = 
  | 'VIEW_PATIENTS' | 'MANAGE_PATIENTS'
  | 'VIEW_APPOINTMENTS' | 'MANAGE_APPOINTMENTS'
  | 'VIEW_STAFF' | 'MANAGE_STAFF'
  | 'VIEW_REPORTS' | 'MANAGE_SETTINGS';

const ROLE_PERMISSIONS: Record<StaffRole, Permission[]> = {
  ADMIN: [
    'VIEW_PATIENTS', 'MANAGE_PATIENTS',
    'VIEW_APPOINTMENTS', 'MANAGE_APPOINTMENTS',
    'VIEW_STAFF', 'MANAGE_STAFF',
    'VIEW_REPORTS', 'MANAGE_SETTINGS'
  ],
  DOCTOR: [
    'VIEW_PATIENTS', 'MANAGE_PATIENTS',
    'VIEW_APPOINTMENTS', 'MANAGE_APPOINTMENTS',
    'VIEW_REPORTS'
  ],
  ASSISTANT: [
    'VIEW_PATIENTS',
    'VIEW_APPOINTMENTS', 'MANAGE_APPOINTMENTS'
  ],
  RECEPTIONIST: [
    'VIEW_PATIENTS',
    'VIEW_APPOINTMENTS', 'MANAGE_APPOINTMENTS'
  ]
};

export async function getCurrentUserRole(): Promise<StaffRole | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: { staff: true }
  });

  return (dbUser?.staff?.role as StaffRole) || null;
}

export async function hasPermission(permission: Permission): Promise<boolean> {
  const role = await getCurrentUserRole();
  if (!role) return false;

  return ROLE_PERMISSIONS[role].includes(permission);
}

export async function ensurePermission(permission: Permission) {
  const allowed = await hasPermission(permission);
  if (!allowed) {
    throw new Error("Forbidden: You do not have permission to perform this action.");
  }
}
