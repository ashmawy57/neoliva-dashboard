
import { PrismaClient } from '../generated/client'
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = 'ashmawyalaa@gmail.com'
  const supabaseId = 'd378508b-58b1-44fa-88ef-d2aa3b3e6dde'
  
  console.log('--- Checking User Diagnostics ---')
  
  // 1. Check User record
  const user = await prisma.user.findFirst({
    where: { 
      OR: [
        { email },
        { supabaseId }
      ]
    },
    include: {
      memberships: {
        include: { tenant: true }
      }
    }
  })
  
  console.log('User Record:', JSON.stringify(user, null, 2))
  
  // 2. Check for ANY active tenants
  const activeTenants = await prisma.tenant.findMany({
    take: 5
  })
  console.log('Active Tenants (Count:', activeTenants.length, ')')
  
  // 3. AUTO-REPAIR: If user exists but no membership, link to first tenant as OWNER
  if (user && user.memberships.length === 0 && activeTenants.length > 0) {
    console.log('No memberships found. Repairing...')
    const newMembership = await prisma.tenantMembership.create({
      data: {
        userId: user.id,
        tenantId: activeTenants[0].id,
        role: 'OWNER',
        status: 'ACTIVE'
      }
    })
    console.log('Membership created:', newMembership.id)
  } else if (!user && activeTenants.length > 0) {
    console.log('User record missing in Prisma. Creating...')
    const newUser = await prisma.user.create({
      data: {
        email,
        supabaseId,
        memberships: {
          create: {
            tenantId: activeTenants[0].id,
            role: 'OWNER',
            status: 'ACTIVE'
          }
        }
      }
    })
    console.log('User and Membership created:', newUser.id)
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
