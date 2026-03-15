/**
 * Socket.io Client
 * Real-time WebSocket communication with backend
 */

import { io, Socket } from 'socket.io-client'
import { TokenManager } from '../api/client'

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'

/**
 * Socket event callbacks
 */
export interface SocketEventCallbacks {
  // Connection events
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void

  // Team events
  onTeamMemberJoined?: (data: { userId: string; username: string; teamId: string; timestamp: Date }) => void
  onTeamMemberLeft?: (data: { userId: string; username: string; teamId: string; timestamp: Date }) => void
  onTeamMembers?: (data: { teamId: string; members: string[]; count: number }) => void
  onTeamMemberStatus?: (data: { userId: string; username: string; status: string; timestamp: Date }) => void

  // Task events
  onTaskCreated?: (data: { task: any; createdBy: string; timestamp: Date }) => void
  onTaskUpdated?: (data: { taskId: string; updates: any; updatedBy: string; timestamp: Date }) => void
  onTaskCompleted?: (data: { taskId: string; result: string; completedBy: string; timestamp: Date }) => void
  onTaskLog?: (data: { taskId: string; logEntry: string; timestamp: Date }) => void

  // Agent events
  onAgentStatus?: (data: { agentId: string; status: string; timestamp: Date }) => void
  onAgentLevelUp?: (data: { agentId: string; newLevel: number; timestamp: Date }) => void
  onAgentStats?: (data: { agentId: string; stats: any; timestamp: Date }) => void

  // Chat events
  onChatMessage?: (data: { userId: string; username: string; message: string; timestamp: Date }) => void
  onChatTyping?: (data: { userId: string; username: string; isTyping: boolean }) => void
}

/**
 * Socket Client Class
 * Manages WebSocket connection and event handling
 */
export class SocketClient {
  private socket: Socket | null = null
  private callbacks: SocketEventCallbacks = {}
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  /**
   * Connect to Socket.io server
   */
  connect(token?: string): void {
    if (this.socket?.connected) {
      console.log('Socket already connected')
      return
    }

    const authToken = token || TokenManager.getAccessToken()
    if (!authToken) {
      console.error('No authentication token available')
      return
    }

    this.socket = io(SOCKET_URL, {
      auth: { token: authToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts
    })

    this.setupEventListeners()
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id)
      this.reconnectAttempts = 0
      this.callbacks.onConnect?.()
    })

    this.socket.on('connected', (data) => {
      console.log('✅ Authenticated:', data)
    })

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected')
      this.callbacks.onDisconnect?.()
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message)
      this.reconnectAttempts++
      this.callbacks.onError?.(error)

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
        this.disconnect()
      }
    })

    // Team events
    this.socket.on('team:member_joined', (data) => {
      console.log('👥 Team member joined:', data)
      this.callbacks.onTeamMemberJoined?.(data)
    })

    this.socket.on('team:member_left', (data) => {
      console.log('👋 Team member left:', data)
      this.callbacks.onTeamMemberLeft?.(data)
    })

    this.socket.on('team:members', (data) => {
      console.log('👥 Team members:', data)
      this.callbacks.onTeamMembers?.(data)
    })

    this.socket.on('team:member_status', (data) => {
      console.log('📊 Team member status:', data)
      this.callbacks.onTeamMemberStatus?.(data)
    })

    // Task events
    this.socket.on('task:created', (data) => {
      console.log('✅ Task created:', data)
      this.callbacks.onTaskCreated?.(data)
    })

    this.socket.on('task:updated', (data) => {
      console.log('🔄 Task updated:', data)
      this.callbacks.onTaskUpdated?.(data)
    })

    this.socket.on('task:completed', (data) => {
      console.log('✅ Task completed:', data)
      this.callbacks.onTaskCompleted?.(data)
    })

    this.socket.on('task:log', (data) => {
      console.log('📝 Task log:', data)
      this.callbacks.onTaskLog?.(data)
    })

    // Agent events
    this.socket.on('agent:status', (data) => {
      console.log('🤖 Agent status:', data)
      this.callbacks.onAgentStatus?.(data)
    })

    this.socket.on('agent:level_up', (data) => {
      console.log('🎉 Agent level up:', data)
      this.callbacks.onAgentLevelUp?.(data)
    })

    this.socket.on('agent:stats', (data) => {
      console.log('📊 Agent stats:', data)
      this.callbacks.onAgentStats?.(data)
    })

    // Chat events
    this.socket.on('chat:message', (data) => {
      console.log('💬 Chat message:', data)
      this.callbacks.onChatMessage?.(data)
    })

    this.socket.on('chat:typing', (data) => {
      console.log('✏️ Chat typing:', data)
      this.callbacks.onChatTyping?.(data)
    })
  }

  /**
   * Register event callbacks
   */
  on(callbacks: SocketEventCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  /**
   * Emit event to server
   */
  emit(event: string, data: any): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot emit event:', event)
      return
    }

    this.socket.emit(event, data)
  }

  // Team methods
  joinTeam(teamId: string): void {
    this.emit('team:join', { teamId })
  }

  leaveTeam(teamId: string): void {
    this.emit('team:leave', { teamId })
  }

  updateTeamStatus(teamId: string, status: string): void {
    this.emit('team:status', { teamId, status })
  }

  // Task methods
  notifyTaskCreated(task: any, teamId?: string): void {
    this.emit('task:created', { task, teamId })
  }

  notifyTaskUpdated(taskId: string, updates: any, teamId?: string): void {
    this.emit('task:updated', { taskId, updates, teamId })
  }

  notifyTaskCompleted(taskId: string, result: string, teamId?: string): void {
    this.emit('task:completed', { taskId, result, teamId })
  }

  sendTaskLog(taskId: string, logEntry: string, teamId?: string): void {
    this.emit('task:log', { taskId, logEntry, teamId })
  }

  // Agent methods
  notifyAgentStatus(agentId: string, status: string, teamId?: string): void {
    this.emit('agent:status', { agentId, status, teamId })
  }

  notifyAgentLevelUp(agentId: string, newLevel: number, teamId?: string): void {
    this.emit('agent:level_up', { agentId, newLevel, teamId })
  }

  notifyAgentStats(agentId: string, stats: any, teamId?: string): void {
    this.emit('agent:stats', { agentId, stats, teamId })
  }

  // Chat methods
  sendChatMessage(teamId: string, message: string): void {
    this.emit('chat:message', { teamId, message })
  }

  sendTypingIndicator(teamId: string, isTyping: boolean): void {
    this.emit('chat:typing', { teamId, isTyping })
  }
}

// Singleton instance
let socketClientInstance: SocketClient | null = null

/**
 * Get Socket Client instance (singleton)
 */
export const getSocketClient = (): SocketClient => {
  if (!socketClientInstance) {
    socketClientInstance = new SocketClient()
  }
  return socketClientInstance
}

/**
 * Initialize and connect socket
 */
export const initSocket = (token?: string): SocketClient => {
  const client = getSocketClient()
  client.connect(token)
  return client
}

/**
 * Disconnect socket
 */
export const disconnectSocket = (): void => {
  if (socketClientInstance) {
    socketClientInstance.disconnect()
  }
}
