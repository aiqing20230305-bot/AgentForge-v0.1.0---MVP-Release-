/**
 * Offline Indicator
 * Shows a banner when network connection is lost
 */

import { WifiOff, Clock } from 'lucide-react'
import { useNetworkStatus } from '../hooks/useNetworkStatus'
import { useEffect, useState } from 'react'
import { getSyncService } from '../services/sync/syncService'

export const OfflineIndicator = () => {
  const { isOnline } = useNetworkStatus()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const updatePendingCount = () => {
      const count = getSyncService().getPendingOpsCount()
      setPendingCount(count)
    }

    updatePendingCount()
    const interval = setInterval(updatePendingCount, 1000)

    return () => clearInterval(interval)
  }, [])

  if (isOnline) {
    return null
  }

  return (
    <div
      className="fixed top-16 left-1/2 -translate-x-1/2 z-50
                 bg-orange-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg
                 flex items-center gap-3 animate-slide-down border border-orange-400/50"
    >
      <WifiOff className="w-5 h-5 animate-pulse" />
      <span className="font-medium text-sm">离线模式 - 部分功能不可用</span>
      {pendingCount > 0 && (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full">
          <Clock className="w-3 h-3" />
          <span className="text-xs font-bold">{pendingCount} 待同步</span>
        </div>
      )}
    </div>
  )
}
