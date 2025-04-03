"use client";

import { Card } from "@/components/ui/card";
import { BookOpenIcon, PencilIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface ServiceTileProps {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  enrolledStudents: number;
  price: number;
}

export function ServiceTile({ id, title, description, thumbnail, enrolledStudents, price }: ServiceTileProps) {
  return (
    <Card className="relative group hover:border-primary transition-colors duration-200">
      <Link href={`/dashboard/services/${id}/edit`} className="block p-4">
        <div className="relative aspect-video mb-4 bg-card-hover rounded-lg overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpenIcon className="w-12 h-12 text-text-secondary" />
            </div>
          )}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <PencilIcon className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
        <p className="text-text-secondary text-sm mb-4 line-clamp-2">{description}</p>
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-secondary">{enrolledStudents} students enrolled</span>
          <span className="text-primary font-medium">${price}</span>
        </div>
      </Link>
    </Card>
  );
} 