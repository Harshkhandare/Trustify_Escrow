import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/apiErrorHandler'
import logger from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const record = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }
    if (record.used) {
      return NextResponse.json({ error: 'Token already used' }, { status: 400 })
    }
    if (record.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
      }),
      prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { used: true },
      }),
    ])

    logger.info(`Email verified for user: ${record.userId}`)
    return NextResponse.json({ message: 'Email verified successfully' })
  } catch (error) {
    logger.error('Error verifying email:', error)
    return handleApiError(error)
  }
}


