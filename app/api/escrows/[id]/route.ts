import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'
import logger from '@/lib/logger'
import { EscrowStatus } from '@/types/escrow'
import { handleApiError } from '@/lib/apiErrorHandler'
import { sendEmail, getEscrowEmailTemplate } from '@/lib/email'
import { createNotificationsForUsers } from '@/lib/notifications'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const escrow = await prisma.escrow.findUnique({
      where: { id: params.id },
      include: {
        milestones: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        buyer: {
          select: { id: true, name: true, email: true, walletAddress: true },
        },
        seller: {
          select: { id: true, name: true, email: true, walletAddress: true },
        },
        arbiter: {
          select: { id: true, name: true, email: true, walletAddress: true },
        },
      },
    })

    if (!escrow) {
      return NextResponse.json(
        { error: 'Escrow not found' },
        { status: 404 }
      )
    }

    // Transform to match Escrow type
    const transformed = {
      id: escrow.id,
      buyer: escrow.buyerAddress,
      seller: escrow.sellerAddress,
      arbiter: escrow.arbiterAddress,
      amount: escrow.amount,
      token: escrow.token,
      status: escrow.status as EscrowStatus,
      createdAt: Math.floor(escrow.createdAt.getTime() / 1000),
      title: escrow.title,
      type: escrow.type,
      description: escrow.description,
      deliverables: escrow.deliverables,
      feePercentage: escrow.feePercentage,
      feePaidBy: escrow.feePaidBy,
      fundingDeadline: escrow.fundingDeadline?.toISOString(),
      releaseCondition: escrow.releaseCondition,
      autoReleaseTime: escrow.autoReleaseTime?.toISOString(),
      milestones: escrow.milestones.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        amount: m.amount,
        dueDate: m.dueDate.toISOString(),
      })),
      disputeWindow: escrow.disputeWindow,
      disputeResolver: escrow.disputeResolver,
      fundedAt: escrow.fundedAt ? Math.floor(escrow.fundedAt.getTime() / 1000) : undefined,
      releasedAt: escrow.releasedAt ? Math.floor(escrow.releasedAt.getTime() / 1000) : undefined,
      refundedAt: escrow.refundedAt ? Math.floor(escrow.refundedAt.getTime() / 1000) : undefined,
      disputedAt: escrow.disputedAt ? Math.floor(escrow.disputedAt.getTime() / 1000) : undefined,
      activities: escrow.activities.map(a => ({
        id: a.id,
        type: a.type,
        message: a.message,
        createdAt: a.createdAt.toISOString(),
        userId: a.userId,
        metadata: a.metadata,
      })),
    }

    return NextResponse.json({ escrow: transformed })
  } catch (error) {
    logger.error('Error fetching escrow:', error)
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, ...updates } = body

    const escrow = await prisma.escrow.findUnique({
      where: { id: params.id },
    })

    if (!escrow) {
      return NextResponse.json(
        { error: 'Escrow not found' },
        { status: 404 }
      )
    }

    // Verify user has permission
    const userAddress = user.walletAddress?.toLowerCase()
    const isBuyer = escrow.buyerAddress.toLowerCase() === userAddress
    const isSeller = escrow.sellerAddress.toLowerCase() === userAddress
    const isArbiter = escrow.arbiterAddress.toLowerCase() === userAddress

    let updateData: any = {}
    let activityType = 'UPDATED'
    let activityMessage = 'Escrow updated'

    if (action === 'fund') {
      if (!isBuyer) {
        return NextResponse.json(
          { error: 'Only buyer can fund escrow' },
          { status: 403 }
        )
      }
      if (escrow.status !== EscrowStatus.PENDING) {
        return NextResponse.json(
          { error: 'Escrow must be pending to fund' },
          { status: 400 }
        )
      }
      updateData = {
        status: EscrowStatus.FUNDED,
        fundedAt: new Date(),
      }
      activityType = 'FUNDED'
      activityMessage = 'Escrow funded'
    } else if (action === 'release') {
      if (!isBuyer && !isArbiter) {
        return NextResponse.json(
          { error: 'Only buyer or arbiter can release funds' },
          { status: 403 }
        )
      }
      if (escrow.status !== EscrowStatus.FUNDED && escrow.status !== EscrowStatus.DISPUTED) {
        return NextResponse.json(
          { error: 'Escrow must be funded or disputed to release' },
          { status: 400 }
        )
      }
      updateData = {
        status: EscrowStatus.RELEASED,
        releasedAt: new Date(),
      }
      activityType = 'RELEASED'
      activityMessage = 'Funds released to seller'
    } else if (action === 'refund') {
      if (!isBuyer && !isArbiter) {
        return NextResponse.json(
          { error: 'Only buyer or arbiter can refund' },
          { status: 403 }
        )
      }
      if (escrow.status !== EscrowStatus.FUNDED && escrow.status !== EscrowStatus.DISPUTED) {
        return NextResponse.json(
          { error: 'Escrow must be funded or disputed to refund' },
          { status: 400 }
        )
      }
      updateData = {
        status: EscrowStatus.REFUNDED,
        refundedAt: new Date(),
      }
      activityType = 'REFUNDED'
      activityMessage = 'Funds refunded to buyer'
    } else if (action === 'dispute') {
      if (!isBuyer && !isSeller) {
        return NextResponse.json(
          { error: 'Only buyer or seller can file dispute' },
          { status: 403 }
        )
      }
      if (escrow.status !== EscrowStatus.FUNDED) {
        return NextResponse.json(
          { error: 'Escrow must be funded to file dispute' },
          { status: 400 }
        )
      }
      updateData = {
        status: EscrowStatus.DISPUTED,
        disputedAt: new Date(),
      }
      activityType = 'DISPUTED'
      activityMessage = 'Dispute filed'
    } else {
      // Regular update
      updateData = updates
    }

    const updated = await prisma.escrow.update({
      where: { id: params.id },
      data: {
        ...updateData,
        activities: {
          create: {
            type: activityType,
            message: activityMessage,
            userId: user.id,
            metadata: { action, ...updates },
          },
        },
      },
      include: {
        milestones: true,
      },
    })

    // Send email and in-app notifications
    if (action) {
      try {
        const [buyerUser, sellerUser, arbiterUser] = await Promise.all([
          prisma.user.findUnique({ where: { id: escrow.buyerId } }),
          prisma.user.findUnique({ where: { id: escrow.sellerId } }),
          prisma.user.findUnique({ where: { id: escrow.arbiterId } }),
        ])

        const emailType = action as 'funded' | 'released' | 'refunded' | 'disputed'
        const template = getEscrowEmailTemplate(emailType, {
          id: escrow.id,
          title: escrow.title || undefined,
          amount: escrow.amount,
          token: escrow.token,
        })

        // Create in-app notifications
        const notificationUserIds: string[] = []
        if (action === 'fund') {
          notificationUserIds.push(escrow.sellerId, escrow.arbiterId)
        } else if (action === 'release') {
          notificationUserIds.push(escrow.buyerId, escrow.sellerId)
        } else if (action === 'refund') {
          notificationUserIds.push(escrow.buyerId, escrow.sellerId)
        } else if (action === 'dispute') {
          notificationUserIds.push(escrow.buyerId, escrow.sellerId, escrow.arbiterId)
        }

        if (notificationUserIds.length > 0) {
          await createNotificationsForUsers(notificationUserIds, {
            type: action === 'dispute' ? 'warning' : 'info',
            title: `Escrow ${action.charAt(0).toUpperCase() + action.slice(1)}`,
            message: activityMessage,
            link: `/escrows/${escrow.id}`,
            metadata: { escrowId: escrow.id, action },
          })
        }

        // Send email notifications
        const emailRecipients = []
        if (buyerUser?.email && buyerUser.email.includes('@')) {
          emailRecipients.push({ user: buyerUser, email: buyerUser.email })
        }
        if (sellerUser?.email && sellerUser.email.includes('@')) {
          emailRecipients.push({ user: sellerUser, email: sellerUser.email })
        }

        for (const recipient of emailRecipients) {
          try {
            await sendEmail({
              to: recipient.email,
              subject: template.subject,
              html: template.html,
            })
          } catch (emailError) {
            logger.error(`Failed to send email to ${recipient.email}:`, emailError)
          }
        }
      } catch (error) {
        logger.error('Failed to send notifications:', error)
        // Don't fail the request if notifications fail
      }
    }

    logger.info(`Escrow ${params.id} updated: ${action || 'general update'} by user: ${user.id}`)

    // Transform response
    const transformed = {
      id: updated.id,
      buyer: updated.buyerAddress,
      seller: updated.sellerAddress,
      arbiter: updated.arbiterAddress,
      amount: updated.amount,
      token: updated.token,
      status: updated.status as EscrowStatus,
      createdAt: Math.floor(updated.createdAt.getTime() / 1000),
      title: updated.title,
      type: updated.type,
      description: updated.description,
      deliverables: updated.deliverables,
      feePercentage: updated.feePercentage,
      feePaidBy: updated.feePaidBy,
      fundingDeadline: updated.fundingDeadline?.toISOString(),
      releaseCondition: updated.releaseCondition,
      autoReleaseTime: updated.autoReleaseTime?.toISOString(),
      milestones: updated.milestones.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        amount: m.amount,
        dueDate: m.dueDate.toISOString(),
      })),
      disputeWindow: updated.disputeWindow,
      disputeResolver: updated.disputeResolver,
      fundedAt: updated.fundedAt ? Math.floor(updated.fundedAt.getTime() / 1000) : undefined,
      releasedAt: updated.releasedAt ? Math.floor(updated.releasedAt.getTime() / 1000) : undefined,
      refundedAt: updated.refundedAt ? Math.floor(updated.refundedAt.getTime() / 1000) : undefined,
      disputedAt: updated.disputedAt ? Math.floor(updated.disputedAt.getTime() / 1000) : undefined,
    }

    return NextResponse.json({ escrow: transformed })
  } catch (error) {
    logger.error('Error updating escrow:', error)
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await prisma.escrow.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Escrow not found' },
        { status: 404 }
      )
    }
    logger.error('Error deleting escrow:', error)
    return handleApiError(error)
  }
}

