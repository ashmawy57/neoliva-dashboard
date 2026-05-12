import "server-only";
import { StaffRepository } from "@/repositories/staff.repository";
import { StaffRole } from "@/generated/client";

export class StaffService {
  private repository = new StaffRepository();

  private normalizeString(val: string | undefined | null, fallback: string = ""): string {
    if (!val || typeof val !== 'string') return fallback;
    return val.trim();
  }

  private getSafeStaffFallback(id?: string) {
    return {
      id: id || "unknown",
      displayId: "STF-0000",
      name: "—",
      role: "STAFF" as StaffRole,
      title: "",
      email: "",
      phone: "",
      status: "Offline",
      createdAt: new Date(),
      updatedAt: new Date(),
      tenantId: "unknown",
    };
  }

  private validateTenant(tenantId: string) {
    if (!tenantId) {
      throw new Error("[StaffService] Missing tenantId");
    }
  }

  private serializeStaff(staff: any) {
    if (!staff) return this.getSafeStaffFallback();
    try {
      return JSON.parse(JSON.stringify(staff));
    } catch (error) {
      console.error("[StaffService.serialize] Serialization error:", error);
      return this.getSafeStaffFallback(staff?.id);
    }
  }

  async getStaffList(tenantId: string) {
    try {
      this.validateTenant(tenantId);
      const staff = await this.repository.findMany(tenantId, {
        orderBy: { name: 'asc' }
      });
      return (staff || []).map(s => this.serializeStaff(s));
    } catch (error) {
      console.error("[StaffService.getStaffList] Error:", error);
      return [];
    }
  }

  async createStaffMember(tenantId: string, data: any) {
    try {
      this.validateTenant(tenantId);
      const inviteToken = crypto.randomUUID();
      const inviteExpiresAt = new Date();
      inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7); // 7 days expiry

      const result = await this.repository.create(tenantId, {
        displayId: `STF-${Math.floor(1000 + Math.random() * 9000)}`,
        name: this.normalizeString(data.name, "New Staff"),
        role: (data.role || "STAFF").toUpperCase() as StaffRole,
        title: this.normalizeString(data.title),
        email: this.normalizeString(data.email).toLowerCase(),
        phone: this.normalizeString(data.phone),
        status: 'Offline',
        inviteToken,
        inviteExpiresAt,
        inviteAccepted: false
      });
      return this.serializeStaff(result);
    } catch (error) {
      console.error("[StaffService.createStaffMember] Error:", error);
      return this.getSafeStaffFallback();
    }
  }

  async updateStaffMember(tenantId: string, id: string, updates: any) {
    try {
      this.validateTenant(tenantId);
      const formattedUpdates = { 
        ...updates,
        name: updates.name ? this.normalizeString(updates.name) : undefined,
        email: updates.email ? this.normalizeString(updates.email).toLowerCase() : undefined,
        phone: updates.phone ? this.normalizeString(updates.phone) : undefined,
      };
      
      if (formattedUpdates.role) {
        formattedUpdates.role = formattedUpdates.role.toUpperCase();
      }
      
      const result = await this.repository.update(tenantId, id, {
        ...formattedUpdates,
        updatedAt: new Date()
      });
      return this.serializeStaff(result);
    } catch (error) {
      console.error("[StaffService.updateStaffMember] Error:", error);
      return this.getSafeStaffFallback(id);
    }
  }

  async deleteStaffMember(tenantId: string, id: string) {
    try {
      this.validateTenant(tenantId);
      return await this.repository.delete(tenantId, id);
    } catch (error) {
      console.error("[StaffService.deleteStaffMember] Error:", error);
      return false;
    }
  }
}

