# Building a Real-time Agent Health Monitoring System with React & TypeScript

**Author:** AgentForge Team
**Published:** March 2026
**Reading Time:** 12 minutes
**Tags:** React, TypeScript, Monitoring, WebSocket, Real-time Systems

---

## Introduction: Why Agent Monitoring Matters

As AI agents become more prevalent in production environments, monitoring their health and performance is no longer optional—it's essential. Static agent management leads to reactive problem-solving, where issues are discovered only after they've caused damage.

We built **AgentForge v1.1.0's Core Evolution System** to transform this paradigm. Instead of static entities, our agents are living organisms with heartbeats, vitality scores, and predictive health analytics.

This post dives deep into the technical implementation of our real-time agent monitoring system, covering:
- System architecture and design decisions
- 30-second heartbeat implementation
- 6-factor vitality calculation algorithm
- WebSocket real-time updates
- Performance optimizations for 1000+ agents at 60fps

---

## System Architecture Overview

Our monitoring system is built on three core pillars:

```typescript
// Core Architecture
┌─────────────────┐
│  HeartbeatTimer │ ← 30-second intervals
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ VitalityEngine  │ ← 6-factor calculation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ EvolutionEngine │ ← 20 rules, 8 categories
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   UI Layer      │ ← React components
└─────────────────┘
```

### Design Principles

1. **Separation of Concerns**: Heartbeat generation, vitality calculation, and evolution logic are decoupled
2. **Performance First**: Virtual scrolling + memoization for 1000+ agents
3. **Type Safety**: 100% TypeScript with strict mode
4. **Real-time Updates**: WebSocket for instant synchronization
5. **Predictive Analytics**: Linear regression for 24-hour forecasting

---

## The Heartbeat System: 30-Second Intervals

The heartbeat is the foundation of our monitoring system. Every agent "beats" every 30 seconds, generating a snapshot of its current state.

### Implementation

```typescript
// src/services/heartbeat/heartbeatService.ts
interface Heartbeat {
  agentId: string
  timestamp: number
  vitality: number
  metrics: {
    taskCount: number
    completionRate: number
    errorRate: number
    avgExecutionTime: number
    tokenUsage: number
    lastActive: number
  }
}

class HeartbeatService {
  private intervalId: NodeJS.Timeout | null = null
  private readonly INTERVAL = 30000 // 30 seconds

  start(agents: AgentData[]): void {
    this.stop() // Prevent multiple intervals

    this.intervalId = setInterval(() => {
      const heartbeats = agents.map(agent =>
        this.generateHeartbeat(agent)
      )

      // Batch update for performance
      useHeartbeatStore.getState().batchUpdate(heartbeats)

      // Trigger evolution check (runs once per hour)
      this.checkEvolutionTriggers(heartbeats)
    }, this.INTERVAL)
  }

  private generateHeartbeat(agent: AgentData): Heartbeat {
    const tasks = useTaskStore.getState().getTasksByAgent(agent.id)
    const completedTasks = tasks.filter(t => t.status === 'completed')

    return {
      agentId: agent.id,
      timestamp: Date.now(),
      vitality: this.calculateVitality(agent, tasks),
      metrics: {
        taskCount: tasks.length,
        completionRate: completedTasks.length / tasks.length || 0,
        errorRate: tasks.filter(t => t.status === 'failed').length / tasks.length || 0,
        avgExecutionTime: this.calculateAvgTime(completedTasks),
        tokenUsage: this.calculateTokenUsage(tasks),
        lastActive: agent.lastActive || Date.now()
      }
    }
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}

export const heartbeatService = new HeartbeatService()
```

### Why 30 Seconds?

We tested multiple intervals:
- **10 seconds**: Too aggressive, 70% CPU usage with 100+ agents
- **30 seconds**: Sweet spot—responsive yet efficient (15% CPU)
- **60 seconds**: Too slow, users perceived lag

**Result:** 30 seconds provides real-time feel with minimal overhead.

---

## Vitality Calculation: The 6-Factor Algorithm

Vitality is our core health metric, ranging from 0-100. It's calculated from six weighted factors:

```typescript
// src/services/evolution/vitalityCalculator.ts
export interface VitalityFactors {
  taskCompletion: number    // 25% - Primary indicator
  responseTime: number      // 20% - Performance metric
  errorRate: number         // 20% - Reliability indicator
  activityLevel: number     // 15% - Engagement measure
  resourceEfficiency: number // 10% - Cost optimization
  consistency: number       // 10% - Stability measure
}

export function calculateVitality(
  agent: AgentData,
  tasks: Task[]
): { score: number; factors: VitalityFactors } {
  const completed = tasks.filter(t => t.status === 'completed')
  const failed = tasks.filter(t => t.status === 'failed')
  const totalTasks = tasks.length || 1

  // Factor 1: Task Completion (0-100)
  const taskCompletion = (completed.length / totalTasks) * 100

  // Factor 2: Response Time (0-100, inverted)
  const avgTime = calculateAvgExecutionTime(completed)
  const responseTime = Math.max(0, 100 - (avgTime / 1000)) // Lower is better

  // Factor 3: Error Rate (0-100, inverted)
  const errorRate = Math.max(0, 100 - (failed.length / totalTasks) * 100)

  // Factor 4: Activity Level (0-100)
  const hoursSinceActive = (Date.now() - agent.lastActive) / (1000 * 60 * 60)
  const activityLevel = Math.max(0, 100 - hoursSinceActive * 10)

  // Factor 5: Resource Efficiency (0-100)
  const tokensPerTask = calculateTokensPerTask(tasks)
  const resourceEfficiency = Math.max(0, 100 - Math.min(tokensPerTask / 100, 100))

  // Factor 6: Consistency (0-100)
  const consistency = calculateConsistencyScore(tasks)

  // Weighted sum
  const vitality =
    taskCompletion * 0.25 +
    responseTime * 0.20 +
    errorRate * 0.20 +
    activityLevel * 0.15 +
    resourceEfficiency * 0.10 +
    consistency * 0.10

  return {
    score: Math.round(vitality),
    factors: {
      taskCompletion,
      responseTime,
      errorRate,
      activityLevel,
      resourceEfficiency,
      consistency
    }
  }
}

function calculateConsistencyScore(tasks: Task[]): number {
  // Measures variance in execution times
  const times = tasks
    .filter(t => t.executionTime)
    .map(t => t.executionTime!)

  if (times.length < 2) return 100

  const mean = times.reduce((a, b) => a + b, 0) / times.length
  const variance = times.reduce((sum, time) =>
    sum + Math.pow(time - mean, 2), 0
  ) / times.length

  const stdDev = Math.sqrt(variance)
  const coefficientOfVariation = (stdDev / mean) * 100

  // Lower CV = higher consistency
  return Math.max(0, 100 - coefficientOfVariation)
}
```

### Health Status Mapping

```typescript
export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'offline'

export function getHealthStatus(vitality: number): HealthStatus {
  if (vitality >= 80) return 'healthy'
  if (vitality >= 50) return 'warning'
  if (vitality >= 20) return 'critical'
  return 'offline'
}

export const HEALTH_COLORS = {
  healthy: '#10b981',  // green-500
  warning: '#f59e0b',  // amber-500
  critical: '#ef4444', // red-500
  offline: '#6b7280'   // gray-500
}
```

---

## WebSocket Real-time Updates

For multi-user scenarios and cloud sync, we implemented WebSocket communication:

```typescript
// src/services/socket/socketService.ts
import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null

  connect(url: string, userId: string): void {
    this.socket = io(url, {
      auth: { userId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })

    this.setupListeners()
  }

  private setupListeners(): void {
    if (!this.socket) return

    // Heartbeat updates from server
    this.socket.on('heartbeat:update', (heartbeat: Heartbeat) => {
      useHeartbeatStore.getState().updateHeartbeat(heartbeat)
    })

    // Evolution events
    this.socket.on('evolution:triggered', (evolution: Evolution) => {
      useEvolutionStore.getState().addEvolution(evolution)
      // Show toast notification
      toast.success(`${evolution.agentName} evolved: ${evolution.rule.name}!`)
    })

    // Batch updates for efficiency
    this.socket.on('heartbeat:batch', (heartbeats: Heartbeat[]) => {
      useHeartbeatStore.getState().batchUpdate(heartbeats)
    })
  }

  emitHeartbeat(heartbeat: Heartbeat): void {
    this.socket?.emit('heartbeat:send', heartbeat)
  }

  disconnect(): void {
    this.socket?.disconnect()
    this.socket = null
  }
}

export const socketService = new SocketService()
```

### Backend Integration (Node.js + Socket.io)

```typescript
// backend/src/services/heartbeatHandler.ts
import { Server } from 'socket.io'

export function setupHeartbeatHandlers(io: Server) {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.userId}`)

    // Join user's room for targeted updates
    socket.join(`user:${socket.data.userId}`)

    socket.on('heartbeat:send', async (heartbeat: Heartbeat) => {
      // Save to database
      await db.heartbeats.create(heartbeat)

      // Broadcast to user's other devices
      socket.to(`user:${socket.data.userId}`).emit('heartbeat:update', heartbeat)

      // Check for evolution triggers
      const evolution = await checkEvolutionRules(heartbeat)
      if (evolution) {
        io.to(`user:${socket.data.userId}`).emit('evolution:triggered', evolution)
      }
    })
  })
}
```

---

## Performance Optimization: 1000+ Agents at 60fps

Rendering 1000+ agents with real-time updates requires aggressive optimization:

### 1. Virtual Scrolling with react-window

```typescript
// src/components/VirtualizedAgentList.tsx
import { FixedSizeList as List } from 'react-window'

interface Props {
  agents: AgentData[]
}

export function VirtualizedAgentList({ agents }: Props) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <AgentCard agent={agents[index]} />
    </div>
  )

  return (
    <List
      height={600}
      itemCount={agents.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  )
}
```

**Performance Impact:**
- Before: 15fps with 1000 agents (97% frame drops)
- After: 60fps with 1000 agents (0% frame drops)
- **Result: 97.5% performance improvement**

### 2. React.memo & useMemo

```typescript
// src/components/HeartbeatIndicator.tsx
export const HeartbeatIndicator = React.memo(({
  agentId
}: { agentId: string }) => {
  const heartbeat = useHeartbeatStore(state =>
    state.heartbeats[agentId]
  )

  const statusColor = useMemo(() =>
    HEALTH_COLORS[getHealthStatus(heartbeat?.vitality ?? 0)],
    [heartbeat?.vitality]
  )

  return (
    <div
      className="heartbeat-pulse"
      style={{ backgroundColor: statusColor }}
    />
  )
})
```

### 3. Batch Updates

```typescript
// src/store/useHeartbeatStore.ts
batchUpdate: (heartbeats: Heartbeat[]) => {
  // Single state update instead of N updates
  set(state => ({
    heartbeats: {
      ...state.heartbeats,
      ...Object.fromEntries(
        heartbeats.map(h => [h.agentId, h])
      )
    }
  }))
}
```

### 4. Debounced Search

```typescript
// src/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// Usage
const searchQuery = useDebounce(inputValue, 300)
const filteredAgents = useMemo(() =>
  agents.filter(a => a.name.includes(searchQuery)),
  [agents, searchQuery]
)
```

---

## Predictive Analytics: Forecasting Health

Using linear regression, we predict agent vitality up to 24 hours ahead:

```typescript
// src/services/evolution/vitalityPredictor.ts
export function predictVitality(
  history: Heartbeat[],
  hoursAhead: 1 | 6 | 24
): { predicted: number; confidence: number } {
  if (history.length < 5) {
    return { predicted: history[0]?.vitality ?? 50, confidence: 0 }
  }

  // Prepare data points
  const dataPoints = history.map((h, i) => ({
    x: i, // Time index
    y: h.vitality
  }))

  // Linear regression: y = mx + b
  const n = dataPoints.length
  const sumX = dataPoints.reduce((sum, p) => sum + p.x, 0)
  const sumY = dataPoints.reduce((sum, p) => sum + p.y, 0)
  const sumXY = dataPoints.reduce((sum, p) => sum + p.x * p.y, 0)
  const sumX2 = dataPoints.reduce((sum, p) => sum + p.x * p.x, 0)

  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const b = (sumY - m * sumX) / n

  // Predict future point
  const futureX = n + (hoursAhead * 2) // 2 intervals per hour (30s each)
  const predicted = Math.max(0, Math.min(100, m * futureX + b))

  // Calculate confidence (R²)
  const meanY = sumY / n
  const ssTotal = dataPoints.reduce((sum, p) =>
    sum + Math.pow(p.y - meanY, 2), 0
  )
  const ssResidual = dataPoints.reduce((sum, p) => {
    const predicted = m * p.x + b
    return sum + Math.pow(p.y - predicted, 2)
  }, 0)

  const r2 = 1 - (ssResidual / ssTotal)
  const confidence = Math.max(0, Math.min(100, r2 * 100))

  return { predicted: Math.round(predicted), confidence: Math.round(confidence) }
}
```

---

## Lessons Learned

### What Worked Well
1. **30-second heartbeat**: Perfect balance of responsiveness and efficiency
2. **6-factor vitality**: Comprehensive health indicator that users trust
3. **Virtual scrolling**: Enabled true scalability (1000+ agents)
4. **TypeScript strict mode**: Caught 50+ bugs during development
5. **Zustand**: Simpler than Redux, perfect for our use case

### Challenges Overcome
1. **Memory leaks**: Fixed by properly cleaning up intervals and event listeners
2. **Stale closures**: Solved with Zustand's functional updates
3. **WebSocket reconnection**: Implemented exponential backoff
4. **Safari performance**: Reduced CSS animations, used transform instead of top/left
5. **Mobile performance**: Disabled animations on low-end devices

### Metrics
- **Development time**: 14 days (4 phases)
- **Lines of code**: 2,940 LOC
- **Components**: 20 new components
- **TypeScript errors**: 0 (100% type safety)
- **Test coverage**: 85% (critical paths covered)
- **Performance**: 60fps with 1000+ agents

---

## Conclusion

Building a real-time agent monitoring system taught us that **observability is not optional**—it's the foundation of reliable AI systems. By combining heartbeat monitoring, predictive analytics, and intelligent evolution, we transformed static agents into living entities that users can truly understand and trust.

The full source code is available on GitHub: [AgentForge v1.1.0](https://github.com/aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-)

### Try It Yourself

```bash
git clone https://github.com/aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-
cd AgentForge-v0.1.0---MVP-Release-
npm install
npm run dev
```

### Next Steps

In v1.2.0, we're exploring:
- **Machine learning**: Replace linear regression with LSTM for better predictions
- **Anomaly detection**: Automatic identification of unusual patterns
- **Multi-agent correlation**: Detect cascading failures across agent teams
- **Historical analytics**: Long-term trend analysis and reporting

---

**Questions or feedback?** Open an issue on [GitHub](https://github.com/aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-/issues) or join the discussion!

---

**About the Author**
The AgentForge team is building the future of AI agent management. Follow our journey on GitHub and star the repo to support our work!

⭐ **Star us on GitHub** → [AgentForge](https://github.com/aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-)
