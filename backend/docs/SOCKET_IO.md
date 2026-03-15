# Socket.io Real-time Communication Guide

AgentForge Backend uses Socket.io for real-time collaboration features including team coordination, task updates, agent status monitoring, and team chat.

## Connection

### Client Setup

```javascript
import { io } from 'socket.io-client'

const socket = io('http://localhost:3001', {
  auth: {
    token: 'your_jwt_access_token'
  }
})

// Connection events
socket.on('connect', () => {
  console.log('Connected:', socket.id)
})

socket.on('connected', (data) => {
  console.log('Authenticated:', data)
  // { socketId, userId, username, timestamp }
})

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message)
})

socket.on('disconnect', () => {
  console.log('Disconnected')
})
```

### Authentication

Socket.io requires JWT authentication. Provide the access token in one of two ways:

**Option 1: Auth parameter (recommended)**
```javascript
const socket = io('http://localhost:3001', {
  auth: { token: 'your_jwt_token' }
})
```

**Option 2: Authorization header**
```javascript
const socket = io('http://localhost:3001', {
  extraHeaders: {
    Authorization: 'Bearer your_jwt_token'
  }
})
```

---

## Event Reference

### Team Events

#### `team:join` (emit)
Join a team room to receive team-related events.

```javascript
socket.emit('team:join', { teamId: '507f1f77bcf86cd799439011' })
```

**Response events:**
- `team:members` - Current team members list
- `team:member_joined` - Broadcast to other team members

---

#### `team:leave` (emit)
Leave a team room.

```javascript
socket.emit('team:leave', { teamId: '507f1f77bcf86cd799439011' })
```

**Response event:** `team:member_left` - Broadcast to team

---

#### `team:status` (emit)
Update your status in a team.

```javascript
socket.emit('team:status', {
  teamId: '507f1f77bcf86cd799439011',
  status: 'working' // or 'idle', 'away', etc.
})
```

**Response event:** `team:member_status` - Broadcast to team

---

#### `team:member_joined` (listen)
Another user joined the team.

```javascript
socket.on('team:member_joined', (data) => {
  console.log(`${data.username} joined team ${data.teamId}`)
  // { userId, username, teamId, timestamp }
})
```

---

#### `team:member_left` (listen)
A user left the team.

```javascript
socket.on('team:member_left', (data) => {
  console.log(`${data.username} left team ${data.teamId}`)
})
```

---

#### `team:members` (listen)
Current team members list (received after joining).

```javascript
socket.on('team:members', (data) => {
  console.log(`Team has ${data.count} members:`, data.members)
  // { teamId, members: [userId, ...], count }
})
```

---

#### `team:member_status` (listen)
Team member status changed.

```javascript
socket.on('team:member_status', (data) => {
  console.log(`${data.username} is now ${data.status}`)
})
```

---

### Task Events

#### `task:created` (emit)
Notify team that a new task was created.

```javascript
socket.emit('task:created', {
  task: { id, title, description, ... },
  teamId: '507f1f77bcf86cd799439011' // optional
})
```

---

#### `task:updated` (emit)
Notify team of task updates.

```javascript
socket.emit('task:updated', {
  taskId: '507f1f77bcf86cd799439013',
  updates: { status: 'in_progress' },
  teamId: '507f1f77bcf86cd799439011' // optional
})
```

---

#### `task:completed` (emit)
Notify team that a task was completed.

```javascript
socket.emit('task:completed', {
  taskId: '507f1f77bcf86cd799439013',
  result: 'Task completed successfully',
  teamId: '507f1f77bcf86cd799439011' // optional
})
```

---

#### `task:log` (emit)
Send task execution log entry.

```javascript
socket.emit('task:log', {
  taskId: '507f1f77bcf86cd799439013',
  logEntry: '[2026-03-15 10:05:00] Processing data...',
  teamId: '507f1f77bcf86cd799439011' // optional
})
```

---

#### Task Events (listen)
Listen for task updates from team members:

```javascript
socket.on('task:created', (data) => {
  console.log(`New task by ${data.createdBy}:`, data.task)
})

socket.on('task:updated', (data) => {
  console.log(`Task ${data.taskId} updated by ${data.updatedBy}`)
})

socket.on('task:completed', (data) => {
  console.log(`Task ${data.taskId} completed by ${data.completedBy}`)
})

socket.on('task:log', (data) => {
  console.log(`Task ${data.taskId}:`, data.logEntry)
})
```

---

### Agent Events

#### `agent:status` (emit)
Update agent status.

```javascript
socket.emit('agent:status', {
  agentId: '507f1f77bcf86cd799439011',
  status: 'busy', // 'idle', 'busy', 'error'
  teamId: '507f1f77bcf86cd799439011' // optional
})
```

---

#### `agent:level_up` (emit)
Announce agent level up.

```javascript
socket.emit('agent:level_up', {
  agentId: '507f1f77bcf86cd799439011',
  newLevel: 10,
  teamId: '507f1f77bcf86cd799439011' // optional
})
```

---

#### `agent:stats` (emit)
Update agent statistics.

```javascript
socket.emit('agent:stats', {
  agentId: '507f1f77bcf86cd799439011',
  stats: { tasksCompleted: 50, tokensUsed: 100000 },
  teamId: '507f1f77bcf86cd799439011' // optional
})
```

---

#### Agent Events (listen)

```javascript
socket.on('agent:status', (data) => {
  console.log(`Agent ${data.agentId} is now ${data.status}`)
})

socket.on('agent:level_up', (data) => {
  console.log(`Agent ${data.agentId} reached level ${data.newLevel}!`)
})

socket.on('agent:stats', (data) => {
  console.log(`Agent ${data.agentId} stats:`, data.stats)
})
```

---

### Chat Events

#### `chat:message` (emit)
Send a message to team chat.

```javascript
socket.emit('chat:message', {
  teamId: '507f1f77bcf86cd799439011',
  message: 'Hello team!'
})
```

---

#### `chat:typing` (emit)
Send typing indicator.

```javascript
socket.emit('chat:typing', {
  teamId: '507f1f77bcf86cd799439011',
  isTyping: true
})
```

---

#### Chat Events (listen)

```javascript
socket.on('chat:message', (data) => {
  console.log(`${data.username}: ${data.message}`)
  // { userId, username, message, timestamp }
})

socket.on('chat:typing', (data) => {
  if (data.isTyping) {
    console.log(`${data.username} is typing...`)
  }
})
```

---

## Rooms

Socket.io automatically manages rooms for team collaboration:

### Personal Room
- Format: `user:{userId}`
- Joined automatically on connection
- Receives personal notifications (agent status updates from your own agents)

### Team Rooms
- Format: `team:{teamId}`
- Join with `team:join` event
- Leave with `team:leave` event
- Automatically left on disconnect

---

## React Integration Example

```typescript
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const useSocket = (token: string) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      auth: { token }
    })

    newSocket.on('connect', () => setConnected(true))
    newSocket.on('disconnect', () => setConnected(false))

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [token])

  return { socket, connected }
}

// Usage in component
const TeamCollaboration = ({ teamId, token }) => {
  const { socket, connected } = useSocket(token)

  useEffect(() => {
    if (!socket || !connected) return

    // Join team
    socket.emit('team:join', { teamId })

    // Listen for team events
    socket.on('team:member_joined', (data) => {
      console.log(`${data.username} joined`)
    })

    socket.on('chat:message', (data) => {
      console.log(`${data.username}: ${data.message}`)
    })

    // Cleanup
    return () => {
      socket.emit('team:leave', { teamId })
      socket.off('team:member_joined')
      socket.off('chat:message')
    }
  }, [socket, connected, teamId])

  const sendMessage = (message: string) => {
    socket?.emit('chat:message', { teamId, message })
  }

  return (
    <div>
      <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={() => sendMessage('Hello!')}>Send</button>
    </div>
  )
}
```

---

## Server API Endpoints

### Get Socket.io Statistics
**GET** `/api/v1/socket/stats`

**Headers:** Requires authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "connectedUsers": 5,
    "activeRooms": [
      {
        "teamId": "507f1f77bcf86cd799439011",
        "memberCount": 3,
        "lastActivity": "2026-03-15T12:00:00.000Z"
      }
    ],
    "timestamp": "2026-03-15T12:00:00.000Z"
  }
}
```

---

## Testing

### Using the HTML Test Client

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. Open `examples/socket-client.html` in a browser

3. Get a JWT token:
   ```bash
   curl -X POST http://localhost:3001/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

4. Paste the `accessToken` into the HTML client and click "Connect"

5. Test team join, chat, and real-time events

### Using JavaScript Console

```javascript
const socket = io('http://localhost:3001', {
  auth: { token: 'your_jwt_token' }
})

socket.on('connect', () => console.log('Connected'))
socket.emit('team:join', { teamId: 'your_team_id' })
socket.on('team:members', (data) => console.log('Team members:', data))
```

---

## Configuration

Socket.io configuration in `src/services/socketService.ts`:

```typescript
{
  cors: {
    origin: config.CORS_ORIGIN,
    credentials: true
  },
  pingTimeout: 60000,   // 60 seconds
  pingInterval: 25000   // 25 seconds
}
```

---

## Security

- **Authentication Required**: All connections must provide a valid JWT token
- **User Isolation**: Users can only join teams they have access to (validated via JWT userId)
- **CORS Protection**: Only allowed origins can connect
- **Automatic Cleanup**: Rooms are cleaned up when empty

---

## Error Handling

```javascript
socket.on('connect_error', (error) => {
  if (error.message === 'Authentication token required') {
    console.error('Missing token')
  } else if (error.message === 'Invalid authentication token') {
    console.error('Token expired or invalid')
  }
})
```

---

## Performance

- **Connection Pooling**: Supports thousands of concurrent connections
- **Room-based Broadcasting**: Efficient message routing to specific teams
- **Automatic Reconnection**: Socket.io handles reconnection automatically
- **Heartbeat**: Regular ping/pong to detect disconnections

---

## Best Practices

1. **Always Clean Up**: Remove event listeners and leave rooms when components unmount
2. **Debounce Typing Indicators**: Don't send typing events on every keystroke
3. **Handle Reconnections**: Re-join rooms after reconnection
4. **Use Namespaces** (future): Separate concerns (e.g., `/tasks`, `/chat`)
5. **Compress Large Payloads**: Use JSON serialization for large objects

---

## Future Enhancements (v1.2.0+)

- Binary data support for file sharing
- Voice/video call signaling
- Screen sharing coordination
- Presence indicators (online/away/busy)
- Message persistence with Redis adapter
- Horizontal scaling with Redis pub/sub
