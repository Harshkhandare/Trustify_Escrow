import { NextRequest, NextResponse } from 'next/server'
import { signupSchema } from '@/lib/validations'
import { prisma } from '@/lib/db'
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'
import logger from '@/lib/logger'
import { z } from 'zod'
import { handleApiError } from '@/lib/apiErrorHandler'
import { createAndSendEmailVerification } from '@/lib/emailVerification'

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: rateLimitResult.error },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const validated = signupSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(validated.password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        name: validated.name,
        passwordHash,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        walletAddress: true,
        emailVerified: true,
      },
    })

    // Generate token
    const token = generateToken(user.id)
    await setAuthCookie(token)

    // Send verification email (no-op if SMTP is not configured)
    await createAndSendEmailVerification({
      id: user.id,
      email: user.email,
      name: user.name,
    })

    logger.info(`New user registered: ${user.id}`)

    return NextResponse.json({ user }, { status: 201 })
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


