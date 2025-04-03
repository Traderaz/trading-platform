'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function BecomeCreatorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleBecomeCreator = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/creator-application', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to become a creator');
      }

      toast({
        title: 'Success',
        description: 'You are now a creator!',
      });

      // Redirect to courses page
      router.push('/dashboard/courses');
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to become a creator',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Become a Creator</h1>
      <p className="mb-4">Click the button below to become a creator and start offering courses.</p>
      <Button 
        onClick={handleBecomeCreator}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Become a Creator'}
      </Button>
    </div>
  );
} 