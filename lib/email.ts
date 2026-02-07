import nodemailer from 'nodemailer'
import logger from './logger'

let transporter: nodemailer.Transporter | null = null

if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  if (!transporter) {
    logger.warn('Email service not configured, skipping email send')
    return
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@escrow-platform.com',
      to,
      subject,
      html,
      text,
    })
    logger.info(`Email sent to ${to}: ${subject}`)
  } catch (error) {
    logger.error('Failed to send email:', error)
    throw error
  }
}

export function getEscrowEmailTemplate(
  type: 'created' | 'funded' | 'released' | 'refunded' | 'disputed',
  escrow: { id: string; title?: string; amount: string; token: string }
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const escrowUrl = `${baseUrl}/escrows/${escrow.id}`

  const templates = {
    created: {
      subject: `Escrow Created: ${escrow.title || escrow.id}`,
      html: `
        <h2>Escrow Created</h2>
        <p>An escrow has been created:</p>
        <ul>
          <li><strong>ID:</strong> ${escrow.id}</li>
          <li><strong>Title:</strong> ${escrow.title || 'N/A'}</li>
          <li><strong>Amount:</strong> ${escrow.amount} ${escrow.token}</li>
        </ul>
        <p><a href="${escrowUrl}">View Escrow</a></p>
      `,
    },
    funded: {
      subject: `Escrow Funded: ${escrow.title || escrow.id}`,
      html: `
        <h2>Escrow Funded</h2>
        <p>The escrow has been funded:</p>
        <ul>
          <li><strong>ID:</strong> ${escrow.id}</li>
          <li><strong>Amount:</strong> ${escrow.amount} ${escrow.token}</li>
        </ul>
        <p><a href="${escrowUrl}">View Escrow</a></p>
      `,
    },
    released: {
      subject: `Funds Released: ${escrow.title || escrow.id}`,
      html: `
        <h2>Funds Released</h2>
        <p>Funds have been released from the escrow:</p>
        <ul>
          <li><strong>ID:</strong> ${escrow.id}</li>
          <li><strong>Amount:</strong> ${escrow.amount} ${escrow.token}</li>
        </ul>
        <p><a href="${escrowUrl}">View Escrow</a></p>
      `,
    },
    refunded: {
      subject: `Refund Processed: ${escrow.title || escrow.id}`,
      html: `
        <h2>Refund Processed</h2>
        <p>A refund has been processed for the escrow:</p>
        <ul>
          <li><strong>ID:</strong> ${escrow.id}</li>
          <li><strong>Amount:</strong> ${escrow.amount} ${escrow.token}</li>
        </ul>
        <p><a href="${escrowUrl}">View Escrow</a></p>
      `,
    },
    disputed: {
      subject: `Dispute Filed: ${escrow.title || escrow.id}`,
      html: `
        <h2>Dispute Filed</h2>
        <p>A dispute has been filed for the escrow:</p>
        <ul>
          <li><strong>ID:</strong> ${escrow.id}</li>
        </ul>
        <p><a href="${escrowUrl}">View Escrow</a></p>
      `,
    },
  }

  return templates[type]
}


