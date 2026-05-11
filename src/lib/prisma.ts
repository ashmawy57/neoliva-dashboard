import "server-only";
import { PrismaClient, Prisma, InvoiceStatus, PaymentMethod } from "@/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Next.js App Router with Turbopack on Windows requires an adapter 
// to correctly initialize Prisma Client during SSR/Edge execution.
const createPrismaClient = () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
// Last updated: 2026-05-12T01:34:00Z
