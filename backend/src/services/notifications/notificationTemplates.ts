/**
 * 通知模板 - Notification Templates
 *
 * 预定义常用通知模板
 */

import type { Notification, NotificationType, NotificationPriority } from './types';

/**
 * 通知模板函数类型
 */
type TemplateFunction = (params: Record<string, any>) => Omit<Notification, 'id' | 'userId' | 'createdAt'>;

/**
 * 通知模板集合
 */
export const notificationTemplates = {
  /**
   * 成就解锁通知
   */
  achievementUnlocked: (params: { achievementName: string; points: number; icon: string }): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
    type: 'achievement',
    title: '🎉 成就解锁！',
    message: `你解锁了成就：${params.achievementName}（+${params.points} 点数）`,
    icon: params.icon,
    priority: 'high',
    actions: [
      {
        id: 'view-achievement',
        label: '查看成就',
        action: 'navigate',
        params: { path: '/achievements' },
      },
    ],
  }),

  /**
   * 任务完成通知
   */
  taskCompleted: (params: { taskName: string; reward?: string }): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
    type: 'task',
    title: '✅ 任务完成',
    message: `你完成了任务：${params.taskName}${params.reward ? `，获得奖励：${params.reward}` : ''}`,
    icon: '✅',
    priority: 'normal',
    link: '/tasks',
  }),

  /**
   * 每日挑战完成通知
   */
  dailyChallengeCompleted: (params: { totalTasks: number; totalReward: string }): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
    type: 'achievement',
    title: '🎯 每日挑战完成！',
    message: `你完成了今日全部${params.totalTasks}个挑战，获得：${params.totalReward}`,
    icon: '🎯',
    priority: 'high',
    actions: [
      {
        id: 'view-rewards',
        label: '查看奖励',
        action: 'navigate',
        params: { path: '/challenges' },
      },
    ],
  }),

  /**
   * 新消息通知
   */
  newMessage: (params: { from: string; preview: string }): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
    type: 'social',
    title: `💬 ${params.from} 给你发了消息`,
    message: params.preview,
    icon: '💬',
    priority: 'normal',
    link: '/messages',
  }),

  /**
   * 团队邀请通知
   */
  teamInvite: (params: { teamName: string; inviterName: string; teamId: string }): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
    type: 'team',
    title: '👥 团队邀请',
    message: `${params.inviterName} 邀请你加入团队：${params.teamName}`,
    icon: '👥',
    priority: 'high',
    actions: [
      {
        id: 'accept-invite',
        label: '接受',
        action: 'api_call',
        params: { endpoint: `/api/teams/${params.teamId}/accept` },
      },
      {
        id: 'decline-invite',
        label: '拒绝',
        action: 'dismiss',
      },
    ],
  }),

  /**
   * 系统维护通知
   */
  systemMaintenance: (params: { startTime: string; duration: string }): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
    type: 'system',
    title: '🔧 系统维护通知',
    message: `系统将于${params.startTime}开始维护，预计持续${params.duration}`,
    icon: '🔧',
    priority: 'urgent',
  }),

  /**
   * 等级提升通知
   */
  levelUp: (params: { newLevel: number; reward: string }): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
    type: 'achievement',
    title: '⬆️ 等级提升！',
    message: `恭喜！你升级到了 Lv.${params.newLevel}，获得奖励：${params.reward}`,
    icon: '⬆️',
    priority: 'high',
    actions: [
      {
        id: 'view-profile',
        label: '查看个人资料',
        action: 'navigate',
        params: { path: '/profile' },
      },
    ],
  }),

  /**
   * 好友请求通知
   */
  friendRequest: (params: { userName: string; userId: string }): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
    type: 'social',
    title: '👋 新的好友请求',
    message: `${params.userName} 想要添加你为好友`,
    icon: '👋',
    priority: 'normal',
    actions: [
      {
        id: 'accept-friend',
        label: '接受',
        action: 'api_call',
        params: { endpoint: `/api/friends/${params.userId}/accept` },
      },
      {
        id: 'decline-friend',
        label: '拒绝',
        action: 'dismiss',
      },
    ],
  }),

  /**
   * 错误通知
   */
  error: (params: { title: string; message: string }): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
    type: 'error',
    title: `❌ ${params.title}`,
    message: params.message,
    icon: '❌',
    priority: 'high',
  }),

  /**
   * 成功通知
   */
  success: (params: { title: string; message: string }): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
    type: 'success',
    title: `✅ ${params.title}`,
    message: params.message,
    icon: '✅',
    priority: 'normal',
  }),

  /**
   * 信息通知
   */
  info: (params: { title: string; message: string }): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
    type: 'info',
    title: `ℹ️ ${params.title}`,
    message: params.message,
    icon: 'ℹ️',
    priority: 'low',
  }),

  /**
   * 警告通知
   */
  warning: (params: { title: string; message: string }): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
    type: 'warning',
    title: `⚠️ ${params.title}`,
    message: params.message,
    icon: '⚠️',
    priority: 'normal',
  }),

  /**
   * Agent部署成功通知
   */
  agentDeployed: (params: { agentName: string }): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
    type: 'success',
    title: '🚀 Agent部署成功',
    message: `${params.agentName} 已成功部署并开始运行`,
    icon: '🚀',
    priority: 'normal',
    link: '/agents',
  }),

  /**
   * 排行榜排名提升通知
   */
  rankImproved: (params: { oldRank: number; newRank: number; metric: string }): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
    type: 'achievement',
    title: '📈 排名提升！',
    message: `你在${params.metric}排行榜的排名从第${params.oldRank}名上升到第${params.newRank}名`,
    icon: '📈',
    priority: 'normal',
    link: '/leaderboard',
  }),

  /**
   * 每日奖励可领取通知
   */
  dailyBonusAvailable: (): Omit<Notification, 'id' | 'userId' | 'createdAt'> => ({
    type: 'info',
    title: '🎁 每日奖励可领取',
    message: '你的每日奖励已经准备好了，快来领取吧！',
    icon: '🎁',
    priority: 'normal',
    actions: [
      {
        id: 'claim-bonus',
        label: '领取奖励',
        action: 'api_call',
        params: { endpoint: '/api/currency/daily-bonus' },
      },
    ],
  }),
};

/**
 * 创建自定义通知
 */
export function createCustomNotification(
  type: NotificationType,
  title: string,
  message: string,
  options?: {
    icon?: string;
    priority?: NotificationPriority;
    link?: string;
    actions?: Notification['actions'];
    expiresAt?: Date;
    metadata?: Record<string, any>;
  }
): Omit<Notification, 'id' | 'userId' | 'createdAt'> {
  return {
    type,
    title,
    message,
    icon: options?.icon,
    priority: options?.priority || 'normal',
    link: options?.link,
    actions: options?.actions,
    expiresAt: options?.expiresAt,
    metadata: options?.metadata,
  };
}
