// 任务相关类型定义

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  agentId: string // 执行此任务的 Agent ID (本地ID)
  agentName: string // Agent 名称
  createdAt: string
  startedAt?: string
  completedAt?: string
  result?: string // 任务执行结果
  tags?: string[] // 任务标签

  // Cloud sync fields
  cloudId?: string // Cloud backend ID
  agentCloudId?: string // Cloud agent ID (for sync mapping)
  updatedAt?: string // Last updated timestamp
  metadata?: {
    lastSyncedAt?: string // Last sync timestamp
    [key: string]: any
  }

  // Auto-execution fields
  autoExecution?: boolean
  executionProgress?: number // 0-100
  estimatedDuration?: number // seconds
  actualDuration?: number // seconds
  retryCount?: number
  maxRetries?: number // default 3
  errorMessage?: string
  executionLog?: string[]

  // Token metrics
  tokenMetrics?: {
    estimatedTokens: number
    actualTokens: number
    inputTokens: number
    outputTokens: number
    model: string
    costUSD: number
  }
}

export interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'completed'
  agentId: string
  agentName: string
  tasks: Task[]
  createdAt: string
  updatedAt: string
}
