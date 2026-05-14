const { PrismaClient } = require('../src/generated/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkServices() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const services = await prisma.service.findMany({
      include: {
        tenant: true
      }
    });
    
    console.log("Total services in DB:", services.length);
    services.forEach(s => {
      console.log(`- Service: ${s.name}, Price: ${s.price}, Tenant: ${s.tenant.name} (${s.tenantId}), Active: ${s.isActive}`);
    });

    const tenants = await prisma.tenant.findMany();
    console.log("\nAll Tenants:");
    tenants.forEach(t => {
      console.log(`- ${t.name} (${t.id})`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkServices();
