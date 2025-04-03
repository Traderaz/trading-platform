import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface User {
  name: string | null;
}

interface Enrollment {
  id: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED';
  progress: number;
  user: User;
  createdAt: Date;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  user: User;
  createdAt: Date;
}

interface Service {
  id: string;
  title: string;
  price: number;
  creatorId: string;
  enrollments: Enrollment[];
  reviews: Review[];
  _count: {
    subscriptions: number;
    reviews: number;
  };
}

export async function GET(
  request: Request,
  { params }: { params: { serviceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the course and verify ownership
    const course = await prisma.service.findUnique({
      where: { id: params.serviceId },
      include: {
        subscriptions: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            subscriptions: true,
            reviews: true,
          },
        },
      },
    }) as unknown as Service | null;

    if (!course) {
      return new NextResponse('Course not found', { status: 404 });
    }

    if (course.creatorId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Calculate total revenue
    const totalRevenue = course.enrollments.length * course.price;

    // Calculate average rating
    const averageRating = course.reviews.length > 0
      ? course.reviews.reduce((acc, review) => acc + review.rating, 0) / course.reviews.length
      : 0;

    // Generate enrollment trend data (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const subscriptionTrend = await prisma.$queryRaw`
      SELECT DATE(createdAt) as date, COUNT(*) as count
      FROM Subscription
      WHERE serviceId = ${params.serviceId}
        AND createdAt >= ${sevenDaysAgo}
      GROUP BY DATE(createdAt)
      ORDER BY DATE(createdAt)
    `;

    // Format trend data
    const trendData = (subscriptionTrend as { date: string; count: number }[]).map(day => ({
      date: day.date,
      enrollments: day.count,
    }));

    // Calculate engagement metrics
    const completedEnrollments = course.enrollments.filter(
      enrollment => enrollment.status === 'COMPLETED'
    ).length;

    const activeEnrollments = course.enrollments.filter(
      enrollment => enrollment.status === 'IN_PROGRESS'
    ).length;

    const averageProgress = course.enrollments.length > 0
      ? course.enrollments.reduce((acc, enrollment) => acc + enrollment.progress, 0) / course.enrollments.length
      : 0;

    const engagementMetrics = {
      completionRate: course.enrollments.length > 0
        ? (completedEnrollments / course.enrollments.length) * 100
        : 0,
      averageProgress,
      activeStudents: activeEnrollments,
    };

    // Format reviews
    const formattedReviews = course.reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      userName: review.user.name || 'Anonymous',
      createdAt: review.createdAt.toISOString(),
    }));

    const analyticsData = {
      id: course.id,
      title: course.title,
      totalEnrollments: course._count.subscriptions,
      totalRevenue,
      averageRating,
      enrollmentTrend: trendData,
      reviews: formattedReviews,
      engagementMetrics,
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching course analytics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 