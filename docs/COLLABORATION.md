# Real-time Collaboration System

Complete documentation for AgentForge's multi-user real-time collaboration features.

## Overview

The collaboration system enables multiple users to work together on tasks, agents, and documents in real-time with conflict detection and resolution.

## Features

### 1. Multi-User Support
- Online user tracking and presence
- User status indicators (online, idle, away)
- User avatars and profiles
- Automatic idle/away detection

### 2. Real-time Cursor Positions
- Live cursor tracking for all users
- Color-coded cursors per user
- Smooth cursor animations
- 10-second timeout for stale cursors

### 3. Operation Conflict Detection
- Vector clock algorithm for causality tracking
- Concurrent edit detection (5-second window)
- Version mismatch detection
- Permission-based conflict checking

### 4. Operation Broadcasting
- Real-time operation synchronization
- Operation history tracking (max 1000 operations)
- Efficient delta updates
- Automatic retry on network failures

### 5. User Permission Management
- Role-based access control (owner, admin, editor, viewer)
- Granular permissions (canEdit, canDelete, canShare)
- Dynamic permission updates
- Permission change notifications

### 6. Conflict Resolution Strategies

#### Last Write Wins (Default)
- Simple and fast
- Latest operation takes precedence
- Best for low-conflict scenarios

#### Operational Transformation
- Advanced conflict resolution
- Merges concurrent edits intelligently
- Preserves user intent
- Best for high-conflict scenarios

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  Components                                                  │
│  ├─ CollaborationIndicators.tsx (UI components)             │
│  └─ CollaborationExample.tsx (Demo implementation)          │
│                                                              │
│  Hooks                                                       │
│  ├─ useCollaboration.ts (Main hook)                         │
│  ├─ useResourceLock.ts (Resource locking)                   │
│  └─ useCursorTracking.ts (Cursor tracking)                  │
│                                                              │
│  Services                                                    │
│  └─ collaborationService.ts (Core logic)                    │
│      ├─ CollaborationService class                          │
│      ├─ Presence management                                 │
│      ├─ Operation broadcasting                              │
│      ├─ Conflict detection                                  │
│      └─ Vector clock synchronization                        │
├─────────────────────────────────────────────────────────────┤
│                    WebSocket Layer                           │
│  ├─ socketClient.ts (Socket.io client)                      │
│  └─ Event handlers (collab:*)                               │
├─────────────────────────────────────────────────────────────┤
│                     Backend (Node.js)                        │
│  └─ socketService.ts (Socket.io server)                     │
│      ├─ handleCollaborationEvents()                         │
│      ├─ Broadcasting logic                                  │
│      └─ Room management                                     │
└─────────────────────────────────────────────────────────────┘
```

## Usage

### Basic Setup

```typescript
import { useCollaboration } from '../hooks/useCollaboration'
import { CollaborationStatusBar } from '../components/CollaborationIndicators'

function MyComponent() {
  const {
    onlineUsers,
    activeEditors,
    broadcastOperation,
    hasPermission
  } = useCollaboration({
    userId: 'user-123',
    username: 'John Doe',
    teamId: 'team-456',
    resourceId: 'task-789',
    resourceType: 'task',
    autoJoinResource: true,
    permissions: {
      canEdit: true,
      canDelete: false,
      canShare: false,
      role: 'editor'
    }
  })

  const handleEdit = (data: any) => {
    if (!hasPermission('canEdit')) return

    broadcastOperation({
      resourceId: 'task-789',
      resourceType: 'task',
      operationType: 'update',
      data
    })
  }

  return (
    <div>
      <CollaborationStatusBar
        resourceId="task-789"
        resourceType="task"
      />
      {/* Your content */}
    </div>
  )
}
```

### Advanced Usage - Cursor Tracking

```typescript
import { useCursorTracking } from '../hooks/useCollaboration'
import { CursorIndicator } from '../components/CollaborationIndicators'

function CollaborativeCanvas() {
  const { cursors, updateMyCursor } = useCursorTracking('canvas-1', 'document')

  const handleMouseMove = (e: React.MouseEvent) => {
    updateMyCursor(e.clientX, e.clientY)
  }

  return (
    <div onMouseMove={handleMouseMove} style={{ position: 'relative' }}>
      {cursors.map(({ user, position }) => (
        <CursorIndicator key={user.userId} user={user} position={position} />
      ))}
      {/* Your canvas content */}
    </div>
  )
}
```

### Resource Locking

```typescript
import { useResourceLock } from '../hooks/useCollaboration'

function ExclusiveEditor() {
  const { isLocked, lockedBy, lock, unlock } = useResourceLock('doc-1', 'document')

  const handleStartEdit = () => {
    if (!isLocked) {
      lock()
      // Start editing
    }
  }

  const handleFinishEdit = () => {
    unlock()
    // Finish editing
  }

  return (
    <div>
      {isLocked && <p>Locked by: {lockedBy}</p>}
      <button onClick={handleStartEdit} disabled={isLocked}>
        Edit
      </button>
    </div>
  )
}
```

## API Reference

### CollaborationService

#### Methods

- `initialize(userId, username, teamId?)` - Initialize collaboration session
- `joinResource(resourceId, resourceType, permissions?)` - Join a collaborative resource
- `leaveResource(resourceId, resourceType)` - Leave a resource
- `updateCursor(position)` - Update cursor position
- `broadcastOperation(operation)` - Broadcast an operation
- `getOnlineUsers()` - Get list of online users
- `getUsersOnResource(resourceId, resourceType)` - Get users on specific resource
- `updateUserPermissions(userId, permissions)` - Update user permissions
- `hasPermission(userId, action)` - Check if user has permission

#### Events

- `onUserJoined` - User joined collaboration
- `onUserLeft` - User left collaboration
- `onUserStatusChanged` - User status changed
- `onCursorMoved` - Cursor position updated
- `onOperationReceived` - Operation received from another user
- `onConflictDetected` - Conflict detected
- `onPermissionChanged` - Permission changed

### WebSocket Events

#### Client → Server

- `collab:presence` - Broadcast presence update
- `collab:cursor_moved` - Broadcast cursor movement
- `collab:operation` - Broadcast operation
- `collab:status` - Update user status
- `collab:permission_changed` - Change user permission
- `collab:leave` - Leave collaboration session
- `collab:lock` - Lock/unlock resource
- `collab:conflict` - Report conflict

#### Server → Client

- `collab:presence` - Presence update from other user
- `collab:cursor_moved` - Cursor moved by other user
- `collab:operation` - Operation from other user
- `collab:status` - Status change from other user
- `collab:permission_changed` - Permission changed
- `collab:leave` - User left
- `collab:lock` - Resource locked/unlocked
- `collab:conflict` - Conflict notification

## UI Components

### OnlineUsersList
Displays list of online users with avatars and status indicators.

### UserAvatar
Individual user avatar with status badge (online/idle/away).

### ActiveEditorsBadge
Shows users currently editing a resource.

### ViewersBadge
Shows users viewing (but not editing) a resource.

### CursorIndicator
Displays real-time cursor position for other users.

### CollaborationActivityFeed
Shows recent collaborative operations.

### CollaborationStatusBar
Complete status bar with all collaboration indicators.

### ConflictWarningBanner
Warning banner displayed when conflicts are detected.

## Configuration

### Service Configuration

```typescript
// In collaborationService.ts
private readonly IDLE_TIMEOUT = 300000 // 5 minutes
private readonly AWAY_TIMEOUT = 900000 // 15 minutes
private readonly ACTIVITY_CHECK_INTERVAL = 60000 // 1 minute
private readonly MAX_OPERATION_HISTORY = 1000
private readonly CONFLICT_RESOLUTION_STRATEGY = 'last_write_wins'
```

### Socket Configuration

```typescript
// In socketClient.ts
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
})
```

## Best Practices

### 1. Initialize Early
Initialize collaboration service as early as possible in your app lifecycle.

```typescript
useEffect(() => {
  if (user) {
    initCollaboration(user.id, user.username, teamId)
  }
}, [user])
```

### 2. Clean Up Resources
Always leave resources and destroy service on unmount.

```typescript
useEffect(() => {
  service.joinResource(resourceId, resourceType)

  return () => {
    service.leaveResource(resourceId, resourceType)
  }
}, [resourceId])
```

### 3. Throttle Operations
Throttle high-frequency operations like cursor movements.

```typescript
import { throttle } from 'lodash'

const throttledUpdateCursor = throttle(updateMyCursor, 100)
```

### 4. Handle Conflicts Gracefully
Always provide UI feedback for conflicts.

```typescript
useEffect(() => {
  service.on({
    onConflictDetected: (conflict) => {
      // Show conflict warning banner
      setShowConflictWarning(true)

      // Log conflict for debugging
      console.warn('Conflict:', conflict)
    }
  })
}, [])
```

### 5. Check Permissions
Always check permissions before allowing operations.

```typescript
const handleEdit = () => {
  if (!hasPermission('canEdit')) {
    toast.error('You do not have permission to edit')
    return
  }

  // Proceed with edit
}
```

## Performance Considerations

1. **Operation History**: Limited to 1000 operations to prevent memory issues
2. **Cursor Updates**: Throttled to 100ms to reduce network traffic
3. **User List Updates**: Polled every 5 seconds instead of real-time
4. **Stale Cursor Cleanup**: Cursors removed after 10 seconds of inactivity
5. **Activity Monitoring**: Checked every 60 seconds

## Security

1. **Authentication**: All WebSocket connections require valid JWT token
2. **Authorization**: Permission checks on every operation
3. **Rate Limiting**: Prevent spam by throttling operations
4. **Input Validation**: All operations validated before broadcasting
5. **Room Isolation**: Users can only see operations in their rooms

## Troubleshooting

### Users Not Appearing Online
- Check WebSocket connection status
- Verify authentication token is valid
- Ensure user called `initialize()` method
- Check browser console for errors

### Cursor Not Updating
- Verify `updateCursor()` is being called
- Check if cursor position is within resource bounds
- Ensure cursor tracking hook is properly initialized

### Conflicts Not Detected
- Verify vector clock is being updated
- Check conflict detection configuration
- Ensure operations have proper timestamps

### Performance Issues
- Reduce cursor update frequency
- Limit operation history size
- Use resource locking for exclusive editing
- Implement pagination for user lists

## Future Enhancements

1. **Yjs Integration**: Full OT algorithm support using Yjs library
2. **CRDT Support**: Conflict-free replicated data types
3. **Presence Awareness**: Rich presence information (typing, viewing, etc.)
4. **Audio/Video**: WebRTC integration for voice/video chat
5. **Screen Sharing**: Share screen with team members
6. **Collaborative Cursors**: Text selection and highlights
7. **Undo/Redo**: Collaborative undo/redo stack
8. **Offline Support**: Queue operations when offline

## License

MIT License - See LICENSE file for details

## Support

For issues and questions, please open a GitHub issue or contact the development team.
