import crypto from 'crypto'
import { generateSecret, generateURI, verifySync } from 'otplib'

export function generateTwoFactorSecret() {
  return generateSecret()
}

export function getOtpAuthUrl(params: { email: string; issuer: string; secret: string }) {
  return generateURI({
    issuer: params.issuer,
    label: params.email,
    secret: params.secret,
  })
}

export function verifyTotp(params: { token: string; secret: string }) {
  const result: any = verifySync({ token: params.token, secret: params.secret })
  return !!result?.valid
}

export function generateBackupCodes(count = 10) {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    // 10 chars, easy to type
    const code = crypto.randomBytes(6).toString('hex').slice(0, 10).toUpperCase()
    codes.push(code)
  }
  return codes
}

export function sha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex')
}


