const { PrismaClient } = require('../src/generated/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config({ path: '.env.local' });

async function seedServices() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const tenantId = "6213c072-3a05-4f6c-a74a-4e5e155a51cc";

  const starterServices = [
    {
      name: "General Consultation",
      category: "PREVENTIVE",
      price: 150,
      duration: 30,
      description: "Comprehensive oral examination and consultation.",
      popular: true
    },
    {
      name: "Teeth Cleaning & Polishing",
      category: "PREVENTIVE",
      price: 120,
      duration: 45,
      description: "Professional scale and polish for a brighter smile.",
      popular: true
    },
    {
      name: "Panoramic X-Ray",
      category: "PREVENTIVE",
      price: 85,
      duration: 15,
      description: "Full mouth digital X-ray for diagnosis.",
      popular: false
    },
    {
      name: "Composite Filling",
      category: "RESTORATIVE",
      price: 200,
      duration: 60,
      description: "Tooth-colored filling for cavities.",
      popular: false
    },
    {
      name: "Root Canal Treatment",
      category: "RESTORATIVE",
      price: 800,
      duration: 90,
      description: "Endodontic therapy to save an infected tooth.",
      popular: false
    }
  ];

  try {
    console.log(`Seeding ${starterServices.length} services for tenant ${tenantId}...`);
    
    for (const service of starterServices) {
      await prisma.service.create({
        data: {
          ...service,
          tenant: { connect: { id: tenantId } }
        }
      });
      console.log(`- Created: ${service.name}`);
    }

    console.log("Seeding complete!");

  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

seedServices();
