import { LabOrderRepository } from "@/repositories/lab-order.repository";
import { resolveTenantContext } from "@/lib/tenant-context";
import { LabOrderStatus } from "@prisma/client";

const repository = new LabOrderRepository();

export class LabOrderService {
  /**
   * Fetches and formats the list of lab orders for the UI
   */
  async getLabOrdersList() {
    const tenantId = await resolveTenantContext();
    const orders = await repository.findMany(tenantId, {
      orderBy: { createdAt: 'desc' }
    });

    return orders.map(order => ({
      ...order,
      cost: Number(order.cost || 0),
      patientName: order.patient?.name || "Unknown",
      patientDisplayId: order.patient?.displayId || "",
      // Ensure dates are serializable if used in Client Components
      sentAt: order.sentAt ? order.sentAt.toISOString() : null,
      dueDate: order.dueDate ? order.dueDate.toISOString() : null,
      receivedAt: order.receivedAt ? order.receivedAt.toISOString() : null,
      createdAt: order.createdAt ? order.createdAt.toISOString() : null,
    }));
  }

  /**
   * Calculates statistics for the lab orders dashboard
   */
  async getLabOrdersStats() {
    const tenantId = await resolveTenantContext();
    return await repository.getStats(tenantId);
  }

  /**
   * Creates a new lab order
   */
  async createLabOrder(data: {
    patientId: string;
    appointmentId?: string;
    labName: string;
    itemType: string;
    toothNumber?: string;
    cost?: number;
    dueDate?: string;
    notes?: string;
  }) {
    const tenantId = await resolveTenantContext();
    
    // Validation
    if (!data.patientId || !data.labName || !data.itemType) {
      throw new Error("Missing required fields: patientId, labName, or itemType");
    }

    const createData: any = {
      displayId: `LAB-${Math.floor(1000 + Math.random() * 9000)}`,
      labName: data.labName,
      itemType: data.itemType,
      toothNumber: data.toothNumber || null,
      cost: data.cost ? Number(data.cost) : 0,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      notes: data.notes || null,
      status: 'PENDING',
      patient: { connect: { id: data.patientId } },
    };

    if (data.appointmentId) {
      createData.appointment = { connect: { id: data.appointmentId } };
    }

    return await repository.create(tenantId, createData);
  }

  /**
   * Updates the status of a lab order and manages lifecycle dates
   */
  async updateLabOrderStatus(id: string, status: LabOrderStatus) {
    const tenantId = await resolveTenantContext();
    return await repository.updateStatus(tenantId, id, status);
  }

  /**
   * Simple delete for management
   */
  async deleteLabOrder(id: string) {
    const tenantId = await resolveTenantContext();
    return await repository.delete(tenantId, id);
  }
}
