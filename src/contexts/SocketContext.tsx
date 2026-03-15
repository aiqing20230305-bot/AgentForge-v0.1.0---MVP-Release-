/**
 * Socket Context
 * Global WebSocket connection provider
 */

import React, { createContext, useContext, ReactNode } from 'react'
import { useSocket } from '../hooks/useSocket'
import { SocketClient } from '../services/socket/socketClient'

interface SocketContextType {
  socket: SocketClient | null
  isConnected: boolean
  connect: () => void
  disconnect: () => void
  joinTeam: (teamId: string) => void
  leaveTeam: (teamId: string) => void
  updateTeamStatus: (teamId: string, status: string) => void
  notifyTaskCreated: (task: any, teamId?: string) => void
  notifyTaskUpdated: (taskId: string, updates: any, teamId?: string) => void
  notifyTaskCompleted: (taskId: string, result: string, teamId?: string) => void
  sendTaskLog: (taskId: string, logEntry: string, teamId?: string) => void
  notifyAgentStatus: (agentId: string, status: string, teamId?: string) => void
  notifyAgentLevelUp: (agentId: string, newLevel: number, teamId?: string) => void
  notifyAgentStats: (agentId: string, stats: any, teamId?: string) => void
  sendChatMessage: (teamId: string, message: string) => void
  sendTypingIndicator: (teamId: string, isTyping: boolean) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

interface SocketProviderProps {
  children: ReactNode
  autoConnect?: boolean
}

/**
 * Socket Provider Component
 * Wraps app with WebSocket context
 */
export const SocketProvider: React.FC<SocketProviderProps> = ({ children, autoConnect = false }) => {
  const socket = useSocket({ autoConnect })

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}

/**
 * useSocketContext Hook
 * Access WebSocket context
 */
export const useSocketContext = (): SocketContextType => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocketContext must be used within SocketProvider')
  }
  return context
}
