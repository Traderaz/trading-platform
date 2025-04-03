'use client'

interface YouTubeLiveEmbedProps {
  videoId: string;
  title?: string;
  description?: string;
}

export default function YouTubeLiveEmbed({ videoId, title, description }: YouTubeLiveEmbedProps) {
  return (
    <div className="w-full space-y-4">
      <div className="relative w-full pt-[56.25%]">
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={title || 'Live Stream'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {title && (
        <h2 className="text-xl font-semibold text-text">{title}</h2>
      )}
      {description && (
        <p className="text-text-secondary">{description}</p>
      )}
    </div>
  )
} 