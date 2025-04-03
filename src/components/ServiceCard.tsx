"use client";

import { Card } from "@/components/ui/card";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from 'next/image'
import { StarIcon } from '@heroicons/react/20/solid'
import { Service } from '@/types'

interface ServiceCardProps {
  service: Service
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link href={`/services/${service.id}`}>
      <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
          {service.thumbnail ? (
            <Image
              src={service.thumbnail}
              alt={service.title}
              width={500}
              height={300}
              className="h-full w-full object-cover object-center group-hover:opacity-75"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-100">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col space-y-2 p-4">
          <h3 className="text-sm font-medium text-gray-900">{service.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">{service.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {service.creator?.image && (
                <Image
                  src={service.creator.image}
                  alt={service.creator.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span className="ml-2 text-sm text-gray-500">{service.creator?.name}</span>
            </div>
            <div className="flex items-center">
              <StarIcon className="h-4 w-4 text-yellow-400" />
              <span className="ml-1 text-sm text-gray-500">
                {service.averageRating?.toFixed(1) || '0.0'}
              </span>
              {service._count?.reviews !== undefined && (
                <span className="ml-1 text-sm text-gray-500">
                  ({service._count.reviews})
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              ${service.price.toFixed(2)}
            </span>
            {service.category && (
              <span className="text-sm text-gray-500">{service.category.name}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
} 