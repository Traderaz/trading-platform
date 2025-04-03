'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, Star, DollarSign, Clock, MessageCircle, Video, Zap, Headphones, BarChart2, Wrench, Box, Plus, Trash2 } from 'lucide-react'
import { Service, Tag, Category, ServiceType, ServiceStatus, UserRole } from '@prisma/client'
import type { Session } from 'next-auth'
import { toast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type ServiceWithCount = Service & {
  category: Category
  tags: Tag[]
  reviews: { rating: number }[]
  _count: {
    reviews: number
    enrollments: number
  }
}

const serviceTypeIcons = {
  [ServiceType.COURSE]: BookOpen,
  [ServiceType.COMMUNITY]: MessageCircle,
  [ServiceType.SIGNALS]: Zap,
  [ServiceType.MENTORSHIP]: Headphones,
  [ServiceType.ANALYSIS]: BarChart2,
  [ServiceType.TOOL]: Wrench,
  [ServiceType.OTHER]: Box,
} as const

const serviceTypeLabels = {
  [ServiceType.COURSE]: 'Course',
  [ServiceType.COMMUNITY]: 'Community',
  [ServiceType.SIGNALS]: 'Signals',
  [ServiceType.MENTORSHIP]: 'Mentorship',
  [ServiceType.ANALYSIS]: 'Analysis',
  [ServiceType.TOOL]: 'Tool',
  [ServiceType.OTHER]: 'Other',
} as const

function ServiceCard({ service }: { service: ServiceWithCount }) {
  const averageRating = service.reviews.length > 0
    ? service.reviews.reduce((acc: number, review) => acc + review.rating, 0) / service.reviews.length
    : 0

  const ServiceIcon = serviceTypeIcons[service.type] || Box

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete service')
      }

      toast({
        title: "Success",
        description: "Service deleted successfully"
      })
      
      // Refresh the page to update the list
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive"
      })
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            <ServiceIcon className="h-3 w-3 mr-1" />
            {serviceTypeLabels[service.type] || 'Other'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {service.status}
          </Badge>
        </div>
        <CardTitle className="line-clamp-2">{service.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {service.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">
              {averageRating.toFixed(1)}
            </span>
          </div>
          {service.type === ServiceType.COURSE && (
            <div className="flex items-center">
              <Users className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-sm font-medium">
                {service._count?.enrollments || 0} students
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {service.tags.map((tag: Tag) => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            <span>{service.price.toFixed(2)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>Updated {new Date(service.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link href={`/dashboard/services/${service.id}/edit`} className="flex-1">
          <Button className="w-full" variant="outline">
            Manage Service
          </Button>
        </Link>
        <Link href={`/dashboard/services/${service.id}/analytics`} className="flex-1">
          <Button className="w-full" variant="secondary">
            Analytics
          </Button>
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your service
                and remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}

interface ServicesClientProps {
  services: ServiceWithCount[]
  session: Session & {
    user: {
      role: UserRole
      isVerified: boolean
    }
  }
}

export default function ServicesClient({ services, session }: ServicesClientProps) {
  // Group services by type
  const servicesByType = services.reduce((acc, service) => {
    const type = service.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(service);
    return acc;
  }, {} as Record<ServiceType, ServiceWithCount[]>);

  // Order of service types to display
  const serviceTypeOrder = [
    ServiceType.COURSE,
    ServiceType.COMMUNITY,
    ServiceType.SIGNALS,
    ServiceType.MENTORSHIP,
    ServiceType.ANALYSIS,
    ServiceType.TOOL,
    ServiceType.OTHER,
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Services</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track your trading services
          </p>
        </div>
        {(session.user.role === UserRole.CREATOR || session.user.role === UserRole.ADMIN) && (
          <Link href="/dashboard/services/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Service
            </Button>
          </Link>
        )}
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12">
          {session.user.role === UserRole.CREATOR || session.user.role === UserRole.ADMIN ? (
            <div>
              <p className="text-lg text-muted-foreground mb-4">
                You haven't created any services yet.
              </p>
              <Link href="/dashboard/services/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Service
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-lg text-muted-foreground mb-4">
                You need to be a creator to offer services.
              </p>
              <Link href="/dashboard/settings">
                <Button>Become a Creator</Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          {serviceTypeOrder.map((type) => {
            const typeServices = servicesByType[type] || [];
            if (typeServices.length === 0) return null;

            const ServiceIcon = serviceTypeIcons[type];
            return (
              <section key={type}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <ServiceIcon className="h-6 w-6" />
                    <h2 className="text-2xl font-semibold">{serviceTypeLabels[type]}</h2>
                    <Badge variant="secondary">{typeServices.length}</Badge>
                  </div>
                  <Link href={`/dashboard/services/new?type=${type}`}>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add {serviceTypeLabels[type]}
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {typeServices.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  )
} 