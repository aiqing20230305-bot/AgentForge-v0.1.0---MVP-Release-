# Team Collaboration System - Integration Guide

## Quick Integration

### Step 1: Import the TeamPanel Component

In your main navigation component (e.g., `MainNavigationTabs.tsx`), add a new tab for teams:

```tsx
import TeamPanel from './TeamPanel'

// Add to your navigation tabs
const tabs = [
  // ... existing tabs
  {
    id: 'teams',
    label: 'Teams',
    icon: Users,
    component: <TeamPanel />
  }
]
```

### Step 2: Add Team Navigation Button

In `TopBar.tsx` or similar, add a quick access button:

```tsx
import { Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom' // if using routing

function TopBar() {
  const navigate = useNavigate()

  return (
    <div className="top-bar">
      {/* ... other buttons */}

      <button
        onClick={() => navigate('/teams')}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2"
      >
        <Users className="w-4 h-4" />
        Teams
      </button>
    </div>
  )
}
```

### Step 3: Alternative - Modal Integration

If you prefer a modal approach:

```tsx
import { useState } from 'react'
import TeamPanel from './components/TeamPanel'

function App() {
  const [showTeamPanel, setShowTeamPanel] = useState(false)

  return (
    <>
      <button onClick={() => setShowTeamPanel(true)}>
        Open Teams
      </button>

      {showTeamPanel && (
        <div className="fixed inset-0 z-50">
          <TeamPanel />
          <button
            onClick={() => setShowTeamPanel(false)}
            className="absolute top-4 right-4"
          >
            Close
          </button>
        </div>
      )}
    </>
  )
}
```

## Advanced Usage

### Using Team Store Directly

```typescript
import { useTeamStore } from './store/useTeamStore'
import { useDataSourceStore } from './store/useDataSourceStore'

function MyComponent() {
  const {
    teams,
    createTeam,
    addMember,
    createTeamTask,
    autoAssignTask
  } = useTeamStore()

  const { agentsCache } = useDataSourceStore()

  // Create a team
  const handleCreateTeam = () => {
    const teamId = createTeam(
      'Backend Team',
      'Handling backend development',
      'agent-1' // leader agent ID
    )

    // Add the leader as a member
    const leader = agentsCache.find(a => a.id === 'agent-1')
    if (leader) {
      addMember(teamId, leader.id, leader.displayName, 'leader')
    }

    // Add other members
    const member = agentsCache.find(a => a.id === 'agent-2')
    if (member) {
      addMember(teamId, member.id, member.displayName, 'member')
    }
  }

  // Create and auto-assign a task
  const handleCreateTask = (teamId: string) => {
    const taskId = createTeamTask(teamId, {
      title: 'Implement REST API',
      description: 'Create endpoints for user management',
      priority: 'high',
      createdBy: 'agent-1',
      requiredSkills: ['backend', 'API design', 'database']
    })

    // Auto-assign based on skills and workload
    const result = autoAssignTask(teamId, taskId, agentsCache, {
      type: 'skills',
      skillMatchWeight: 0.6,
      workloadWeight: 0.4,
      considerStatus: true
    })

    if (result) {
      console.log(`Task assigned to: ${result.assignedToName}`)
      console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`)
    }
  }

  return (
    <div>
      <button onClick={handleCreateTeam}>Create Team</button>
      {/* ... */}
    </div>
  )
}
```

### Listening to Team Events

```typescript
import { useEffect } from 'react'
import { useTeamStore } from './store/useTeamStore'
import { useNotificationStore } from './store/useNotificationStore'

function TeamEventMonitor() {
  const { teams, getTeamMessages } = useTeamStore()
  const { addNotification } = useNotificationStore()

  useEffect(() => {
    // Monitor team messages for system events
    teams.forEach(team => {
      const messages = getTeamMessages(team.id)
      const recentMessages = messages.slice(-5) // last 5 messages

      recentMessages.forEach(msg => {
        if (msg.type === 'system') {
          // Show notification for system events
          addNotification({
            type: 'info',
            title: `Team: ${team.name}`,
            message: msg.content
          })
        }
      })
    })
  }, [teams, getTeamMessages, addNotification])

  return null // This is a background monitor
}
```

### Custom Task Assignment Logic

```typescript
import { useTeamStore } from './store/useTeamStore'

function CustomTaskAssignment() {
  const { autoAssignTask } = useTeamStore()

  // Workload-based assignment
  const assignByWorkload = (teamId: string, taskId: string, agents: any[]) => {
    return autoAssignTask(teamId, taskId, agents, {
      type: 'workload',
      workloadWeight: 1.0,
      skillMatchWeight: 0.0,
      considerStatus: true
    })
  }

  // Skills-based assignment
  const assignBySkills = (teamId: string, taskId: string, agents: any[]) => {
    return autoAssignTask(teamId, taskId, agents, {
      type: 'skills',
      workloadWeight: 0.0,
      skillMatchWeight: 1.0,
      considerStatus: true
    })
  }

  // Balanced assignment (default)
  const assignBalanced = (teamId: string, taskId: string, agents: any[]) => {
    return autoAssignTask(teamId, taskId, agents, {
      type: 'workload',
      workloadWeight: 0.6,
      skillMatchWeight: 0.4,
      considerStatus: true
    })
  }

  return { assignByWorkload, assignBySkills, assignBalanced }
}
```

## WebSocket Integration (Future)

When you're ready to add real-time features:

```typescript
// Add to useTeamStore.ts

interface TeamStore {
  // ... existing

  // WebSocket methods
  wsConnected: boolean
  connectWebSocket: (teamId: string) => void
  disconnectWebSocket: (teamId: string) => void

  // Real-time event handlers
  onTeamUpdate: (callback: (team: Team) => void) => () => void
  onMessageReceived: (callback: (message: TeamChatMessage) => void) => () => void
  onTaskAssigned: (callback: (task: TeamTask) => void) => () => void
}

// Implementation
export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      // ... existing

      wsConnected: false,

      connectWebSocket: (teamId) => {
        const ws = new WebSocket(`ws://your-server.com/teams/${teamId}`)

        ws.onopen = () => {
          set({ wsConnected: true })
        }

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data)

          switch (data.type) {
            case 'team_update':
              // Update team data
              break
            case 'message':
              // Add message to chat
              break
            case 'task_assigned':
              // Update task status
              break
          }
        }

        ws.onclose = () => {
          set({ wsConnected: false })
        }
      },

      // ... more implementations
    })
  )
)
```

## Styling Customization

### Custom Theme Colors

```tsx
// In TeamPanel.tsx or create a theme config

const teamTheme = {
  primary: '#3b82f6', // blue-500
  success: '#10b981', // green-500
  warning: '#f59e0b', // amber-500
  error: '#ef4444',   // red-500
  info: '#8b5cf6'     // purple-500
}

// Use in components
<div style={{ backgroundColor: teamTheme.primary }}>
  {/* content */}
</div>
```

### Custom Component Styles

```tsx
// Override default styles
const customStyles = {
  teamCard: 'bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-6',
  memberCard: 'bg-slate-800/50 backdrop-blur-sm rounded-lg p-4',
  taskCard: 'border-l-4 border-blue-500 bg-slate-800 p-4'
}
```

## Testing

### Unit Tests Example

```typescript
import { renderHook, act } from '@testing-library/react'
import { useTeamStore } from './store/useTeamStore'

describe('useTeamStore', () => {
  it('should create a team', () => {
    const { result } = renderHook(() => useTeamStore())

    act(() => {
      const teamId = result.current.createTeam(
        'Test Team',
        'A test team',
        'agent-1'
      )
      expect(teamId).toBeDefined()
    })

    expect(result.current.teams).toHaveLength(1)
    expect(result.current.teams[0].name).toBe('Test Team')
  })

  it('should add a member', () => {
    const { result } = renderHook(() => useTeamStore())

    act(() => {
      const teamId = result.current.createTeam('Test', 'Test', 'agent-1')
      result.current.addMember(teamId, 'agent-2', 'ORACLE', 'member')
    })

    const team = result.current.teams[0]
    expect(team.members).toHaveLength(1)
    expect(team.members[0].agentId).toBe('agent-2')
  })

  it('should auto-assign task based on workload', () => {
    const { result } = renderHook(() => useTeamStore())

    const mockAgents = [
      { id: 'agent-1', name: 'ATLAS', skills: ['backend'], status: 'online' },
      { id: 'agent-2', name: 'ORACLE', skills: ['frontend'], status: 'online' }
    ]

    act(() => {
      const teamId = result.current.createTeam('Test', 'Test', 'agent-1')
      result.current.addMember(teamId, 'agent-1', 'ATLAS', 'leader')
      result.current.addMember(teamId, 'agent-2', 'ORACLE', 'member')

      const taskId = result.current.createTeamTask(teamId, {
        title: 'Test Task',
        description: 'Test',
        priority: 'medium',
        createdBy: 'agent-1'
      })

      const assignment = result.current.autoAssignTask(
        teamId,
        taskId,
        mockAgents as any,
        { type: 'workload' }
      )

      expect(assignment).toBeDefined()
      expect(assignment?.assignedTo).toBe('agent-1')
    })
  })
})
```

## Performance Tips

### 1. Lazy Load Team Panel

```tsx
import { lazy, Suspense } from 'react'

const TeamPanel = lazy(() => import('./components/TeamPanel'))

function App() {
  return (
    <Suspense fallback={<div>Loading Teams...</div>}>
      <TeamPanel />
    </Suspense>
  )
}
```

### 2. Memoize Expensive Calculations

```tsx
import { useMemo } from 'react'
import { useTeamStore } from './store/useTeamStore'

function TeamStats({ teamId }: { teamId: string }) {
  const { teams } = useTeamStore()

  const stats = useMemo(() => {
    const team = teams.find(t => t.id === teamId)
    if (!team) return null

    // Expensive calculations
    return {
      successRate: team.stats.totalTasks > 0
        ? team.stats.completedTasks / team.stats.totalTasks
        : 0,
      // ... more stats
    }
  }, [teams, teamId])

  return <div>{/* render stats */}</div>
}
```

### 3. Optimize Re-renders with Selectors

```tsx
import { useTeamStore } from './store/useTeamStore'

// Only re-render when specific team changes
function TeamCard({ teamId }: { teamId: string }) {
  const team = useTeamStore(state =>
    state.teams.find(t => t.id === teamId)
  )

  if (!team) return null

  return <div>{team.name}</div>
}
```

## Troubleshooting

### Common Issues

1. **Team not showing up**
   - Check if `useTeamStore` is properly imported
   - Verify team was created successfully
   - Check localStorage for persisted data

2. **Auto-assign not working**
   - Ensure agents have the `skills` field populated
   - Check if agents are in `online` or `idle` status
   - Verify `considerStatus` option in strategy

3. **Chat messages not appearing**
   - Check if `teamId` matches
   - Verify `getTeamMessages` is called with correct ID
   - Clear localStorage if data is corrupted

### Debug Mode

```typescript
// Add to useTeamStore
if (import.meta.env.DEV) {
  // Enable debug logging
  window.teamStore = useTeamStore.getState()

  // In browser console:
  // teamStore.teams
  // teamStore.createTeam('Debug Team', 'Test', 'agent-1')
}
```

## Migration Guide

If you have existing team data in a different format:

```typescript
// Migration script
import { useTeamStore } from './store/useTeamStore'

function migrateOldTeamData(oldData: any[]) {
  const store = useTeamStore.getState()

  oldData.forEach(oldTeam => {
    const teamId = store.createTeam(
      oldTeam.name,
      oldTeam.description,
      oldTeam.leaderId
    )

    oldTeam.members.forEach((member: any) => {
      store.addMember(teamId, member.id, member.name, member.role)
    })

    oldTeam.tasks.forEach((task: any) => {
      store.createTeamTask(teamId, {
        title: task.title,
        description: task.description,
        priority: task.priority || 'medium',
        createdBy: oldTeam.leaderId
      })
    })
  })

  console.log('Migration completed!')
}
```

## Support

For issues or questions:
- Check the type definitions in `src/types/team.ts`
- Review store implementation in `src/store/useTeamStore.ts`
- See component code in `src/components/TeamPanel.tsx`
- Read completion report in `.prophet/task-48-completed.md`

---

Happy Team Collaboration! 🚀
