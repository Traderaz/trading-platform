import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Service, Tag, Category, ServiceType, ServiceStatus, UserRole } from '@prisma/client'
import type { Session } from 'next-auth'
import ServicesClient from './services-client'

type ServiceWithCount = Service & {
  category: Category
  tags: Tag[]
  reviews: { rating: number }[]
  _count: {
    reviews: number
    enrollments: number
  }
}

export default async function ServicesPage() {
  const session = (await getServerSession(authOptions)) as Session & {
    user: {
      role: UserRole
      isVerified: boolean
    }
  }

  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Get user's services if they are a creator
  const services = (session.user.role === UserRole.CREATOR || session.user.role === UserRole.ADMIN)
    ? await prisma.service.findMany({
        where: { 
          creatorId: session.user.id,
        },
        include: {
          category: true,
          tags: true,
          reviews: {
            select: {
              rating: true
            }
          },
          _count: {
            select: {
              reviews: true,
              enrollments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    : []

  return <ServicesClient services={services} session={session} />
}