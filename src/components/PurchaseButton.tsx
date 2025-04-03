"use client";

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { purchasesApi } from '@/lib/api-client'
import { Service } from '@/types'

interface PurchaseButtonProps {
  service: Service
}

export default function PurchaseButton({ service }: PurchaseButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handlePurchase = async () => {
    try {
      setLoading(true)
      // TODO: Integrate with payment processor (e.g., Stripe)
      const purchase = await purchasesApi.create({
        serviceId: service.id,
        userId: '', // This will be set by the API based on the session
        amount: service.price,
        currency: 'USD',
        status: 'PENDING',
        paymentMethodId: '', // This will be set after payment processing
      })

      // Redirect to payment page or show payment form
      router.push(`/checkout/${purchase.id}`)
    } catch (error) {
      console.error('Error creating purchase:', error)
      // TODO: Show error message to user
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? 'Processing...' : 'Purchase Now'}
    </button>
  )
} 