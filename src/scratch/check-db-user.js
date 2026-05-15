const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'ashmawyalaa@gmail.com';
  console.log(`Checking Database records for: ${email}`);
  
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
    console.log('User record found:', JSON.stringify(user, null, 2));
  } else {
    console.log('User record NOT found in Prisma.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
