import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import CourseDetails from "@/components/CourseDetails";

interface CoursePageProps {
  params: {
    serviceId: string;
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const course = await prisma.service.findUnique({
    where: { 
      id: params.serviceId,
      type: 'COURSE'
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#2F4F4F] py-12">
      <div className="container mx-auto px-4">
        <CourseDetails course={course} />
      </div>
    </div>
  );
} 