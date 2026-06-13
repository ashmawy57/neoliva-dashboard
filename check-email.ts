import { prisma } from './src/lib/db/prisma';
async function main() {
  const email = 'ashmawydev@gmail.com';
  console.log('Checking staff_invitations...');
  const inv = await prisma.staffInvitation.findMany({ where: { email }});
  console.log(JSON.stringify(inv, null, 2));
  
  console.log('\nChecking users...');
  const usr = await prisma.user.findMany({ where: { email }});
  console.log(JSON.stringify(usr, null, 2));
}
main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
