import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'gray'
  text?: string
  fullscreen?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
}

const colorClasses = {
  primary: 'text-purple-400',
  white: 'text-white',
  gray: 'text-gray-400'
}

/**
 * 🔄 Unified Loading Spinner Component
 * Displays a loading indicator with optional text
 */
export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  text,
  fullscreen = false,
  className = ''
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`} />
      {text && (
        <p className={`text-sm ${colorClasses[color]} animate-pulse`}>{text}</p>
      )}
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

/**
 * 💀 Skeleton Loading Component
 * Shows a placeholder while content is loading
 */
export function SkeletonLoader({
  count = 1,
  height = 'h-4',
  className = ''
}: {
  count?: number
  height?: string
  className?: string
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${height} bg-white/10 rounded animate-pulse`}
          style={{
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  )
}

/**
 * 🃏 Card Skeleton for Agent/Task cards
 */
export function CardSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-4 animate-pulse">
      {/* Avatar */}
      <div className="w-16 h-16 bg-white/10 rounded-xl mb-3" />

      {/* Title */}
      <div className="h-6 bg-white/10 rounded mb-2 w-3/4" />

      {/* Description */}
      <div className="space-y-2">
        <div className="h-4 bg-white/10 rounded w-full" />
        <div className="h-4 bg-white/10 rounded w-5/6" />
      </div>

      {/* Stats */}
      <div className="mt-4 flex gap-2">
        <div className="h-8 bg-white/10 rounded flex-1" />
        <div className="h-8 bg-white/10 rounded flex-1" />
        <div className="h-8 bg-white/10 rounded flex-1" />
      </div>
    </div>
  )
}

/**
 * 📊 Loading Dots Animation
 */
export function LoadingDots({ color = 'white' }: { color?: 'primary' | 'white' | 'gray' }) {
  const dotColor = {
    primary: 'bg-purple-400',
    white: 'bg-white',
    gray: 'bg-gray-400'
  }[color]

  return (
    <div className="flex gap-1 items-center justify-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 ${dotColor} rounded-full animate-bounce`}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  )
}

export default LoadingSpinner
