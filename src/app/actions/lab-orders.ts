'use server'

import { revalidatePath } from "next/cache";
import { LabOrderService } from "@/services/lab-order.service";
import { LabOrderStatus } from "@/generated/client";
import { resolveTenantContext } from "@/lib/tenant-context";
import { requirePermission } from "@/lib/rbac";
import { PermissionCode } from "@/types/permissions";
import { EventService } from "@/services/event.service";

const labOrderService = new LabOrderService();

export async function createLabOrderAction(data: {
  patientId: string;
  appointmentId?: string;
  labName: string;
  itemType: string;
  toothNumber?: string;
  cost?: number;
  dueDate?: string;
  notes?: string;
}) {
  try {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.CLINICAL_LAB_ORDER_MANAGE);
    const result = await labOrderService.createLabOrder(tenantId, data);

    await EventService.trackEvent({
      tenantId,
      eventType: 'LAB_ORDER_CREATED',
      entityType: 'LAB_ORDER',
      entityId: result.id,
      metadata: { labName: data.labName, itemType: data.itemType, cost: data.cost }
    });

    revalidatePath('/lab-orders');
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error in createLabOrderAction:", error);
    return { success: false, error: error.message };
  }
}

export async function updateLabOrderStatusAction(id: string, status: LabOrderStatus) {
  try {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.CLINICAL_LAB_ORDER_MANAGE);
    const result = await labOrderService.updateLabOrderStatus(tenantId, id, status);

    await EventService.trackEvent({
      tenantId,
      eventType: 'LAB_ORDER_STATUS_CHANGED',
      entityType: 'LAB_ORDER',
      entityId: id,
      metadata: { status }
    });

    revalidatePath('/lab-orders');
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error in updateLabOrderStatusAction:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteLabOrderAction(id: string) {
  try {
    const { tenantId } = await resolveTenantContext();
    await requirePermission(PermissionCode.CLINICAL_LAB_ORDER_MANAGE);
    await labOrderService.deleteLabOrder(tenantId, id);

    await EventService.trackEvent({
      tenantId,
      eventType: 'LAB_ORDER_DELETED',
      entityType: 'LAB_ORDER',
      entityId: id
    });

    revalidatePath('/lab-orders');
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteLabOrderAction:", error);
    return { success: false, error: error.message };
  }
}
