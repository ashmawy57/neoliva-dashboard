'use server'

import { revalidatePath } from "next/cache";
import { LabOrderService } from "@/services/lab-order.service";
import { resolveTenantContext } from "@/lib/tenant-context";

const labOrderService = new LabOrderService();

export async function getLabOrders() {
  try {
    const tenantId = await resolveTenantContext();
    const data = await labOrderService.getLabOrders(tenantId);

    return data.map((order) => ({
      id: order.id,
      displayId: order.displayId || order.id,
      patient: (order as any).patient?.name || "Unknown Patient",
      patientId: order.patientId,
      item: order.itemDescription,
      labName: order.labName,
      dateSent: order.sendDate ? new Date(order.sendDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : '—',
      dateDue: order.expectedReturnDate ? new Date(order.expectedReturnDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "N/A",
      status: order.status,
      cost: Number(order.cost) || 0,
      notes: order.notes
    }));
  } catch (error) {
    console.error("Error fetching lab orders:", error);
    return [];
  }
}

export async function createLabOrder(formData: {
  patientId: string;
  labName: string;
  itemDescription: string;
  sendDate?: string;
  expectedReturnDate?: string;
  cost?: number;
  status?: any;
  notes?: string;
}) {
  try {
    const tenantId = await resolveTenantContext();
    const data = await labOrderService.createLabOrder(tenantId, formData);

    revalidatePath('/lab-orders');
    return data;
  } catch (error: any) {
    console.error("Error creating lab order:", error);
    throw new Error("Failed to create lab order");
  }
}

export async function updateLabOrder(id: string, updates: any) {
  try {
    const tenantId = await resolveTenantContext();
    const data = await labOrderService.updateLabOrder(tenantId, id, updates);

    revalidatePath('/lab-orders');
    return data;
  } catch (error: any) {
    console.error("Error updating lab order:", error);
    throw new Error("Failed to update lab order");
  }
}

export async function deleteLabOrder(id: string) {
  try {
    const tenantId = await resolveTenantContext();
    await labOrderService.deleteLabOrder(tenantId, id);

    revalidatePath('/lab-orders');
    return true;
  } catch (error: any) {
    console.error("Error deleting lab order:", error);
    throw new Error("Failed to delete lab order");
  }
}

