/**
 * Cloud Sync Settings Panel
 * Comprehensive cloud sync configuration and status
 */

import React, { useState, useEffect } from 'react'
import {
  Cloud,
  LogOut,
  RefreshCw,
  CheckCircle,
  XCircle,
  User,
  Server,
  Download,
  Upload,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { useAuthContext } from '../contexts/AuthContext'
import { getSyncService } from '../services/sync/syncService'
import { useDataSourceStore } from '../store/useDataSourceStore'
import { LoginModal } from './LoginModal'
import { audioSystem } from '../services/audioSystem'

interface SyncHistoryEntry {
  id: string
  timestamp: string
  type: 'pull' | 'push' | 'full'
  status: 'success' | 'error'
  synced: { agents: number; tasks: number }
  errors: string[]
}

export const CloudSyncSettings: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthContext()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncHistory, setSyncHistory] = useState<SyncHistoryEntry[]>([])
  const [pendingOps, setPendingOps] = useState(0)

  const syncService = getSyncService()
  const agentsCache = useDataSourceStore((state) => state.agentsCache)
  const cloudSyncedAgents = agentsCache.filter((a) => a.metadata?.cloudId)

  // Update pending operations count
  useEffect(() => {
    const updatePendingCount = () => {
      setPendingOps(syncService.getPendingOpsCount())
    }

    updatePendingCount()
    const interval = setInterval(updatePendingCount, 2000)

    return () => clearInterval(interval)
  }, [syncService])

  // Load sync history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sync_history')
    if (saved) {
      try {
        setSyncHistory(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load sync history:', e)
      }
    }
  }, [])

  // Save sync history to localStorage
  const saveSyncHistory = (history: SyncHistoryEntry[]) => {
    setSyncHistory(history)
    localStorage.setItem('sync_history', JSON.stringify(history.slice(0, 10)))
  }

  const handleSync = async (type: 'pull' | 'push' | 'full') => {
    setIsSyncing(true)
    audioSystem.play('click')

    try {
      let result
      if (type === 'pull') {
        result = await syncService.pullFromCloud()
      } else if (type === 'push') {
        result = await syncService.pushToCloud()
      } else {
        result = await syncService.fullSync()
      }

      const entry: SyncHistoryEntry = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        type,
        status: result.success ? 'success' : 'error',
        synced: result.synced,
        errors: result.errors
      }

      saveSyncHistory([entry, ...syncHistory])

      if (result.success) {
        audioSystem.play('success')
      } else {
        audioSystem.play('error')
      }
    } catch (error) {
      console.error('Sync failed:', error)
      audioSystem.play('error')

      const entry: SyncHistoryEntry = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        type,
        status: 'error',
        synced: { agents: 0, tasks: 0 },
        errors: ['Sync failed. Please check your connection.']
      }

      saveSyncHistory([entry, ...syncHistory])
    } finally {
      setIsSyncing(false)
    }
  }

  const handleLogout = () => {
    logout()
    syncService.disable()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Cloud className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Cloud Sync Settings</h2>
      </div>

      {/* Authentication Status */}
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Account</span>
          </div>
          {isAuthenticated ? (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle className="w-4 h-4" />
              Connected
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-red-400">
              <XCircle className="w-4 h-4" />
              Not connected
            </span>
          )}
        </div>

        {isAuthenticated && user ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white font-medium">{user.username}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Login to Enable Cloud Sync
          </button>
        )}
      </div>

      {/* Sync Status */}
      {isAuthenticated && syncService.isEnabled() && (
        <>
          {/* Sync Statistics - Enhanced with 3 columns */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">最后同步</span>
              </div>
              <p className="text-lg font-bold text-white">
                {syncHistory.length > 0
                  ? new Date(syncHistory[0].timestamp).toLocaleString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '从未'}
              </p>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-gray-400">待同步操作</span>
              </div>
              <p className="text-lg font-bold text-orange-400">{pendingOps}</p>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Cloud className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">云端Agent</span>
              </div>
              <p className="text-lg font-bold text-white">{cloudSyncedAgents.length}</p>
            </div>
          </div>

          {/* Sync Actions */}
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-300">同步操作</span>
              </div>

              {isSyncing && (
                <div className="flex items-center gap-2 text-blue-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">同步中...</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleSync('pull')}
                disabled={isSyncing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-400/50 text-green-300 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                <span>Pull (下载)</span>
              </button>

              <button
                onClick={() => handleSync('push')}
                disabled={isSyncing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 text-blue-300 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-5 h-5" />
                <span>Push (上传)</span>
              </button>

              <button
                onClick={() => handleSync('full')}
                disabled={isSyncing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 text-purple-300 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Full Sync</span>
              </button>
            </div>
          </div>

          {/* Sync History */}
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">同步历史（最近10条）</span>
            </div>

            {syncHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <div className="text-sm">暂无同步记录</div>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {syncHistory.slice(0, 10).map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-3 rounded-lg border ${
                      entry.status === 'success'
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {entry.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="font-medium text-white text-sm">
                          {entry.type === 'pull' ? '下载' : entry.type === 'push' ? '上传' : '完整同步'}
                        </span>
                      </div>

                      <span className="text-xs text-gray-400">
                        {new Date(entry.timestamp).toLocaleString('zh-CN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-300">
                      <span>👤 {entry.synced.agents} agents</span>
                      <span>📋 {entry.synced.tasks} tasks</span>
                    </div>

                    {entry.errors.length > 0 && (
                      <div className="mt-2 text-xs text-red-300 space-y-1">
                        {entry.errors.slice(0, 3).map((error, i) => (
                          <div key={i}>• {error}</div>
                        ))}
                        {entry.errors.length > 3 && (
                          <div className="text-gray-400">...及 {entry.errors.length - 3} 个其他错误</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Server Info */}
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Server className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-400">Backend Server</span>
        </div>
        <p className="text-sm text-white font-mono">
          {import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}
        </p>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          syncService.enable()
          handleSync('pull')
        }}
      />
    </div>
  )
}
