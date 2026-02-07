import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/apiErrorHandler'
import logger from '@/lib/logger'
import { generateTwoFactorSecret, getOtpAuthUrl } from '@/lib/twoFactor'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, twoFactorEnabled: true },
    })
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (dbUser.twoFactorEnabled) {
      return NextResponse.json({ error: '2FA already enabled' }, { status: 400 })
    }

    const secret = generateTwoFactorSecret()
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { twoFactorSecret: secret },
    })

    const issuer = 'Escrow Platform'
    const otpauthUrl = getOtpAuthUrl({ email: dbUser.email, issuer, secret })

    logger.info(`2FA setup started for user: ${dbUser.id}`)
    return NextResponse.json({ secret, otpauthUrl, issuer })
  } catch (error) {
    logger.error('Error setting up 2FA:', error)
    return handleApiError(error)
  }
}


