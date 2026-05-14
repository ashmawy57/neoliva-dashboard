import { prisma } from "../src/lib/prisma";

async function checkServices() {
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
}

checkServices()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
