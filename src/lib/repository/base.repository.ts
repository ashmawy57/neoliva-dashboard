import 'server-only'
import { getUserSession } from '@/lib/rbac/session'
import type { UserSession } from '@/lib/rbac/session'

export abstract class BaseRepository {
  /**
   * Resolves the full user session. Throws if no active session exists.
   */
  protected async getSession(): Promise<UserSession> {
    const session = await getUserSession()
    if (!session) throw new Error('Unauthorized: No active session')
    return session
  }

  /**
   * Resolves the current tenant ID from the active session.
   * Throws if no active session exists.
   */
  protected async getTenantId(): Promise<string> {
    const session = await this.getSession()
    return session.tenantId
  }

  /**
   * Safe findMany — always injects tenantId into the where clause.
   * @param model  - Prisma delegate (e.g. prisma.patient)
   * @param args   - Standard Prisma findMany arguments (without tenantId)
   */
  protected async safeFindMany<T>(
    model: any,
    args: any = {}
  ): Promise<T[]> {
    const tenantId = await this.getTenantId()
    return model.findMany({
      ...args,
      where: { ...args.where, tenantId },
    })
  }

  /**
   * Safe findFirst — always injects tenantId into the where clause.
   * @param model  - Prisma delegate (e.g. prisma.patient)
   * @param args   - Standard Prisma findFirst arguments (without tenantId)
   */
  protected async safeFindFirst<T>(
    model: any,
    args: any = {}
  ): Promise<T | null> {
    const tenantId = await this.getTenantId()
    return model.findFirst({
      ...args,
      where: { ...args.where, tenantId },
    })
  }

  /**
   * Safe create — always injects tenantId into the data object.
   * @param model  - Prisma delegate (e.g. prisma.patient)
   * @param data   - Record data (without tenantId)
   */
  protected async safeCreate<T>(
    model: any,
    data: any
  ): Promise<T> {
    const tenantId = await this.getTenantId()
    return model.create({
      data: { ...data, tenantId },
    })
  }

  /**
   * Safe update — verifies tenant ownership before updating.
   * Throws if the record does not exist or belongs to another tenant.
   * @param model  - Prisma delegate (e.g. prisma.patient)
   * @param id     - Record ID
   * @param data   - Fields to update
   */
  protected async safeUpdate<T>(
    model: any,
    id: string,
    data: any
  ): Promise<T> {
    const tenantId = await this.getTenantId()
    const existing = await model.findFirst({
      where: { id, tenantId },
      select: { id: true },
    })
    if (!existing) throw new Error('Record not found or access denied')
    return model.update({ where: { id, tenantId }, data })
  }

  /**
   * Safe delete — verifies tenant ownership before deleting.
   * Throws if the record does not exist or belongs to another tenant.
   * @param model  - Prisma delegate (e.g. prisma.patient)
   * @param id     - Record ID
   */
  protected async safeDelete<T>(
    model: any,
    id: string
  ): Promise<T> {
    const tenantId = await this.getTenantId()
    const existing = await model.findFirst({
      where: { id, tenantId },
      select: { id: true },
    })
    if (!existing) throw new Error('Record not found or access denied')
    return model.delete({ where: { id, tenantId } })
  }
}
