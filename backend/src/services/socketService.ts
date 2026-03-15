/**
 * Socket.io Service
 * Real-time communication for collaborative features
 */

import { Server as HTTPServer } from 'http'
import { Server, Socket } from 'socket.io'
import { verifyAccessToken } from '../utils/jwt'
import config from '../config/env'

interface AuthenticatedSocket extends Socket {
  userId?: string
  username?: string
}

interface RoomData {
  teamId: string
  members: Set<string>
  lastActivity: Date
}

export class SocketService {
  private io: Server
  private rooms: Map<string, RoomData> = new Map()

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.CORS_ORIGIN,
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    })

    this.setupMiddleware()
    this.setupEventHandlers()
  }

  /**
   * Authentication middleware for socket connections
   */
  private setupMiddleware(): void {
    this.io.use((socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1]

        if (!token) {
          return next(new Error('Authentication token required'))
        }

        const payload = verifyAccessToken(token)
        socket.userId = payload.userId
        socket.username = payload.username

        next()
      } catch (error) {
        next(new Error('Invalid authentication token'))
      }
    })
  }

  /**
   * Setup event handlers for socket connections
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`✅ Socket connected: ${socket.id} (User: ${socket.username})`)

      // Join user's personal room
      socket.join(`user:${socket.userId}`)

      // Handle team room events
      this.handleTeamEvents(socket)

      // Handle task events
      this.handleTaskEvents(socket)

      // Handle agent events
      this.handleAgentEvents(socket)

      // Handle chat events
      this.handleChatEvents(socket)

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`❌ Socket disconnected: ${socket.id} (User: ${socket.username})`)
        this.handleDisconnect(socket)
      })

      // Send connection success
      socket.emit('connected', {
        socketId: socket.id,
        userId: socket.userId,
        username: socket.username,
        timestamp: new Date()
      })
    })
  }

  /**
   * Handle team-related events
   */
  private handleTeamEvents(socket: AuthenticatedSocket): void {
    // Join team room
    socket.on('team:join', (data: { teamId: string }) => {
      const { teamId } = data
      const roomKey = `team:${teamId}`

      socket.join(roomKey)

      // Track room membership
      if (!this.rooms.has(roomKey)) {
        this.rooms.set(roomKey, {
          teamId,
          members: new Set(),
          lastActivity: new Date()
        })
      }

      const room = this.rooms.get(roomKey)!
      room.members.add(socket.userId!)
      room.lastActivity = new Date()

      console.log(`👥 User ${socket.username} joined team ${teamId}`)

      // Notify team members
      socket.to(roomKey).emit('team:member_joined', {
        userId: socket.userId,
        username: socket.username,
        teamId,
        timestamp: new Date()
      })

      // Send current team members to the new joiner
      socket.emit('team:members', {
        teamId,
        members: Array.from(room.members),
        count: room.members.size
      })
    })

    // Leave team room
    socket.on('team:leave', (data: { teamId: string }) => {
      const { teamId } = data
      const roomKey = `team:${teamId}`

      socket.leave(roomKey)

      const room = this.rooms.get(roomKey)
      if (room) {
        room.members.delete(socket.userId!)

        // Clean up empty rooms
        if (room.members.size === 0) {
          this.rooms.delete(roomKey)
        }
      }

      console.log(`👋 User ${socket.username} left team ${teamId}`)

      // Notify team members
      socket.to(roomKey).emit('team:member_left', {
        userId: socket.userId,
        username: socket.username,
        teamId,
        timestamp: new Date()
      })
    })

    // Team member status update
    socket.on('team:status', (data: { teamId: string; status: string }) => {
      const { teamId, status } = data
      const roomKey = `team:${teamId}`

      socket.to(roomKey).emit('team:member_status', {
        userId: socket.userId,
        username: socket.username,
        status,
        timestamp: new Date()
      })
    })
  }

  /**
   * Handle task-related events
   */
  private handleTaskEvents(socket: AuthenticatedSocket): void {
    // Task created
    socket.on('task:created', (data: { task: any; teamId?: string }) => {
      const { task, teamId } = data

      if (teamId) {
        // Broadcast to team
        socket.to(`team:${teamId}`).emit('task:created', {
          task,
          createdBy: socket.username,
          timestamp: new Date()
        })
      }
    })

    // Task updated
    socket.on('task:updated', (data: { taskId: string; updates: any; teamId?: string }) => {
      const { taskId, updates, teamId } = data

      if (teamId) {
        socket.to(`team:${teamId}`).emit('task:updated', {
          taskId,
          updates,
          updatedBy: socket.username,
          timestamp: new Date()
        })
      }
    })

    // Task completed
    socket.on('task:completed', (data: { taskId: string; result: string; teamId?: string }) => {
      const { taskId, result, teamId } = data

      if (teamId) {
        socket.to(`team:${teamId}`).emit('task:completed', {
          taskId,
          result,
          completedBy: socket.username,
          timestamp: new Date()
        })
      }
    })

    // Task execution log
    socket.on('task:log', (data: { taskId: string; logEntry: string; teamId?: string }) => {
      const { taskId, logEntry, teamId } = data

      if (teamId) {
        socket.to(`team:${teamId}`).emit('task:log', {
          taskId,
          logEntry,
          timestamp: new Date()
        })
      }
    })
  }

  /**
   * Handle agent-related events
   */
  private handleAgentEvents(socket: AuthenticatedSocket): void {
    // Agent status changed
    socket.on('agent:status', (data: { agentId: string; status: string; teamId?: string }) => {
      const { agentId, status, teamId } = data

      if (teamId) {
        socket.to(`team:${teamId}`).emit('agent:status', {
          agentId,
          status,
          timestamp: new Date()
        })
      }

      // Also broadcast to user's personal room
      socket.to(`user:${socket.userId}`).emit('agent:status', {
        agentId,
        status,
        timestamp: new Date()
      })
    })

    // Agent level up
    socket.on('agent:level_up', (data: { agentId: string; newLevel: number; teamId?: string }) => {
      const { agentId, newLevel, teamId } = data

      if (teamId) {
        socket.to(`team:${teamId}`).emit('agent:level_up', {
          agentId,
          newLevel,
          timestamp: new Date()
        })
      }
    })

    // Agent stats updated
    socket.on('agent:stats', (data: { agentId: string; stats: any; teamId?: string }) => {
      const { agentId, stats, teamId } = data

      if (teamId) {
        socket.to(`team:${teamId}`).emit('agent:stats', {
          agentId,
          stats,
          timestamp: new Date()
        })
      }
    })
  }

  /**
   * Handle chat events
   */
  private handleChatEvents(socket: AuthenticatedSocket): void {
    // Send message to team
    socket.on('chat:message', (data: { teamId: string; message: string }) => {
      const { teamId, message } = data
      const roomKey = `team:${teamId}`

      // Broadcast to team (excluding sender)
      socket.to(roomKey).emit('chat:message', {
        userId: socket.userId,
        username: socket.username,
        message,
        timestamp: new Date()
      })

      // Update room activity
      const room = this.rooms.get(roomKey)
      if (room) {
        room.lastActivity = new Date()
      }
    })

    // User typing indicator
    socket.on('chat:typing', (data: { teamId: string; isTyping: boolean }) => {
      const { teamId, isTyping } = data
      const roomKey = `team:${teamId}`

      socket.to(roomKey).emit('chat:typing', {
        userId: socket.userId,
        username: socket.username,
        isTyping
      })
    })
  }

  /**
   * Handle socket disconnect
   */
  private handleDisconnect(socket: AuthenticatedSocket): void {
    // Remove from all team rooms
    this.rooms.forEach((room, roomKey) => {
      if (room.members.has(socket.userId!)) {
        room.members.delete(socket.userId!)

        // Notify team members
        socket.to(roomKey).emit('team:member_left', {
          userId: socket.userId,
          username: socket.username,
          teamId: room.teamId,
          timestamp: new Date()
        })

        // Clean up empty rooms
        if (room.members.size === 0) {
          this.rooms.delete(roomKey)
        }
      }
    })
  }

  /**
   * Send notification to specific user
   */
  public notifyUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data)
  }

  /**
   * Broadcast to team
   */
  public notifyTeam(teamId: string, event: string, data: any): void {
    this.io.to(`team:${teamId}`).emit(event, data)
  }

  /**
   * Broadcast to all connected clients
   */
  public broadcast(event: string, data: any): void {
    this.io.emit(event, data)
  }

  /**
   * Get active rooms
   */
  public getActiveRooms(): Array<{ teamId: string; memberCount: number; lastActivity: Date }> {
    return Array.from(this.rooms.values()).map((room) => ({
      teamId: room.teamId,
      memberCount: room.members.size,
      lastActivity: room.lastActivity
    }))
  }

  /**
   * Get connected users count
   */
  public getConnectedUsersCount(): number {
    return this.io.sockets.sockets.size
  }

  /**
   * Get Socket.io instance
   */
  public getIO(): Server {
    return this.io
  }
}

// Export singleton instance (initialized in index.ts)
let socketService: SocketService | null = null

export const initSocketService = (httpServer: HTTPServer): SocketService => {
  socketService = new SocketService(httpServer)
  return socketService
}

export const getSocketService = (): SocketService => {
  if (!socketService) {
    throw new Error('Socket service not initialized. Call initSocketService first.')
  }
  return socketService
}
