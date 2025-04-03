'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ServicePage({ params }: { params: { serviceId: string } }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/services/${params.serviceId}/edit`);
  }, [params.serviceId, router]);

  return null;
} 