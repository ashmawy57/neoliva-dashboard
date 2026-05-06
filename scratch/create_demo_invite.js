require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("No database URL found in environment.");
    process.exit(1);
  }
  
  const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      console.log("No tenants found in database.");
      return;
    }

    const token = 'test-demo-123';
    
    // Check if it exists
    const existing = await prisma.staff.findFirst({ where: { inviteToken: token } });
    if (existing) {
      console.log(`Token already exists for: ${existing.email}`);
    } else {
      await prisma.staff.create({
        data: {
          name: 'Demo Doctor',
          email: 'demo@example.com',
          role: 'DOCTOR', // Must be uppercase as per StaffRole enum
          inviteToken: token,
          inviteAccepted: false,
          tenantId: tenant.id
        }
      });
      console.log(`Successfully created test invitation with token: ${token}`);
    }
  } catch (error) {
    console.error("Error creating invitation:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
