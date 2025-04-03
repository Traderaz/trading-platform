import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
  };
}

// GET /api/courses/[serviceId] - Get a specific course
export async function GET(
  request: Request,
  { params }: { params: { serviceId: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const course = await prisma.service.findUnique({
      where: {
        id: params.serviceId,
        type: 'COURSE'
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
    });

    if (!course) {
      return new NextResponse('Course not found', { status: 404 });
    }

    // Check if user is the creator or admin
    if (course.creatorId !== session.user.id && session.user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    return new NextResponse(
      `Error fetching course: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
  }
}

// PUT /api/courses/[serviceId] - Update a course
export async function PUT(
  request: Request,
  { params }: { params: { serviceId: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if the course exists and user has permission
    const existingCourse = await prisma.service.findUnique({
      where: { id: params.serviceId }
    });

    if (!existingCourse) {
      return new NextResponse('Course not found', { status: 404 });
    }

    if (existingCourse.creatorId !== session.user.id && session.user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const data = await request.json();

    // Update the course
    const updatedCourse = await prisma.service.update({
      where: { id: params.serviceId },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        status: data.status || 'ACTIVE',
        price: parseFloat(data.price.toString()),
        currency: data.currency || 'USD',
        features: [
          ...(data.features || []).filter((f: any) => f.type !== 'level'),
          { type: 'level', value: data.level || 'beginner' }
        ],
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
          set: [], // Remove existing tags
          connectOrCreate: (data.tags || []).map((tag: { id?: string; name: string }) => ({
            where: { name: tag.name },
            create: { name: tag.name }
          }))
        }
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
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    return new NextResponse(
      `Error updating course: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
  }
} 