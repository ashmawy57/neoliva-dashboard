import { StaffRepository } from "@/repositories/staff.repository";
import { Staff, Prisma } from "@prisma/client";

export class StaffService {
  private repository = new StaffRepository();

  async getStaffList(tenantId: string) {
    return this.repository.findAll(tenantId, {
      orderBy: { name: 'asc' }
    });
  }

  async createStaffMember(tenantId: string, data: any) {
    return this.repository.create(tenantId, {
      displayId: `STF-${Math.floor(1000 + Math.random() * 9000)}`,
      name: data.name,
      role: data.role.toUpperCase(),
      title: data.title,
      email: data.email,
      phone: data.phone,
      status: 'Online'
    });
  }

  async updateStaffMember(tenantId: string, id: string, updates: any) {
    const formattedUpdates = { ...updates };
    if (formattedUpdates.role) {
      formattedUpdates.role = formattedUpdates.role.toUpperCase();
    }
    
    return this.repository.update(tenantId, id, {
      ...formattedUpdates,
      updatedAt: new Date()
    });
  }

  async deleteStaffMember(tenantId: string, id: string) {
    return this.repository.delete(tenantId, id);
  }
}
