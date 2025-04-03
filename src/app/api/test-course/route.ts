import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    console.log('Received test course creation request');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.log('Unauthorized: No session or user');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('User authenticated:', session.user.id);

    // Get user and verify they are a creator
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      console.log('User not found in database');
      return new NextResponse('User not found', { status: 404 });
    }

    console.log('User role:', user.role);

    if (user?.role !== 'CREATOR' && user?.role !== 'ADMIN') {
      console.log('Forbidden: User is not a creator or admin');
      return new NextResponse('Only creators can create services', { status: 403 });
    }

    // Get or create a default category
    let category = await prisma.category.findFirst({
      where: { name: 'Trading' }
    });

    if (!category) {
      console.log('Creating default category...');
      category = await prisma.category.create({
        data: {
          name: 'Trading',
          description: 'Default category for trading courses and services'
        }
      });
    }

    console.log('Using category:', category);

    // Parse request body
    const data = await request.json();
    console.log('Received data:', data);

    // Create the course
    const course = await prisma.service.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        price: data.price,
        features: data.features,
        content: data.content,
        categoryId: category.id,
        creatorId: session.user.id,
        status: 'ACTIVE',
        tags: {
          connectOrCreate: data.tags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag }
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

    console.log('Course created successfully:', course.id);
    return NextResponse.json(course);
  } catch (error) {
    console.error('Error creating test course:', error);
    return new NextResponse(`Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
} 