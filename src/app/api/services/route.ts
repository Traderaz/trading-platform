import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ServiceType, ServiceStatus, Prisma } from '@prisma/client'

// Define types for our service with relations
interface ServiceWithRelations extends Prisma.ServiceGetPayload<{
  include: {
    reviews: { select: { rating: true } }
    category: true
    tags: true
    creator: {
      select: {
        id: true
        name: true
        image: true
        isVerified: true
      }
    }
  }
}> {}

interface ServiceWithRating extends ServiceWithRelations {
  averageRating: number | null
  reviewCount: number
}

// GET /api/services - Get all services or filter by query params
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const creatorId = searchParams.get('creatorId')
    const query = searchParams.get('query')

    const session = await getServerSession(authOptions)
    
    // Build the where clause based on filters
    const where: Prisma.ServiceWhereInput = {
      status: (status as ServiceStatus) || 'ACTIVE',
      ...(category && { categoryId: category }),
      ...(type && { type: type as ServiceType }),
      ...(creatorId && { creatorId }),
      ...(query && {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } }
        ]
      })
    }

    // If not authenticated, only show active services
    if (!session?.user) {
      where.status = 'ACTIVE'
    }

    const services = await prisma.service.findMany({
      where,
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
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate average rating for each service
    const servicesWithRating = services.map((service: ServiceWithRelations) => ({
      ...service,
      averageRating: service.reviews.length > 0
        ? service.reviews.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0) / service.reviews.length
        : null,
      reviewCount: service.reviews.length
    }))

    return NextResponse.json(servicesWithRating)
  } catch (error) {
    console.error('Error fetching services:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// POST /api/services - Create a new service
export async function POST(request: Request) {
  try {
    console.log('Received service creation request');
    
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

    let data: any;
    const contentType = request.headers.get('content-type') || '';
    console.log('Content-Type:', contentType);
    
    try {
      if (contentType.includes('multipart/form-data')) {
        console.log('Parsing FormData');
        const formData = await request.formData();
        data = {
          title: formData.get('title'),
          description: formData.get('description'),
          type: formData.get('type'),
          price: formData.get('price'),
          currency: formData.get('currency') || 'USD',
          features: formData.get('features'),
          categoryId: formData.get('categoryId'),
          tags: formData.get('tags'),
          content: formData.get('content'),
          thumbnail: formData.get('thumbnail')
        };
        
        // Log form data for debugging
        console.log('Form data received:', {
          title: data.title,
          description: data.description,
          type: data.type,
          price: data.price,
          categoryId: data.categoryId,
          features: data.features,
          tags: data.tags,
          content: data.content ? 'Content present' : 'No content'
        });
      } else {
        console.log('Parsing JSON');
        data = await request.json();
        console.log('JSON data received:', data);
      }
    } catch (error) {
      console.error('Error parsing request data:', error);
      return new NextResponse(`Invalid request data format: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 400 });
    }

    const { 
      title, 
      description, 
      type, 
      price, 
      currency = 'USD',
      features,
      categoryId,
      tags,
      content
    } = data;

    // Validate required fields
    if (!title || !description || !type || !price) {
      console.log('Missing required fields:', { title, description, type, price });
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Validate service type
    if (!Object.values(ServiceType).includes(type as ServiceType)) {
      console.log('Invalid service type:', type);
      return new NextResponse('Invalid service type', { status: 400 });
    }

    // Get or create a default category if no categoryId is provided
    let category;
    if (!categoryId) {
      console.log('No category provided, creating default category...');
      category = await prisma.category.upsert({
        where: { name: 'Trading' },
        update: {},
        create: {
          name: 'Trading',
          description: 'Default category for trading courses and services'
        }
      });
      console.log('Using default category:', category);
    } else {
      category = await prisma.category.findUnique({
        where: { id: categoryId }
      });
      
      if (!category) {
        console.log('Category not found:', categoryId);
        return new NextResponse('Category not found', { status: 400 });
      }
    }

    // Process features and tags
    let processedFeatures = [];
    let processedTags = [];
    let processedContent = undefined;

    try {
      if (features) {
        processedFeatures = typeof features === 'string' 
          ? JSON.parse(features)
          : Array.isArray(features) ? features : [];
        console.log('Processed features:', processedFeatures);
      }

      if (tags) {
        processedTags = typeof tags === 'string'
          ? JSON.parse(tags)
          : Array.isArray(tags) ? tags : [];
        console.log('Processed tags:', processedTags);
      }

      if (content) {
        processedContent = typeof content === 'string' 
          ? JSON.parse(content)
          : content;
        console.log('Processed content structure:', 
          processedContent ? 
            `Sections: ${processedContent.sections ? processedContent.sections.length : 0}` : 
            'No content'
        );
      }
    } catch (error) {
      console.error('Error parsing JSON data:', error);
      return new NextResponse(`Invalid JSON format in features, tags, or content: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 400 });
    }

    // Create new service
    try {
      if (!session.user?.id) {
        throw new Error('User ID is required');
      }

      console.log('Creating service in database');
      const service = await prisma.service.create({
        data: {
          title,
          description,
          type: type as ServiceType,
          price: parseFloat(price.toString()),
          currency,
          features: processedFeatures,
          categoryId: category.id,
          creatorId: session.user.id,
          status: 'ACTIVE' as ServiceStatus,
          content: processedContent,
          tags: processedTags.length > 0 ? {
            connectOrCreate: processedTags.map((tag: string) => ({
              where: { name: tag },
              create: { name: tag }
            }))
          } : undefined
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

      console.log('Service created successfully:', service.id);
      return NextResponse.json(service);
    } catch (error) {
      console.error('Error creating service in database:', error);
      return new NextResponse(`Database error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating service:', error);
    return new NextResponse(`Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
} 