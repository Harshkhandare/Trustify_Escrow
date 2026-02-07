import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, verifyPassword } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/apiErrorHandler'
import logger from '@/lib/logger'
import { sha256, verifyTotp } from '@/lib/twoFactor'
import { z } from 'zod'

const schema = z.object({
  password: z.string().min(1),
  code: z.string().optional(),
  backupCode: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { password, code, backupCode } = schema.parse(body)

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        passwordHash: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackupCodes: true,
      },
    })
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (!dbUser.twoFactorEnabled) {
      return NextResponse.json({ error: '2FA is not enabled' }, { status: 400 })
    }

    const passOk = await verifyPassword(password, dbUser.passwordHash)
    if (!passOk) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 400 })
    }

    let verified = false

    if (code && dbUser.twoFactorSecret) {
      verified = verifyTotp({ token: code, secret: dbUser.twoFactorSecret })
    }

    if (!verified && backupCode && dbUser.twoFactorBackupCodes) {
      const hashes: string[] = JSON.parse(dbUser.twoFactorBackupCodes)
      const hash = sha256(backupCode.trim().toUpperCase())
      if (hashes.includes(hash)) {
        verified = true
        // consume backup code
        const remaining = hashes.filter((h) => h !== hash)
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { twoFactorBackupCodes: JSON.stringify(remaining) },
        })
      }
    }

    if (!verified) {
      return NextResponse.json({ error: 'Invalid 2FA code' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
      },
    })

    logger.info(`2FA disabled for user: ${dbUser.id}`)
    return NextResponse.json({ message: '2FA disabled' })
  } catch (error) {
    logger.error('Error disabling 2FA:', error)
    return handleApiError(error)
  }
}


