/**
 * useSocket Hook
 * WebSocket connection management with React
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { getSocketClient, SocketEventCallbacks, SocketClient } from '../services/socket/socketClient'
import { TokenManager } from '../services/api'

interface UseSocketOptions {
  autoConnect?: boolean
  callbacks?: SocketEventCallbacks
}

interface UseSocketReturn {
  socket: SocketClient | null
  isConnected: boolean
  connect: () => void
  disconnect: () => void

  // Team methods
  joinTeam: (teamId: string) => void
  leaveTeam: (teamId: string) => void
  updateTeamStatus: (teamId: string, status: string) => void

  // Task methods
  notifyTaskCreated: (task: any, teamId?: string) => void
  notifyTaskUpdated: (taskId: string, updates: any, teamId?: string) => void
  notifyTaskCompleted: (taskId: string, result: string, teamId?: string) => void
  sendTaskLog: (taskId: string, logEntry: string, teamId?: string) => void

  // Agent methods
  notifyAgentStatus: (agentId: string, status: string, teamId?: string) => void
  notifyAgentLevelUp: (agentId: string, newLevel: number, teamId?: string) => void
  notifyAgentStats: (agentId: string, stats: any, teamId?: string) => void

  // Chat methods
  sendChatMessage: (teamId: string, message: string) => void
  sendTypingIndicator: (teamId: string, isTyping: boolean) => void
}

/**
 * WebSocket hook
 * Manages Socket.io connection and provides helper methods
 */
export const useSocket = (options: UseSocketOptions = {}): UseSocketReturn => {
  const { autoConnect = false, callbacks } = options
  const socketRef = useRef<SocketClient | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  /**
   * Initialize socket client
   */
  useEffect(() => {
    socketRef.current = getSocketClient()

    // Register callbacks
    if (callbacks) {
      socketRef.current.on({
        ...callbacks,
        onConnect: () => {
          setIsConnected(true)
          callbacks.onConnect?.()
        },
        onDisconnect: () => {
          setIsConnected(false)
          callbacks.onDisconnect?.()
        }
      })
    } else {
      // Default callbacks for connection state
      socketRef.current.on({
        onConnect: () => setIsConnected(true),
        onDisconnect: () => setIsConnected(false)
      })
    }

    // Auto-connect if enabled and token is available
    if (autoConnect && TokenManager.hasValidToken()) {
      socketRef.current.connect()
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current?.isConnected()) {
        socketRef.current.disconnect()
      }
    }
  }, [autoConnect]) // Only run on mount

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (socketRef.current && !socketRef.current.isConnected()) {
      socketRef.current.connect()
    }
  }, [])

  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    if (socketRef.current?.isConnected()) {
      socketRef.current.disconnect()
      setIsConnected(false)
    }
  }, [])

  // Team methods
  const joinTeam = useCallback((teamId: string) => {
    socketRef.current?.joinTeam(teamId)
  }, [])

  const leaveTeam = useCallback((teamId: string) => {
    socketRef.current?.leaveTeam(teamId)
  }, [])

  const updateTeamStatus = useCallback((teamId: string, status: string) => {
    socketRef.current?.updateTeamStatus(teamId, status)
  }, [])

  // Task methods
  const notifyTaskCreated = useCallback((task: any, teamId?: string) => {
    socketRef.current?.notifyTaskCreated(task, teamId)
  }, [])

  const notifyTaskUpdated = useCallback((taskId: string, updates: any, teamId?: string) => {
    socketRef.current?.notifyTaskUpdated(taskId, updates, teamId)
  }, [])

  const notifyTaskCompleted = useCallback((taskId: string, result: string, teamId?: string) => {
    socketRef.current?.notifyTaskCompleted(taskId, result, teamId)
  }, [])

  const sendTaskLog = useCallback((taskId: string, logEntry: string, teamId?: string) => {
    socketRef.current?.sendTaskLog(taskId, logEntry, teamId)
  }, [])

  // Agent methods
  const notifyAgentStatus = useCallback((agentId: string, status: string, teamId?: string) => {
    socketRef.current?.notifyAgentStatus(agentId, status, teamId)
  }, [])

  const notifyAgentLevelUp = useCallback((agentId: string, newLevel: number, teamId?: string) => {
    socketRef.current?.notifyAgentLevelUp(agentId, newLevel, teamId)
  }, [])

  const notifyAgentStats = useCallback((agentId: string, stats: any, teamId?: string) => {
    socketRef.current?.notifyAgentStats(agentId, stats, teamId)
  }, [])

  // Chat methods
  const sendChatMessage = useCallback((teamId: string, message: string) => {
    socketRef.current?.sendChatMessage(teamId, message)
  }, [])

  const sendTypingIndicator = useCallback((teamId: string, isTyping: boolean) => {
    socketRef.current?.sendTypingIndicator(teamId, isTyping)
  }, [])

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
    joinTeam,
    leaveTeam,
    updateTeamStatus,
    notifyTaskCreated,
    notifyTaskUpdated,
    notifyTaskCompleted,
    sendTaskLog,
    notifyAgentStatus,
    notifyAgentLevelUp,
    notifyAgentStats,
    sendChatMessage,
    sendTypingIndicator
  }
}
