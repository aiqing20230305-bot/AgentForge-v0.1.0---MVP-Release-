/**
 * 邀请码系统 Store
 * 管理邀请码生成、使用、奖励发放和统计
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  InviteCode,
  InviteStats,
  InviteRecord,
  InviteReward,
  InviteCodeStatus
} from '../types/invite'
import { generateInviteCode, DEFAULT_INVITE_REWARD } from '../types/invite'

interface InviteStore {
  // 所有邀请码
  inviteCodes: InviteCode[]

  // Agent邀请统计
  inviteStats: Record<string, InviteStats>

  // 邀请历史记录
  inviteRecords: InviteRecord[]

  // 奖励配置
  rewardConfig: InviteReward

  // 邀请排行榜
  inviteLeaderboard: InviteStats[]

  // 生成邀请码
  createInviteCode: (agentId: string, agentName: string, expiresInDays?: number) => string

  // 使用邀请码
  useInviteCode: (code: string, inviteeId: string, inviteeName: string) => {
    success: boolean
    message: string
    rewards?: InviteRecord['rewards']
  }

  // 获取Agent的邀请码
  getAgentInviteCodes: (agentId: string) => InviteCode[]

  // 获取Agent邀请统计
  getAgentInviteStats: (agentId: string) => InviteStats | undefined

  // 获取邀请码详情
  getInviteCodeByCode: (code: string) => InviteCode | undefined

  // 更新邀请排行榜
  updateInviteLeaderboard: () => void

  // 获取邀请历史
  getInviteRecords: (agentId?: string) => InviteRecord[]

  // 删除邀请码
  deleteInviteCode: (code: string) => void

  // 更新奖励配置
  updateRewardConfig: (config: Partial<InviteReward>) => void
}

export const useInviteStore = create<InviteStore>()(
  persist(
    (set, get) => ({
      inviteCodes: [],
      inviteStats: {},
      inviteRecords: [],
      rewardConfig: DEFAULT_INVITE_REWARD,
      inviteLeaderboard: [],

      createInviteCode: (agentId, agentName, expiresInDays) => {
        // 生成唯一邀请码
        let code = generateInviteCode()
        let attempts = 0
        while (get().inviteCodes.some(c => c.code === code) && attempts < 10) {
          code = generateInviteCode()
          attempts++
        }

        const now = new Date().toISOString()
        const expiresAt = expiresInDays
          ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
          : undefined

        const newCode: InviteCode = {
          code,
          creatorId: agentId,
          creatorName: agentName,
          status: 'active',
          createdAt: now,
          expiresAt
        }

        set(state => {
          // 更新邀请码列表
          const inviteCodes = [...state.inviteCodes, newCode]

          // 更新Agent统计
          const stats = state.inviteStats[agentId] || {
            agentId,
            agentName,
            totalInvites: 0,
            successfulInvites: 0,
            pendingInvites: 0,
            totalExpEarned: 0,
            totalCoinsEarned: 0,
            inviteRank: 0,
            createdCodes: [],
            usedCodes: []
          }

          stats.totalInvites++
          stats.pendingInvites++
          stats.createdCodes.push(code)

          return {
            inviteCodes,
            inviteStats: {
              ...state.inviteStats,
              [agentId]: stats
            }
          }
        })

        // 更新排行榜
        get().updateInviteLeaderboard()

        return code
      },

      useInviteCode: (code, inviteeId, inviteeName) => {
        const inviteCode = get().getInviteCodeByCode(code)

        // 验证邀请码
        if (!inviteCode) {
          return { success: false, message: '邀请码不存在' }
        }

        if (inviteCode.status === 'used') {
          return { success: false, message: '邀请码已被使用' }
        }

        if (inviteCode.status === 'expired') {
          return { success: false, message: '邀请码已过期' }
        }

        if (inviteCode.expiresAt && new Date(inviteCode.expiresAt) < new Date()) {
          // 标记为过期
          set(state => ({
            inviteCodes: state.inviteCodes.map(c =>
              c.code === code ? { ...c, status: 'expired' as InviteCodeStatus } : c
            )
          }))
          return { success: false, message: '邀请码已过期' }
        }

        if (inviteCode.creatorId === inviteeId) {
          return { success: false, message: '不能使用自己的邀请码' }
        }

        const now = new Date().toISOString()
        const rewardConfig = get().rewardConfig

        // 创建邀请记录
        const record: InviteRecord = {
          id: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          inviteCode: code,
          inviterId: inviteCode.creatorId,
          inviterName: inviteCode.creatorName,
          inviteeId,
          inviteeName,
          timestamp: now,
          rewards: {
            inviterExp: rewardConfig.inviterReward.exp,
            inviterCoins: rewardConfig.inviterReward.coins,
            inviteeExp: rewardConfig.inviteeReward.exp,
            inviteeCoins: rewardConfig.inviteeReward.coins
          }
        }

        set(state => {
          // 更新邀请码状态
          const inviteCodes = state.inviteCodes.map(c =>
            c.code === code
              ? { ...c, status: 'used' as InviteCodeStatus, usedAt: now, usedBy: inviteeId, usedByName: inviteeName }
              : c
          )

          // 更新邀请者统计
          const inviterStats = state.inviteStats[inviteCode.creatorId] || {
            agentId: inviteCode.creatorId,
            agentName: inviteCode.creatorName,
            totalInvites: 0,
            successfulInvites: 0,
            pendingInvites: 0,
            totalExpEarned: 0,
            totalCoinsEarned: 0,
            inviteRank: 0,
            createdCodes: [],
            usedCodes: []
          }

          inviterStats.successfulInvites++
          inviterStats.pendingInvites = Math.max(0, inviterStats.pendingInvites - 1)
          inviterStats.totalExpEarned += record.rewards.inviterExp
          inviterStats.totalCoinsEarned += record.rewards.inviterCoins

          // 更新被邀请者统计
          const inviteeStats = state.inviteStats[inviteeId] || {
            agentId: inviteeId,
            agentName: inviteeName,
            totalInvites: 0,
            successfulInvites: 0,
            pendingInvites: 0,
            totalExpEarned: 0,
            totalCoinsEarned: 0,
            inviteRank: 0,
            createdCodes: [],
            usedCodes: []
          }

          inviteeStats.usedCodes.push(code)
          inviteeStats.totalExpEarned += record.rewards.inviteeExp
          inviteeStats.totalCoinsEarned += record.rewards.inviteeCoins

          return {
            inviteCodes,
            inviteStats: {
              ...state.inviteStats,
              [inviteCode.creatorId]: inviterStats,
              [inviteeId]: inviteeStats
            },
            inviteRecords: [...state.inviteRecords, record]
          }
        })

        // 更新排行榜
        get().updateInviteLeaderboard()

        return {
          success: true,
          message: '邀请码使用成功！',
          rewards: record.rewards
        }
      },

      getAgentInviteCodes: agentId => {
        return get().inviteCodes.filter(c => c.creatorId === agentId)
      },

      getAgentInviteStats: agentId => {
        return get().inviteStats[agentId]
      },

      getInviteCodeByCode: code => {
        return get().inviteCodes.find(c => c.code === code)
      },

      updateInviteLeaderboard: () => {
        const stats = Object.values(get().inviteStats)
        const leaderboard = stats
          .filter(s => s.successfulInvites > 0)
          .sort((a, b) => b.successfulInvites - a.successfulInvites)
          .map((stat, index) => ({
            ...stat,
            inviteRank: index + 1
          }))

        set({ inviteLeaderboard: leaderboard })
      },

      getInviteRecords: agentId => {
        if (!agentId) {
          return get().inviteRecords
        }
        return get().inviteRecords.filter(
          r => r.inviterId === agentId || r.inviteeId === agentId
        )
      },

      deleteInviteCode: code => {
        set(state => ({
          inviteCodes: state.inviteCodes.filter(c => c.code !== code)
        }))
      },

      updateRewardConfig: config => {
        set(state => ({
          rewardConfig: {
            inviterReward: { ...state.rewardConfig.inviterReward, ...config.inviterReward },
            inviteeReward: { ...state.rewardConfig.inviteeReward, ...config.inviteeReward }
          }
        }))
      }
    }),
    {
      name: 'invite-store'
    }
  )
)
