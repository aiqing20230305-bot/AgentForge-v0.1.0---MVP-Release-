/**
 * 邀请码系统类型定义
 * 支持邀请好友、奖励追踪、邀请排行榜
 */

// 邀请码状态
export type InviteCodeStatus = 'active' | 'used' | 'expired'

// 邀请码
export interface InviteCode {
  code: string                    // 唯一邀请码（8位）
  creatorId: string               // 创建者Agent ID
  creatorName: string             // 创建者名称
  status: InviteCodeStatus
  createdAt: string
  usedAt?: string                 // 使用时间
  usedBy?: string                 // 使用者Agent ID
  usedByName?: string             // 使用者名称
  expiresAt?: string              // 过期时间（可选）
}

// 邀请奖励配置
export interface InviteReward {
  inviterReward: {
    exp: number                   // 邀请者获得经验值
    coins: number                 // 邀请者获得金币
    items?: string[]              // 邀请者获得物品
  }
  inviteeReward: {
    exp: number                   // 被邀请者获得经验值
    coins: number                 // 被邀请者获得金币
    items?: string[]              // 被邀请者获得物品
  }
}

// 邀请统计
export interface InviteStats {
  agentId: string
  agentName: string
  totalInvites: number            // 总邀请数
  successfulInvites: number       // 成功邀请数
  pendingInvites: number          // 待使用邀请码数
  totalExpEarned: number          // 通过邀请获得的总经验
  totalCoinsEarned: number        // 通过邀请获得的总金币
  inviteRank: number              // 邀请排行榜排名
  createdCodes: string[]          // 创建的邀请码列表
  usedCodes: string[]             // 使用过的邀请码列表
}

// 邀请历史记录
export interface InviteRecord {
  id: string
  inviteCode: string
  inviterId: string
  inviterName: string
  inviteeId: string
  inviteeName: string
  timestamp: string
  rewards: {
    inviterExp: number
    inviterCoins: number
    inviteeExp: number
    inviteeCoins: number
  }
}

// 默认邀请奖励配置
export const DEFAULT_INVITE_REWARD: InviteReward = {
  inviterReward: {
    exp: 500,                     // 邀请者+500经验
    coins: 1000                   // 邀请者+1000金币
  },
  inviteeReward: {
    exp: 200,                     // 新用户+200经验
    coins: 500                    // 新用户+500金币
  }
}

// 生成随机邀请码（8位字母数字组合）
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 排除易混淆字符
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// 验证邀请码格式
export function isValidInviteCodeFormat(code: string): boolean {
  return /^[A-Z0-9]{8}$/.test(code)
}

// 计算邀请排名
export function calculateInviteRank(stats: InviteStats[]): InviteStats[] {
  return stats
    .sort((a, b) => b.successfulInvites - a.successfulInvites)
    .map((stat, index) => ({
      ...stat,
      inviteRank: index + 1
    }))
}
