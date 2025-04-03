'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function TestCoursePage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const checkCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/test-category');
      const data = await response.json();
      console.log('Categories response:', data);
      toast({
        title: 'Categories Check',
        description: data.message,
      });
    } catch (error) {
      console.error('Error checking categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to check categories',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTestCourse = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/test-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Course',
          description: 'This is a test course',
          type: 'COURSE',
          price: 99.99,
          features: ['Feature 1', 'Feature 2'],
          tags: ['test', 'course'],
          content: {
            sections: [
              {
                title: 'Introduction',
                content: 'Welcome to the course'
              }
            ]
          }
        }),
      });

      const data = await response.json();
      console.log('Course creation response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create course');
      }

      toast({
        title: 'Success',
        description: 'Test course created successfully',
      });
    } catch (error) {
      console.error('Error creating test course:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create test course',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Test Course Page</h1>
        <p>Please sign in to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Course Page</h1>
      <div className="space-y-4">
        <Button 
          onClick={checkCategories} 
          disabled={isLoading}
        >
          Check Categories
        </Button>
        <Button 
          onClick={createTestCourse} 
          disabled={isLoading}
        >
          Create Test Course
        </Button>
      </div>
    </div>
  );
} 