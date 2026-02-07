import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { handleApiError } from '@/lib/apiErrorHandler'
import logger from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const template = await prisma.escrowTemplate.findUnique({
      where: { id: params.id },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Check if user can access this template
    if (!template.isPublic) {
      const user = await getCurrentUser()
      if (!user || template.createdBy !== user.id) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({ template })
  } catch (error) {
    logger.error('Error fetching template:', error)
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const template = await prisma.escrowTemplate.findUnique({
      where: { id: params.id },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    if (template.createdBy !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    await prisma.escrowTemplate.delete({
      where: { id: params.id },
    })

    logger.info(`Template deleted by user ${user.id}: ${params.id}`)

    return NextResponse.json({ message: 'Template deleted' })
  } catch (error) {
    logger.error('Error deleting template:', error)
    return handleApiError(error)
  }
}

