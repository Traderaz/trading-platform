'use client'

import * as React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/components/ui/use-toast'
import { Upload, X, Image as ImageIcon, Video } from 'lucide-react'

interface MediaData {
  thumbnail?: string
  previewVideo?: string
}

interface MediaFormProps {
  data: MediaData
  onUpdate: (data: Partial<MediaData>) => Promise<void>
  onNext: () => Promise<void>
  onBack: () => Promise<void>
}

export default function MediaForm({ data, onUpdate, onNext, onBack }: MediaFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file'
      })
      return
    }

    try {
      setIsUploading(true)
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval)
            return prev
          }
          return prev + 5
        })
      }, 100)

      // TODO: Replace with actual upload logic
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      clearInterval(interval)
      setUploadProgress(100)
      
      // Simulate getting the URL back from the server
      const thumbnailUrl = URL.createObjectURL(file)
      await onUpdate({ thumbnail: thumbnailUrl })
      
      toast({
        title: 'Success',
        description: 'Thumbnail uploaded successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload thumbnail'
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handlePreviewVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a video file'
      })
      return
    }

    try {
      setIsUploading(true)
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval)
            return prev
          }
          return prev + 5
        })
      }, 100)

      // TODO: Replace with actual upload logic
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      clearInterval(interval)
      setUploadProgress(100)
      
      // Simulate getting the URL back from the server
      const videoUrl = URL.createObjectURL(file)
      await onUpdate({ previewVideo: videoUrl })
      
      toast({
        title: 'Success',
        description: 'Preview video uploaded successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload preview video'
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const removeThumbnail = () => {
    onUpdate({ thumbnail: undefined })
  }

  const removePreviewVideo = () => {
    onUpdate({ previewVideo: undefined })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Course Media</h3>
        <p className="text-muted-foreground mb-6">
          Upload a thumbnail and preview video for your course
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <h4 className="text-sm font-medium">Course Thumbnail</h4>
                    <p className="text-sm text-muted-foreground">
                      Upload a 16:9 image for your course thumbnail
                    </p>
                  </div>
                </div>
                {data.thumbnail && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={removeThumbnail}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {data.thumbnail ? (
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <img
                    src={data.thumbnail}
                    alt="Course thumbnail"
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleThumbnailUpload}
                    disabled={isUploading}
                  />
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click or drag and drop to upload
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Video className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <h4 className="text-sm font-medium">Preview Video</h4>
                    <p className="text-sm text-muted-foreground">
                      Upload a short preview video for your course
                    </p>
                  </div>
                </div>
                {data.previewVideo && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={removePreviewVideo}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {data.previewVideo ? (
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <video
                    src={data.previewVideo}
                    controls
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    accept="video/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handlePreviewVideoUpload}
                    disabled={isUploading}
                  />
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click or drag and drop to upload
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} />
            <p className="text-sm text-muted-foreground text-center">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={!data.thumbnail || isUploading}
        >
          Next
        </Button>
      </div>
    </div>
  )
} 