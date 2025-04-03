import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Service, Tag, Category, User, UserRole } from '@prisma/client'
import ExploreClient from './explore-client'

type ServiceWithRelations = Service & {
  category: Category
  tags: Tag[]
  reviews: { rating: number }[]
  _count: {
    reviews: number
    enrollments: number
  }
}

type CreatorWithServices = User & {
  services: ServiceWithRelations[]
}

type GroupedCreators = {
  crypto: CreatorWithServices[]
  forex: CreatorWithServices[]
  indices: CreatorWithServices[]
  metals: CreatorWithServices[]
}

export default async function ExplorePage() {
  const session = await getServerSession(authOptions)

  // Get all verified creators with their services
  const creators = await prisma.user.findMany({
    where: {
      role: UserRole.CREATOR,
      isVerified: true,
    },
    include: {
      services: {
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
        }
      }
    }
  }) as unknown as CreatorWithServices[]

  // Group creators by their trading specialty (based on their service tags)
  const groupedCreators: GroupedCreators = {
    crypto: creators.filter(creator => 
      creator.services.some(service => 
        service.tags.some(tag => tag.name.toLowerCase().includes('crypto'))
      )
    ),
    forex: creators.filter(creator => 
      creator.services.some(service => 
        service.tags.some(tag => tag.name.toLowerCase().includes('forex'))
      )
    ),
    indices: creators.filter(creator => 
      creator.services.some(service => 
        service.tags.some(tag => tag.name.toLowerCase().includes('indices') || 
        tag.name.toLowerCase().includes('stocks'))
      )
    ),
    metals: creators.filter(creator => 
      creator.services.some(service => 
        service.tags.some(tag => tag.name.toLowerCase().includes('metals') || 
        tag.name.toLowerCase().includes('gold') || 
        tag.name.toLowerCase().includes('silver'))
      )
    ),
  }

  return <ExploreClient creators={groupedCreators} session={session} />
} 