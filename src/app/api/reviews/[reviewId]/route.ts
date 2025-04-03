import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/reviews/[reviewId] - Get a specific review
export async function GET(
  request: Request,
  { params }: { params: { reviewId: string } }
) {
  try {
    const review = await prisma.review.findUnique({
      where: {
        id: params.reviewId,
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

    if (!review) {
      return new NextResponse('Review not found', { status: 404 })
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error fetching review:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// PATCH /api/reviews/[reviewId] - Update a review
export async function PATCH(
  request: Request,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { rating, comment, title } = body

    // Validate rating range if provided
    if (rating && (rating < 1 || rating > 5)) {
      return new NextResponse('Rating must be between 1 and 5', { status: 400 })
    }

    // Check if review exists and belongs to the user
    const review = await prisma.review.findUnique({
      where: {
        id: params.reviewId,
      }
    })

    if (!review) {
      return new NextResponse('Review not found', { status: 404 })
    }

    if (review.userId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: {
        id: params.reviewId,
      },
      data: {
        rating: rating !== undefined ? rating : undefined,
        comment: comment !== undefined ? comment : undefined,
        title: title !== undefined ? title : undefined
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

    return NextResponse.json(updatedReview)
  } catch (error) {
    console.error('Error updating review:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// DELETE /api/reviews/[reviewId] - Delete a review
export async function DELETE(
  request: Request,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: {
        id: params.reviewId,
      }
    })

    if (!review) {
      return new NextResponse('Review not found', { status: 404 })
    }

    // Check if user is the review author or an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (review.userId !== session.user.id && user?.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    await prisma.review.delete({
      where: {
        id: params.reviewId,
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting review:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 