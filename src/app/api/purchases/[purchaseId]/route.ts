import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/purchases/[purchaseId] - Get a specific purchase
export async function GET(
  request: Request,
  { params }: { params: { purchaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const purchase = await prisma.purchase.findUnique({
      where: {
        id: params.purchaseId,
      },
      include: {
        service: {
          include: {
            category: true,
            creator: {
              select: {
                id: true,
                name: true,
                image: true,
                isVerified: true
              }
            }
          }
        }
      }
    })

    if (!purchase) {
      return new NextResponse('Purchase not found', { status: 404 })
    }

    // Check if user is the purchaser or the service creator
    const service = await prisma.service.findUnique({
      where: { id: purchase.serviceId }
    })

    if (purchase.userId !== session.user.id && service?.creatorId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    return NextResponse.json(purchase)
  } catch (error) {
    console.error('Error fetching purchase:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// PATCH /api/purchases/[purchaseId] - Update a purchase (refund, cancel, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: { purchaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { status, reason } = body

    // Check if purchase exists
    const purchase = await prisma.purchase.findUnique({
      where: {
        id: params.purchaseId,
      }
    })

    if (!purchase) {
      return new NextResponse('Purchase not found', { status: 404 })
    }

    // Get the service to check if user is the creator
    const service = await prisma.service.findUnique({
      where: { id: purchase.serviceId }
    })

    // Only the purchaser or the service creator can update the purchase
    if (purchase.userId !== session.user.id && service?.creatorId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Validate status
    const validStatuses = ['COMPLETED', 'CANCELLED', 'REFUNDED', 'DISPUTED']
    if (!validStatuses.includes(status)) {
      return new NextResponse('Invalid status', { status: 400 })
    }

    // Update purchase
    const updatedPurchase = await prisma.purchase.update({
      where: {
        id: params.purchaseId,
      },
      data: {
        status,
        refundReason: reason
      },
      include: {
        service: {
          include: {
            category: true,
            creator: {
              select: {
                id: true,
                name: true,
                image: true,
                isVerified: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedPurchase)
  } catch (error) {
    console.error('Error updating purchase:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 