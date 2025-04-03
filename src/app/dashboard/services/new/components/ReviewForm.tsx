'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { Check, AlertCircle } from 'lucide-react'

interface Chapter {
  id: string
  title: string
  lessons: {
    id: string
    title: string
    videoUrl?: string
    attachments?: string[]
  }[]
}

interface ReviewFormProps {
  data: {
    title: string
    description: string
    price: string
    categoryId: string
    level: string
    features: string[]
    chapters: Chapter[]
    thumbnail?: string
    previewVideo?: string
  }
  onBack: () => Promise<void>
}

export default function ReviewForm({ data, onBack }: ReviewFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testResults, setTestResults] = useState<{
    basicInfo: boolean
    content: boolean
    features: boolean
    media: boolean
  }>({
    basicInfo: false,
    content: false,
    features: false,
    media: false
  })

  const testBasicInfo = () => {
    const isValid = 
      data.title.length >= 3 &&
      data.description.length >= 10 &&
      !isNaN(Number(data.price)) &&
      Number(data.price) >= 0 &&
      data.categoryId.length > 0

    setTestResults(prev => ({ ...prev, basicInfo: isValid }))
    return isValid
  }

  const testContent = () => {
    const isValid = 
      data.chapters.length > 0 &&
      data.chapters.every(chapter => 
        chapter.title.length > 0 &&
        chapter.lessons.length > 0 &&
        chapter.lessons.every(lesson => lesson.title.length > 0)
      )

    setTestResults(prev => ({ ...prev, content: isValid }))
    return isValid
  }

  const testFeatures = () => {
    const isValid = data.features.length > 0 && data.features.every(f => f.length > 0)
    setTestResults(prev => ({ ...prev, features: isValid }))
    return isValid
  }

  const testMedia = () => {
    const isValid = !!data.thumbnail
    setTestResults(prev => ({ ...prev, media: isValid }))
    return isValid
  }

  const runAllTests = () => {
    const results = {
      basicInfo: testBasicInfo(),
      content: testContent(),
      features: testFeatures(),
      media: testMedia()
    }
    setTestResults(results)
    return Object.values(results).every(Boolean)
  }

  const handleSubmit = async () => {
    if (!runAllTests()) {
      toast({
        title: 'Validation Failed',
        description: 'Please fix the issues before submitting',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          type: 'COURSE',
          price: Number(data.price),
          features: data.features.map(value => ({ value }))
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create course')
      }

      toast({
        title: 'Success',
        description: 'Course created successfully'
      })
      router.push('/dashboard/services')
      router.refresh()
    } catch (error) {
      console.error('Error creating course:', error)
      toast({
        title: 'Error',
        description: 'Failed to create course'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Review Your Course</h3>
        <p className="text-muted-foreground mb-6">
          Let's make sure everything is ready before publishing your course
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{data.title}</p>
                  <p className="text-sm text-muted-foreground">{data.description}</p>
                </div>
                {testResults.basicInfo ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Price: ${data.price}</span>
                <span>Level: {data.level}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Course Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p>{data.chapters.length} Chapters</p>
                  <p className="text-sm text-muted-foreground">
                    {data.chapters.reduce((acc, chapter) => acc + chapter.lessons.length, 0)} Total Lessons
                  </p>
                </div>
                {testResults.content ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Course Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <ul className="list-disc list-inside space-y-1">
                  {data.features.map((feature, index) => (
                    <li key={index} className="text-sm">{feature}</li>
                  ))}
                </ul>
                {testResults.features ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Course Media</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  {data.thumbnail && (
                    <img
                      src={data.thumbnail}
                      alt="Course thumbnail"
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  )}
                  <div>
                    <p>Thumbnail: {data.thumbnail ? 'Uploaded' : 'Missing'}</p>
                    <p className="text-sm text-muted-foreground">
                      Preview Video: {data.previewVideo ? 'Uploaded' : 'Not uploaded'}
                    </p>
                  </div>
                </div>
                {testResults.media ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={runAllTests}
            disabled={isSubmitting}
          >
            Run Tests
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !Object.values(testResults).every(Boolean)}
          >
            {isSubmitting ? 'Creating...' : 'Create Course'}
          </Button>
        </div>
      </div>
    </div>
  )
} 