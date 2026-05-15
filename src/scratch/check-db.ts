import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'ashmawyalaa@gmail.com';
  
  console.log(`Checking user and tenant status for: ${email}`);
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      staff: {
        include: {
          tenant: true
        }
      }
    }
  });
  
  if (user) {
    console.log('User found:', JSON.stringify(user, null, 2));
  } else {
    console.log('User NOT found in database.');
  }

  const allTenants = await prisma.tenant.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('Recent Tenants:', JSON.stringify(allTenants, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
