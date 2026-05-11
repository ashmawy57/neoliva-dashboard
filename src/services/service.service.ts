import { ServiceRepository } from "@/repositories/service.repository";
import { resolveTenantContext } from "@/lib/tenant-context";
import { ServiceCategory } from "@prisma/client";

export class ServiceService {
  private repository = new ServiceRepository();

  async getServices() {
    const tenantId = await resolveTenantContext();
    console.log(`[ServiceService] Fetching services for tenant: ${tenantId}`);
    
    const services = await this.repository.findMany(tenantId, {
      orderBy: { name: 'asc' }
    });

    console.log(`[ServiceService] Found ${services.length} services`);
    
    // Convert Decimal to number for serialization to Client Components
    return services.map(s => ({
      ...s,
      price: Number(s.price)
    }));
  }

  async createService(data: {
    name: string;
    category: ServiceCategory;
    price: number;
    duration: number;
    description?: string;
  }) {
    const tenantId = await resolveTenantContext();
    console.log(`[ServiceService] Creating service for tenant ${tenantId}:`, data);
    
    const result = await this.repository.create(tenantId, {
      name: data.name,
      category: data.category,
      price: data.price,
      duration: data.duration,
      description: data.description
    });

    return this.serializeService(result);
  }

  async updateService(id: string, data: Partial<{
    name: string;
    category: ServiceCategory;
    price: number;
    duration: number;
    description: string;
  }>) {
    const tenantId = await resolveTenantContext();
    console.log(`[ServiceService] Updating service ${id} for tenant ${tenantId}:`, data);
    
    const result = await this.repository.update(tenantId, id, {
      ...data,
      updatedAt: new Date()
    });

    return this.serializeService(result);
  }

  async deleteService(id: string) {
    const tenantId = await resolveTenantContext();
    console.log(`[ServiceService] Soft deleting service ${id} for tenant ${tenantId}`);
    const result = await this.repository.softDelete(tenantId, id);
    return this.serializeService(result);
  }

  private serializeService(s: any) {
    if (!s) return null;
    return {
      ...s,
      price: s.price ? Number(s.price) : 0
    };
  }
}
