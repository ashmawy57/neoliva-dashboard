'use server';

import { RoomOperationalService } from "@/services/room-operational.service";
import { getTenantContext } from "@/lib/tenant-context";
import { revalidatePath } from "next/cache";
import { getUserPermissions } from "@/lib/rbac";
import { PermissionCode } from "@/types/permissions";

export async function getLiveRoomStatusAction() {
  try {
    const permissions = await getUserPermissions();
    if (!permissions.has(PermissionCode.ROOM_VIEW)) {
      throw new Error("Unauthorized: Insufficient permissions");
    }

    const { tenantId } = await getTenantContext();
    const data = await RoomOperationalService.getLiveRoomStatus(tenantId);
    return { success: true, data };
  } catch (error: any) {
    console.error("[getLiveRoomStatusAction] Failed:", error);
    return { success: false, error: error.message };
  }
}

export async function startSessionAction(appointmentId: string) {
  try {
    const permissions = await getUserPermissions();
    if (!permissions.has(PermissionCode.ROOM_MANAGE)) {
      throw new Error("Unauthorized: Insufficient permissions");
    }

    const { tenantId } = await getTenantContext();
    await RoomOperationalService.startSession(tenantId, appointmentId);
    revalidatePath("/dashboard/operations/rooms");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function endSessionAction(appointmentId: string) {
  try {
    const permissions = await getUserPermissions();
    if (!permissions.has(PermissionCode.ROOM_MANAGE)) {
      throw new Error("Unauthorized: Insufficient permissions");
    }

    const { tenantId } = await getTenantContext();
    await RoomOperationalService.endSession(tenantId, appointmentId);
    revalidatePath("/dashboard/operations/rooms");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function transferAppointmentAction(appointmentId: string, targetRoomId: string) {
  try {
    const permissions = await getUserPermissions();
    if (!permissions.has(PermissionCode.ROOM_MANAGE)) {
      throw new Error("Unauthorized: Insufficient permissions");
    }

    const { tenantId } = await getTenantContext();
    await RoomOperationalService.transferAppointment(tenantId, appointmentId, targetRoomId);
    revalidatePath("/dashboard/operations/rooms");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function reorderQueueAction(roomId: string, appointmentIds: string[]) {
  try {
    const permissions = await getUserPermissions();
    if (!permissions.has(PermissionCode.ROOM_MANAGE)) {
      throw new Error("Unauthorized: Insufficient permissions");
    }

    const { tenantId } = await getTenantContext();
    await RoomOperationalService.reorderQueue(tenantId, roomId, appointmentIds);
    revalidatePath("/dashboard/operations/rooms");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateRoomStatusAction(roomId: string, status: any) {
  try {
    const permissions = await getUserPermissions();
    if (!permissions.has(PermissionCode.ROOM_MANAGE)) {
      throw new Error("Unauthorized: Insufficient permissions");
    }

    const { tenantId } = await getTenantContext();
    await RoomOperationalService.updateRoomStatus(tenantId, roomId, status);
    revalidatePath("/dashboard/operations/rooms");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
export async function prioritizeAppointmentAction(appointmentId: string) {
  try {
    const permissions = await getUserPermissions();
    if (!permissions.has(PermissionCode.ROOM_MANAGE)) {
      throw new Error("Unauthorized: Insufficient permissions");
    }

    const { tenantId } = await getTenantContext();
    await RoomOperationalService.prioritizeAppointment(tenantId, appointmentId);
    revalidatePath("/dashboard/operations/rooms");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
