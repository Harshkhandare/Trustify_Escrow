import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'
import { handleApiError } from '@/lib/apiErrorHandler'
import logger from '@/lib/logger'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import crypto from 'crypto'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: rateLimitResult.error },
      { status: 429 }
    )
  }

  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const escrowId = formData.get('escrowId') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    await ensureUploadDir()

    // Create user-specific directory
    const userDir = join(UPLOAD_DIR, user.id)
    if (!existsSync(userDir)) {
      await mkdir(userDir, { recursive: true })
    }

    // Create escrow-specific subdirectory if provided
    const targetDir = escrowId ? join(userDir, escrowId) : userDir
    if (escrowId && !existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true })
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'bin'
    const hash = crypto.randomBytes(16).toString('hex')
    const timestamp = Date.now()
    const filename = `${timestamp}-${hash}.${ext}`
    const filepath = join(targetDir, filename)

    // Save file
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await writeFile(filepath, buffer)

    // Return public URL
    const url = escrowId
      ? `/uploads/${user.id}/${escrowId}/${filename}`
      : `/uploads/${user.id}/${filename}`

    logger.info(`File uploaded by user ${user.id}: ${filename}`)

    return NextResponse.json({
      url,
      filename,
      size: file.size,
      mimetype: file.type,
    })
  } catch (error) {
    logger.error('Error uploading file:', error)
    return handleApiError(error)
  }
}

