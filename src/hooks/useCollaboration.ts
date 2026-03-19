/**
 * useCollaboration Hook
 * React hook for easy integration of collaboration features
 */

import { useEffect, useState, useCallback } from 'react'
import {
  getCollaborationService,
  initCollaboration,
  OnlineUser,
  CursorPosition,
  CollaborativeOperation,
  ConflictResult,
  UserPermissions
} from '../services/collaborationService'

export interface UseCollaborationOptions {
  userId: string
  username: string
  teamId?: string
  resourceId?: string
  resourceType?: string
  autoJoinResource?: boolean
  permissions?: UserPermissions
}

export interface UseCollaborationResult {
  // State
  onlineUsers: OnlineUser[]
  activeEditors: OnlineUser[]
  viewers: OnlineUser[]
  recentOperations: CollaborativeOperation[]
  conflicts: ConflictResult[]
  isInitialized: boolean

  // Actions
  joinResource: (resourceId: string, resourceType: string) => void
  leaveResource: (resourceId: string, resourceType: string) => void
  updateCursor: (position: CursorPosition) => void
  broadcastOperation: (
    operation: Omit<
      CollaborativeOperation,
      'id' | 'userId' | 'username' | 'timestamp' | 'vectorClock'
    >
  ) => void
  updatePermissions: (userId: string, permissions: Partial<UserPermissions>) => void
  hasPermission: (action: keyof Omit<UserPermissions, 'role'>) => boolean

  // Service instance
  service: ReturnType<typeof getCollaborationService>
}

/**
 * useCollaboration Hook
 */
export const useCollaboration = (
  options: UseCollaborationOptions
): UseCollaborationResult => {
  const { userId, username, teamId, resourceId, resourceType, autoJoinResource, permissions } = options

  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [recentOperations, setRecentOperations] = useState<CollaborativeOperation[]>([])
  const [conflicts, setConflicts] = useState<ConflictResult[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  const service = getCollaborationService()

  // Initialize collaboration service
  useEffect(() => {
    if (!isInitialized && userId && username) {
      initCollaboration(userId, username, teamId)
      setIsInitialized(true)
      console.log('[useCollaboration] Initialized')
    }
  }, [userId, username, teamId, isInitialized])

  // Auto-join resource if specified
  useEffect(() => {
    if (isInitialized && autoJoinResource && resourceId && resourceType) {
      service.joinResource(resourceId, resourceType, permissions)
      console.log(`[useCollaboration] Auto-joined ${resourceType}:${resourceId}`)

      return () => {
        service.leaveResource(resourceId, resourceType)
        console.log(`[useCollaboration] Auto-left ${resourceType}:${resourceId}`)
      }
    }
  }, [isInitialized, autoJoinResource, resourceId, resourceType, permissions])

  // Setup event listeners
  useEffect(() => {
    const updateUsers = () => {
      if (resourceId && resourceType) {
        setOnlineUsers(service.getUsersOnResource(resourceId, resourceType))
      } else {
        setOnlineUsers(service.getOnlineUsers())
      }
    }

    // Initial load
    updateUsers()

    // Register callbacks
    service.on({
      onUserJoined: (user) => {
        console.log('[useCollaboration] User joined:', user.username)
        updateUsers()
      },

      onUserLeft: (userId) => {
        console.log('[useCollaboration] User left:', userId)
        updateUsers()
      },

      onUserStatusChanged: (userId, status) => {
        console.log('[useCollaboration] User status changed:', userId, status)
        updateUsers()
      },

      onOperationReceived: (operation) => {
        console.log('[useCollaboration] Operation received:', operation.operationType)
        setRecentOperations((prev) => [operation, ...prev].slice(0, 50))
      },

      onConflictDetected: (conflict) => {
        console.warn('[useCollaboration] Conflict detected:', conflict.conflictType)
        setConflicts((prev) => [conflict, ...prev].slice(0, 10))
      },

      onPermissionChanged: (userId, permissions) => {
        console.log('[useCollaboration] Permission changed:', userId, permissions)
        updateUsers()
      }
    })

    // Periodic update for user list
    const interval = setInterval(updateUsers, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [resourceId, resourceType])

  // Computed values
  const activeEditors = onlineUsers.filter((user) => user.permissions.canEdit)
  const viewers = onlineUsers.filter((user) => !user.permissions.canEdit)

  // Actions
  const joinResource = useCallback(
    (resId: string, resType: string) => {
      service.joinResource(resId, resType, permissions)
    },
    [permissions]
  )

  const leaveResource = useCallback((resId: string, resType: string) => {
    service.leaveResource(resId, resType)
  }, [])

  const updateCursor = useCallback((position: CursorPosition) => {
    service.updateCursor(position)
  }, [])

  const broadcastOperation = useCallback(
    (
      operation: Omit<
        CollaborativeOperation,
        'id' | 'userId' | 'username' | 'timestamp' | 'vectorClock'
      >
    ) => {
      service.broadcastOperation(operation)
    },
    []
  )

  const updatePermissions = useCallback((targetUserId: string, perms: Partial<UserPermissions>) => {
    service.updateUserPermissions(targetUserId, perms)
  }, [])

  const hasPermission = useCallback(
    (action: keyof Omit<UserPermissions, 'role'>) => {
      return service.hasPermission(userId, action)
    },
    [userId]
  )

  return {
    // State
    onlineUsers,
    activeEditors,
    viewers,
    recentOperations,
    conflicts,
    isInitialized,

    // Actions
    joinResource,
    leaveResource,
    updateCursor,
    broadcastOperation,
    updatePermissions,
    hasPermission,

    // Service instance
    service
  }
}

/**
 * useResourceLock Hook
 * Manage resource locking for exclusive editing
 */
export const useResourceLock = (resourceId: string, resourceType: string) => {
  const [isLocked, setIsLocked] = useState(false)
  const [lockedBy, setLockedBy] = useState<string | null>(null)
  const service = getCollaborationService()

  const lock = useCallback(() => {
    setIsLocked(true)
    service.broadcastOperation({
      resourceId,
      resourceType,
      operationType: 'update',
      data: { locked: true }
    })
  }, [resourceId, resourceType])

  const unlock = useCallback(() => {
    setIsLocked(false)
    setLockedBy(null)
    service.broadcastOperation({
      resourceId,
      resourceType,
      operationType: 'update',
      data: { locked: false }
    })
  }, [resourceId, resourceType])

  useEffect(() => {
    service.on({
      onOperationReceived: (operation) => {
        if (
          operation.resourceId === resourceId &&
          operation.resourceType === resourceType &&
          operation.data?.locked !== undefined
        ) {
          setIsLocked(operation.data.locked)
          setLockedBy(operation.data.locked ? operation.userId : null)
        }
      }
    })
  }, [resourceId, resourceType])

  return {
    isLocked,
    lockedBy,
    lock,
    unlock
  }
}

/**
 * useCursorTracking Hook
 * Track and display real-time cursors
 */
export const useCursorTracking = (resourceId: string, resourceType: string) => {
  const [cursors, setCursors] = useState<Map<string, { user: OnlineUser; position: CursorPosition }>>(
    new Map()
  )
  const service = getCollaborationService()

  useEffect(() => {
    service.on({
      onCursorMoved: (userId, position) => {
        if (position.resourceId === resourceId && position.resourceType === resourceType) {
          const users = service.getOnlineUsers()
          const user = users.find((u) => u.userId === userId)
          if (user) {
            setCursors((prev) => {
              const next = new Map(prev)
              next.set(userId, { user, position })
              return next
            })
          }
        }
      },

      onUserLeft: (userId) => {
        setCursors((prev) => {
          const next = new Map(prev)
          next.delete(userId)
          return next
        })
      }
    })

    // Clean up stale cursors
    const interval = setInterval(() => {
      const now = Date.now()
      setCursors((prev) => {
        const next = new Map(prev)
        for (const [userId, { position }] of next.entries()) {
          if (now - new Date(position.timestamp).getTime() > 10000) {
            // 10 seconds timeout
            next.delete(userId)
          }
        }
        return next
      })
    }, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [resourceId, resourceType])

  const updateMyCursor = useCallback(
    (x: number, y: number) => {
      service.updateCursor({
        resourceId,
        resourceType,
        x,
        y,
        timestamp: new Date()
      })
    },
    [resourceId, resourceType]
  )

  return {
    cursors: Array.from(cursors.values()),
    updateMyCursor
  }
}
