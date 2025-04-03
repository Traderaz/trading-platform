'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { Headphones, Clock, Calendar, Users } from 'lucide-react'
import { ServiceType } from '@prisma/client'

interface MentorshipData {
  name: string
  tagline: string
  description: string
  price: number
  paymentFrequency: 'ONE_TIME' | 'MONTHLY' | 'YEARLY'
  sessionDuration: number // in minutes
  sessionsPerMonth: number
  availability: string[]
  maxStudents: number
  features: string[]
}

export default function CreateServicePage() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<MentorshipData>({
    name: '',
    tagline: '',
    description: '',
    price: 0,
    paymentFrequency: 'MONTHLY',
    sessionDuration: 60,
    sessionsPerMonth: 4,
    availability: [],
    maxStudents: 5,
    features: []
  })

  useEffect(() => {
    const type = searchParams.get('type')
    if (type && type !== ServiceType.MENTORSHIP) {
      window.location.href = '/dashboard/services/new'
    }
  }, [searchParams])

  const updateFormData = (data: Partial<MentorshipData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handlePublish = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a mentorship program name"
      })
      return
    }
    if (!formData.description.trim()) {
      toast({
        title: "Error",
        description: "Please enter a program description"
      })
      return
    }
    if (formData.price <= 0) {
      toast({
        title: "Error",
        description: "Price must be greater than 0"
      })
      return
    }

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.name,
          description: formData.description,
          type: ServiceType.MENTORSHIP,
          price: formData.price,
          currency: 'USD',
          features: [
            `${formData.sessionDuration} minute sessions`,
            `${formData.sessionsPerMonth} sessions per month`,
            `Maximum ${formData.maxStudents} students`,
            ...formData.features
          ],
          content: {
            sessionDuration: formData.sessionDuration,
            sessionsPerMonth: formData.sessionsPerMonth,
            availability: formData.availability,
            maxStudents: formData.maxStudents
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create mentorship program')
      }

      const data = await response.json()
      toast({
        title: "Success",
        description: "Your mentorship program has been created"
      })

      window.location.href = `/dashboard/services/${data.id}`
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create mentorship program"
      })
    }
  }

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <Card className="p-6">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Create Mentorship Program</h1>
            <p className="text-muted-foreground">Tell us about your mentorship program</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                placeholder="e.g. Trading Mentorship Program"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
              />
              <p className="text-sm text-muted-foreground mt-1">Choose a name that reflects your material - you can change this later</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tagline</label>
              <Input
                placeholder="A short, catchy description"
                value={formData.tagline}
                onChange={(e) => updateFormData({ tagline: e.target.value })}
              />
              <p className="text-sm text-muted-foreground mt-1">This will appear on your service card</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                placeholder="Describe your mentorship program and what users will get..."
                className="h-32"
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
              />
              <p className="text-sm text-muted-foreground mt-1">Let users know what they'll get from your service</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price ($)</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => updateFormData({ price: parseFloat(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Payment Frequency</label>
                <Select
                  value={formData.paymentFrequency}
                  onValueChange={(value) => updateFormData({ paymentFrequency: value as 'ONE_TIME' | 'MONTHLY' | 'YEARLY' })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payment frequency" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="ONE_TIME">One-time payment</SelectItem>
                    <SelectItem value="MONTHLY">Monthly payment</SelectItem>
                    <SelectItem value="YEARLY">Yearly payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Session Duration (minutes)</label>
                <Input
                  type="number"
                  min="15"
                  step="15"
                  value={formData.sessionDuration}
                  onChange={(e) => updateFormData({ sessionDuration: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sessions per Month</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.sessionsPerMonth}
                  onChange={(e) => updateFormData({ sessionsPerMonth: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Maximum Students</label>
              <Input
                type="number"
                min="1"
                value={formData.maxStudents}
                onChange={(e) => updateFormData({ maxStudents: parseInt(e.target.value) })}
              />
              <p className="text-sm text-muted-foreground mt-1">Set a limit for how many students you can mentor at once</p>
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={() => window.history.back()}>
              Back
            </Button>
            <Button onClick={handlePublish}>
              Publish Mentorship Program
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
} 