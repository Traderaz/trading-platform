'use client'

import * as React from 'react'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Link, Clock, Video, Image, X, Paperclip } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

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

interface LessonEditorProps {
  chapterId: string
  lesson: Lesson
  onSave: (chapterId: string, lessonId: string, updates: Partial<Lesson>) => void
  onClose: () => void
}

export default function LessonEditor({
  chapterId,
  lesson,
  onSave,
  onClose
}: LessonEditorProps) {
  const [editedLesson, setEditedLesson] = useState<Lesson>(lesson)
  const [selectedTab, setSelectedTab] = useState<'video' | 'image'>('video')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const attachmentInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    onSave(chapterId, lesson.id, editedLesson)
    onClose()
  }

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  const handleFileUpload = (files: FileList) => {
    const file = files[0]
    
    if (selectedTab === 'video') {
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Error",
          description: "Please upload a video file"
        })
        return
      }
      if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB
        toast({
          title: "Error",
          description: "Video file size must be less than 2GB"
        })
        return
      }
      // Here you would typically upload to your storage service
      // For now, we'll just update the local state
      setEditedLesson({
        ...editedLesson,
        videoUrl: URL.createObjectURL(file)
      })
    } else {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please upload an image file"
        })
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "Error",
          description: "Image file size must be less than 5MB"
        })
        return
      }
      // Handle image upload
      setEditedLesson({
        ...editedLesson,
        attachments: [...(editedLesson.attachments || []), file.name]
      })
    }
  }

  const handleAttachmentUpload = (files: FileList) => {
    const file = files[0]
    if (file.size > 50 * 1024 * 1024) { // 50MB
      toast({
        title: "Error",
        description: "File size must be less than 50MB"
      })
      return
    }
    // Handle attachment upload
    setEditedLesson({
      ...editedLesson,
      attachments: [...(editedLesson.attachments || []), file.name]
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            {lesson.title || 'New Lesson'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Chapter 1
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Title
          </label>
          <Input
            value={editedLesson.title}
            onChange={(e) => setEditedLesson({ ...editedLesson, title: e.target.value })}
            placeholder="Enter lesson title"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant={selectedTab === 'video' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('video')}
            >
              <Video className="w-4 h-4 mr-2" />
              Video
            </Button>
            <Button
              variant={selectedTab === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('image')}
            >
              <Image className="w-4 h-4 mr-2" />
              Image
            </Button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={selectedTab === 'video' ? "video/*" : "image/*"}
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          />

          {selectedTab === 'video' ? (
            <div className="space-y-4">
              <div
                className={`border-2 ${isDragging ? 'border-primary' : 'border-dashed'} rounded-lg p-6 transition-colors`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center cursor-pointer">
                  <Video className="w-8 h-8 text-muted-foreground mb-2" />
                  <div className="text-sm font-medium">Upload a video</div>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    MP4, MOV, MPEG or WEBM (max. 2GB)
                  </p>
                  <Button variant="outline" size="sm" type="button">
                    Choose File
                  </Button>
                </div>
              </div>

              {editedLesson.videoUrl && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Video uploaded</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditedLesson({ ...editedLesson, videoUrl: undefined })}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Or paste a video URL
                </label>
                <div className="flex gap-2">
                  <Input
                    value={editedLesson.videoUrl || ''}
                    onChange={(e) => setEditedLesson({ ...editedLesson, videoUrl: e.target.value })}
                    placeholder="https://..."
                  />
                  <Button variant="outline" type="button">
                    <Link className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`border-2 ${isDragging ? 'border-primary' : 'border-dashed'} rounded-lg p-6 transition-colors`}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center cursor-pointer">
                <Image className="w-8 h-8 text-muted-foreground mb-2" />
                <div className="text-sm font-medium">Upload images</div>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  PNG, JPG or GIF (max. 5MB each)
                </p>
                <Button variant="outline" size="sm" type="button">
                  Choose Files
                </Button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Description
          </label>
          <Textarea
            value={editedLesson.description || ''}
            onChange={(e) => setEditedLesson({ ...editedLesson, description: e.target.value })}
            placeholder="Describe what students will learn in this lesson..."
            className="min-h-[100px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Attachments
          </label>
          <input
            type="file"
            ref={attachmentInputRef}
            className="hidden"
            onChange={(e) => e.target.files && handleAttachmentUpload(e.target.files)}
          />
          <div className="space-y-2">
            {editedLesson.attachments?.map((attachment, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{attachment}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newAttachments = [...(editedLesson.attachments || [])]
                    newAttachments.splice(index, 1)
                    setEditedLesson({ ...editedLesson, attachments: newAttachments })
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => attachmentInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Add Attachment
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Release Schedule
          </label>
          <Button variant="outline" size="sm" className="w-full">
            <Clock className="w-4 h-4 mr-2" />
            {editedLesson.unlockDate ? editedLesson.unlockDate : 'Available immediately'}
          </Button>
        </div>
      </div>
    </div>
  )
} 