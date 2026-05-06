const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const staff = await prisma.staff.findFirst({
    where: { inviteAccepted: false, NOT: { inviteToken: null } },
    select: { email: true, inviteToken: true }
  });
  
  if (staff) {
    console.log(`Valid test URL: /signup?token=${staff.inviteToken}`);
    console.log(`Email: ${staff.email}`);
  } else {
    // Create one if none exists
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      console.log("No tenants found.");
      return;
    }
    
    const newToken = 'test-' + Math.random().toString(36).substring(2, 15);
    const newStaff = await prisma.staff.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        role: 'Doctor',
        inviteToken: newToken,
        inviteAccepted: false,
        tenantId: tenant.id
      }
    });
    console.log(`Created new invitation: /signup?token=${newToken}`);
    console.log(`Email: test@example.com`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
