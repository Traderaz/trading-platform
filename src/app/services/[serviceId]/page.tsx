import { notFound } from 'next/navigation'
import { servicesApi } from '@/lib/api-client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ServicePageContent from '@/components/ServicePageContent'

interface ServicePageProps {
  params: {
    serviceId: string
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const session = await getServerSession(authOptions)
  const service = await servicesApi.getById(params.serviceId).catch(() => null)

  if (!service) {
    notFound()
  }

  return <ServicePageContent service={service} session={session} />
} 