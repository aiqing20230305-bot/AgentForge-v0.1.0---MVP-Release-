/**
 * Collaboration Service
 * Real-time multi-user collaboration with conflict detection and resolution
 *
 * Features:
 * - Online user tracking
 * - Real-time cursor positions
 * - Operation conflict detection
 * - Operation broadcasting
 * - User permission management
 * - Conflict resolution (Last Write Wins + Operational Transformation support)
 */

import { getSocketClient, SocketClient } from './socket/socketClient'

/**
 * User presence information
 */
export interface OnlineUser {
  userId: string
  username: string
  avatar?: string
  status: 'online' | 'idle' | 'away'
  lastActivity: Date
  currentResource?: string // Current editing resource (e.g., "task:123", "agent:456")
  cursorPosition?: CursorPosition
  permissions: UserPermissions
}

/**
 * Cursor position for real-time tracking
 */
export interface CursorPosition {
  resourceId: string
  resourceType: 'task' | 'agent' | 'document' | 'chat'
  x: number
  y: number
  timestamp: Date
}

/**
 * User permissions for collaboration
 */
export interface UserPermissions {
  canEdit: boolean
  canDelete: boolean
  canShare: boolean
  role: 'owner' | 'admin' | 'editor' | 'viewer'
}

/**
 * Operation for tracking changes
 */
export interface CollaborativeOperation {
  id: string
  userId: string
  username: string
  resourceId: string
  resourceType: string
  operationType: 'create' | 'update' | 'delete'
  timestamp: Date
  data: any
  version?: number // For OT algorithm
  vectorClock?: Record<string, number> // For conflict detection
}

/**
 * Conflict detection result
 */
export interface ConflictResult {
  hasConflict: boolean
  conflictType?: 'concurrent_edit' | 'version_mismatch' | 'permission_denied'
  conflictingOperations?: CollaborativeOperation[]
  resolution?: 'last_write_wins' | 'operational_transformation' | 'manual'
}

/**
 * Collaboration event callbacks
 */
export interface CollaborationCallbacks {
  onUserJoined?: (user: OnlineUser) => void
  onUserLeft?: (userId: string) => void
  onUserStatusChanged?: (userId: string, status: OnlineUser['status']) => void
  onCursorMoved?: (userId: string, position: CursorPosition) => void
  onOperationReceived?: (operation: CollaborativeOperation) => void
  onConflictDetected?: (conflict: ConflictResult) => void
  onPermissionChanged?: (userId: string, permissions: UserPermissions) => void
}

/**
 * Collaboration Service Class
 */
export class CollaborationService {
  private socket: SocketClient
  private onlineUsers: Map<string, OnlineUser> = new Map()
  private operationHistory: CollaborativeOperation[] = []
  private callbacks: CollaborationCallbacks = {}
  private currentUserId?: string
  private currentUsername?: string
  private sessionId: string
  private idleTimer?: NodeJS.Timeout
  private activityCheckInterval?: NodeJS.Timeout
  private vectorClock: Record<string, number> = {}

  // Configuration
  private readonly IDLE_TIMEOUT = 300000 // 5 minutes
  private readonly AWAY_TIMEOUT = 900000 // 15 minutes
  private readonly ACTIVITY_CHECK_INTERVAL = 60000 // 1 minute
  private readonly MAX_OPERATION_HISTORY = 1000
  private readonly CONFLICT_RESOLUTION_STRATEGY: 'last_write_wins' | 'operational_transformation' = 'last_write_wins'

  constructor() {
    this.socket = getSocketClient()
    this.sessionId = this.generateSessionId()
    this.setupSocketListeners()
    this.setupActivityMonitoring()
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * Setup socket event listeners
   */
  private setupSocketListeners(): void {
    this.socket.on({
      onConnect: () => {
        console.log('[Collaboration] Socket connected')
        this.broadcastPresence()
      },

      onDisconnect: () => {
        console.log('[Collaboration] Socket disconnected')
        this.handleDisconnect()
      },

      onTeamMemberJoined: (data) => {
        this.handleUserJoined({
          userId: data.userId,
          username: data.username,
          status: 'online',
          lastActivity: new Date(data.timestamp),
          permissions: this.getDefaultPermissions()
        })
      },

      onTeamMemberLeft: (data) => {
        this.handleUserLeft(data.userId)
      },

      onTeamMemberStatus: (data) => {
        this.updateUserStatus(data.userId, data.status as OnlineUser['status'])
      }
    })

    // Setup custom collaboration events
    this.setupCollaborationEvents()
  }

  /**
   * Setup custom collaboration events
   */
  private setupCollaborationEvents(): void {
    // Cursor position updates
    this.socket.emit = ((originalEmit) => {
      return function(this: SocketClient, event: string, data: any) {
        originalEmit.call(this, event, data)
      }
    })(this.socket.emit.bind(this.socket))

    // Listen for cursor movements
    if ((this.socket as any).socket) {
      (this.socket as any).socket.on('collab:cursor_moved', (data: any) => {
        this.handleCursorMoved(data)
      })

      // Listen for operations
      (this.socket as any).socket.on('collab:operation', (data: any) => {
        this.handleOperationReceived(data)
      })

      // Listen for permission changes
      (this.socket as any).socket.on('collab:permission_changed', (data: any) => {
        this.handlePermissionChanged(data)
      })

      // Listen for presence updates
      (this.socket as any).socket.on('collab:presence', (data: any) => {
        this.handlePresenceUpdate(data)
      })
    }
  }

  /**
   * Setup activity monitoring for idle/away detection
   */
  private setupActivityMonitoring(): void {
    // Reset idle timer on user activity
    const resetIdleTimer = () => {
      this.updateActivity()

      if (this.idleTimer) {
        clearTimeout(this.idleTimer)
      }

      this.idleTimer = setTimeout(() => {
        this.setUserStatus('idle')
      }, this.IDLE_TIMEOUT)
    }

    // Monitor user activity
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', resetIdleTimer)
      window.addEventListener('keydown', resetIdleTimer)
      window.addEventListener('click', resetIdleTimer)
      window.addEventListener('scroll', resetIdleTimer)
    }

    // Periodic activity check
    this.activityCheckInterval = setInterval(() => {
      this.checkUserActivity()
    }, this.ACTIVITY_CHECK_INTERVAL)
  }

  /**
   * Initialize collaboration for a session
   */
  initialize(userId: string, username: string, teamId?: string): void {
    this.currentUserId = userId
    this.currentUsername = username
    this.vectorClock[userId] = 0

    console.log(`[Collaboration] Initialized for user ${username} (${userId})`)

    if (teamId) {
      this.socket.joinTeam(teamId)
    }

    this.broadcastPresence()
  }

  /**
   * Join a collaborative resource (task, document, etc.)
   */
  joinResource(resourceId: string, resourceType: string, permissions?: UserPermissions): void {
    if (!this.currentUserId || !this.currentUsername) {
      console.error('[Collaboration] Not initialized')
      return
    }

    const user: OnlineUser = {
      userId: this.currentUserId,
      username: this.currentUsername,
      status: 'online',
      lastActivity: new Date(),
      currentResource: `${resourceType}:${resourceId}`,
      permissions: permissions || this.getDefaultPermissions()
    }

    this.onlineUsers.set(this.currentUserId, user)
    this.broadcastPresence()

    console.log(`[Collaboration] Joined resource ${resourceType}:${resourceId}`)
  }

  /**
   * Leave a collaborative resource
   */
  leaveResource(resourceId: string, resourceType: string): void {
    if (!this.currentUserId) return

    const user = this.onlineUsers.get(this.currentUserId)
    if (user && user.currentResource === `${resourceType}:${resourceId}`) {
      user.currentResource = undefined
      user.cursorPosition = undefined
      this.broadcastPresence()
    }

    console.log(`[Collaboration] Left resource ${resourceType}:${resourceId}`)
  }

  /**
   * Update cursor position
   */
  updateCursor(position: CursorPosition): void {
    if (!this.currentUserId) return

    const user = this.onlineUsers.get(this.currentUserId)
    if (user) {
      user.cursorPosition = { ...position, timestamp: new Date() }
      this.broadcastCursor(position)
    }
  }

  /**
   * Broadcast an operation
   */
  broadcastOperation(operation: Omit<CollaborativeOperation, 'id' | 'userId' | 'username' | 'timestamp' | 'vectorClock'>): void {
    if (!this.currentUserId || !this.currentUsername) {
      console.error('[Collaboration] Not initialized')
      return
    }

    // Increment vector clock
    this.vectorClock[this.currentUserId] = (this.vectorClock[this.currentUserId] || 0) + 1

    const fullOperation: CollaborativeOperation = {
      id: this.generateOperationId(),
      userId: this.currentUserId,
      username: this.currentUsername,
      timestamp: new Date(),
      vectorClock: { ...this.vectorClock },
      ...operation
    }

    // Check for conflicts
    const conflict = this.detectConflict(fullOperation)
    if (conflict.hasConflict) {
      console.warn('[Collaboration] Conflict detected:', conflict)
      this.callbacks.onConflictDetected?.(conflict)

      // Apply conflict resolution
      const resolved = this.resolveConflict(fullOperation, conflict)
      if (!resolved) {
        console.error('[Collaboration] Failed to resolve conflict')
        return
      }
    }

    // Add to history
    this.addToHistory(fullOperation)

    // Broadcast to other users
    this.socket.emit('collab:operation', fullOperation)

    console.log('[Collaboration] Operation broadcasted:', fullOperation.operationType)
  }

  /**
   * Detect operation conflicts
   */
  private detectConflict(operation: CollaborativeOperation): ConflictResult {
    const result: ConflictResult = {
      hasConflict: false
    }

    // Check for concurrent edits on same resource
    const recentOps = this.operationHistory.filter(op =>
      op.resourceId === operation.resourceId &&
      op.userId !== operation.userId &&
      Math.abs(new Date(op.timestamp).getTime() - new Date(operation.timestamp).getTime()) < 5000 // Within 5 seconds
    )

    if (recentOps.length > 0) {
      result.hasConflict = true
      result.conflictType = 'concurrent_edit'
      result.conflictingOperations = recentOps
      result.resolution = this.CONFLICT_RESOLUTION_STRATEGY
    }

    // Check vector clock for causality violations
    if (operation.vectorClock) {
      for (const [userId, clock] of Object.entries(operation.vectorClock)) {
        if (this.vectorClock[userId] && this.vectorClock[userId] > clock) {
          result.hasConflict = true
          result.conflictType = 'version_mismatch'
          result.resolution = 'operational_transformation'
        }
      }
    }

    // Check permissions
    const user = this.onlineUsers.get(operation.userId)
    if (user && !user.permissions.canEdit && operation.operationType !== 'create') {
      result.hasConflict = true
      result.conflictType = 'permission_denied'
      result.resolution = 'manual'
    }

    return result
  }

  /**
   * Resolve operation conflict
   */
  private resolveConflict(operation: CollaborativeOperation, conflict: ConflictResult): boolean {
    switch (conflict.resolution) {
      case 'last_write_wins':
        // Simply accept the latest operation
        console.log('[Collaboration] Conflict resolved: Last Write Wins')
        return true

      case 'operational_transformation':
        // Apply OT algorithm (simplified version)
        if (conflict.conflictingOperations && conflict.conflictingOperations.length > 0) {
          // Transform the operation against conflicting operations
          const transformed = this.applyOperationalTransformation(operation, conflict.conflictingOperations)
          Object.assign(operation, transformed)
          console.log('[Collaboration] Conflict resolved: Operational Transformation')
          return true
        }
        return false

      case 'manual':
        // Requires user intervention
        console.log('[Collaboration] Conflict requires manual resolution')
        return false

      default:
        return false
    }
  }

  /**
   * Apply Operational Transformation (simplified)
   */
  private applyOperationalTransformation(
    operation: CollaborativeOperation,
    conflictingOps: CollaborativeOperation[]
  ): CollaborativeOperation {
    // This is a simplified OT implementation
    // In production, you'd use a proper OT library like ShareDB or Yjs

    let transformed = { ...operation }

    for (const conflictOp of conflictingOps) {
      // If both operations are updates, merge the data
      if (operation.operationType === 'update' && conflictOp.operationType === 'update') {
        transformed.data = {
          ...conflictOp.data,
          ...operation.data,
          // Add timestamp to track the transformation
          _transformedAt: new Date(),
          _transformedFrom: [conflictOp.id, operation.id]
        }
      }
    }

    return transformed
  }

  /**
   * Get online users list
   */
  getOnlineUsers(): OnlineUser[] {
    return Array.from(this.onlineUsers.values())
  }

  /**
   * Get users editing specific resource
   */
  getUsersOnResource(resourceId: string, resourceType: string): OnlineUser[] {
    const resourceKey = `${resourceType}:${resourceId}`
    return this.getOnlineUsers().filter(user => user.currentResource === resourceKey)
  }

  /**
   * Update user permissions
   */
  updateUserPermissions(userId: string, permissions: Partial<UserPermissions>): void {
    const user = this.onlineUsers.get(userId)
    if (user) {
      user.permissions = { ...user.permissions, ...permissions }
      this.broadcastPermissionChange(userId, user.permissions)
    }
  }

  /**
   * Check if user has permission
   */
  hasPermission(userId: string, action: keyof Omit<UserPermissions, 'role'>): boolean {
    const user = this.onlineUsers.get(userId)
    return user ? user.permissions[action] : false
  }

  /**
   * Register event callbacks
   */
  on(callbacks: CollaborationCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer)
    }
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval)
    }
    this.onlineUsers.clear()
    this.operationHistory = []
    this.vectorClock = {}
  }

  // ============ Private Helper Methods ============

  private getDefaultPermissions(): UserPermissions {
    return {
      canEdit: true,
      canDelete: false,
      canShare: false,
      role: 'editor'
    }
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  private addToHistory(operation: CollaborativeOperation): void {
    this.operationHistory.push(operation)

    // Limit history size
    if (this.operationHistory.length > this.MAX_OPERATION_HISTORY) {
      this.operationHistory.shift()
    }
  }

  private updateActivity(): void {
    if (!this.currentUserId) return

    const user = this.onlineUsers.get(this.currentUserId)
    if (user) {
      user.lastActivity = new Date()
      if (user.status !== 'online') {
        this.setUserStatus('online')
      }
    }
  }

  private setUserStatus(status: OnlineUser['status']): void {
    if (!this.currentUserId) return

    const user = this.onlineUsers.get(this.currentUserId)
    if (user) {
      user.status = status
      this.socket.emit('collab:status', { userId: this.currentUserId, status })
      this.callbacks.onUserStatusChanged?.(this.currentUserId, status)
    }
  }

  private checkUserActivity(): void {
    const now = Date.now()

    for (const [userId, user] of this.onlineUsers.entries()) {
      const timeSinceActivity = now - user.lastActivity.getTime()

      if (timeSinceActivity > this.AWAY_TIMEOUT && user.status !== 'away') {
        user.status = 'away'
        this.callbacks.onUserStatusChanged?.(userId, 'away')
      } else if (timeSinceActivity > this.IDLE_TIMEOUT && timeSinceActivity <= this.AWAY_TIMEOUT && user.status === 'online') {
        user.status = 'idle'
        this.callbacks.onUserStatusChanged?.(userId, 'idle')
      }
    }
  }

  private broadcastPresence(): void {
    if (!this.currentUserId) return

    const user = this.onlineUsers.get(this.currentUserId)
    if (user) {
      this.socket.emit('collab:presence', user)
    }
  }

  private broadcastCursor(position: CursorPosition): void {
    if (!this.currentUserId) return

    this.socket.emit('collab:cursor_moved', {
      userId: this.currentUserId,
      position
    })
  }

  private broadcastPermissionChange(userId: string, permissions: UserPermissions): void {
    this.socket.emit('collab:permission_changed', {
      userId,
      permissions
    })
  }

  private handleUserJoined(userData: Partial<OnlineUser>): void {
    if (!userData.userId) return

    const user: OnlineUser = {
      username: userData.username || 'Unknown',
      status: 'online',
      lastActivity: new Date(),
      permissions: this.getDefaultPermissions(),
      ...userData,
      userId: userData.userId
    }

    this.onlineUsers.set(user.userId, user)
    this.callbacks.onUserJoined?.(user)

    console.log(`[Collaboration] User joined: ${user.username}`)
  }

  private handleUserLeft(userId: string): void {
    this.onlineUsers.delete(userId)
    this.callbacks.onUserLeft?.(userId)

    console.log(`[Collaboration] User left: ${userId}`)
  }

  private updateUserStatus(userId: string, status: OnlineUser['status']): void {
    const user = this.onlineUsers.get(userId)
    if (user) {
      user.status = status
      this.callbacks.onUserStatusChanged?.(userId, status)
    }
  }

  private handleCursorMoved(data: { userId: string; position: CursorPosition }): void {
    const user = this.onlineUsers.get(data.userId)
    if (user) {
      user.cursorPosition = data.position
      this.callbacks.onCursorMoved?.(data.userId, data.position)
    }
  }

  private handleOperationReceived(operation: CollaborativeOperation): void {
    // Update vector clock
    if (operation.vectorClock) {
      for (const [userId, clock] of Object.entries(operation.vectorClock)) {
        this.vectorClock[userId] = Math.max(this.vectorClock[userId] || 0, clock)
      }
    }

    // Check for conflicts
    const conflict = this.detectConflict(operation)
    if (conflict.hasConflict) {
      this.callbacks.onConflictDetected?.(conflict)
      this.resolveConflict(operation, conflict)
    }

    // Add to history
    this.addToHistory(operation)

    // Notify callback
    this.callbacks.onOperationReceived?.(operation)

    console.log(`[Collaboration] Operation received from ${operation.username}:`, operation.operationType)
  }

  private handlePermissionChanged(data: { userId: string; permissions: UserPermissions }): void {
    const user = this.onlineUsers.get(data.userId)
    if (user) {
      user.permissions = data.permissions
      this.callbacks.onPermissionChanged?.(data.userId, data.permissions)
    }
  }

  private handlePresenceUpdate(userData: OnlineUser): void {
    if (userData.userId && userData.userId !== this.currentUserId) {
      this.onlineUsers.set(userData.userId, userData)
    }
  }

  private handleDisconnect(): void {
    // Notify other users we're leaving
    if (this.currentUserId) {
      this.socket.emit('collab:leave', { userId: this.currentUserId })
    }
  }
}

// Singleton instance
let collaborationServiceInstance: CollaborationService | null = null

/**
 * Get Collaboration Service instance (singleton)
 */
export const getCollaborationService = (): CollaborationService => {
  if (!collaborationServiceInstance) {
    collaborationServiceInstance = new CollaborationService()
  }
  return collaborationServiceInstance
}

/**
 * Initialize collaboration service
 */
export const initCollaboration = (userId: string, username: string, teamId?: string): CollaborationService => {
  const service = getCollaborationService()
  service.initialize(userId, username, teamId)
  return service
}

/**
 * Destroy collaboration service
 */
export const destroyCollaboration = (): void => {
  if (collaborationServiceInstance) {
    collaborationServiceInstance.destroy()
    collaborationServiceInstance = null
  }
}
