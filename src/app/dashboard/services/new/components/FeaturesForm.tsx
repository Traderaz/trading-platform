'use client'

import * as React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { Plus, X } from 'lucide-react'

interface FeaturesFormProps {
  data: {
    features: string[]
  }
  onUpdate: (data: { features: string[] }) => void
  onNext: () => void
  onBack: () => void
}

export default function FeaturesForm({ data, onUpdate, onNext, onBack }: FeaturesFormProps) {
  const [newFeature, setNewFeature] = useState('')

  const addFeature = () => {
    if (!newFeature.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a feature'
      })
      return
    }

    onUpdate({
      features: [...data.features, newFeature.trim()]
    })
    setNewFeature('')
  }

  const removeFeature = (index: number) => {
    onUpdate({
      features: data.features.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (data.features.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one feature'
      })
      return
    }

    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Course Features</h3>
        <p className="text-muted-foreground mb-6">
          Add features that describe what students will learn in your course
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter a feature..."
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={addFeature}
                className="shrink-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            {data.features.length > 0 ? (
              <ul className="space-y-2">
                {data.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                  >
                    <span>{feature}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No features added yet. Add some features to describe what students will learn.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">
          Next
        </Button>
      </div>
    </form>
  )
} 