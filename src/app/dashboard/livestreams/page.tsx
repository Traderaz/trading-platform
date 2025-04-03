'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import YouTubeLiveEmbed from '@/components/YouTubeLiveEmbed'
import { useRouter } from 'next/navigation'

interface Livestream {
  id: string
  title: string
  description: string
  isLive: boolean
  scheduledFor: string
  videoId: string
  isPrivate: boolean
  hasAccess: boolean
}

export default function LivestreamsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [livestreams, setLivestreams] = useState<Livestream[]>([])
  const [selectedStream, setSelectedStream] = useState<Livestream | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLivestreams()
  }, [])

  const fetchLivestreams = async () => {
    try {
      const response = await fetch('/api/livestreams')
      const data = await response.json()
      setLivestreams(data)
      if (data.length > 0) {
        setSelectedStream(data[0])
      }
    } catch (error) {
      console.error('Error fetching livestreams:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnectYouTube = async () => {
    try {
      const response = await fetch('/api/youtube/auth')
      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error connecting to YouTube:', error)
    }
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view livestreams</h1>
          <button onClick={() => router.push('/auth/signin')} className="btn-primary">
            Sign In
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <div className="text-center">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text">Livestreams</h1>
        <div className="space-x-4">
          <button
            onClick={handleConnectYouTube}
            className="btn-primary"
          >
            Connect YouTube
          </button>
          <button
            onClick={() => router.push('/dashboard/livestreams/new')}
            className="btn-primary"
          >
            Schedule New Stream
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main livestream viewer */}
        <div className="lg:col-span-2">
          {selectedStream ? (
            selectedStream.hasAccess ? (
              <YouTubeLiveEmbed
                videoId={selectedStream.videoId}
                title={selectedStream.title}
                description={selectedStream.description}
              />
            ) : (
              <div className="bg-card border border-zinc-700/50 rounded-lg p-6 text-center">
                <h2 className="text-xl font-semibold mb-2">Premium Content</h2>
                <p className="text-text-secondary mb-4">
                  This livestream is only available to premium subscribers.
                </p>
                <button
                  onClick={() => router.push('/pricing')}
                  className="btn-primary"
                >
                  Upgrade to Premium
                </button>
              </div>
            )
          ) : (
            <div className="bg-card border border-zinc-700/50 rounded-lg p-6 text-center">
              <p className="text-text-secondary">Select a livestream to view</p>
            </div>
          )}
        </div>

        {/* Stream list */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text">Available Streams</h2>
          <div className="space-y-3">
            {livestreams.map((stream) => (
              <button
                key={stream.id}
                onClick={() => setSelectedStream(stream)}
                className={`w-full p-4 rounded-lg border transition-colors ${
                  selectedStream?.id === stream.id
                    ? 'border-primary bg-primary/10'
                    : 'border-zinc-700/50 hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${
                    stream.isLive ? 'bg-red-500' : 'bg-zinc-500'
                  }`} />
                  <span className="text-sm text-text-secondary">
                    {stream.isLive ? 'Live Now' : 'Scheduled'}
                  </span>
                  {stream.isPrivate && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                      Premium
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-text">{stream.title}</h3>
                <p className="text-sm text-text-secondary mt-1">{stream.description}</p>
                <p className="text-xs text-text-secondary mt-2">
                  {new Date(stream.scheduledFor).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 