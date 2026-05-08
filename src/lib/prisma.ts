import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("CRITICAL: DATABASE_URL is not set in environment variables.");
  }

  const pool = new Pool({
    connectionString,
    max: 5,                        // Supabase free tier: keep low
    idleTimeoutMillis: 60000,      // 60s idle before closing
    connectionTimeoutMillis: 10000, // 10s to establish connection (was 2s)
    query_timeout: 30000,          // 30s max per query
    statement_timeout: 30000,      // 30s statement timeout
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
