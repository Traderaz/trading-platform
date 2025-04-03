'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Users, DollarSign } from 'lucide-react'
import { Service, Tag, Category, User } from '@prisma/client'
import type { Session } from 'next-auth'

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

function CreatorCard({ creator }: { creator: CreatorWithServices }) {
  // Calculate average rating across all services
  const totalReviews = creator.services.reduce((acc, service) => acc + service.reviews.length, 0)
  const totalRating = creator.services.reduce((acc, service) => 
    acc + service.reviews.reduce((sum, review) => sum + review.rating, 0), 0
  )
  const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0

  // Calculate total students
  const totalStudents = creator.services.reduce((acc, service) => 
    acc + (service._count?.enrollments || 0), 0
  )

  // Get unique categories
  const uniqueCategories = Array.from(new Set(creator.services.flatMap(service => 
    service.tags.map(tag => tag.name)
  )))

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 rounded-full overflow-hidden">
            <Image
              src={creator.image || '/default-avatar.png'}
              alt={creator.name || 'Creator'}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <CardTitle>{creator.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {creator.services.length} Active Services
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">
              {averageRating.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-sm font-medium">
              {totalStudents} students
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {uniqueCategories.slice(0, 5).map((category, index) => (
            <Badge key={index} variant="secondary">
              {category}
            </Badge>
          ))}
          {uniqueCategories.length > 5 && (
            <Badge variant="secondary">+{uniqueCategories.length - 5} more</Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Starting from</p>
          <p className="flex items-center mt-1">
            <DollarSign className="h-4 w-4 mr-1" />
            <span className="font-medium">
              {Math.min(...creator.services.map(s => s.price)).toFixed(2)}
            </span>
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/creators/${creator.id}`} className="w-full">
          <Button className="w-full">
            View Profile
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

interface ExploreClientProps {
  creators: GroupedCreators
  session: Session | null
}

export default function ExploreClient({ creators, session }: ExploreClientProps) {
  const sections = [
    { id: 'crypto', title: 'Crypto Traders', data: creators.crypto },
    { id: 'forex', title: 'Forex Traders', data: creators.forex },
    { id: 'indices', title: 'Indices Traders', data: creators.indices },
    { id: 'metals', title: 'Metals Traders', data: creators.metals },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Explore Creators</h1>
        <p className="text-muted-foreground mt-2">
          Discover expert traders across different markets
        </p>
      </div>

      <div className="space-y-12">
        {sections.map(section => {
          if (section.data.length === 0) return null

          return (
            <section key={section.id}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold">{section.title}</h2>
                  <Badge variant="secondary">{section.data.length}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.data.map((creator) => (
                  <CreatorCard key={creator.id} creator={creator} />
                ))}
              </div>
            </section>
          )
        })}

        {Object.values(creators).every(group => group.length === 0) && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              No verified creators found at the moment.
            </p>
            {!session && (
              <Link href="/auth/signin">
                <Button>Sign In to Become a Creator</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 