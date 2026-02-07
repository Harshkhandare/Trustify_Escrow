import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validations'
import { prisma } from '@/lib/db'
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'
import logger from '@/lib/logger'
import { z } from 'zod'
import { handleApiError } from '@/lib/apiErrorHandler'
import { sha256, verifyTotp } from '@/lib/twoFactor'

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = rateLimit(request)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: rateLimitResult.error },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    
    // Validate input
    const validated = loginSchema.parse(body)
    
    // Find user
    let user
    try {
      user = await prisma.user.findUnique({
        where: { email: validated.email },
      })
    } catch (dbError: any) {
      logger.error('Database error during login:', dbError)
      // Check if it's a connection error
      if (dbError.code === 'P1001' || dbError.message?.includes('connect')) {
        return NextResponse.json(
          { error: 'Database connection failed. Please check your database configuration.' },
          { status: 503 }
        )
      }
      throw dbError
    }

    if (!user) {
      logger.warn(`Failed login attempt for email: ${validated.email}`)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(validated.password, user.passwordHash)
    if (!isValid) {
      logger.warn(`Failed login attempt for user: ${user.id}`)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // If 2FA is enabled, require a valid TOTP code or backup code
    if (user.twoFactorEnabled) {
      const twoFactorCode = typeof body.twoFactorCode === 'string' ? body.twoFactorCode : undefined
      const backupCode = typeof body.backupCode === 'string' ? body.backupCode : undefined

      if (!twoFactorCode && !backupCode) {
        return NextResponse.json(
          { error: 'Two-factor authentication required', requiresTwoFactor: true },
          { status: 401 }
        )
      }

      let verified = false

      if (twoFactorCode && user.twoFactorSecret) {
        verified = verifyTotp({ token: twoFactorCode, secret: user.twoFactorSecret })
      }

      if (!verified && backupCode && user.twoFactorBackupCodes) {
        try {
          const hashes: string[] = JSON.parse(user.twoFactorBackupCodes)
          const hash = sha256(backupCode.trim().toUpperCase())
          if (hashes.includes(hash)) {
            verified = true
            // consume backup code
            const remaining = hashes.filter((h) => h !== hash)
            await prisma.user.update({
              where: { id: user.id },
              data: { twoFactorBackupCodes: JSON.stringify(remaining) },
            })
          }
        } catch {
          // ignore
        }
      }

      if (!verified) {
        return NextResponse.json(
          { error: 'Invalid 2FA code', requiresTwoFactor: true },
          { status: 401 }
        )
      }
    }

    // Generate token
    const token = generateToken(user.id)
    await setAuthCookie(token)

    logger.info(`User logged in: ${user.id}`)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        walletAddress: user.walletAddress,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return handleApiError(error)
  }
}

