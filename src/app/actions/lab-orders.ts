'use server'

import { revalidatePath } from "next/cache";
import { LabOrderService } from "@/services/lab-order.service";
import { LabOrderStatus } from "@/generated/client";
import { resolveTenantContext } from "@/lib/tenant-context";

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
    const tenantId = await resolveTenantContext();
    const result = await labOrderService.createLabOrder(tenantId, data);
    revalidatePath('/lab-orders');
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error in createLabOrderAction:", error);
    return { success: false, error: error.message };
  }
}

export async function updateLabOrderStatusAction(id: string, status: LabOrderStatus) {
  try {
    const tenantId = await resolveTenantContext();
    const result = await labOrderService.updateLabOrderStatus(tenantId, id, status);
    revalidatePath('/lab-orders');
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error in updateLabOrderStatusAction:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteLabOrderAction(id: string) {
  try {
    const tenantId = await resolveTenantContext();
    await labOrderService.deleteLabOrder(tenantId, id);
    revalidatePath('/lab-orders');
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteLabOrderAction:", error);
    return { success: false, error: error.message };
  }
}
