'use client'

import * as React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { Plus, X, Video, FileText } from 'lucide-react'

interface Lesson {
  id: string
  title: string
  type: 'video' | 'document'
  duration?: string
  description?: string
  videoUrl?: string
  attachments?: string[]
}

interface Chapter {
  id: string
  title: string
  lessons: Lesson[]
}

interface ContentFormProps {
  data: {
    chapters: Chapter[]
  }
  onUpdate: (data: { chapters: Chapter[] }) => void
  onNext: () => void
  onBack: () => void
}

export default function ContentForm({ data, onUpdate, onNext, onBack }: ContentFormProps) {
  const [chapters, setChapters] = useState<Chapter[]>(data.chapters || [])
  const [editingLesson, setEditingLesson] = useState<string | null>(null)

  const addChapter = () => {
    const newChapter: Chapter = {
      id: Date.now().toString(),
      title: 'New Chapter',
      lessons: []
    }
    setChapters([...chapters, newChapter])
    onUpdate({ chapters: [...chapters, newChapter] })
  }

  const updateChapter = (chapterId: string, updates: Partial<Chapter>) => {
    const updatedChapters = chapters.map(chapter =>
      chapter.id === chapterId ? { ...chapter, ...updates } : chapter
    )
    setChapters(updatedChapters)
    onUpdate({ chapters: updatedChapters })
  }

  const removeChapter = (chapterId: string) => {
    const updatedChapters = chapters.filter(chapter => chapter.id !== chapterId)
    setChapters(updatedChapters)
    onUpdate({ chapters: updatedChapters })
  }

  const addLesson = (chapterId: string) => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: 'New Lesson',
      type: 'video'
    }
    const updatedChapters = chapters.map(chapter =>
      chapter.id === chapterId
        ? { ...chapter, lessons: [...chapter.lessons, newLesson] }
        : chapter
    )
    setChapters(updatedChapters)
    onUpdate({ chapters: updatedChapters })
  }

  const updateLesson = (
    chapterId: string,
    lessonId: string,
    updates: Partial<Lesson>
  ) => {
    const updatedChapters = chapters.map(chapter =>
      chapter.id === chapterId
        ? {
            ...chapter,
            lessons: chapter.lessons.map(lesson =>
              lesson.id === lessonId ? { ...lesson, ...updates } : lesson
            )
          }
        : chapter
    )
    setChapters(updatedChapters)
    onUpdate({ chapters: updatedChapters })
  }

  const removeLesson = (chapterId: string, lessonId: string) => {
    const updatedChapters = chapters.map(chapter =>
      chapter.id === chapterId
        ? {
            ...chapter,
            lessons: chapter.lessons.filter(lesson => lesson.id !== lessonId)
          }
        : chapter
    )
    setChapters(updatedChapters)
    onUpdate({ chapters: updatedChapters })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (chapters.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one chapter'
      })
      return
    }

    if (chapters.some(chapter => chapter.lessons.length === 0)) {
      toast({
        title: 'Error',
        description: 'Each chapter must have at least one lesson'
      })
      return
    }

    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Course Content</h3>
          <p className="text-muted-foreground">
            Add chapters and lessons to your course
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={addChapter}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Chapter
        </Button>
      </div>

      <div className="space-y-4">
        {chapters.map((chapter) => (
          <Card key={chapter.id}>
            <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
              <Input
                value={chapter.title}
                onChange={(e) => updateChapter(chapter.id, { title: e.target.value })}
                placeholder="Chapter title"
                className="text-lg font-medium bg-transparent border-0 p-0 focus-visible:ring-0 w-[300px]"
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addLesson(chapter.id)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lesson
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeChapter(chapter.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {chapter.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/40"
                  >
                    <div className="flex items-center gap-3">
                      {lesson.type === 'video' ? (
                        <Video className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      )}
                      {editingLesson === lesson.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={lesson.title}
                            onChange={(e) => updateLesson(chapter.id, lesson.id, { title: e.target.value })}
                            placeholder="Lesson title"
                            className="h-8"
                          />
                          <select
                            value={lesson.type}
                            onChange={(e) => updateLesson(chapter.id, lesson.id, { type: e.target.value as 'video' | 'document' })}
                            className="h-8 rounded-md border bg-background px-2"
                          >
                            <option value="video">Video</option>
                            <option value="document">Document</option>
                          </select>
                          <Input
                            value={lesson.duration || ''}
                            onChange={(e) => updateLesson(chapter.id, lesson.id, { duration: e.target.value })}
                            placeholder="Duration"
                            className="h-8 w-24"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{lesson.title}</span>
                          {lesson.duration && (
                            <span className="text-sm text-muted-foreground">
                              ({lesson.duration})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingLesson(
                          editingLesson === lesson.id ? null : lesson.id
                        )}
                      >
                        {editingLesson === lesson.id ? 'Save' : 'Edit'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLesson(chapter.id, lesson.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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