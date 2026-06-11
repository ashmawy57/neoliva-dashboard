'use server'

import { withPermission } from "@/lib/rbac/guard";

import { RoomService, RoomSchema, RoomAssignmentSchema } from '@/services/room.service';
import { StaffService } from '@/services/staff.service';

import { revalidatePath } from 'next/cache';

const staffService = new StaffService();


/**
 * Server Action: Create a new room
 */
export async function createRoomAction(data: any) {
  try {
    return await withPermission('clinical', 'create', async (session) => {
      const tenantId = session.tenantId;
      // Parse data with RoomSchema (slug is now optional)
          const result = RoomSchema.safeParse(data);
          if (!result.success) {
            const errorMsg = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            return { success: false, data: undefined, error: `Invalid input: ${errorMsg}` };
          }
      
          await RoomService.createRoom(tenantId, result.data);
          
          revalidatePath('/dashboard/settings/rooms');
          return { success: true, error: undefined };
    });
  } catch (error: any) {
    console.error('[createRoomAction] Failed:', error);
        return { success: false, data: undefined, error: error.message || 'Failed to create room' };
  }
}

/**
 * Server Action: Update room details
 */
export async function updateRoomAction(roomId: string, data: any) {
  try {
    return await withPermission('clinical', 'update', async (session) => {
      const tenantId = session.tenantId;
      const result = RoomSchema.partial().safeParse(data);
          if (!result.success) {
            const errorMsg = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            return { success: false, data: undefined, error: `Invalid input: ${errorMsg}` };
          }
          
          await RoomService.updateRoom(tenantId, roomId, result.data);
          
          revalidatePath('/dashboard/settings/rooms');
          return { success: true, error: undefined };
    });
  } catch (error: any) {
    console.error('[updateRoomAction] Failed:', error);
        return { success: false, data: undefined, error: error.message || 'Failed to update room' };
  }
}

/**
 * Server Action: Assign staff to room
 */
export async function assignRoomStaffAction(data: any) {
  try {
    return await withPermission('clinical', 'update', async (session) => {
      const tenantId = session.tenantId;
      const validated = RoomAssignmentSchema.parse(data);
          
          await RoomService.assignStaffToRoom(tenantId, validated);
          
          revalidatePath(`/dashboard/settings/rooms/${validated.roomId}`);
          return { success: true, error: undefined };
    });
  } catch (error: any) {
    console.error('[assignRoomStaffAction] Failed:', error);
        return { success: false, data: undefined, error: error.message || 'Failed to assign staff' };
  }
}

/**
 * Server Action: Remove staff from room
 */
export async function removeRoomStaffAction(roomId: string, userId: string) {
  try {
    return await withPermission('clinical', 'delete', async (session) => {
      const tenantId = session.tenantId;
      await RoomService.removeStaffFromRoom(tenantId, roomId, userId);
          
          revalidatePath(`/dashboard/settings/rooms/${roomId}`);
          return { success: true, error: undefined };
    });
  } catch (error: any) {
    console.error('[removeRoomStaffAction] Failed:', error);
        return { success: false, data: undefined, error: error.message || 'Failed to remove staff' };
  }
}

/**
 * Server Action: Change room operational status
 */
export async function updateRoomStatusAction(roomId: string, status: any) {
  try {
    return await withPermission('clinical', 'update', async (session) => {
      const tenantId = session.tenantId;
      await RoomService.changeRoomStatus(tenantId, roomId, status);
          
          revalidatePath('/dashboard/rooms');
          return { success: true, error: undefined };
    });
  } catch (error: any) {
    console.error('[updateRoomStatusAction] Failed:', error);
        return { success: false, data: undefined, error: error.message || 'Failed to update status' };
  }
}

/**
 * Server Action: Add a chair to a room
 */
export async function addChairAction(roomId: string, name: string, code?: string) {
  try {
    return await withPermission('clinical', 'create', async (session) => {
      const tenantId = session.tenantId;
      await RoomService.addChairToRoom(tenantId, roomId, name, code);
          
          revalidatePath(`/dashboard/settings/rooms/${roomId}`);
          return { success: true, error: undefined };
    });
  } catch (error: any) {
    console.error('[addChairAction] Failed:', error);
        return { success: false, data: undefined, error: error.message || 'Failed to add chair' };
  }
}

/**
 * Server Action: Get available staff for room assignment
 *
 * V2 FIX: Removed direct `prisma.tenantMembership.findMany` from this
 * action. The query is now owned by StaffRepository.findActiveMembers()
 * and exposed through StaffService.getStaffOptions().
 * Actions must never touch the database directly.
 */
export async function getStaffOptionsAction() {
  try {
    return await withPermission('clinical', 'read', async (session) => {
      const tenantId = session.tenantId;
      const data = await staffService.getStaffOptions(tenantId);
          return { success: true, error: undefined, data };
    });
  } catch (error: any) {
    console.error('[getStaffOptionsAction] Failed:', error);
        return { success: false, data: undefined, error: error.message || 'Failed to fetch staff' };
  }
}
