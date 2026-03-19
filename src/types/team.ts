/**
 * Team Collaboration System Types
 * 团队协作系统类型定义
 */

export type TeamRole = 'leader' | 'member' | 'observer'
export type TeamStatus = 'active' | 'inactive' | 'disbanded'
export type TeamTaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed'

/**
 * Team Member Interface
 * 团队成员接口
 */
export interface TeamMember {
  agentId: string
  agentName: string
  role: TeamRole
  joinedAt: string
  // 成员统计
  stats: {
    tasksCompleted: number
    tasksInProgress: number
    tasksFailed: number
    totalContribution: number // 贡献度
    averageTaskTime: number // 平均任务完成时间（秒）
  }
}

/**
 * Team Task Interface
 * 团队任务接口
 */
export interface TeamTask {
  id: string
  title: string
  description: string
  status: TeamTaskStatus
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string // agentId
  createdBy: string // agentId
  createdAt: string
  assignedAt?: string
  startedAt?: string
  completedAt?: string
  estimatedDuration?: number // 预计耗时（秒）
  actualDuration?: number // 实际耗时（秒）
  requiredSkills?: string[] // 需要的技能
  result?: string
  errorMessage?: string
}

/**
 * Team Chat Message Interface
 * 团队聊天消息接口
 */
export interface TeamChatMessage {
  id: string
  teamId: string
  senderId: string // agentId
  senderName: string
  content: string
  timestamp: string
  type: 'text' | 'system' | 'task_update' | 'member_join' | 'member_leave'
  metadata?: {
    taskId?: string
    taskStatus?: TeamTaskStatus
    [key: string]: any
  }
}

/**
 * Team Statistics Interface
 * 团队统计接口
 */
export interface TeamStatistics {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  failedTasks: number
  averageTaskTime: number
  totalContribution: number
  memberCount: number
  activeMembers: number
  // 团队排名数据
  ranking?: {
    globalRank: number
    categoryRank: number
    points: number
  }
}

/**
 * Team Interface
 * 团队接口
 */
export interface Team {
  id: string
  name: string
  description: string
  leaderId: string // agentId
  members: TeamMember[]
  status: TeamStatus
  createdAt: string
  updatedAt: string
  // 团队配置
  config: {
    maxMembers: number
    autoAssignTasks: boolean // 是否自动分配任务
    allowMemberInvite: boolean
    taskPriority: 'workload' | 'skills' | 'random' // 任务分配策略
  }
  // 团队标签
  tags?: string[]
  // 团队图标
  avatar?: string
  color?: string
  // 团队统计
  stats: TeamStatistics
}

/**
 * Task Assignment Strategy
 * 任务分配策略
 */
export interface TaskAssignmentStrategy {
  type: 'workload' | 'skills' | 'random' | 'manual'
  // 工作负载权重（0-1）
  workloadWeight?: number
  // 技能匹配权重（0-1）
  skillMatchWeight?: number
  // 考虑Agent状态
  considerStatus?: boolean
}

/**
 * Task Assignment Result
 * 任务分配结果
 */
export interface TaskAssignmentResult {
  taskId: string
  assignedTo: string // agentId
  assignedToName: string
  confidence: number // 0-1，分配置信度
  reason: string
  timestamp: string
}

/**
 * Team Leaderboard Entry
 * 团队排行榜条目
 */
export interface TeamLeaderboardEntry {
  rank: number
  teamId: string
  teamName: string
  leaderId: string
  leaderName: string
  memberCount: number
  totalTasks: number
  completedTasks: number
  successRate: number
  totalPoints: number
  averageTaskTime: number
  createdAt: string
}
