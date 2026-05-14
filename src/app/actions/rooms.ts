'use server';
import { RoomService, RoomSchema, RoomAssignmentSchema } from '@/services/room.service';
import { getTenantContext } from '@/lib/tenant-context';
import { revalidatePath } from 'next/cache';

/**
 * Server Action: Create a new room
 */
export async function createRoomAction(data: any) {
  try {
    const { tenantId } = await getTenantContext();
    const validated = RoomSchema.parse(data);
    
    await RoomService.createRoom(tenantId, validated);
    
    revalidatePath('/dashboard/settings/rooms');
    return { success: true };
  } catch (error: any) {
    console.error('[createRoomAction] Failed:', error);
    return { success: false, error: error.message || 'Failed to create room' };
  }
}

/**
 * Server Action: Update room details
 */
export async function updateRoomAction(roomId: string, data: any) {
  try {
    const { tenantId } = await getTenantContext();
    const validated = RoomSchema.partial().parse(data);
    
    await RoomService.updateRoom(tenantId, roomId, validated);
    
    revalidatePath('/dashboard/settings/rooms');
    return { success: true };
  } catch (error: any) {
    console.error('[updateRoomAction] Failed:', error);
    return { success: false, error: error.message || 'Failed to update room' };
  }
}

/**
 * Server Action: Assign staff to room
 */
export async function assignRoomStaffAction(data: any) {
  try {
    const { tenantId } = await getTenantContext();
    const validated = RoomAssignmentSchema.parse(data);
    
    await RoomService.assignStaffToRoom(tenantId, validated);
    
    revalidatePath(`/dashboard/settings/rooms/${validated.roomId}`);
    return { success: true };
  } catch (error: any) {
    console.error('[assignRoomStaffAction] Failed:', error);
    return { success: false, error: error.message || 'Failed to assign staff' };
  }
}

/**
 * Server Action: Remove staff from room
 */
export async function removeRoomStaffAction(roomId: string, userId: string) {
  try {
    const { tenantId } = await getTenantContext();
    
    await RoomService.removeStaffFromRoom(tenantId, roomId, userId);
    
    revalidatePath(`/dashboard/settings/rooms/${roomId}`);
    return { success: true };
  } catch (error: any) {
    console.error('[removeRoomStaffAction] Failed:', error);
    return { success: false, error: error.message || 'Failed to remove staff' };
  }
}

/**
 * Server Action: Change room operational status
 */
export async function updateRoomStatusAction(roomId: string, status: any) {
  try {
    const { tenantId } = await getTenantContext();
    
    await RoomService.changeRoomStatus(tenantId, roomId, status);
    
    revalidatePath('/dashboard/rooms');
    return { success: true };
  } catch (error: any) {
    console.error('[updateRoomStatusAction] Failed:', error);
    return { success: false, error: error.message || 'Failed to update status' };
  }
}

/**
 * Server Action: Add a chair to a room
 */
export async function addChairAction(roomId: string, name: string, code?: string) {
  try {
    const { tenantId } = await getTenantContext();
    
    await RoomService.addChairToRoom(tenantId, roomId, name, code);
    
    revalidatePath(`/dashboard/settings/rooms/${roomId}`);
    return { success: true };
  } catch (error: any) {
    console.error('[addChairAction] Failed:', error);
    return { success: false, error: error.message || 'Failed to add chair' };
  }
}
