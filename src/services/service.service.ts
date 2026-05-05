import { ServiceRepository } from "@/repositories/service.repository";
import { Service, Prisma } from "@prisma/client";

export class ServiceService {
  private repository = new ServiceRepository();

  async getServices(tenantId: string) {
    return this.repository.findAll(tenantId, {
      orderBy: { name: 'asc' }
    });
  }

  async createService(tenantId: string, data: any) {
    return this.repository.create(tenantId, {
      name: data.name,
      price: data.price,
      duration: data.duration,
      description: data.description,
      category: data.category,
      popular: data.popular || false
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
