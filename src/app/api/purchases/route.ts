import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/purchases - Get all purchases for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Build the where clause based on filters
    const where = {
      userId: session.user.id,
      ...(status && { status })
    }

    const purchases = await prisma.purchase.findMany({
      where,
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(purchases)
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// POST /api/purchases - Create a new purchase
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { serviceId, paymentMethodId } = body

    // Validate required fields
    if (!serviceId || !paymentMethodId) {
      return new NextResponse('Service ID and payment method ID are required', { status: 400 })
    }

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return new NextResponse('Service not found', { status: 404 })
    }

    // Check if service is active
    if (service.status !== 'ACTIVE') {
      return new NextResponse('Service is not available for purchase', { status: 400 })
    }

    // Check if user has already purchased this service
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        serviceId,
        userId: session.user.id,
        status: 'COMPLETED'
      }
    })

    if (existingPurchase) {
      return new NextResponse('You have already purchased this service', { status: 400 })
    }

    // Check if user is trying to purchase their own service
    if (service.creatorId === session.user.id) {
      return new NextResponse('You cannot purchase your own service', { status: 400 })
    }

    // TODO: Process payment with Stripe or other payment processor
    // For now, we'll just create the purchase record

    // Create new purchase
    const purchase = await prisma.purchase.create({
      data: {
        serviceId,
        userId: session.user.id,
        amount: service.price,
        currency: service.currency,
        status: 'COMPLETED', // In a real app, this would be 'PENDING' until payment is confirmed
        paymentMethodId
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

    return NextResponse.json(purchase)
  } catch (error) {
    console.error('Error creating purchase:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 