/**
 * Collaboration Example Component
 * Demonstrates how to use the collaboration service and hooks
 *
 * This component can be integrated into task editing, agent configuration,
 * or any other collaborative feature in AgentForge
 */

import React, { useEffect, useRef, useState } from 'react'
import { useCollaboration, useCursorTracking, useResourceLock } from '../hooks/useCollaboration'
import {
  OnlineUsersList,
  ActiveEditorsBadge,
  ViewersBadge,
  CursorIndicator,
  CollaborationActivityFeed,
  CollaborationStatusBar,
  ConflictWarningBanner
} from './CollaborationIndicators'
import { Edit3, Lock, Unlock, Save } from 'lucide-react'

interface CollaborativeEditorProps {
  resourceId: string
  resourceType: 'task' | 'agent' | 'document'
  userId: string
  username: string
  teamId?: string
  onSave?: (data: any) => void
}

/**
 * Collaborative Editor Example
 */
export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  resourceId,
  resourceType,
  userId,
  username,
  teamId,
  onSave
}) => {
  const [content, setContent] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  // Initialize collaboration
  const {
    onlineUsers,
    activeEditors,
    conflicts,
    isInitialized,
    broadcastOperation,
    hasPermission
  } = useCollaboration({
    userId,
    username,
    teamId,
    resourceId,
    resourceType,
    autoJoinResource: true,
    permissions: {
      canEdit: true,
      canDelete: false,
      canShare: false,
      role: 'editor'
    }
  })

  // Resource locking
  const { isLocked, lockedBy, lock, unlock } = useResourceLock(resourceId, resourceType)

  // Cursor tracking
  const { cursors, updateMyCursor } = useCursorTracking(resourceId, resourceType)

  // Can current user edit?
  const canEdit = hasPermission('canEdit') && (!isLocked || lockedBy === userId)

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    setHasUnsavedChanges(true)

    // Broadcast the change
    if (canEdit) {
      broadcastOperation({
        resourceId,
        resourceType,
        operationType: 'update',
        data: {
          content: newContent,
          field: 'content',
          timestamp: new Date()
        }
      })
    }
  }

  // Handle cursor movement
  const handleMouseMove = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (!editorRef.current) return

    const rect = editorRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    updateMyCursor(x, y)
  }

  // Handle save
  const handleSave = () => {
    if (onSave) {
      onSave({ content })
      setHasUnsavedChanges(false)

      // Broadcast save operation
      broadcastOperation({
        resourceId,
        resourceType,
        operationType: 'update',
        data: {
          action: 'save',
          timestamp: new Date()
        }
      })
    }
  }

  // Handle lock/unlock
  const handleLockToggle = () => {
    if (isLocked && lockedBy === userId) {
      unlock()
    } else if (!isLocked) {
      lock()
    }
  }

  // Display conflict warnings
  const hasConflicts = conflicts.length > 0

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      {/* Header with collaboration status */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Collaborative Editor
          </h2>
          {isLocked && (
            <span className="flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400">
              <Lock className="w-4 h-4" />
              {lockedBy === userId ? 'Locked by you' : 'Locked'}
            </span>
          )}
        </div>

        <CollaborationStatusBar
          resourceId={resourceId}
          resourceType={resourceType}
          className="flex-shrink-0"
        />
      </div>

      {/* Conflict warning */}
      {hasConflicts && (
        <div className="p-4">
          <ConflictWarningBanner
            onResolve={() => {
              // Handle conflict resolution
              console.log('Resolving conflicts...')
            }}
            onCancel={() => {
              // Cancel and reload
              console.log('Canceling changes...')
            }}
          />
        </div>
      )}

      {/* Main editor area */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Editor with cursors */}
        <div className="flex-1 relative">
          <div className="relative h-full">
            {/* Cursor indicators */}
            {cursors.map(({ user, position }) => (
              <CursorIndicator key={user.userId} user={user} position={position} />
            ))}

            {/* Textarea */}
            <textarea
              ref={editorRef}
              value={content}
              onChange={handleContentChange}
              onMouseMove={handleMouseMove}
              disabled={!canEdit}
              placeholder={
                canEdit
                  ? 'Start typing... Your changes will be visible to all collaborators in real-time.'
                  : isLocked
                  ? 'This resource is currently locked for editing.'
                  : 'You do not have permission to edit.'
              }
              className="w-full h-full p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
            />

            {/* Active editors indicator */}
            {activeEditors.length > 1 && (
              <div className="absolute top-2 right-2">
                <ActiveEditorsBadge
                  resourceId={resourceId}
                  resourceType={resourceType}
                  showNames={true}
                />
              </div>
            )}
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              {/* Lock/Unlock button */}
              <button
                onClick={handleLockToggle}
                disabled={isLocked && lockedBy !== userId}
                className="flex items-center gap-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLocked ? (
                  <>
                    <Unlock className="w-4 h-4" />
                    Unlock
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Lock
                  </>
                )}
              </button>

              {/* Viewers badge */}
              <ViewersBadge resourceId={resourceId} resourceType={resourceType} />
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={!canEdit || !hasUnsavedChanges}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
            </button>
          </div>
        </div>

        {/* Activity sidebar */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 pl-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Activity Feed
          </h3>
          <CollaborationActivityFeed
            resourceId={resourceId}
            resourceType={resourceType}
            maxItems={20}
          />

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Online Users ({onlineUsers.length})
            </h3>
            <OnlineUsersList resourceId={resourceId} resourceType={resourceType} />
          </div>
        </div>
      </div>

      {/* Footer with stats */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
        <div>
          {isInitialized ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Connected
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              Connecting...
            </span>
          )}
        </div>
        <div>
          {activeEditors.length} editing • {onlineUsers.length} online
        </div>
      </div>
    </div>
  )
}

/**
 * Simplified Collaboration Panel
 * Can be added to existing pages
 */
export const CollaborationPanel: React.FC<{
  resourceId: string
  resourceType: string
  userId: string
  username: string
  teamId?: string
}> = ({ resourceId, resourceType, userId, username, teamId }) => {
  const { onlineUsers, activeEditors, recentOperations, isInitialized } = useCollaboration({
    userId,
    username,
    teamId,
    resourceId,
    resourceType,
    autoJoinResource: true
  })

  if (!isInitialized) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-2" />
        Initializing collaboration...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <CollaborationStatusBar
        resourceId={resourceId}
        resourceType={resourceType}
      />

      {/* Active editors */}
      {activeEditors.length > 0 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <Edit3 className="w-4 h-4" />
            <span>
              {activeEditors.length === 1
                ? `${activeEditors[0].username} is editing`
                : `${activeEditors.length} people are editing`}
            </span>
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Recent Activity
        </h4>
        <CollaborationActivityFeed
          resourceId={resourceId}
          resourceType={resourceType}
          maxItems={5}
        />
      </div>
    </div>
  )
}
