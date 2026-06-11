import 'server-only'
import { BaseRepository } from './base.repository'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/client'

/**
 * StaffRepository (session-scoped)
 *
 * Extends BaseRepository so tenantId is always resolved from the active user
 * session — callers never pass tenantId explicitly.
 *
 * Note: The main staff operations (invitations, membership management) live in
 * src/repositories/staff.repository.ts (the explicit-tenantId pattern).
 * This class provides a session-auto-scoped complement for use in Server
 * Actions and Server Components that use the lib/repository pattern.
 *
 * Prisma models:
 *   Staff           (@@map("staff"))
 *   TenantMembership (@@map("tenant_memberships"))
 */
class StaffRepository extends BaseRepository {
  /**
   * Return all Staff profiles for the current tenant, newest first.
   */
  async findAll() {
    const tenantId = await this.getTenantId()
    return prisma.staff.findMany({
      where:   { tenantId },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Return a single Staff profile by ID.
   * Returns null if not found or belongs to another tenant.
   */
  async findById(id: string) {
    return this.safeFindFirst<Awaited<ReturnType<typeof prisma.staff.findFirst>>>(
      prisma.staff,
      { where: { id } }
    )
  }

  /**
   * Return active TenantMembership records with user + staff profile data,
   * suitable for populating staff selection dropdowns.
   */
  async findActiveMembers() {
    const tenantId = await this.getTenantId()
    return prisma.tenantMembership.findMany({
      where: { tenantId, isActive: true },
      select: {
        id:          true,
        userId:      true,
        role:        true,
        joinedAt:    true,
        user:        { select: { id: true, email: true } },
        staffProfile:{ select: { id: true, name: true, title: true, phone: true, avatarUrl: true } },
      },
      orderBy: { joinedAt: 'asc' },
    })
  }

  /**
   * Update a Staff profile by membership ID.
   * Verifies the profile belongs to the current tenant before updating.
   */
  async updateByMembershipId(membershipId: string, data: Prisma.StaffUpdateInput) {
    const tenantId = await this.getTenantId()
    const existing = await prisma.staff.findFirst({
      where:  { membershipId, tenantId },
      select: { id: true },
    })
    if (!existing) throw new Error('Staff profile not found or access denied')
    return prisma.staff.update({
      where: { membershipId, tenantId },
      data,
    })
  }
}

export const staffRepository = new StaffRepository()
