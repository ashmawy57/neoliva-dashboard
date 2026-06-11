const { PrismaClient } = require('../src/generated/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkMemberships() {
  const connectionString = process.env.DATABASE_URL;
  console.log("DB URL:", connectionString ? "Found" : "Missing");
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const email = "ashmawyalaa@gmail.com";
    console.log(`Checking user by email: ${email}`);
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log("User not found in DB.");
      return;
    }

    console.log("User found:", user);

    console.log("\n--- Tenant Memberships ---");
    const tenantMemberships = await prisma.tenantMembership.findMany({
      where: { userId: user.id },
      include: { tenant: true }
    });
    console.log(`Found ${tenantMemberships.length} tenant memberships:`);
    tenantMemberships.forEach(tm => {
      console.log(`- Tenant: ${tm.tenant.name} (${tm.tenantId}), Role: ${tm.role}, Status: ${tm.status}, Active: ${tm.isActive}`);
    });

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkMemberships();
