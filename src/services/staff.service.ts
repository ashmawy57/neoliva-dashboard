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
      
      const [members, invitations] = await Promise.all([
        this.repository.findMembers(tenantId),
        this.repository.findInvitations(tenantId)
      ]);

      const activeStaff = members.map(m => ({
        id: m.id,
        name: m.staffProfile?.name || m.user.email.split('@')[0],
        email: m.user.email,
        role: m.role,
        status: 'Active',
        isPending: false,
        joinedAt: m.joinedAt
      }));

      const pendingStaff = invitations.map(i => ({
        id: i.id,
        name: i.fullName,
        email: i.email,
        role: i.role,
        status: 'Pending',
        isPending: true,
        createdAt: i.createdAt
      }));

      return [...activeStaff, ...pendingStaff];
    } catch (error) {
      console.error("[StaffService.getStaffList] Error:", error);
      return [];
    }
  }

  async createStaffMember(tenantId: string, data: any) {
    // This now delegates to the secure invitation logic in auth actions
    // but we can keep it here if needed for direct creation by superadmins
    throw new Error("Use createStaffInvitation action for secure staff onboarding.");
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

