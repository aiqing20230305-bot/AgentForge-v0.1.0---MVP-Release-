/**
 * useNetworkStatus Hook
 * Monitor network connection status
 */

import { useState, useEffect } from 'react'

export interface NetworkStatus {
  isOnline: boolean
  wasOffline: boolean
  lastOnlineChange: Date | null
}

export const useNetworkStatus = () => {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    lastOnlineChange: null
  })

  useEffect(() => {
    const handleOnline = () => {
      console.log('✅ Network: Back online')
      setStatus(prev => ({
        isOnline: true,
        wasOffline: prev.wasOffline || !prev.isOnline, // Remember if we were ever offline
        lastOnlineChange: new Date()
      }))
    }

    const handleOffline = () => {
      console.log('❌ Network: Went offline')
      setStatus(() => ({
        isOnline: false,
        wasOffline: true,
        lastOnlineChange: new Date()
      }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return status
}
