import crypto from 'crypto'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import logger from '@/lib/logger'

export async function createAndSendEmailVerification(user: { id: string; email: string; name: string }) {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

  // Remove any existing active tokens
  await prisma.emailVerificationToken.deleteMany({
    where: { userId: user.id },
  })

  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`

  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify your email</h2>
          <p>Hello ${user.name},</p>
          <p>Please verify your email address to complete your account setup.</p>
          <p>
            <a href="${verifyUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email
            </a>
          </p>
          <p>Or copy and paste this link:</p>
          <p style="word-break: break-all;">${verifyUrl}</p>
          <p>This link expires in 24 hours.</p>
        </div>
      `,
    })
  } catch (e) {
    logger.error('Failed to send verification email:', e)
  }

  logger.info(`Email verification token created for user ${user.id}: ${verifyUrl}`)
  return { token, verifyUrl }
}


