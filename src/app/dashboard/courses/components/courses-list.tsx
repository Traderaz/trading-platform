import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CoursesListProps {
  courses: any[];
  userRole: string;
}

export function CoursesList({ courses, userRole }: CoursesListProps) {
  return (
    <div>
      {courses.length === 0 ? (
        <div className="text-center">
          <p className="text-muted-foreground">No courses found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                <p className="text-muted-foreground line-clamp-2">{course.description}</p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Link href={`/dashboard/services/${course.id}/edit`} className="flex-1">
                  <Button className="w-full" variant="outline">
                    Manage Course
                  </Button>
                </Link>
                <Link href={`/dashboard/services/${course.id}/analytics`} className="flex-1">
                  <Button className="w-full" variant="secondary">
                    Analytics
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 