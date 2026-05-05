import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  const tenants = await prisma.$queryRawUnsafe('SELECT id FROM tenants WHERE slug = \'default\'');
  console.log(JSON.stringify(tenants));
  await pool.end();
}
main();
