// 任务相关类型定义

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  agentId: string // 执行此任务的 Agent ID
  agentName: string // Agent 名称
  createdAt: string
  startedAt?: string
  completedAt?: string
  result?: string // 任务执行结果
  tags?: string[] // 任务标签
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
