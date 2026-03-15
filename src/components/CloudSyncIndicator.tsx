/**
 * Cloud Sync Indicator
 * Shows cloud sync status for individual agents
 */

import React from 'react'
import { Cloud, CloudOff, RefreshCw } from 'lucide-react'

interface CloudSyncIndicatorProps {
  isCloudSynced?: boolean
  isSyncing?: boolean
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export const CloudSyncIndicator: React.FC<CloudSyncIndicatorProps> = ({
  isCloudSynced = false,
  isSyncing = false,
  size = 'md',
  showLabel = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const iconSize = sizeClasses[size]

  if (isSyncing) {
    return (
      <div className={`flex items-center gap-1 ${className}`} title="Syncing...">
        <RefreshCw className={`${iconSize} text-blue-400 animate-spin`} />
        {showLabel && <span className="text-xs text-blue-400">Syncing...</span>}
      </div>
    )
  }

  if (isCloudSynced) {
    return (
      <div className={`flex items-center gap-1 ${className}`} title="Synced to cloud">
        <Cloud className={`${iconSize} text-green-400`} />
        {showLabel && <span className="text-xs text-green-400">Cloud</span>}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1 ${className}`} title="Local only">
      <CloudOff className={`${iconSize} text-gray-500`} />
      {showLabel && <span className="text-xs text-gray-500">Local</span>}
    </div>
  )
}
