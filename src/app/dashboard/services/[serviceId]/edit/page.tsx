'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import ChaptersList from '@/app/dashboard/services/new/components/ChaptersList'
import LessonEditor from '@/app/dashboard/services/new/components/LessonEditor'
import { toast } from '@/components/ui/use-toast'
import { Plus } from 'lucide-react'
import { ServiceType } from '@prisma/client'

interface CourseData {
  name: string
  description: string
  price: number
  chapters: Chapter[]
  categoryId: string
}

interface Chapter {
  id: string
  title: string
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  type: 'video' | 'document'
  description?: string
  duration?: string
  videoUrl?: string
  attachments?: string[]
}

export default function EditCoursePage({ params }: { params: { serviceId: string } }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<CourseData>({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    chapters: []
  })
  const [editingLesson, setEditingLesson] = useState<{
    chapterId: string;
    lessonId: string;
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCourseData()
  }, [])

  const fetchCourseData = async () => {
    try {
      const response = await fetch(`/api/services/${params.serviceId}`)
      if (!response.ok) throw new Error('Failed to fetch course data')
      
      const data = await response.json()
      setFormData({
        name: data.title,
        description: data.description,
        price: data.price,
        categoryId: data.categoryId,
        chapters: data.content?.sections?.map((section: any) => ({
          id: section.id,
          title: section.title,
          lessons: section.lessons.map((lesson: any) => ({
            id: lesson.id,
            title: lesson.title,
            type: lesson.type || 'video',
            description: lesson.description || '',
            videoUrl: lesson.videoUrl || '',
            attachments: lesson.attachments || []
          }))
        })) || []
      })
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching course:', error)
      toast({
        title: "Error",
        description: "Failed to load course data"
      })
    }
  }

  const updateFormData = (data: Partial<CourseData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleLessonSave = (
    chapterId: string,
    lessonId: string,
    updates: Partial<Lesson>
  ) => {
    const updatedChapters = formData.chapters.map(chapter =>
      chapter.id === chapterId
        ? {
            ...chapter,
            lessons: chapter.lessons.map(lesson =>
              lesson.id === lessonId ? { ...lesson, ...updates } : lesson
            )
          }
        : chapter
    )
    updateFormData({ chapters: updatedChapters })
  }

  const getEditingLesson = () => {
    if (!editingLesson) return null
    const chapter = formData.chapters.find(c => c.id === editingLesson.chapterId)
    if (!chapter) return null
    return chapter.lessons.find(l => l.id === editingLesson.lessonId)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a course name"
      })
      return
    }
    if (!formData.description.trim()) {
      toast({
        title: "Error",
        description: "Please enter a course description"
      })
      return
    }
    if (formData.price < 0) {
      toast({
        title: "Error",
        description: "Price cannot be negative"
      })
      return
    }

    try {
      const response = await fetch(`/api/services/${params.serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.name,
          description: formData.description,
          price: parseFloat(formData.price.toString()),
          type: 'COURSE',
          status: 'ACTIVE',
          level: 'BEGINNER',
          features: [],
          categoryId: formData.categoryId,
          content: {
            sections: formData.chapters.map(chapter => ({
              id: chapter.id,
              title: chapter.title,
              lessons: chapter.lessons.map(lesson => ({
                id: lesson.id,
                title: lesson.title,
                type: lesson.type || 'video',
                description: lesson.description || '',
                videoUrl: lesson.videoUrl || '',
                attachments: lesson.attachments || []
              }))
            }))
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update course')
      }

      toast({
        title: "Success",
        description: "Course updated successfully"
      })
    } catch (error) {
      console.error('Error updating course:', error)
      toast({
        title: "Error",
        description: "Failed to update course"
      })
    }
  }

  const renderDetailsStep = () => {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <Card className="p-6">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Course Details</h2>
              <p className="text-muted-foreground mb-6">
                Update your course information
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  placeholder="e.g. Advanced Trading Strategies"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Choose a name that reflects your material
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="Describe what students will learn..."
                  className="min-h-[150px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Let students know what they'll learn in your course
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price ($)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => {
                    const value = e.target.value
                    const numericValue = value === '' ? 0 : parseFloat(value)
                    updateFormData({ price: numericValue })
                  }}
                  placeholder="29.99"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Set a fair price for your course
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const renderContentStep = () => {
    const editingLessonData = getEditingLesson();

    return (
      <div className="container mx-auto py-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            {editingLessonData ? (
              <Card className="p-6">
                <LessonEditor
                  chapterId={editingLesson!.chapterId}
                  lesson={editingLessonData}
                  onSave={handleLessonSave}
                  onClose={() => setEditingLesson(null)}
                />
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">Course Content</h2>
                    <p className="text-muted-foreground">
                      Organize your course content into chapters and lessons
                    </p>
                  </div>
                  <Button onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>

                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Course Structure</h3>
                        <p className="text-sm text-muted-foreground">
                          Add chapters and lessons to your course
                        </p>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      {formData.chapters.length === 0 && (
                        <Button
                          variant="outline"
                          className="w-full flex items-center justify-center gap-2"
                          onClick={() => {
                            const defaultChapter = {
                              id: crypto.randomUUID(),
                              title: "Chapter 1",
                              lessons: [
                                {
                                  id: crypto.randomUUID(),
                                  title: "Lesson 1",
                                  type: "video" as const,
                                  description: "",
                                  duration: "",
                                  videoUrl: "",
                                  attachments: []
                                }
                              ]
                            }
                            updateFormData({ chapters: [defaultChapter] })
                          }}
                        >
                          <Plus className="w-4 h-4" /> Add Chapter
                        </Button>
                      )}
                      {formData.chapters.length > 0 && (
                        <>
                          <ChaptersList
                            chapters={formData.chapters}
                            onChaptersChange={(chapters: Chapter[]) => updateFormData({ chapters })}
                            onEditLesson={(chapterId: string, lessonId: string) => {
                              setEditingLesson({ chapterId, lessonId })
                            }}
                          />
                          <Button
                            variant="outline"
                            className="w-full flex items-center justify-center gap-2 mt-4"
                            onClick={() => {
                              const defaultChapter = {
                                id: crypto.randomUUID(),
                                title: `Chapter ${formData.chapters.length + 1}`,
                                lessons: []
                              }
                              updateFormData({ chapters: [...formData.chapters, defaultChapter] })
                            }}
                          >
                            <Plus className="w-4 h-4" /> Add Chapter
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
          
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Course Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Course Summary</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{formData.description}</p>
                    <p className="text-sm">Price: ${formData.price}</p>
                    <p className="text-sm">
                      Chapters: {formData.chapters.length} · 
                      Lessons: {formData.chapters.reduce((acc, chapter) => acc + chapter.lessons.length, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div>
      <div className="border-b">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant={currentStep === 1 ? "default" : "ghost"}
                onClick={() => setCurrentStep(1)}
              >
                Details
              </Button>
              <Button
                variant={currentStep === 2 ? "default" : "ghost"}
                onClick={() => setCurrentStep(2)}
              >
                Content
              </Button>
            </div>
            <Button variant="outline" onClick={handleSave}>
              Preview
            </Button>
          </div>
        </div>
      </div>
      {currentStep === 1 ? renderDetailsStep() : renderContentStep()}
    </div>
  )
} 