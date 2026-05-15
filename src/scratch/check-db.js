const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = "ashmawyalaa@gmail.com";
  
  // Find in User
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: true
    }
  });
  
  console.log("User in Prisma DB:", user ? JSON.stringify(user, null, 2) : "Not Found");
  
  // Find in Supabase directly? Can't easily do it via Prisma because Supabase Auth is separate.
  // But let's see if we have staff records.
  const staff = await prisma.staff.findMany({
    where: { email }
  });
  console.log("Staff in Prisma DB:", staff ? JSON.stringify(staff, null, 2) : "Not Found");
}

main().catch(console.error).finally(() => prisma.$disconnect());
