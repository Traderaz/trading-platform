'use client'

import * as React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash, Video, FileText, Pencil, Trash2 } from 'lucide-react'

interface Lesson {
  id: string
  title: string
  type: 'video' | 'document'
  description?: string
  duration?: string
  videoUrl?: string
  attachments?: string[]
  unlockDate?: string
}

interface Chapter {
  id: string
  title: string
  lessons: Lesson[]
}

interface ChaptersListProps {
  chapters: Chapter[]
  onChaptersChange: (chapters: Chapter[]) => void
  onEditLesson: (chapterId: string, lessonId: string) => void
}

export default function ChaptersList({ 
  chapters, 
  onChaptersChange,
  onEditLesson
}: ChaptersListProps) {
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null)

  const addChapter = () => {
    const newChapter: Chapter = {
      id: crypto.randomUUID(),
      title: `Chapter ${chapters.length + 1}`,
      lessons: []
    }
    onChaptersChange([...chapters, newChapter])
  }

  const updateChapterTitle = (chapterId: string, newTitle: string) => {
    const updatedChapters = chapters.map(chapter =>
      chapter.id === chapterId ? { ...chapter, title: newTitle } : chapter
    )
    onChaptersChange(updatedChapters)
  }

  const removeChapter = (chapterId: string) => {
    const updatedChapters = chapters.filter(chapter => chapter.id !== chapterId)
    onChaptersChange(updatedChapters)
  }

  const addLesson = (chapterId: string) => {
    const updatedChapters = chapters.map(chapter => {
      if (chapter.id === chapterId) {
        return {
          ...chapter,
          lessons: [
            ...chapter.lessons,
            {
              id: crypto.randomUUID(),
              title: `Lesson ${chapter.lessons.length + 1}`,
              type: 'video' as const,
              description: '',
              duration: '',
              videoUrl: '',
              attachments: []
            }
          ]
        }
      }
      return chapter
    })
    onChaptersChange(updatedChapters)
  }

  const updateLessonTitle = (chapterId: string, lessonId: string, newTitle: string) => {
    const updatedChapters = chapters.map(chapter => {
      if (chapter.id === chapterId) {
        return {
          ...chapter,
          lessons: chapter.lessons.map(lesson =>
            lesson.id === lessonId ? { ...lesson, title: newTitle } : lesson
          )
        }
      }
      return chapter
    })
    onChaptersChange(updatedChapters)
  }

  const removeLesson = (chapterId: string, lessonId: string) => {
    const updatedChapters = chapters.map(chapter => {
      if (chapter.id === chapterId) {
        return {
          ...chapter,
          lessons: chapter.lessons.filter(lesson => lesson.id !== lessonId)
        }
      }
      return chapter
    })
    onChaptersChange(updatedChapters)
  }

  return (
    <div className="space-y-4">
      {chapters.map((chapter) => (
        <div key={chapter.id}>
          <div className="flex items-center gap-2 bg-black/5 p-2 rounded-md">
            <Input
              value={chapter.title}
              onChange={(e) => updateChapterTitle(chapter.id, e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 p-0 text-lg font-medium h-auto"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeChapter(chapter.id)}
              className="opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="pl-4 space-y-2 mt-2">
            {chapter.lessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center gap-2 group">
                <Input
                  value={lesson.title}
                  onChange={(e) => updateLessonTitle(chapter.id, lesson.id, e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0 p-0 h-auto"
                />
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditLesson(chapter.id, lesson.id)}
                    className="h-6 w-6"
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLesson(chapter.id, lesson.id)}
                    className="h-6 w-6"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-xs"
              onClick={() => addLesson(chapter.id)}
            >
              <Plus className="w-3 h-3" /> Add Lesson
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
} 