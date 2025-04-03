import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Define types for our service with relations
interface ServiceWithReviews {
  id: string
  title: string
  description: string
  type: string
  price: number
  currency: string
  status: string
  features: string[]
  createdAt: Date
  updatedAt: Date
  categoryId: string
  creatorId: string
  reviews: Array<{ rating: number }>
  creator: {
    id: string
    name: string
    image: string | null
    isVerified: boolean
  }
}

interface ServiceWithRating extends ServiceWithReviews {
  averageRating: number | null
  reviewCount: number
}

interface CategoryWithServices {
  id: string
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
  services: ServiceWithReviews[]
}

interface CategoryWithRatedServices extends Omit<CategoryWithServices, 'services'> {
  services: ServiceWithRating[]
}

// GET /api/categories/[categoryId] - Get a specific category
export async function GET(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: {
        id: params.categoryId,
      },
      include: {
        services: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                image: true,
                isVerified: true
              }
            },
            reviews: {
              select: {
                rating: true
              }
            }
          }
        }
      }
    })

    if (!category) {
      return new NextResponse('Category not found', { status: 404 })
    }

    // Calculate average rating for each service
    const servicesWithRating = (category as unknown as CategoryWithServices).services.map((service: ServiceWithReviews) => ({
      ...service,
      averageRating: service.reviews.length > 0
        ? service.reviews.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0) / service.reviews.length
        : null,
      reviewCount: service.reviews.length
    }))

    return NextResponse.json({
      ...category,
      services: servicesWithRating
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// PATCH /api/categories/[categoryId] - Update a category (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get user and verify they are an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (user?.role !== 'ADMIN') {
      return new NextResponse('Only admins can update categories', { status: 403 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return new NextResponse('Name is required', { status: 400 })
    }

    const category = await prisma.category.update({
      where: {
        id: params.categoryId,
      },
      data: {
        name,
        description
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// DELETE /api/categories/[categoryId] - Delete a category (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get user and verify they are an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (user?.role !== 'ADMIN') {
      return new NextResponse('Only admins can delete categories', { status: 403 })
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: {
        id: params.categoryId,
      }
    })

    if (!category) {
      return new NextResponse('Category not found', { status: 404 })
    }

    // Check if category has services
    const servicesCount = await prisma.service.count({
      where: {
        categoryId: params.categoryId
      }
    })

    if (servicesCount > 0) {
      return new NextResponse('Cannot delete category with existing services', { status: 400 })
    }

    await prisma.category.delete({
      where: {
        id: params.categoryId,
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting category:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 