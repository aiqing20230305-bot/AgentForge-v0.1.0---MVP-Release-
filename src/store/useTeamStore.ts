/**
 * Team Store
 * 团队管理 Zustand Store
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Team,
  TeamMember,
  TeamTask,
  TeamChatMessage,
  TeamRole,
  TeamStatus,
  TeamTaskStatus,
  TaskAssignmentStrategy,
  TaskAssignmentResult,
  TeamLeaderboardEntry
} from '../types/team'
import type { AgentData } from './useDataSourceStore'

interface TeamStore {
  // 团队列表
  teams: Team[]
  // 团队任务池
  teamTasks: Record<string, TeamTask[]> // teamId -> tasks
  // 团队聊天消息
  teamMessages: Record<string, TeamChatMessage[]> // teamId -> messages
  // 团队排行榜
  leaderboard: TeamLeaderboardEntry[]

  // 团队管理
  createTeam: (name: string, description: string, leaderId: string, config?: Partial<Team['config']>) => string
  updateTeam: (teamId: string, updates: Partial<Omit<Team, 'id' | 'createdAt'>>) => void
  disbandTeam: (teamId: string) => void
  getTeam: (teamId: string) => Team | undefined
  getTeamsByLeader: (leaderId: string) => Team[]
  getTeamsByMember: (agentId: string) => Team[]

  // 成员管理
  addMember: (teamId: string, agentId: string, agentName: string, role?: TeamRole) => void
  removeMember: (teamId: string, agentId: string) => void
  updateMemberRole: (teamId: string, agentId: string, role: TeamRole) => void
  getMember: (teamId: string, agentId: string) => TeamMember | undefined

  // 任务管理
  createTeamTask: (teamId: string, task: Omit<TeamTask, 'id' | 'createdAt' | 'status'>) => string
  updateTeamTask: (teamId: string, taskId: string, updates: Partial<TeamTask>) => void
  deleteTeamTask: (teamId: string, taskId: string) => void
  assignTask: (teamId: string, taskId: string, agentId: string) => void
  completeTask: (teamId: string, taskId: string, result: string) => void
  failTask: (teamId: string, taskId: string, errorMessage: string) => void
  getTeamTasks: (teamId: string) => TeamTask[]
  getAgentTasks: (teamId: string, agentId: string) => TeamTask[]

  // 自动任务分配
  autoAssignTask: (
    teamId: string,
    taskId: string,
    agents: AgentData[],
    strategy?: TaskAssignmentStrategy
  ) => TaskAssignmentResult | null

  // 团队聊天
  sendTeamMessage: (teamId: string, senderId: string, senderName: string, content: string) => void
  sendSystemMessage: (teamId: string, content: string, metadata?: any) => void
  getTeamMessages: (teamId: string) => TeamChatMessage[]
  clearTeamMessages: (teamId: string) => void

  // 团队统计
  updateTeamStats: (teamId: string) => void
  getTeamRanking: (teamId: string) => number

  // 排行榜
  updateLeaderboard: () => void
  getTopTeams: (limit?: number) => TeamLeaderboardEntry[]
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      teams: [],
      teamTasks: {},
      teamMessages: {},
      leaderboard: [],

      // 创建团队
      createTeam: (name, description, leaderId, config) => {
        const id = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date().toISOString()

        const newTeam: Team = {
          id,
          name,
          description,
          leaderId,
          members: [],
          status: 'active',
          createdAt: now,
          updatedAt: now,
          config: {
            maxMembers: 10,
            autoAssignTasks: true,
            allowMemberInvite: true,
            taskPriority: 'workload',
            ...config
          },
          stats: {
            totalTasks: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            failedTasks: 0,
            averageTaskTime: 0,
            totalContribution: 0,
            memberCount: 0,
            activeMembers: 0
          }
        }

        set(state => ({
          teams: [...state.teams, newTeam],
          teamTasks: { ...state.teamTasks, [id]: [] },
          teamMessages: { ...state.teamMessages, [id]: [] }
        }))

        // 发送系统消息
        get().sendSystemMessage(id, `团队 "${name}" 已创建`)

        return id
      },

      // 更新团队
      updateTeam: (teamId, updates) => {
        set(state => ({
          teams: state.teams.map(team =>
            team.id === teamId
              ? { ...team, ...updates, updatedAt: new Date().toISOString() }
              : team
          )
        }))
      },

      // 解散团队
      disbandTeam: teamId => {
        const team = get().getTeam(teamId)
        if (!team) return

        set(state => ({
          teams: state.teams.map(t =>
            t.id === teamId ? { ...t, status: 'disbanded' as TeamStatus } : t
          )
        }))

        get().sendSystemMessage(teamId, `团队已解散`)
      },

      // 获取团队
      getTeam: teamId => {
        return get().teams.find(t => t.id === teamId)
      },

      // 获取队长的团队
      getTeamsByLeader: leaderId => {
        return get().teams.filter(t => t.leaderId === leaderId && t.status !== 'disbanded')
      },

      // 获取成员所在的团队
      getTeamsByMember: agentId => {
        return get().teams.filter(
          t => t.members.some(m => m.agentId === agentId) && t.status !== 'disbanded'
        )
      },

      // 添加成员
      addMember: (teamId, agentId, agentName, role = 'member') => {
        const team = get().getTeam(teamId)
        if (!team) return

        // 检查是否已存在
        if (team.members.some(m => m.agentId === agentId)) {
          console.warn(`Agent ${agentId} is already in team ${teamId}`)
          return
        }

        // 检查人数限制
        if (team.members.length >= team.config.maxMembers) {
          console.warn(`Team ${teamId} has reached max members limit`)
          return
        }

        const newMember: TeamMember = {
          agentId,
          agentName,
          role,
          joinedAt: new Date().toISOString(),
          stats: {
            tasksCompleted: 0,
            tasksInProgress: 0,
            tasksFailed: 0,
            totalContribution: 0,
            averageTaskTime: 0
          }
        }

        set(state => ({
          teams: state.teams.map(t =>
            t.id === teamId
              ? {
                  ...t,
                  members: [...t.members, newMember],
                  updatedAt: new Date().toISOString()
                }
              : t
          )
        }))

        // 更新统计
        get().updateTeamStats(teamId)

        // 发送系统消息
        get().sendSystemMessage(teamId, `${agentName} 加入了团队`, {
          type: 'member_join',
          agentId,
          agentName
        })
      },

      // 移除成员
      removeMember: (teamId, agentId) => {
        const team = get().getTeam(teamId)
        if (!team) return

        const member = team.members.find(m => m.agentId === agentId)
        if (!member) return

        set(state => ({
          teams: state.teams.map(t =>
            t.id === teamId
              ? {
                  ...t,
                  members: t.members.filter(m => m.agentId !== agentId),
                  updatedAt: new Date().toISOString()
                }
              : t
          )
        }))

        // 更新统计
        get().updateTeamStats(teamId)

        // 发送系统消息
        get().sendSystemMessage(teamId, `${member.agentName} 离开了团队`, {
          type: 'member_leave',
          agentId,
          agentName: member.agentName
        })
      },

      // 更新成员角色
      updateMemberRole: (teamId, agentId, role) => {
        set(state => ({
          teams: state.teams.map(t =>
            t.id === teamId
              ? {
                  ...t,
                  members: t.members.map(m =>
                    m.agentId === agentId ? { ...m, role } : m
                  ),
                  updatedAt: new Date().toISOString()
                }
              : t
          )
        }))
      },

      // 获取成员
      getMember: (teamId, agentId) => {
        const team = get().getTeam(teamId)
        return team?.members.find(m => m.agentId === agentId)
      },

      // 创建团队任务
      createTeamTask: (teamId, task) => {
        const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date().toISOString()

        const newTask: TeamTask = {
          ...task,
          id,
          status: 'pending',
          createdAt: now
        }

        set(state => ({
          teamTasks: {
            ...state.teamTasks,
            [teamId]: [...(state.teamTasks[teamId] || []), newTask]
          }
        }))

        // 更新统计
        get().updateTeamStats(teamId)

        // 发送系统消息
        get().sendSystemMessage(teamId, `新任务: ${task.title}`, {
          type: 'task_update',
          taskId: id,
          taskStatus: 'pending'
        })

        return id
      },

      // 更新团队任务
      updateTeamTask: (teamId, taskId, updates) => {
        set(state => ({
          teamTasks: {
            ...state.teamTasks,
            [teamId]: (state.teamTasks[teamId] || []).map(task =>
              task.id === taskId ? { ...task, ...updates } : task
            )
          }
        }))

        // 更新统计
        get().updateTeamStats(teamId)
      },

      // 删除团队任务
      deleteTeamTask: (teamId, taskId) => {
        set(state => ({
          teamTasks: {
            ...state.teamTasks,
            [teamId]: (state.teamTasks[teamId] || []).filter(task => task.id !== taskId)
          }
        }))

        // 更新统计
        get().updateTeamStats(teamId)
      },

      // 分配任务
      assignTask: (teamId, taskId, agentId) => {
        const team = get().getTeam(teamId)
        const member = get().getMember(teamId, agentId)
        if (!team || !member) return

        set(state => ({
          teamTasks: {
            ...state.teamTasks,
            [teamId]: (state.teamTasks[teamId] || []).map(task =>
              task.id === taskId
                ? {
                    ...task,
                    status: 'assigned' as TeamTaskStatus,
                    assignedTo: agentId,
                    assignedAt: new Date().toISOString()
                  }
                : task
            )
          }
        }))

        // 发送系统消息
        const task = get()
          .getTeamTasks(teamId)
          .find(t => t.id === taskId)
        if (task) {
          get().sendSystemMessage(teamId, `任务 "${task.title}" 已分配给 ${member.agentName}`, {
            type: 'task_update',
            taskId,
            taskStatus: 'assigned'
          })
        }

        // 更新统计
        get().updateTeamStats(teamId)
      },

      // 完成任务
      completeTask: (teamId, taskId, result) => {
        const tasks = get().getTeamTasks(teamId)
        const task = tasks.find(t => t.id === taskId)
        if (!task || !task.assignedTo) return

        const completedAt = new Date().toISOString()
        const actualDuration = task.startedAt
          ? (new Date(completedAt).getTime() - new Date(task.startedAt).getTime()) / 1000
          : 0

        set(state => ({
          teamTasks: {
            ...state.teamTasks,
            [teamId]: (state.teamTasks[teamId] || []).map(t =>
              t.id === taskId
                ? {
                    ...t,
                    status: 'completed' as TeamTaskStatus,
                    completedAt,
                    actualDuration,
                    result
                  }
                : t
            )
          }
        }))

        // 更新成员统计
        set(state => ({
          teams: state.teams.map(team => {
            if (team.id !== teamId) return team
            return {
              ...team,
              members: team.members.map(m => {
                if (m.agentId !== task.assignedTo) return m
                const completedTasks = m.stats.tasksCompleted + 1
                const avgTime =
                  (m.stats.averageTaskTime * m.stats.tasksCompleted + actualDuration) /
                  completedTasks
                return {
                  ...m,
                  stats: {
                    ...m.stats,
                    tasksCompleted: completedTasks,
                    tasksInProgress: Math.max(0, m.stats.tasksInProgress - 1),
                    averageTaskTime: avgTime,
                    totalContribution: m.stats.totalContribution + 10 // 完成任务+10贡献度
                  }
                }
              })
            }
          })
        }))

        // 发送系统消息
        const member = get().getMember(teamId, task.assignedTo)
        if (member) {
          get().sendSystemMessage(
            teamId,
            `${member.agentName} 完成了任务 "${task.title}"`,
            {
              type: 'task_update',
              taskId,
              taskStatus: 'completed'
            }
          )
        }

        // 更新统计
        get().updateTeamStats(teamId)
      },

      // 任务失败
      failTask: (teamId, taskId, errorMessage) => {
        const tasks = get().getTeamTasks(teamId)
        const task = tasks.find(t => t.id === taskId)
        if (!task || !task.assignedTo) return

        set(state => ({
          teamTasks: {
            ...state.teamTasks,
            [teamId]: (state.teamTasks[teamId] || []).map(t =>
              t.id === taskId
                ? {
                    ...t,
                    status: 'failed' as TeamTaskStatus,
                    errorMessage
                  }
                : t
            )
          }
        }))

        // 更新成员统计
        set(state => ({
          teams: state.teams.map(team => {
            if (team.id !== teamId) return team
            return {
              ...team,
              members: team.members.map(m => {
                if (m.agentId !== task.assignedTo) return m
                return {
                  ...m,
                  stats: {
                    ...m.stats,
                    tasksFailed: m.stats.tasksFailed + 1,
                    tasksInProgress: Math.max(0, m.stats.tasksInProgress - 1)
                  }
                }
              })
            }
          })
        }))

        // 更新统计
        get().updateTeamStats(teamId)
      },

      // 获取团队任务
      getTeamTasks: teamId => {
        return get().teamTasks[teamId] || []
      },

      // 获取Agent的任务
      getAgentTasks: (teamId, agentId) => {
        return get()
          .getTeamTasks(teamId)
          .filter(task => task.assignedTo === agentId)
      },

      // 自动分配任务
      autoAssignTask: (teamId, taskId, agents, strategy) => {
        const team = get().getTeam(teamId)
        const task = get()
          .getTeamTasks(teamId)
          .find(t => t.id === taskId)

        if (!team || !task || team.members.length === 0) return null

        const defaultStrategy: TaskAssignmentStrategy = {
          type: team.config.taskPriority,
          workloadWeight: 0.6,
          skillMatchWeight: 0.4,
          considerStatus: true
        }

        const finalStrategy = { ...defaultStrategy, ...strategy }

        // 获取可用的团队成员
        const availableMembers = team.members
          .map(member => {
            const agent = agents.find(a => a.id === member.agentId)
            return { member, agent }
          })
          .filter(({ agent }) => {
            if (!agent) return false
            if (finalStrategy.considerStatus && agent.status !== 'online' && agent.status !== 'idle')
              return false
            return true
          })

        if (availableMembers.length === 0) return null

        // 计算每个成员的得分
        const scores = availableMembers.map(({ member, agent }) => {
          let score = 0

          // 工作负载得分（工作越少，得分越高）
          if (finalStrategy.type === 'workload' || finalStrategy.workloadWeight) {
            const workload = member.stats.tasksInProgress
            const maxWorkload = Math.max(...team.members.map(m => m.stats.tasksInProgress), 1)
            const workloadScore = 1 - workload / maxWorkload
            score += workloadScore * (finalStrategy.workloadWeight || 0.6)
          }

          // 技能匹配得分
          if (finalStrategy.type === 'skills' || finalStrategy.skillMatchWeight) {
            if (task.requiredSkills && task.requiredSkills.length > 0 && agent?.skills) {
              const matchedSkills = task.requiredSkills.filter(skill =>
                agent.skills.includes(skill)
              ).length
              const skillScore = matchedSkills / task.requiredSkills.length
              score += skillScore * (finalStrategy.skillMatchWeight || 0.4)
            } else {
              // 如果没有技能要求，所有人得分相同
              score += finalStrategy.skillMatchWeight || 0.4
            }
          }

          // 随机策略
          if (finalStrategy.type === 'random') {
            score = Math.random()
          }

          return {
            member,
            agent,
            score
          }
        })

        // 选择得分最高的成员
        scores.sort((a, b) => b.score - a.score)
        const selected = scores[0]

        // 分配任务
        get().assignTask(teamId, taskId, selected.member.agentId)

        // 返回分配结果
        const result: TaskAssignmentResult = {
          taskId,
          assignedTo: selected.member.agentId,
          assignedToName: selected.member.agentName,
          confidence: selected.score,
          reason: `Based on ${finalStrategy.type} strategy`,
          timestamp: new Date().toISOString()
        }

        return result
      },

      // 发送团队消息
      sendTeamMessage: (teamId, senderId, senderName, content) => {
        const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const message: TeamChatMessage = {
          id,
          teamId,
          senderId,
          senderName,
          content,
          timestamp: new Date().toISOString(),
          type: 'text'
        }

        set(state => ({
          teamMessages: {
            ...state.teamMessages,
            [teamId]: [...(state.teamMessages[teamId] || []), message]
          }
        }))
      },

      // 发送系统消息
      sendSystemMessage: (teamId, content, metadata) => {
        const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const message: TeamChatMessage = {
          id,
          teamId,
          senderId: 'system',
          senderName: 'System',
          content,
          timestamp: new Date().toISOString(),
          type: 'system',
          metadata
        }

        set(state => ({
          teamMessages: {
            ...state.teamMessages,
            [teamId]: [...(state.teamMessages[teamId] || []), message]
          }
        }))
      },

      // 获取团队消息
      getTeamMessages: teamId => {
        return get().teamMessages[teamId] || []
      },

      // 清空团队消息
      clearTeamMessages: teamId => {
        set(state => ({
          teamMessages: {
            ...state.teamMessages,
            [teamId]: []
          }
        }))
      },

      // 更新团队统计
      updateTeamStats: teamId => {
        const team = get().getTeam(teamId)
        const tasks = get().getTeamTasks(teamId)

        if (!team) return

        const completedTasks = tasks.filter(t => t.status === 'completed')
        const inProgressTasks = tasks.filter(t => t.status === 'in_progress' || t.status === 'assigned')
        const failedTasks = tasks.filter(t => t.status === 'failed')

        const averageTaskTime =
          completedTasks.length > 0
            ? completedTasks.reduce((sum, t) => sum + (t.actualDuration || 0), 0) /
              completedTasks.length
            : 0

        const totalContribution = team.members.reduce(
          (sum, m) => sum + m.stats.totalContribution,
          0
        )

        const activeMembers = team.members.filter(m => m.stats.tasksInProgress > 0).length

        set(state => ({
          teams: state.teams.map(t =>
            t.id === teamId
              ? {
                  ...t,
                  stats: {
                    totalTasks: tasks.length,
                    completedTasks: completedTasks.length,
                    inProgressTasks: inProgressTasks.length,
                    failedTasks: failedTasks.length,
                    averageTaskTime,
                    totalContribution,
                    memberCount: team.members.length,
                    activeMembers
                  },
                  updatedAt: new Date().toISOString()
                }
              : t
          )
        }))
      },

      // 获取团队排名
      getTeamRanking: teamId => {
        const leaderboard = get().leaderboard
        const index = leaderboard.findIndex(entry => entry.teamId === teamId)
        return index >= 0 ? index + 1 : -1
      },

      // 更新排行榜
      updateLeaderboard: () => {
        const teams = get().teams.filter(t => t.status === 'active')

        const entries: TeamLeaderboardEntry[] = teams
          .map(team => {
            const successRate =
              team.stats.totalTasks > 0
                ? team.stats.completedTasks / team.stats.totalTasks
                : 0

            // 计算积分：完成任务数 * 100 + 贡献度 + 成功率奖励
            const totalPoints =
              team.stats.completedTasks * 100 +
              team.stats.totalContribution +
              successRate * 1000

            const leader = team.members.find(m => m.agentId === team.leaderId)

            return {
              rank: 0, // 将在排序后设置
              teamId: team.id,
              teamName: team.name,
              leaderId: team.leaderId,
              leaderName: leader?.agentName || 'Unknown',
              memberCount: team.members.length,
              totalTasks: team.stats.totalTasks,
              completedTasks: team.stats.completedTasks,
              successRate,
              totalPoints,
              averageTaskTime: team.stats.averageTaskTime,
              createdAt: team.createdAt
            }
          })
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .map((entry, index) => ({ ...entry, rank: index + 1 }))

        set({ leaderboard: entries })
      },

      // 获取排行榜前N名
      getTopTeams: (limit = 10) => {
        return get().leaderboard.slice(0, limit)
      }
    }),
    {
      name: 'team-store'
    }
  )
)
