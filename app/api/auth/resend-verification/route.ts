import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rateLimit'
import { handleApiError } from '@/lib/apiErrorHandler'
import logger from '@/lib/logger'
import { createAndSendEmailVerification } from '@/lib/emailVerification'

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request)
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: rateLimitResult.error }, { status: 429 })
  }

  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, emailVerified: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (dbUser.emailVerified) {
      return NextResponse.json({ message: 'Email already verified' })
    }

    await createAndSendEmailVerification(dbUser)
    logger.info(`Verification email resent for user: ${dbUser.id}`)
    return NextResponse.json({ message: 'Verification email sent' })
  } catch (error) {
    logger.error('Error resending verification email:', error)
    return handleApiError(error)
  }
}


