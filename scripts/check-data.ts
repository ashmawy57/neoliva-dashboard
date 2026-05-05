import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const staffCount = await prisma.staff.count();
  const patientCount = await prisma.patient.count();
  console.log('Staff count:', staffCount);
  console.log('Patient count:', patientCount);
  
  const sampleTenant = await prisma.tenant.findFirst();
  console.log('Sample tenant:', sampleTenant);
}

main().finally(() => prisma.$disconnect());
