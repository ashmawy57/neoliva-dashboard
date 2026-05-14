const { PrismaClient } = require('../src/generated/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkData() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const patients = await prisma.patient.count();
    const services = await prisma.service.count();
    const appointments = await prisma.appointment.count();
    const users = await prisma.user.count();
    const tenants = await prisma.tenant.findMany();
    
    console.log("Database Stats:");
    console.log("- Patients:", patients);
    console.log("- Services:", services);
    console.log("- Appointments:", appointments);
    console.log("- Users:", users);
    console.log("- Tenants:", tenants.length);
    tenants.forEach(t => console.log(`  - ${t.name} (${t.id})`));

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkData();
