import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { createEscrowSchema } from '@/lib/validations'
import { rateLimit } from '@/lib/rateLimit'
import logger from '@/lib/logger'
import { z } from 'zod'
import { EscrowStatus } from '@/types/escrow'
import { handleApiError } from '@/lib/apiErrorHandler'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get('address')
    const status = searchParams.get('status') as EscrowStatus | null
    const q = (searchParams.get('q') || '').trim()
    const sortBy = searchParams.get('sortBy') || 'newest'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const where: any = {}
    
    const andConditions: any[] = []
    if (address) {
      const lowerAddress = address.toLowerCase()
      andConditions.push({
        OR: [
          { buyerAddress: { equals: lowerAddress, mode: 'insensitive' } },
          { sellerAddress: { equals: lowerAddress, mode: 'insensitive' } },
          { arbiterAddress: { equals: lowerAddress, mode: 'insensitive' } },
        ],
      })
    }
    
    if (status) {
      andConditions.push({ status })
    }

    if (q) {
      andConditions.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { buyerAddress: { contains: q, mode: 'insensitive' } },
          { sellerAddress: { contains: q, mode: 'insensitive' } },
          { arbiterAddress: { contains: q, mode: 'insensitive' } },
        ],
      })
    }

    if (andConditions.length > 0) {
      where.AND = andConditions
    }

    const orderBy =
      sortBy === 'oldest'
        ? { createdAt: 'asc' as const }
        : sortBy === 'amount-high'
          ? { amount: 'desc' as const }
          : sortBy === 'amount-low'
            ? { amount: 'asc' as const }
            : { createdAt: 'desc' as const }

    const [escrows, total] = await Promise.all([
      prisma.escrow.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          milestones: true,
          buyer: {
            select: { id: true, name: true, email: true },
          },
          seller: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.escrow.count({ where }),
    ])

    // Transform to match Escrow type
    const transformedEscrows = escrows.map(e => ({
      id: e.id,
      buyer: e.buyerAddress,
      seller: e.sellerAddress,
      arbiter: e.arbiterAddress,
      amount: e.amount,
      token: e.token,
      status: e.status as EscrowStatus,
      createdAt: Math.floor(e.createdAt.getTime() / 1000),
      title: e.title,
      type: e.type,
      description: e.description,
      deliverables: e.deliverables,
      feePercentage: e.feePercentage,
      feePaidBy: e.feePaidBy,
      fundingDeadline: e.fundingDeadline?.toISOString(),
      releaseCondition: e.releaseCondition,
      autoReleaseTime: e.autoReleaseTime?.toISOString(),
      milestones: e.milestones.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        amount: m.amount,
        dueDate: m.dueDate.toISOString(),
      })),
      disputeWindow: e.disputeWindow,
      disputeResolver: e.disputeResolver,
      fundedAt: e.fundedAt ? Math.floor(e.fundedAt.getTime() / 1000) : undefined,
      releasedAt: e.releasedAt ? Math.floor(e.releasedAt.getTime() / 1000) : undefined,
      refundedAt: e.refundedAt ? Math.floor(e.refundedAt.getTime() / 1000) : undefined,
      disputedAt: e.disputedAt ? Math.floor(e.disputedAt.getTime() / 1000) : undefined,
    }))

    return NextResponse.json({
      escrows: transformedEscrows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error('Error fetching escrows:', error)
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validated = createEscrowSchema.parse(body)

    // Find or create users for addresses
    const buyer = await prisma.user.findFirst({
      where: { walletAddress: validated.payerAddress.toLowerCase() },
    }) || await prisma.user.create({
      data: {
        email: `${validated.payerAddress}@wallet.local`,
        name: `Wallet ${validated.payerAddress.slice(0, 6)}`,
        passwordHash: '',
        walletAddress: validated.payerAddress.toLowerCase(),
      },
    })

    const seller = await prisma.user.findFirst({
      where: { walletAddress: validated.payeeAddress.toLowerCase() },
    }) || await prisma.user.create({
      data: {
        email: `${validated.payeeAddress}@wallet.local`,
        name: `Wallet ${validated.payeeAddress.slice(0, 6)}`,
        passwordHash: '',
        walletAddress: validated.payeeAddress.toLowerCase(),
      },
    })

    const arbiter = await prisma.user.findFirst({
      where: { walletAddress: validated.disputeResolver.toLowerCase() },
    }) || await prisma.user.create({
      data: {
        email: `${validated.disputeResolver}@wallet.local`,
        name: 'Platform Admin',
        passwordHash: '',
        walletAddress: validated.disputeResolver.toLowerCase(),
      },
    })

    // Create escrow
    const escrow = await prisma.escrow.create({
      data: {
        title: validated.title,
        type: validated.type,
        buyerId: buyer.id,
        sellerId: seller.id,
        arbiterId: arbiter.id,
        buyerAddress: validated.payerAddress.toLowerCase(),
        sellerAddress: validated.payeeAddress.toLowerCase(),
        arbiterAddress: validated.disputeResolver.toLowerCase(),
        amount: validated.amount,
        token: validated.token,
        status: EscrowStatus.PENDING,
        description: validated.description,
        deliverables: validated.deliverables,
        feePercentage: validated.feePercentage,
        feePaidBy: validated.feePaidBy,
        fundingDeadline: validated.fundingDeadline 
          ? new Date(validated.fundingDeadline) 
          : null,
        releaseCondition: validated.releaseCondition,
        autoReleaseTime: validated.autoReleaseTime
          ? new Date(validated.autoReleaseTime)
          : null,
        disputeWindow: validated.disputeWindow,
        disputeResolver: validated.disputeResolver,
        milestones: {
          create: validated.milestones?.map(m => ({
            title: m.title,
            description: m.description,
            amount: m.amount,
            dueDate: new Date(m.dueDate),
          })) || [],
        },
        activities: {
          create: [{
            type: 'CREATED',
            message: 'Escrow created',
            userId: user.id,
          }],
        },
      },
      include: {
        milestones: true,
      },
    })

    logger.info(`Escrow created: ${escrow.id} by user: ${user.id}`)

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
    }

    return NextResponse.json({ escrow: transformed }, { status: 201 })
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

