import prisma from "@/lib/prisma";
import { Invoice, Prisma } from "@prisma/client";

export class InvoiceRepository {
  async findAll(tenantId: string, params?: {
    skip?: number;
    take?: number;
    include?: Prisma.InvoiceInclude;
    orderBy?: Prisma.InvoiceOrderByWithRelationInput;
  }): Promise<Invoice[]> {
    return prisma.invoice.findMany({
      ...params,
      where: {
        tenantId,
      },
    });
  }

  async findById(tenantId: string, id: string): Promise<Invoice | null> {
    return prisma.invoice.findFirst({
      where: {
        id,
        tenantId,
      },
    });
  }

  async create(tenantId: string, data: Omit<Prisma.InvoiceCreateInput, 'tenant'>): Promise<Invoice> {
    return prisma.invoice.create({
      data: {
        ...data,
        tenant: { connect: { id: tenantId } },
      },
    });
  }

  async update(tenantId: string, id: string, data: Prisma.InvoiceUpdateInput): Promise<Invoice> {
    return prisma.invoice.update({
      where: {
        id,
        tenantId,
      },
      data,
    });
  }

  async delete(tenantId: string, id: string): Promise<Invoice> {
    return prisma.invoice.delete({
      where: {
        id,
        tenantId,
      },
    });
  }
}
