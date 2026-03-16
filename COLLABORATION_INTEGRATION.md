# Collaboration Integration Guide

Quick guide to integrate real-time collaboration into existing AgentForge components.

## Quick Start

### 1. Install Dependencies (Already Available)

The collaboration system uses existing dependencies:
- `socket.io-client` - Already in package.json
- React hooks - Built-in

### 2. Initialize Socket Connection

In your main app component (e.g., `App.tsx`):

```typescript
import { initSocket } from './services/socket/socketClient'

useEffect(() => {
  // Initialize socket when user logs in
  if (user && token) {
    initSocket(token)
  }
}, [user, token])
```

### 3. Add Collaboration to Task Editing

Example integration in a task editor component:

```typescript
// In TaskEditor.tsx or similar component

import { useCollaboration } from '../hooks/useCollaboration'
import {
  CollaborationStatusBar,
  ActiveEditorsBadge,
  ConflictWarningBanner
} from '../components/CollaborationIndicators'

export const TaskEditor: React.FC<{ task: Task; user: User }> = ({ task, user }) => {
  const [taskData, setTaskData] = useState(task)

  // Enable collaboration
  const {
    activeEditors,
    conflicts,
    broadcastOperation,
    hasPermission
  } = useCollaboration({
    userId: user.id,
    username: user.name,
    resourceId: task.id,
    resourceType: 'task',
    autoJoinResource: true
  })

  // Handle task updates
  const handleTaskUpdate = (field: string, value: any) => {
    // Check permission
    if (!hasPermission('canEdit')) {
      toast.error('You do not have edit permission')
      return
    }

    // Update local state
    setTaskData(prev => ({ ...prev, [field]: value }))

    // Broadcast to other users
    broadcastOperation({
      resourceId: task.id,
      resourceType: 'task',
      operationType: 'update',
      data: { field, value }
    })
  }

  return (
    <div>
      {/* Add collaboration status bar */}
      <CollaborationStatusBar
        resourceId={task.id}
        resourceType="task"
      />

      {/* Show conflict warnings */}
      {conflicts.length > 0 && (
        <ConflictWarningBanner
          onResolve={() => {
            // Handle conflict resolution
            // Could reload from server or show merge UI
          }}
        />
      )}

      {/* Show who's editing */}
      {activeEditors.length > 1 && (
        <div className="mb-4">
          <ActiveEditorsBadge
            resourceId={task.id}
            resourceType="task"
            showNames={true}
          />
        </div>
      )}

      {/* Your existing task editor UI */}
      <input
        value={taskData.title}
        onChange={(e) => handleTaskUpdate('title', e.target.value)}
        disabled={!hasPermission('canEdit')}
      />
      {/* ... rest of your form ... */}
    </div>
  )
}
```

### 4. Add Collaboration to Agent Configuration

Example for agent editing:

```typescript
// In AgentConfigPanel.tsx

import { CollaborationPanel } from '../components/CollaborationExample'
import { useCollaboration } from '../hooks/useCollaboration'

export const AgentConfigPanel: React.FC<{ agent: Agent; user: User }> = ({ agent, user }) => {
  const { broadcastOperation, hasPermission } = useCollaboration({
    userId: user.id,
    username: user.name,
    resourceId: agent.id,
    resourceType: 'agent',
    autoJoinResource: true
  })

  const handleConfigChange = (config: AgentConfig) => {
    if (!hasPermission('canEdit')) return

    broadcastOperation({
      resourceId: agent.id,
      resourceType: 'agent',
      operationType: 'update',
      data: { config }
    })
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Main content */}
      <div className="col-span-9">
        {/* Your agent config UI */}
      </div>

      {/* Collaboration sidebar */}
      <div className="col-span-3">
        <CollaborationPanel
          resourceId={agent.id}
          resourceType="agent"
          userId={user.id}
          username={user.name}
        />
      </div>
    </div>
  )
}
```

### 5. Add Collaboration to Document Editing

For rich text or markdown editors:

```typescript
import { useCursorTracking } from '../hooks/useCollaboration'
import { CursorIndicator } from '../components/CollaborationIndicators'

export const DocumentEditor: React.FC = () => {
  const { cursors, updateMyCursor } = useCursorTracking('doc-123', 'document')

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    updateMyCursor(e.clientX - rect.left, e.clientY - rect.top)
  }

  return (
    <div className="relative" onMouseMove={handleMouseMove}>
      {/* Show other users' cursors */}
      {cursors.map(({ user, position }) => (
        <CursorIndicator key={user.userId} user={user} position={position} />
      ))}

      {/* Your editor */}
      <textarea className="w-full h-full" />
    </div>
  )
}
```

## Backend Integration

The backend WebSocket handlers are already implemented. Just ensure your backend server is running:

```bash
cd backend
npm install
npm run dev
```

The backend will automatically handle all collaboration events.

## Component Reference

### CollaborationStatusBar
Complete status bar showing online users, editors, and viewers.

```tsx
<CollaborationStatusBar
  resourceId="task-123"
  resourceType="task"
/>
```

### OnlineUsersList
Shows list of online users with avatars.

```tsx
<OnlineUsersList
  resourceId="task-123"
  resourceType="task"
/>
```

### ActiveEditorsBadge
Shows who's currently editing.

```tsx
<ActiveEditorsBadge
  resourceId="task-123"
  resourceType="task"
  showNames={true}
/>
```

### CollaborationActivityFeed
Shows recent collaborative operations.

```tsx
<CollaborationActivityFeed
  resourceId="task-123"
  resourceType="task"
  maxItems={10}
/>
```

### CollaborationPanel
Complete collaboration sidebar panel.

```tsx
<CollaborationPanel
  resourceId="task-123"
  resourceType="task"
  userId={user.id}
  username={user.name}
  teamId={team.id}
/>
```

## Testing

1. Open two browser windows
2. Login as different users
3. Navigate to the same resource
4. Make changes in one window
5. See changes reflected in real-time in the other window

## Troubleshooting

### Not seeing other users?
- Check WebSocket connection in browser console
- Verify backend is running
- Ensure authentication token is valid

### Changes not syncing?
- Check `broadcastOperation()` is being called
- Verify operation data structure
- Check browser console for errors

### Permission errors?
- Verify user has correct permissions
- Check `hasPermission()` before operations
- Ensure permission system is initialized

## Performance Tips

1. **Throttle high-frequency updates** (cursor movements, typing)
   ```typescript
   const throttledUpdate = throttle(broadcastOperation, 100)
   ```

2. **Debounce text input**
   ```typescript
   const debouncedUpdate = debounce(broadcastOperation, 500)
   ```

3. **Use resource locking** for exclusive editing
   ```typescript
   const { lock, unlock } = useResourceLock(resourceId, resourceType)
   ```

4. **Limit operation history**
   - Default: 1000 operations
   - Configurable in `collaborationService.ts`

## Next Steps

1. Add collaboration to remaining pages:
   - Agent detail page
   - Task management
   - Team settings
   - Project planning

2. Enhance with additional features:
   - Voice chat integration
   - Screen sharing
   - Video conferencing
   - Rich presence (typing indicators, etc.)

3. Optimize performance:
   - Implement operation batching
   - Add compression for large operations
   - Use IndexedDB for offline support

## Support

For questions or issues:
1. Check `docs/COLLABORATION.md` for detailed documentation
2. Review example in `src/components/CollaborationExample.tsx`
3. Open GitHub issue with collaboration tag
