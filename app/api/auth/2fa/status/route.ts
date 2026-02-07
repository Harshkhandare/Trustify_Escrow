import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { twoFactorEnabled: true, twoFactorBackupCodes: true },
  })

  const remaining =
    dbUser?.twoFactorBackupCodes ? (JSON.parse(dbUser.twoFactorBackupCodes) as string[]).length : 0

  return NextResponse.json({
    enabled: !!dbUser?.twoFactorEnabled,
    backupCodesRemaining: remaining,
  })
}


