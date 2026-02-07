import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'
import { handleApiError } from '@/lib/apiErrorHandler'
import logger from '@/lib/logger'
import { z } from 'zod'

const createTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.string(),
  defaultData: z.record(z.any()).optional(),
  isPublic: z.boolean().default(false),
})

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const searchParams = request.nextUrl.searchParams
    const publicOnly = searchParams.get('public') === 'true'

    const where: any = {}
    if (publicOnly) {
      where.isPublic = true
    } else if (user) {
      where.OR = [
        { isPublic: true },
        { createdBy: user.id },
      ]
    } else {
      where.isPublic = true
    }

    const templates = await prisma.escrowTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ templates })
  } catch (error) {
    logger.error('Error fetching templates:', error)
    return handleApiError(error)
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

    const body = await request.json()
    const data = createTemplateSchema.parse(body)

    const template = await prisma.escrowTemplate.create({
      data: {
        ...data,
        defaultData: data.defaultData ? JSON.stringify(data.defaultData) : null,
        createdBy: user.id,
      },
    })

    logger.info(`Template created by user ${user.id}: ${template.id}`)

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    logger.error('Error creating template:', error)
    return handleApiError(error)
  }
}

