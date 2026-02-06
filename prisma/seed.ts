import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await hashPassword('admin123456')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@escrow.com' },
    update: {},
    create: {
      email: 'admin@escrow.com',
      name: 'Admin User',
      passwordHash: adminPassword,
    },
  })

  console.log('✅ Created admin user:', admin.email)

  console.log('✨ Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

