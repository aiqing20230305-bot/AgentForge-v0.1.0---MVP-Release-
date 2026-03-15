/**
 * Cloud Sync Toggle
 * Toggle switch to enable/disable cloud synchronization
 */

import React, { useState, useEffect } from 'react'
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle } from 'lucide-react'
import { getSyncService } from '../services/sync/syncService'
import { useAuthContext } from '../contexts/AuthContext'

interface CloudSyncToggleProps {
  className?: string
}

export const CloudSyncToggle: React.FC<CloudSyncToggleProps> = ({ className = '' }) => {
  const { isAuthenticated } = useAuthContext()
  const [isEnabled, setIsEnabled] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const syncService = getSyncService()

  useEffect(() => {
    setIsEnabled(syncService.isEnabled())
  }, [])

  const handleToggle = () => {
    if (isEnabled) {
      // Disable sync
      syncService.disable()
      setIsEnabled(false)
      setSyncStatus('idle')
    } else {
      // Enable sync
      if (!isAuthenticated) {
        setErrorMessage('Please login to enable cloud sync')
        setSyncStatus('error')
        return
      }

      syncService.enable()
      setIsEnabled(true)

      // Auto-sync on enable
      handleSync()
    }
  }

  const handleSync = async () => {
    if (!isEnabled || isSyncing) return

    setIsSyncing(true)
    setSyncStatus('idle')
    setErrorMessage('')

    try {
      const result = await syncService.fullSync()

      if (result.success) {
        setSyncStatus('success')
        console.log(`✅ Sync completed: ${result.synced.agents} agents, ${result.synced.tasks} tasks`)
      } else {
        setSyncStatus('error')
        setErrorMessage(result.errors.join(', '))
        console.error('❌ Sync errors:', result.errors)
      }

      // Clear status after 3 seconds
      setTimeout(() => {
        setSyncStatus('idle')
        setErrorMessage('')
      }, 3000)
    } catch (error) {
      setSyncStatus('error')
      setErrorMessage('Sync failed. Please check your connection.')
      console.error('❌ Sync failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Toggle Switch */}
      <button
        onClick={handleToggle}
        disabled={!isAuthenticated}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${isEnabled ? 'bg-blue-600' : 'bg-gray-600'}
          ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          hover:opacity-90
        `}
        title={isAuthenticated ? (isEnabled ? 'Disable cloud sync' : 'Enable cloud sync') : 'Login to enable cloud sync'}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>

      {/* Status Icon */}
      <div className="flex items-center gap-2">
        {isEnabled ? (
          <Cloud className="w-5 h-5 text-blue-400" />
        ) : (
          <CloudOff className="w-5 h-5 text-gray-500" />
        )}

        <span className={`text-sm font-medium ${isEnabled ? 'text-blue-400' : 'text-gray-500'}`}>
          {isEnabled ? 'Cloud Sync' : 'Offline Mode'}
        </span>
      </div>

      {/* Sync Button */}
      {isEnabled && (
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`
            flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium
            transition-all
            ${isSyncing
              ? 'bg-blue-600/20 text-blue-400 cursor-wait'
              : 'bg-blue-600/10 text-blue-400 hover:bg-blue-600/20'
            }
          `}
          title="Sync now"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync'}
        </button>
      )}

      {/* Status Indicator */}
      {syncStatus !== 'idle' && (
        <div className="flex items-center gap-1 animate-fade-in">
          {syncStatus === 'success' && (
            <>
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400">Synced</span>
            </>
          )}
          {syncStatus === 'error' && (
            <>
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400" title={errorMessage}>
                {errorMessage || 'Error'}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
