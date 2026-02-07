import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await hashPassword('admin123456')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@escrow.com' },
    update: {
      isAdmin: true,
      emailVerified: true,
    },
    create: {
      email: 'admin@escrow.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      isAdmin: true,
      emailVerified: true,
    },
  })

  console.log('✅ Admin user:', admin.email)
  console.log('   Password: admin123456')

  // Create default escrow templates
  const templates = [
    {
      name: 'Simple Payment',
      description: 'Basic one-time payment escrow',
      type: 'one-time',
      isPublic: true,
      defaultData: JSON.stringify({
        type: 'one-time',
        feePercentage: 1.0,
        feePaidBy: 'payer',
        releaseCondition: 'manual',
        disputeWindow: 3,
      }),
    },
    {
      name: 'Milestone Project',
      description: 'Multi-milestone project escrow',
      type: 'milestone',
      isPublic: true,
      defaultData: JSON.stringify({
        type: 'milestone',
        feePercentage: 1.5,
        feePaidBy: 'payer',
        releaseCondition: 'milestone',
        disputeWindow: 7,
      }),
    },
    {
      name: 'Time-Locked Release',
      description: 'Automatic release after time period',
      type: 'time-locked',
      isPublic: true,
      defaultData: JSON.stringify({
        type: 'time-locked',
        feePercentage: 1.0,
        feePaidBy: 'payer',
        releaseCondition: 'auto',
        disputeWindow: 3,
      }),
    },
  ]

  for (const template of templates) {
    const existing = await prisma.escrowTemplate.findFirst({
      where: { name: template.name },
    })

    if (!existing) {
      await prisma.escrowTemplate.create({ data: template })
      console.log(`✅ Template created: ${template.name}`)
    }
  }

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


