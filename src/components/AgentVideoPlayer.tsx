import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Image as ImageIcon, Film } from 'lucide-react'
import { AgentId, useAgentVideoStore } from '../store/useAgentVideoStore'

interface AgentVideoPlayerProps {
  agentId: AgentId
  fallbackImage: string
  className?: string
  controls?: boolean
  showToggle?: boolean
}

export default function AgentVideoPlayer({
  agentId,
  fallbackImage,
  className = '',
  controls = true,
  showToggle = false
}: AgentVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { preferences, getVideoPath, setDisplayMode } = useAgentVideoStore()
  const preference = preferences[agentId]

  const [isPlaying, setIsPlaying] = useState(preference.autoPlay)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [showVideo, setShowVideo] = useState(preference.displayMode === 'video')

  const videoPath = getVideoPath(agentId)

  useEffect(() => {
    if (videoRef.current && showVideo && preference.autoPlay) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false)
      })
    }
  }, [showVideo, preference.autoPlay])

  const handleTogglePlay = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch(() => {
          setIsPlaying(false)
        })
    }
  }

  const handleVideoLoad = () => {
    setIsLoading(false)
  }

  const handleVideoError = () => {
    setHasError(true)
    setIsLoading(false)
    setShowVideo(false)
  }

  const handleToggleDisplay = () => {
    const newMode = showVideo ? 'image' : 'video'
    setShowVideo(!showVideo)
    setDisplayMode(agentId, newMode)
  }

  // 如果有错误或不显示视频，显示图片
  if (hasError || !showVideo) {
    return (
      <div className={`relative ${className}`}>
        <img src={fallbackImage} alt={agentId} className="w-full h-full object-cover" />
        {showToggle && !hasError && (
          <button
            onClick={handleToggleDisplay}
            className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-lg backdrop-blur-sm transition-colors z-10"
            title="切换到视频"
          >
            <Film className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className} group`}>
      {/* 加载占位符 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* 视频元素 */}
      <video
        ref={videoRef}
        src={videoPath}
        className="w-full h-full object-cover"
        loop
        muted
        playsInline
        autoPlay={preference.autoPlay}
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
      />

      {/* 控制按钮 */}
      {controls && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-2">
            {/* 播放/暂停 */}
            <button
              onClick={handleTogglePlay}
              className="p-3 bg-black/60 hover:bg-black/80 rounded-full backdrop-blur-sm transition-colors"
              title={isPlaying ? '暂停' : '播放'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white" />
              )}
            </button>

            {/* 切换到图片 */}
            {showToggle && (
              <button
                onClick={handleToggleDisplay}
                className="p-3 bg-black/60 hover:bg-black/80 rounded-full backdrop-blur-sm transition-colors"
                title="切换到图片"
              >
                <ImageIcon className="w-6 h-6 text-white" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 视频标识（小图标） */}
      {!controls && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded backdrop-blur-sm">
          <Film className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  )
}
