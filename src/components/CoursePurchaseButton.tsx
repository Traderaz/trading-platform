import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface CoursePurchaseButtonProps {
  serviceId: string;
  price: number;
}

export default function CoursePurchaseButton({
  serviceId,
  price
}: CoursePurchaseButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/services/${serviceId}/purchase`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to initiate purchase');
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error('Error purchasing course:', error);
      toast({
        title: 'Error',
        description: 'Failed to initiate purchase'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePurchase}
      disabled={loading}
      className="w-full"
    >
      {loading ? 'Processing...' : `Purchase for $${price}`}
    </Button>
  );
} 