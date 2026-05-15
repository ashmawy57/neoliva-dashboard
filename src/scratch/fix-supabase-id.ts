
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
  const correctSupabaseId = 'd378508b-58b1-44fa-88ef-d2aa3b3e6dde'
  
  console.log('--- REPAIRING SUPABASE ID Mismatch ---')
  
  // 1. Find user by email
  const user = await prisma.user.findUnique({
    where: { email }
  })
  
  if (user) {
    console.log('Found user in DB:', user.id, 'with current SupabaseId:', user.supabaseId)
    
    if (user.supabaseId !== correctSupabaseId) {
      console.log('Mismatch detected! Updating to correct ID:', correctSupabaseId)
      await prisma.user.update({
        where: { id: user.id },
        data: { supabaseId: correctSupabaseId }
      })
      console.log('Update SUCCESSFUL!')
    } else {
      console.log('IDs already match. No update needed.')
    }
  } else {
    console.log('User not found by email. Creating new user record...')
    // Find an active tenant to link to
    const tenant = await prisma.tenant.findFirst()
    if (!tenant) {
       console.error('No tenants found to link to!')
       return
    }
    
    await prisma.user.create({
      data: {
        email,
        supabaseId: correctSupabaseId,
        memberships: {
          create: {
            tenantId: tenant.id,
            role: 'OWNER',
            status: 'ACTIVE'
          }
        }
      }
    })
    console.log('User created and linked to tenant:', tenant.name)
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
