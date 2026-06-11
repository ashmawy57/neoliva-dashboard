'use server'

import { withPermission } from "@/lib/rbac/guard";


import { RoomOperationalService } from "@/services/room-operational.service";

import { revalidatePath } from "next/cache";



export async function getLiveRoomStatusAction() {
  try {
    return await withPermission('clinical', 'read', async (session) => {
      const tenantId = session.tenantId;
      const data = await RoomOperationalService.getLiveRoomStatus(tenantId);
          return { success: true, error: undefined, data };
    });
  } catch (error: any) {
    console.error("[getLiveRoomStatusAction] Failed:", error);
        return { success: false, data: undefined, error: error.message };
  }
}

export async function startSessionAction(appointmentId: string) {
  try {
    return await withPermission('clinical', 'read', async (session) => {
      const tenantId = session.tenantId;
      await RoomOperationalService.startSession(tenantId, appointmentId);
          revalidatePath("/dashboard/operations/rooms");
          return { success: true, error: undefined };
    });
  } catch (error: any) {
    return { success: false, data: undefined, error: error.message };
  }
}

export async function endSessionAction(appointmentId: string) {
  try {
    return await withPermission('clinical', 'read', async (session) => {
      const tenantId = session.tenantId;
      await RoomOperationalService.endSession(tenantId, appointmentId);
          revalidatePath("/dashboard/operations/rooms");
          return { success: true, error: undefined };
    });
  } catch (error: any) {
    return { success: false, data: undefined, error: error.message };
  }
}

export async function transferAppointmentAction(appointmentId: string, targetRoomId: string) {
  try {
    return await withPermission('clinical', 'read', async (session) => {
      const tenantId = session.tenantId;
      await RoomOperationalService.transferAppointment(tenantId, appointmentId, targetRoomId);
          revalidatePath("/dashboard/operations/rooms");
          return { success: true, error: undefined };
    });
  } catch (error: any) {
    return { success: false, data: undefined, error: error.message };
  }
}

export async function reorderQueueAction(roomId: string, appointmentIds: string[]) {
  try {
    return await withPermission('clinical', 'read', async (session) => {
      const tenantId = session.tenantId;
      await RoomOperationalService.reorderQueue(tenantId, roomId, appointmentIds);
          revalidatePath("/dashboard/operations/rooms");
          return { success: true, error: undefined };
    });
  } catch (error: any) {
    return { success: false, data: undefined, error: error.message };
  }
}

export async function updateRoomStatusAction(roomId: string, status: any) {
  try {
    return await withPermission('clinical', 'update', async (session) => {
      const tenantId = session.tenantId;
      await RoomOperationalService.updateRoomStatus(tenantId, roomId, status);
          revalidatePath("/dashboard/operations/rooms");
          return { success: true, error: undefined };
    });
  } catch (error: any) {
    return { success: false, data: undefined, error: error.message };
  }
}
export async function prioritizeAppointmentAction(appointmentId: string) {
  try {
    return await withPermission('clinical', 'read', async (session) => {
      const tenantId = session.tenantId;
      await RoomOperationalService.prioritizeAppointment(tenantId, appointmentId);
          revalidatePath("/dashboard/operations/rooms");
          return { success: true, error: undefined };
    });
  } catch (error: any) {
    return { success: false, data: undefined, error: error.message };
  }
}
