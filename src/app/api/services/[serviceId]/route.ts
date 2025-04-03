import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
  };
}

// GET /api/services/[serviceId] - Get a specific service
export async function GET(
  request: Request,
  { params }: { params: { serviceId: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const service = await prisma.service.findUnique({
      where: {
        id: params.serviceId,
      },
      include: {
        category: true,
        tags: true,
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true
          }
        }
      }
    })

    if (!service) {
      return new NextResponse('Service not found', { status: 404 })
    }

    // Check if user is the creator or admin
    if (service.creatorId !== session.user.id && session.user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error fetching service:', error)
    return new NextResponse(
      `Error fetching service: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    )
  }
}

// PUT /api/services/[serviceId] - Update a service
export async function PUT(
  request: Request,
  { params }: { params: { serviceId: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if the service exists and user has permission
    const existingService = await prisma.service.findUnique({
      where: { id: params.serviceId }
    })

    if (!existingService) {
      return new NextResponse('Service not found', { status: 404 })
    }

    // Check if user is the creator or admin
    if (existingService.creatorId !== session.user.id && session.user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.description || !data.price) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Update the service
    const updateData = {
      title: data.title,
      description: data.description,
      type: data.type,
      status: data.status || 'ACTIVE',
      price: parseFloat(data.price.toString()),
      currency: data.currency || 'USD',
      level: data.level?.toUpperCase() || 'BEGINNER',
      features: data.features || [],
      content: {
        sections: data.content?.sections?.map((section: any) => ({
          ...section,
          lessons: section.lessons.map((lesson: any) => ({
            ...lesson,
            // Remove file objects as they can't be serialized
            attachments: []
          }))
        })) || []
      },
      category: {
        connect: {
          id: data.categoryId
        }
      },
      tags: {
        set: [],
        connectOrCreate: (data.tags || []).map((tag: { id?: string; name: string }) => ({
          where: { name: tag.name },
          create: { name: tag.name }
        }))
      }
    };

    const updatedService = await prisma.service.update({
      where: { id: params.serviceId },
      data: updateData,
      include: {
        category: true,
        tags: true,
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true
          }
        }
      }
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error)
    return new NextResponse(
      `Error updating service: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    )
  }
}

// DELETE /api/services/[serviceId] - Delete a service
export async function DELETE(
  request: Request,
  { params }: { params: { serviceId: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const service = await prisma.service.findUnique({
      where: {
        id: params.serviceId,
      }
    })

    if (!service) {
      return new NextResponse('Service not found', { status: 404 })
    }

    // Check if user is the creator or admin
    if (service.creatorId !== session.user.id && session.user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    await prisma.service.delete({
      where: {
        id: params.serviceId,
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting service:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 