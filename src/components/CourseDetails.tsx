import { Service } from '@prisma/client';
import { CoursePurchaseButton } from '@/components/CoursePurchaseButton';

interface CourseDetailsProps {
  course: Service;
}

export function CourseDetails({ course }: CourseDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="text-muted-foreground mt-2">{course.description}</p>
      </div>
      <div className="grid gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Price:</span>
          <span>${course.price}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Level:</span>
          <span className="capitalize">{course.level?.toLowerCase()}</span>
        </div>
        {course.features?.length > 0 && (
          <div>
            <span className="font-semibold">Features:</span>
            <ul className="list-disc list-inside mt-2">
              {course.features.map((feature, index) => (
                <li key={index}>{feature.value}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <CoursePurchaseButton serviceId={course.id} price={course.price} />
    </div>
  );
} 