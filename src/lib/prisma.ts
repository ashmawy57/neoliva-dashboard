import { PrismaClient, Prisma, InvoiceStatus, PaymentMethod } from "@/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Next.js App Router with Turbopack on Windows requires an adapter 
// to correctly initialize Prisma Client during SSR/Edge execution.
import { logger } from "./logger";

const createPrismaClient = () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({ 
    adapter,
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'stdout', level: 'error' },
      { emit: 'stdout', level: 'warn' },
    ],
  });

  // @ts-ignore
  client.$on('query', (e: any) => {
    logger.debug(`Prisma Query`, {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });

  return client;
};

// Use a more robust singleton pattern that can recover from stale instances
const getPrismaClient = () => {
  if (process.env.NODE_ENV === "production") {
    return createPrismaClient();
  }

  // In development, we use globalThis to persist the client across HMR
  // but we check if it's missing models (stale after schema changes)
  if (!globalForPrisma.prisma || !(globalForPrisma.prisma as any).ledgerAccount) {
    if (globalForPrisma.prisma) {
      console.warn("[Prisma] Stale client detected (missing ledgerAccount). Re-initializing...");
    }
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
};

export const prisma = getPrismaClient();

export default prisma;
// Last updated: 2026-05-14T01:13:00Z
