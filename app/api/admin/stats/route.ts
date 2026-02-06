import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { EscrowStatus } from '@/types/escrow'
import logger from '@/lib/logger'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    // TODO: Check if user is admin
    // if (!user || !user.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    // }

    const [
      totalEscrows,
      pendingEscrows,
      fundedEscrows,
      completedEscrows,
      totalUsers,
      escrows,
    ] = await Promise.all([
      prisma.escrow.count(),
      prisma.escrow.count({ where: { status: EscrowStatus.PENDING } }),
      prisma.escrow.count({ where: { status: EscrowStatus.FUNDED } }),
      prisma.escrow.count({
        where: {
          status: {
            in: [EscrowStatus.RELEASED, EscrowStatus.REFUNDED],
          },
        },
      }),
      prisma.user.count(),
      prisma.escrow.findMany({
        select: { amount: true, token: true },
      }),
    ])

    // Calculate total volume (simplified - assumes all are ETH)
    const totalVolume = escrows.reduce((sum, e) => {
      const amount = parseFloat(e.amount) || 0
      return sum + amount
    }, 0)

    return NextResponse.json({
      totalEscrows,
      pendingEscrows,
      fundedEscrows,
      completedEscrows,
      totalUsers,
      totalVolume,
    })
  } catch (error) {
    logger.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

