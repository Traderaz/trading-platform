'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Upload, FileVideo, FileText } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Price must be a valid number',
  }),
  categoryId: z.string().min(1, 'Please select a category'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  features: z.array(z.object({
    value: z.string()
  })).optional(),
  chapters: z.array(z.object({
    title: z.string().min(1, 'Chapter title is required'),
    lessons: z.array(z.object({
      title: z.string().min(1, 'Lesson title is required'),
      videoUrl: z.string().optional(),
      attachments: z.array(z.string()).optional(),
    }))
  }))
})

type FormData = z.infer<typeof formSchema>

interface Category {
  id: string
  name: string
}

interface CreateServiceFormProps {
  categories: Category[]
}

interface Chapter {
  id: string
  title: string
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  videoUrl?: string
  attachments?: string[]
}

interface UploadState {
  progress: number
  uploading: boolean
  error?: string
}

export default function CreateServiceForm({ categories }: CreateServiceFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [features, setFeatures] = useState<string[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: '1',
      title: 'Introduction',
      lessons: []
    }
  ])
  const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>({})

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      categoryId: '',
      level: 'BEGINNER',
      features: [],
      chapters: []
    },
  })

  const onSubmit = async (data: FormData) => {
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
          features: features.map(value => ({ value })),
          chapters: chapters
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

  const addFeature = () => {
    setFeatures([...features, ''])
  }

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
  }

  const addChapter = () => {
    setChapters([...chapters, {
      id: Date.now().toString(),
      title: 'New Chapter',
      lessons: []
    }])
  }

  const addLesson = (chapterId: string) => {
    setChapters(chapters.map(chapter => {
      if (chapter.id === chapterId) {
        return {
          ...chapter,
          lessons: [...chapter.lessons, {
            id: Date.now().toString(),
            title: 'New Lesson'
          }]
        }
      }
      return chapter
    }))
  }

  const handleVideoUpload = async (lessonId: string, file: File) => {
    if (file.size > 3 * 1024 * 1024 * 1024) { // 3GB
      toast({
        title: 'Error',
        description: 'Video size must be less than 3GB'
      })
      return
    }

    setUploadStates(prev => ({
      ...prev,
      [lessonId]: { progress: 0, uploading: true }
    }))

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'video')
      formData.append('lessonId', lessonId)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/upload', true)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100
          setUploadStates(prev => ({
            ...prev,
            [lessonId]: { ...prev[lessonId], progress }
          }))
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          setChapters(chapters.map(chapter => ({
            ...chapter,
            lessons: chapter.lessons.map(lesson =>
              lesson.id === lessonId
                ? { ...lesson, videoUrl: response.url }
                : lesson
            )
          })))
          setUploadStates(prev => ({
            ...prev,
            [lessonId]: { progress: 100, uploading: false }
          }))
          toast({
            title: 'Success',
            description: 'Video uploaded successfully'
          })
        } else {
          throw new Error('Upload failed')
        }
      }

      xhr.onerror = () => {
        throw new Error('Upload failed')
      }

      xhr.send(formData)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStates(prev => ({
        ...prev,
        [lessonId]: {
          progress: 0,
          uploading: false,
          error: 'Failed to upload video'
        }
      }))
      toast({
        title: 'Error',
        description: 'Failed to upload video'
      })
    }
  }

  const handleAttachmentUpload = async (lessonId: string, file: File) => {
    setUploadStates(prev => ({
      ...prev,
      [lessonId + file.name]: { progress: 0, uploading: true }
    }))

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'attachment')
      formData.append('lessonId', lessonId)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/upload', true)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100
          setUploadStates(prev => ({
            ...prev,
            [lessonId + file.name]: { ...prev[lessonId + file.name], progress }
          }))
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          setChapters(chapters.map(chapter => ({
            ...chapter,
            lessons: chapter.lessons.map(lesson =>
              lesson.id === lessonId
                ? {
                    ...lesson,
                    attachments: [...(lesson.attachments || []), response.url]
                  }
                : lesson
            )
          })))
          setUploadStates(prev => ({
            ...prev,
            [lessonId + file.name]: { progress: 100, uploading: false }
          }))
          toast({
            title: 'Success',
            description: 'File uploaded successfully'
          })
        } else {
          throw new Error('Upload failed')
        }
      }

      xhr.onerror = () => {
        throw new Error('Upload failed')
      }

      xhr.send(formData)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStates(prev => ({
        ...prev,
        [lessonId + file.name]: {
          progress: 0,
          uploading: false,
          error: 'Failed to upload file'
        }
      }))
      toast({
        title: 'Error',
        description: 'Failed to upload file'
      })
    }
  }

  const renderLesson = (lesson: Lesson) => (
    <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex-1 space-y-4">
        <Input
          value={lesson.title}
          onChange={(e) => {
            setChapters(chapters.map(chapter => ({
              ...chapter,
              lessons: chapter.lessons.map(l =>
                l.id === lesson.id ? { ...l, title: e.target.value } : l
              )
            })))
          }}
          placeholder="Lesson title"
        />
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <FileVideo className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Video</span>
          </div>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
            {lesson.videoUrl ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Video uploaded</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setChapters(chapters.map(chapter => ({
                      ...chapter,
                      lessons: chapter.lessons.map(l =>
                        l.id === lesson.id ? { ...l, videoUrl: undefined } : l
                      )
                    })))
                  }}
                >
                  <Trash2 className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleVideoUpload(lesson.id, file)
                    }
                  }}
                  id={`video-${lesson.id}`}
                />
                <label
                  htmlFor={`video-${lesson.id}`}
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Upload video (max 3GB)</span>
                </label>
              </>
            )}
            {uploadStates[lesson.id]?.uploading && (
              <div className="mt-2">
                <Progress value={uploadStates[lesson.id].progress} className="h-1" />
                <span className="text-sm text-gray-600 mt-1">
                  Uploading... {Math.round(uploadStates[lesson.id].progress)}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Attachments</span>
          </div>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
            {lesson.attachments && lesson.attachments.length > 0 && (
              <div className="mb-4 space-y-2">
                {lesson.attachments.map((url, index) => (
                  <div key={url} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Attachment {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setChapters(chapters.map(chapter => ({
                          ...chapter,
                          lessons: chapter.lessons.map(l =>
                            l.id === lesson.id
                              ? {
                                  ...l,
                                  attachments: l.attachments?.filter(a => a !== url)
                                }
                              : l
                          )
                        })))
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files
                if (files) {
                  Array.from(files).forEach(file => {
                    handleAttachmentUpload(lesson.id, file)
                  })
                }
              }}
              id={`attachments-${lesson.id}`}
            />
            <label
              htmlFor={`attachments-${lesson.id}`}
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Upload attachments</span>
            </label>
            {Object.entries(uploadStates)
              .filter(([key]) => key.startsWith(lesson.id) && key !== lesson.id)
              .map(([key, state]) => state.uploading && (
                <div key={key} className="mt-2">
                  <Progress value={state.progress} className="h-1" />
                  <span className="text-sm text-gray-600 mt-1">
                    Uploading... {Math.round(state.progress)}%
                  </span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setChapters(chapters.map(chapter => ({
            ...chapter,
            lessons: chapter.lessons.filter(l => l.id !== lesson.id)
          })))
        }}
      >
        <Trash2 className="w-4 h-4 text-gray-400" />
      </Button>
    </div>
  )

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Course</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter course title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Enter price"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BEGINNER">Beginner</SelectItem>
                          <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                          <SelectItem value="ADVANCED">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your course"
                        className="h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Course Features</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFeature}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Enter feature"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(index)}
                      >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Course Content</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addChapter}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Chapter
                  </Button>
                </div>
                <div className="space-y-4">
                  {chapters.map((chapter) => (
                    <Card key={chapter.id}>
                      <CardHeader className="flex flex-row items-center justify-between py-2">
                        <Input
                          value={chapter.title}
                          onChange={(e) => {
                            setChapters(chapters.map(c =>
                              c.id === chapter.id ? { ...c, title: e.target.value } : c
                            ))
                          }}
                          placeholder="Chapter title"
                          className="border-0 text-lg font-medium focus-visible:ring-0"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addLesson(chapter.id)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Lesson
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {chapter.lessons.map((lesson) => renderLesson(lesson))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Course'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 