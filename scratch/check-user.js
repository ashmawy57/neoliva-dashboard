const { PrismaClient } = require('../src/generated/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkUser() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.findFirst({
      where: { email: "ashmawyalaa@gmail.com" },
      include: {
        tenant: true,
        staff: true
      }
    });
    
    if (user) {
      console.log("User found:");
      console.log("- ID:", user.id);
      console.log("- Email:", user.email);
      console.log("- Tenant:", user.tenant.name, `(${user.tenantId})`);
      console.log("- Staff record exists:", !!user.staff);
      
      const services = await prisma.service.findMany({
        where: { tenantId: user.tenantId }
      });
      console.log("- Services for this tenant:", services.length);
    } else {
      console.log("User not found.");
    }

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkUser();
