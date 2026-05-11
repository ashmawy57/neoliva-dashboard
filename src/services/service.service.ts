import { ServiceRepository } from "@/repositories/service.repository";
import { resolveTenantContext } from "@/lib/tenant-context";
import { ServiceCategory } from "@/generated/client";

export class ServiceService {
  private repository = new ServiceRepository();

  async getServices() {
    const tenantId = await resolveTenantContext();
    console.log(`[ServiceService] Fetching services for tenant: ${tenantId}`);
    
    const services = await this.repository.findMany(tenantId, {
      orderBy: { name: 'asc' }
    });

    console.log(`[ServiceService] Found ${services.length} services`);
    
    // Ensure plain objects for Next.js Client Components
    return services.map(s => this.serializeService(s));
  }

  async createService(data: {
    name: string;
    category: ServiceCategory;
    price: number;
    duration: number;
    description?: string;
    popular?: boolean;
  }) {
    const tenantId = await resolveTenantContext();
    console.log(`[ServiceService] Creating service for tenant ${tenantId}:`, data);
    
    const result = await this.repository.create(tenantId, {
      name: data.name,
      category: data.category,
      price: data.price,
      duration: data.duration,
      description: data.description,
      popular: data.popular
    });

    return this.serializeService(result);
  }

  async updateService(id: string, data: Partial<{
    name: string;
    category: ServiceCategory;
    price: number;
    duration: number;
    description: string;
    popular: boolean;
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
    
    // Convert to plain object and handle Decimal/Date types
    return {
      id: s.id,
      tenantId: s.tenantId,
      name: s.name,
      description: s.description,
      price: s.price ? Number(s.price) : 0,
      duration: s.duration,
      category: s.category,
      isActive: s.isActive,
      popular: s.popular,
      createdAt: s.createdAt ? s.createdAt.toISOString() : null,
      updatedAt: s.updatedAt ? s.updatedAt.toISOString() : null,
    };
  }
}
