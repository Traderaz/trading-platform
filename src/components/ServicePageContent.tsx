"use client";

import Image from 'next/image'
import { StarIcon } from '@heroicons/react/20/solid'
import { Service } from '@/types'
import PurchaseButton from '@/components/PurchaseButton'
import ReviewList from '@/components/ReviewList'
import { Session } from 'next-auth'

interface ServicePageContentProps {
  service: Service
  session: Session | null
}

export default function ServicePageContent({ service, session }: ServicePageContentProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200">
            {service.thumbnail ? (
              <Image
                src={service.thumbnail}
                alt={service.title}
                width={1000}
                height={600}
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-100">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>

          <div className="mt-8">
            <h1 className="text-3xl font-bold text-gray-900">{service.title}</h1>
            <div className="mt-4 flex items-center">
              <div className="flex items-center">
                {service.creator?.image && (
                  <Image
                    src={service.creator.image}
                    alt={service.creator.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}
                <span className="ml-2 text-sm text-gray-500">
                  {service.creator?.name}
                </span>
              </div>
              <div className="ml-4 flex items-center">
                <StarIcon className="h-5 w-5 text-yellow-400" />
                <span className="ml-1 text-sm text-gray-500">
                  {service.averageRating?.toFixed(1) || '0.0'}
                </span>
                {service._count?.reviews !== undefined && (
                  <span className="ml-1 text-sm text-gray-500">
                    ({service._count.reviews} reviews)
                  </span>
                )}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900">Description</h2>
              <p className="mt-4 whitespace-pre-wrap text-gray-500">
                {service.description}
              </p>
            </div>

            {service.category && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900">Category</h2>
                <p className="mt-4 text-gray-500">{service.category.name}</p>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
              <ReviewList serviceId={service.id} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">
                ${service.price.toFixed(2)}
              </span>
              {service.status === 'ACTIVE' && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  Active
                </span>
              )}
            </div>

            {session?.user && service.creatorId !== session.user.id && (
              <div className="mt-6">
                <PurchaseButton service={service} />
              </div>
            )}

            {!session?.user && (
              <div className="mt-6 text-center text-sm text-gray-500">
                Please sign in to purchase this service
              </div>
            )}

            {session?.user && service.creatorId === session.user.id && (
              <div className="mt-6 text-center text-sm text-gray-500">
                You cannot purchase your own service
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 