import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/reviews - Get all reviews with optional filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')
    const userId = searchParams.get('userId')
    const rating = searchParams.get('rating')

    // Build the where clause based on filters
    const where = {
      ...(serviceId && { serviceId }),
      ...(userId && { userId }),
      ...(rating && { rating: parseInt(rating) })
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        service: {
          select: {
            id: true,
            title: true,
            creator: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { 
      serviceId, 
      rating, 
      comment,
      title
    } = body

    // Validate required fields
    if (!serviceId || !rating) {
      return new NextResponse('Service ID and rating are required', { status: 400 })
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return new NextResponse('Rating must be between 1 and 5', { status: 400 })
    }

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return new NextResponse('Service not found', { status: 404 })
    }

    // Check if user has already reviewed this service
    const existingReview = await prisma.review.findFirst({
      where: {
        serviceId,
        userId: session.user.id
      }
    })

    if (existingReview) {
      return new NextResponse('You have already reviewed this service', { status: 400 })
    }

    // Create new review
    const review = await prisma.review.create({
      data: {
        serviceId,
        userId: session.user.id,
        rating,
        comment: comment || '',
        title: title || ''
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        service: {
          select: {
            id: true,
            title: true,
            creator: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error creating review:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 