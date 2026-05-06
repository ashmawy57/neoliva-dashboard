import { ServiceRepository } from "@/repositories/service.repository";
import { Service, Prisma } from "@prisma/client";

export class ServiceService {
  private repository = new ServiceRepository();

  async getServices(tenantId: string) {
    return this.repository.findMany(tenantId, {
      orderBy: { name: 'asc' }
    });
  }

  async createService(tenantId: string, data: any) {
    const { inventoryUsages, ...serviceData } = data;
    
    return this.repository.create(tenantId, {
      ...serviceData,
      inventoryUsages: inventoryUsages?.length ? {
        create: inventoryUsages.map((usage: any) => ({
          inventoryId: usage.inventoryId,
          quantity: usage.quantity,
          tenantId: tenantId
        }))
      } : undefined
    });
  }

  async updateService(tenantId: string, id: string, data: any) {
    return this.repository.update(tenantId, id, {
      ...data,
      updatedAt: new Date()
    });
  }

  async deleteService(tenantId: string, id: string) {
    return this.repository.delete(tenantId, id);
  }
}
