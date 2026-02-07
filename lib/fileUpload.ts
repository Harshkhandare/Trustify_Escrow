import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import crypto from 'crypto'

const UPLOAD_DIR = join(process.cwd(), 'uploads')
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export interface UploadResult {
  filename: string
  path: string
  size: number
  mimetype: string
}

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

/**
 * Validate file
 */
function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds 10MB limit' }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' }
  }

  return { valid: true }
}

/**
 * Generate unique filename
 */
function generateFilename(originalName: string, mimetype: string): string {
  const ext = originalName.split('.').pop() || 'bin'
  const hash = crypto.randomBytes(16).toString('hex')
  const timestamp = Date.now()
  return `${timestamp}-${hash}.${ext}`
}

/**
 * Upload file
 */
export async function uploadFile(
  file: File,
  userId: string,
  escrowId?: string
): Promise<UploadResult> {
  // Validate file
  const validation = validateFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Ensure upload directory exists
  await ensureUploadDir()

  // Create user-specific directory
  const userDir = join(UPLOAD_DIR, userId)
  if (!existsSync(userDir)) {
    await mkdir(userDir, { recursive: true })
  }

  // Create escrow-specific subdirectory if provided
  const targetDir = escrowId ? join(userDir, escrowId) : userDir
  if (escrowId && !existsSync(targetDir)) {
    await mkdir(targetDir, { recursive: true })
  }

  // Generate filename
  const filename = generateFilename(file.name, file.type)
  const filepath = join(targetDir, filename)

  // Convert File to Buffer and save
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  await writeFile(filepath, buffer)

  return {
    filename,
    path: filepath,
    size: file.size,
    mimetype: file.type,
  }
}

/**
 * Get file URL for serving
 */
export function getFileUrl(userId: string, filename: string, escrowId?: string): string {
  const path = escrowId
    ? `/uploads/${userId}/${escrowId}/${filename}`
    : `/uploads/${userId}/${filename}`
  return path
}

