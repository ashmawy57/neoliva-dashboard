import { PrismaClient } from "../src/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
const { Pool } = pkg;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("Models in generated client:", Object.keys(prisma).filter(k => !k.startsWith('$')));
  
  if ((prisma as any).inventoryItem) {
    console.log("SUCCESS: inventoryItem found in generated client.");
  } else {
    console.log("FAILURE: inventoryItem NOT found in generated client.");
  }
  
  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
