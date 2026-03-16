/**
 * Collaboration Indicators
 * UI components for visualizing multi-user collaboration
 *
 * Features:
 * - Online users list
 * - Active editors indicator
 * - Real-time cursor display
 * - User avatars and status
 */

import React, { useEffect, useState } from 'react'
import { Users, Eye, Edit3, Circle } from 'lucide-react'
import {
  getCollaborationService,
  OnlineUser,
  CursorPosition,
  CollaborativeOperation
} from '../services/collaborationService'

/**
 * Online Users List Component
 */
export const OnlineUsersList: React.FC<{ resourceId?: string; resourceType?: string }> = ({
  resourceId,
  resourceType
}) => {
  const [users, setUsers] = useState<OnlineUser[]>([])
  const collabService = getCollaborationService()

  useEffect(() => {
    const updateUsers = () => {
      if (resourceId && resourceType) {
        setUsers(collabService.getUsersOnResource(resourceId, resourceType))
      } else {
        setUsers(collabService.getOnlineUsers())
      }
    }

    // Initial load
    updateUsers()

    // Setup callbacks
    collabService.on({
      onUserJoined: () => updateUsers(),
      onUserLeft: () => updateUsers(),
      onUserStatusChanged: () => updateUsers()
    })

    // Periodic update
    const interval = setInterval(updateUsers, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [resourceId, resourceType])

  if (users.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <Users className="w-4 h-4 text-gray-500" />
      <div className="flex items-center gap-1">
        {users.map((user) => (
          <UserAvatar key={user.userId} user={user} />
        ))}
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
        {users.length} online
      </span>
    </div>
  )
}

/**
 * User Avatar Component with Status Indicator
 */
export const UserAvatar: React.FC<{ user: OnlineUser; size?: 'sm' | 'md' | 'lg' }> = ({
  user,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  }

  const statusColors = {
    online: 'bg-green-500',
    idle: 'bg-yellow-500',
    away: 'bg-gray-400'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="relative group" title={`${user.username} (${user.status})`}>
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.username}
          className={`${sizeClasses[size]} rounded-full border-2 border-white dark:border-gray-700 object-cover`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full border-2 border-white dark:border-gray-700 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium`}
        >
          {getInitials(user.username)}
        </div>
      )}

      {/* Status indicator */}
      <div
        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800 ${statusColors[user.status]}`}
      />

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {user.username}
        {user.currentResource && (
          <div className="text-xs text-gray-400">Editing: {user.currentResource}</div>
        )}
      </div>
    </div>
  )
}

/**
 * Active Editors Badge
 */
export const ActiveEditorsBadge: React.FC<{
  resourceId: string
  resourceType: string
  showNames?: boolean
}> = ({ resourceId, resourceType, showNames = true }) => {
  const [editors, setEditors] = useState<OnlineUser[]>([])
  const collabService = getCollaborationService()

  useEffect(() => {
    const updateEditors = () => {
      const users = collabService.getUsersOnResource(resourceId, resourceType)
      const activeEditors = users.filter((u) => u.permissions.canEdit)
      setEditors(activeEditors)
    }

    updateEditors()

    collabService.on({
      onUserJoined: () => updateEditors(),
      onUserLeft: () => updateEditors(),
      onPermissionChanged: () => updateEditors()
    })

    const interval = setInterval(updateEditors, 3000)

    return () => {
      clearInterval(interval)
    }
  }, [resourceId, resourceType])

  if (editors.length === 0) {
    return null
  }

  return (
    <div className="inline-flex items-center gap-2 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-sm">
      <Edit3 className="w-3 h-3" />
      <div className="flex items-center gap-1">
        {editors.map((editor) => (
          <UserAvatar key={editor.userId} user={editor} size="sm" />
        ))}
      </div>
      {showNames && editors.length === 1 && (
        <span className="text-xs">{editors[0].username} is editing</span>
      )}
      {showNames && editors.length > 1 && (
        <span className="text-xs">{editors.length} people editing</span>
      )}
    </div>
  )
}

/**
 * Viewer Badge (read-only users)
 */
export const ViewersBadge: React.FC<{
  resourceId: string
  resourceType: string
}> = ({ resourceId, resourceType }) => {
  const [viewers, setViewers] = useState<OnlineUser[]>([])
  const collabService = getCollaborationService()

  useEffect(() => {
    const updateViewers = () => {
      const users = collabService.getUsersOnResource(resourceId, resourceType)
      const readOnlyViewers = users.filter((u) => !u.permissions.canEdit)
      setViewers(readOnlyViewers)
    }

    updateViewers()

    collabService.on({
      onUserJoined: () => updateViewers(),
      onUserLeft: () => updateViewers(),
      onPermissionChanged: () => updateViewers()
    })

    const interval = setInterval(updateViewers, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [resourceId, resourceType])

  if (viewers.length === 0) {
    return null
  }

  return (
    <div className="inline-flex items-center gap-2 px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-sm">
      <Eye className="w-3 h-3" />
      <div className="flex items-center gap-1">
        {viewers.slice(0, 3).map((viewer) => (
          <UserAvatar key={viewer.userId} user={viewer} size="sm" />
        ))}
      </div>
      {viewers.length > 3 && <span className="text-xs">+{viewers.length - 3}</span>}
    </div>
  )
}

/**
 * Cursor Position Indicator
 */
export const CursorIndicator: React.FC<{
  user: OnlineUser
  position: CursorPosition
}> = ({ user, position }) => {
  const getUserColor = (userId: string) => {
    // Generate consistent color based on userId
    const hash = userId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)

    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 70%, 60%)`
  }

  return (
    <div
      className="absolute pointer-events-none z-50 transition-all duration-150"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        color: getUserColor(user.userId)
      }}
    >
      {/* Cursor arrow */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="drop-shadow-lg"
      >
        <path d="M0 0 L0 16 L5 11 L8 20 L10 19 L7 10 L12 10 Z" />
      </svg>

      {/* User name label */}
      <div
        className="absolute left-5 top-0 px-2 py-0.5 rounded text-white text-xs whitespace-nowrap shadow-lg"
        style={{ backgroundColor: getUserColor(user.userId) }}
      >
        {user.username}
      </div>
    </div>
  )
}

/**
 * Activity Feed Component
 */
export const CollaborationActivityFeed: React.FC<{
  maxItems?: number
  resourceId?: string
  resourceType?: string
}> = ({ maxItems = 10, resourceId, resourceType }) => {
  const [activities, setActivities] = useState<CollaborativeOperation[]>([])
  const collabService = getCollaborationService()

  useEffect(() => {
    collabService.on({
      onOperationReceived: (operation) => {
        // Filter by resource if specified
        if (resourceId && resourceType) {
          if (operation.resourceId === resourceId && operation.resourceType === resourceType) {
            setActivities((prev) => [operation, ...prev].slice(0, maxItems))
          }
        } else {
          setActivities((prev) => [operation, ...prev].slice(0, maxItems))
        }
      }
    })
  }, [maxItems, resourceId, resourceType])

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'create':
        return <Circle className="w-3 h-3 text-green-500" />
      case 'update':
        return <Edit3 className="w-3 h-3 text-blue-500" />
      case 'delete':
        return <Circle className="w-3 h-3 text-red-500" />
      default:
        return <Circle className="w-3 h-3 text-gray-500" />
    }
  }

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)

    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (activities.length === 0) {
    return (
      <div className="text-center text-sm text-gray-500 py-4">No recent activity</div>
    )
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
        >
          <div className="mt-0.5">{getOperationIcon(activity.operationType)}</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 dark:text-white truncate">
              {activity.username}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {activity.operationType} {activity.resourceType}
            </div>
          </div>
          <div className="text-xs text-gray-500 whitespace-nowrap">
            {getTimeAgo(activity.timestamp)}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Collaboration Status Bar
 */
export const CollaborationStatusBar: React.FC<{
  resourceId: string
  resourceType: string
  className?: string
}> = ({ resourceId, resourceType, className = '' }) => {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <OnlineUsersList resourceId={resourceId} resourceType={resourceType} />
      <div className="flex items-center gap-2">
        <ActiveEditorsBadge
          resourceId={resourceId}
          resourceType={resourceType}
          showNames={false}
        />
        <ViewersBadge resourceId={resourceId} resourceType={resourceType} />
      </div>
    </div>
  )
}

/**
 * Conflict Warning Banner
 */
export const ConflictWarningBanner: React.FC<{
  onResolve?: () => void
  onCancel?: () => void
}> = ({ onResolve, onCancel }) => {
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-yellow-600 dark:text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Edit Conflict Detected
          </h3>
          <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
            Another user modified this resource while you were editing. Your changes may
            conflict with theirs.
          </p>
          {(onResolve || onCancel) && (
            <div className="mt-3 flex gap-2">
              {onResolve && (
                <button
                  onClick={onResolve}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-md transition-colors"
                >
                  Resolve Conflict
                </button>
              )}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm rounded-md transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
