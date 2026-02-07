import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/apiErrorHandler'
import logger from '@/lib/logger'
import { generateBackupCodes, sha256, verifyTotp } from '@/lib/twoFactor'
import { z } from 'zod'

const schema = z.object({
  code: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { code } = schema.parse(body)

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, twoFactorEnabled: true, twoFactorSecret: true },
    })
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (dbUser.twoFactorEnabled) {
      return NextResponse.json({ error: '2FA already enabled' }, { status: 400 })
    }
    if (!dbUser.twoFactorSecret) {
      return NextResponse.json({ error: '2FA setup not started' }, { status: 400 })
    }

    const ok = verifyTotp({ token: code, secret: dbUser.twoFactorSecret })
    if (!ok) {
      return NextResponse.json({ error: 'Invalid 2FA code' }, { status: 400 })
    }

    const backupCodes = generateBackupCodes(10)
    const hashes = backupCodes.map((c) => sha256(c))

    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        twoFactorEnabled: true,
        twoFactorBackupCodes: JSON.stringify(hashes),
      },
    })

    logger.info(`2FA enabled for user: ${dbUser.id}`)
    return NextResponse.json({
      message: '2FA enabled',
      backupCodes,
    })
  } catch (error) {
    logger.error('Error enabling 2FA:', error)
    return handleApiError(error)
  }
}


