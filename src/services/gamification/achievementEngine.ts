/**
 * 成就引擎 - Achievement Engine
 *
 * 负责：
 * - 成就检查和触发
 * - 进度计算
 * - 成就解锁
 * - 奖励发放
 */

import type {
  Achievement,
  AchievementCategory,
  AchievementTier,
  AchievementRequirement,
  Reward,
  GameEvent,
  ProgressUpdate,
} from './types';

/**
 * 成就引擎类
 */
export class AchievementEngine {
  private achievements: Map<string, Achievement> = new Map();
  private userProgress: Map<string, Map<string, number>> = new Map();

  constructor() {
    this.initializeAchievements();
  }

  /**
   * 初始化100+预定义成就
   */
  private initializeAchievements(): void {
    const achievements = this.generateAchievements();
    achievements.forEach((achievement) => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  /**
   * 生成100+成就定义
   */
  private generateAchievements(): Achievement[] {
    return [
      // ========== Agent类成就 (15个) ==========
      {
        id: 'agent_first_create',
        name: '初出茅庐',
        description: '创建你的第一个Agent',
        category: 'agent',
        tier: 'bronze',
        points: 10,
        requirements: [{ type: 'count', metric: 'agents_created', threshold: 1 }],
        reward: { xp: 50, coins: 100 },
        progress: 0,
        rarity: 1.0,
        icon: '🤖',
      },
      {
        id: 'agent_create_5',
        name: 'Agent工匠',
        description: '创建5个Agent',
        category: 'agent',
        tier: 'silver',
        points: 25,
        requirements: [{ type: 'count', metric: 'agents_created', threshold: 5 }],
        reward: { xp: 150, coins: 300 },
        progress: 0,
        rarity: 0.8,
        icon: '⚙️',
      },
      {
        id: 'agent_create_10',
        name: 'Agent大师',
        description: '创建10个Agent',
        category: 'agent',
        tier: 'gold',
        points: 50,
        requirements: [{ type: 'count', metric: 'agents_created', threshold: 10 }],
        reward: { xp: 300, coins: 600, gems: 5 },
        progress: 0,
        rarity: 0.5,
        icon: '🏆',
      },
      {
        id: 'agent_create_50',
        name: 'Agent传奇',
        description: '创建50个Agent',
        category: 'agent',
        tier: 'platinum',
        points: 150,
        requirements: [{ type: 'count', metric: 'agents_created', threshold: 50 }],
        reward: { xp: 1000, coins: 2000, gems: 20 },
        progress: 0,
        rarity: 0.2,
        icon: '⭐',
      },
      {
        id: 'agent_create_100',
        name: 'Agent之神',
        description: '创建100个Agent',
        category: 'agent',
        tier: 'diamond',
        points: 300,
        requirements: [{ type: 'count', metric: 'agents_created', threshold: 100 }],
        reward: { xp: 3000, coins: 5000, gems: 50, badge: 'Agent God' },
        progress: 0,
        rarity: 0.05,
        icon: '💎',
      },
      {
        id: 'agent_first_deploy',
        name: '首次部署',
        description: '部署你的第一个Agent',
        category: 'agent',
        tier: 'bronze',
        points: 15,
        requirements: [{ type: 'count', metric: 'agents_deployed', threshold: 1 }],
        reward: { xp: 75, coins: 150 },
        progress: 0,
        rarity: 0.95,
        icon: '🚀',
      },
      {
        id: 'agent_deploy_10',
        name: '部署专家',
        description: '部署10个Agent',
        category: 'agent',
        tier: 'silver',
        points: 40,
        requirements: [{ type: 'count', metric: 'agents_deployed', threshold: 10 }],
        reward: { xp: 250, coins: 500, gems: 3 },
        progress: 0,
        rarity: 0.6,
        icon: '🎯',
      },
      {
        id: 'agent_perfect_config',
        name: '完美配置',
        description: '创建一个配置完美的Agent（所有选项都配置）',
        category: 'agent',
        tier: 'gold',
        points: 60,
        requirements: [{ type: 'quality', metric: 'agent_config_completeness', threshold: 100 }],
        reward: { xp: 400, coins: 800, gems: 10 },
        progress: 0,
        rarity: 0.3,
        icon: '✨',
      },
      {
        id: 'agent_high_success_rate',
        name: '成功典范',
        description: 'Agent成功率达到95%以上',
        category: 'agent',
        tier: 'gold',
        points: 70,
        requirements: [{ type: 'quality', metric: 'agent_success_rate', threshold: 95 }],
        reward: { xp: 500, coins: 1000, gems: 15 },
        progress: 0,
        rarity: 0.25,
        icon: '🎖️',
      },
      {
        id: 'agent_rename_master',
        name: '命名大师',
        description: '给Agent起了20个不同的名字',
        category: 'agent',
        tier: 'silver',
        points: 30,
        requirements: [{ type: 'count', metric: 'unique_agent_names', threshold: 20 }],
        reward: { xp: 200, coins: 400 },
        progress: 0,
        rarity: 0.4,
        icon: '📝',
      },
      {
        id: 'agent_avatar_collector',
        name: 'Avatar收集家',
        description: '使用15种不同的Avatar',
        category: 'agent',
        tier: 'silver',
        points: 35,
        requirements: [{ type: 'count', metric: 'unique_avatars_used', threshold: 15 }],
        reward: { xp: 220, coins: 450, gems: 2 },
        progress: 0,
        rarity: 0.5,
        icon: '🎭',
      },
      {
        id: 'agent_skill_master',
        name: '技能大师',
        description: '给Agent配置超过50个技能（累计）',
        category: 'agent',
        tier: 'gold',
        points: 55,
        requirements: [{ type: 'count', metric: 'total_skills_configured', threshold: 50 }],
        reward: { xp: 350, coins: 700, gems: 8 },
        progress: 0,
        rarity: 0.35,
        icon: '🔧',
      },
      {
        id: 'agent_quick_create',
        name: '闪电创建',
        description: '在30秒内创建一个Agent',
        category: 'agent',
        tier: 'silver',
        points: 45,
        requirements: [{ type: 'speed', metric: 'agent_creation_time', threshold: 30 }],
        reward: { xp: 280, coins: 550, gems: 5 },
        progress: 0,
        rarity: 0.45,
        icon: '⚡',
      },
      {
        id: 'agent_update_veteran',
        name: '更新老手',
        description: '更新Agent配置50次',
        category: 'agent',
        tier: 'gold',
        points: 50,
        requirements: [{ type: 'count', metric: 'agents_updated', threshold: 50 }],
        reward: { xp: 320, coins: 650, gems: 7 },
        progress: 0,
        rarity: 0.3,
        icon: '🔄',
      },
      {
        id: 'agent_delete_cautious',
        name: '谨慎删除',
        description: '删除过的Agent少于创建的10%（表示决策谨慎）',
        category: 'agent',
        tier: 'platinum',
        points: 100,
        requirements: [{ type: 'quality', metric: 'agent_delete_ratio', threshold: 10 }],
        reward: { xp: 700, coins: 1500, gems: 25 },
        progress: 0,
        rarity: 0.15,
        icon: '🛡️',
      },

      // ========== Task类成就 (15个) ==========
      {
        id: 'task_first_complete',
        name: '任务新手',
        description: '完成你的第一个任务',
        category: 'task',
        tier: 'bronze',
        points: 10,
        requirements: [{ type: 'count', metric: 'tasks_completed', threshold: 1 }],
        reward: { xp: 50, coins: 100 },
        progress: 0,
        rarity: 1.0,
        icon: '✅',
      },
      {
        id: 'task_complete_10',
        name: '任务能手',
        description: '完成10个任务',
        category: 'task',
        tier: 'silver',
        points: 25,
        requirements: [{ type: 'count', metric: 'tasks_completed', threshold: 10 }],
        reward: { xp: 150, coins: 300 },
        progress: 0,
        rarity: 0.85,
        icon: '📋',
      },
      {
        id: 'task_complete_50',
        name: '任务专家',
        description: '完成50个任务',
        category: 'task',
        tier: 'gold',
        points: 60,
        requirements: [{ type: 'count', metric: 'tasks_completed', threshold: 50 }],
        reward: { xp: 400, coins: 800, gems: 10 },
        progress: 0,
        rarity: 0.5,
        icon: '🎯',
      },
      {
        id: 'task_complete_100',
        name: '任务大师',
        description: '完成100个任务',
        category: 'task',
        tier: 'platinum',
        points: 150,
        requirements: [{ type: 'count', metric: 'tasks_completed', threshold: 100 }],
        reward: { xp: 1000, coins: 2000, gems: 20 },
        progress: 0,
        rarity: 0.25,
        icon: '🏅',
      },
      {
        id: 'task_complete_500',
        name: '任务传说',
        description: '完成500个任务',
        category: 'task',
        tier: 'diamond',
        points: 400,
        requirements: [{ type: 'count', metric: 'tasks_completed', threshold: 500 }],
        reward: { xp: 4000, coins: 8000, gems: 80, badge: 'Task Legend' },
        progress: 0,
        rarity: 0.05,
        icon: '👑',
      },
      {
        id: 'task_streak_7',
        name: '七日连胜',
        description: '连续7天完成任务',
        category: 'task',
        tier: 'silver',
        points: 40,
        requirements: [{ type: 'streak', metric: 'daily_task_streak', threshold: 7 }],
        reward: { xp: 250, coins: 500, gems: 5 },
        progress: 0,
        rarity: 0.4,
        icon: '🔥',
      },
      {
        id: 'task_streak_30',
        name: '月度坚持',
        description: '连续30天完成任务',
        category: 'task',
        tier: 'gold',
        points: 100,
        requirements: [{ type: 'streak', metric: 'daily_task_streak', threshold: 30 }],
        reward: { xp: 800, coins: 1600, gems: 30 },
        progress: 0,
        rarity: 0.15,
        icon: '📅',
      },
      {
        id: 'task_streak_100',
        name: '百日传奇',
        description: '连续100天完成任务',
        category: 'task',
        tier: 'diamond',
        points: 500,
        requirements: [{ type: 'streak', metric: 'daily_task_streak', threshold: 100 }],
        reward: { xp: 5000, coins: 10000, gems: 100, badge: '100 Day Legend' },
        progress: 0,
        rarity: 0.01,
        icon: '💯',
      },
      {
        id: 'task_speed_demon',
        name: '速度恶魔',
        description: '在5分钟内完成5个任务',
        category: 'task',
        tier: 'gold',
        points: 70,
        requirements: [
          { type: 'count', metric: 'tasks_completed_in_timeframe', threshold: 5, timeframe: 300 },
        ],
        reward: { xp: 450, coins: 900, gems: 12 },
        progress: 0,
        rarity: 0.2,
        icon: '⚡',
      },
      {
        id: 'task_perfect_day',
        name: '完美一天',
        description: '一天内完成10个任务',
        category: 'task',
        tier: 'silver',
        points: 45,
        requirements: [{ type: 'count', metric: 'tasks_completed_daily', threshold: 10 }],
        reward: { xp: 280, coins: 550, gems: 6 },
        progress: 0,
        rarity: 0.35,
        icon: '🌟',
      },
      {
        id: 'task_early_bird',
        name: '早起鸟儿',
        description: '在早上6点前完成任务',
        category: 'task',
        tier: 'bronze',
        points: 20,
        requirements: [{ type: 'count', metric: 'tasks_completed_early', threshold: 1 }],
        reward: { xp: 120, coins: 250 },
        progress: 0,
        rarity: 0.6,
        icon: '🌅',
      },
      {
        id: 'task_night_owl',
        name: '夜猫子',
        description: '在午夜12点后完成任务',
        category: 'task',
        tier: 'bronze',
        points: 20,
        requirements: [{ type: 'count', metric: 'tasks_completed_late', threshold: 1 }],
        reward: { xp: 120, coins: 250 },
        progress: 0,
        rarity: 0.55,
        icon: '🦉',
      },
      {
        id: 'task_comeback',
        name: '王者归来',
        description: '中断后重新开始连胜',
        category: 'task',
        tier: 'silver',
        points: 35,
        requirements: [{ type: 'count', metric: 'streak_restarts', threshold: 3 }],
        reward: { xp: 220, coins: 440, gems: 4 },
        progress: 0,
        rarity: 0.45,
        icon: '🔄',
      },
      {
        id: 'task_variety',
        name: '多样化',
        description: '完成10种不同类型的任务',
        category: 'task',
        tier: 'gold',
        points: 55,
        requirements: [{ type: 'count', metric: 'unique_task_types', threshold: 10 }],
        reward: { xp: 350, coins: 700, gems: 8 },
        progress: 0,
        rarity: 0.3,
        icon: '🎨',
      },
      {
        id: 'task_marathon',
        name: '马拉松',
        description: '单次会话完成20个任务',
        category: 'task',
        tier: 'platinum',
        points: 120,
        requirements: [{ type: 'count', metric: 'tasks_completed_session', threshold: 20 }],
        reward: { xp: 900, coins: 1800, gems: 25 },
        progress: 0,
        rarity: 0.12,
        icon: '🏃',
      },

      // ========== Team类成就 (10个) ==========
      {
        id: 'team_first_join',
        name: '加入团队',
        description: '加入你的第一个团队',
        category: 'team',
        tier: 'bronze',
        points: 15,
        requirements: [{ type: 'count', metric: 'teams_joined', threshold: 1 }],
        reward: { xp: 80, coins: 150 },
        progress: 0,
        rarity: 0.9,
        icon: '👥',
      },
      {
        id: 'team_first_create',
        name: '团队创建者',
        description: '创建你的第一个团队',
        category: 'team',
        tier: 'silver',
        points: 30,
        requirements: [{ type: 'count', metric: 'teams_created', threshold: 1 }],
        reward: { xp: 200, coins: 400, gems: 3 },
        progress: 0,
        rarity: 0.5,
        icon: '🏢',
      },
      {
        id: 'team_invite_5',
        name: '团队建设者',
        description: '邀请5个成员加入团队',
        category: 'team',
        tier: 'gold',
        points: 50,
        requirements: [{ type: 'count', metric: 'members_invited', threshold: 5 }],
        reward: { xp: 350, coins: 700, gems: 10 },
        progress: 0,
        rarity: 0.3,
        icon: '📧',
      },
      {
        id: 'team_leader',
        name: '团队领袖',
        description: '管理一个超过10人的团队',
        category: 'team',
        tier: 'gold',
        points: 70,
        requirements: [{ type: 'count', metric: 'team_members', threshold: 10 }],
        reward: { xp: 500, coins: 1000, gems: 15 },
        progress: 0,
        rarity: 0.2,
        icon: '👔',
      },
      {
        id: 'team_collaboration',
        name: '协作专家',
        description: '与团队成员协作完成20个任务',
        category: 'team',
        tier: 'gold',
        points: 60,
        requirements: [{ type: 'count', metric: 'collaborative_tasks', threshold: 20 }],
        reward: { xp: 400, coins: 800, gems: 12 },
        progress: 0,
        rarity: 0.25,
        icon: '🤝',
      },
      {
        id: 'team_helpful',
        name: '乐于助人',
        description: '帮助团队成员10次',
        category: 'team',
        tier: 'silver',
        points: 40,
        requirements: [{ type: 'count', metric: 'help_count', threshold: 10 }],
        reward: { xp: 260, coins: 520, gems: 6 },
        progress: 0,
        rarity: 0.4,
        icon: '💪',
      },
      {
        id: 'team_active_member',
        name: '活跃成员',
        description: '在团队中活跃30天',
        category: 'team',
        tier: 'platinum',
        points: 100,
        requirements: [{ type: 'count', metric: 'team_active_days', threshold: 30 }],
        reward: { xp: 750, coins: 1500, gems: 20 },
        progress: 0,
        rarity: 0.15,
        icon: '⭐',
      },
      {
        id: 'team_multiple',
        name: '多面手',
        description: '同时参与3个不同的团队',
        category: 'team',
        tier: 'gold',
        points: 65,
        requirements: [{ type: 'count', metric: 'active_teams', threshold: 3 }],
        reward: { xp: 450, coins: 900, gems: 13 },
        progress: 0,
        rarity: 0.22,
        icon: '🎭',
      },
      {
        id: 'team_contributor',
        name: '主要贡献者',
        description: '成为团队前3名贡献者',
        category: 'team',
        tier: 'platinum',
        points: 120,
        requirements: [{ type: 'quality', metric: 'team_rank', threshold: 3 }],
        reward: { xp: 850, coins: 1700, gems: 25 },
        progress: 0,
        rarity: 0.1,
        icon: '🏆',
      },
      {
        id: 'team_founder',
        name: '开拓者',
        description: '创建5个不同的团队',
        category: 'team',
        tier: 'diamond',
        points: 200,
        requirements: [{ type: 'count', metric: 'teams_founded', threshold: 5 }],
        reward: { xp: 1500, coins: 3000, gems: 50, badge: 'Team Founder' },
        progress: 0,
        rarity: 0.05,
        icon: '🌟',
      },

      // ========== Social类成就 (10个) ==========
      {
        id: 'social_first_share',
        name: '首次分享',
        description: '第一次分享你的成就',
        category: 'social',
        tier: 'bronze',
        points: 10,
        requirements: [{ type: 'count', metric: 'shares_count', threshold: 1 }],
        reward: { xp: 60, coins: 120 },
        progress: 0,
        rarity: 0.7,
        icon: '📤',
      },
      {
        id: 'social_share_10',
        name: '分享达人',
        description: '分享10次',
        category: 'social',
        tier: 'silver',
        points: 30,
        requirements: [{ type: 'count', metric: 'shares_count', threshold: 10 }],
        reward: { xp: 200, coins: 400, gems: 4 },
        progress: 0,
        rarity: 0.4,
        icon: '📢',
      },
      {
        id: 'social_invite_friend',
        name: '邀请好友',
        description: '邀请第一个好友',
        category: 'social',
        tier: 'bronze',
        points: 20,
        requirements: [{ type: 'count', metric: 'friends_invited', threshold: 1 }],
        reward: { xp: 100, coins: 200, gems: 2 },
        progress: 0,
        rarity: 0.6,
        icon: '👋',
      },
      {
        id: 'social_invite_5',
        name: '社交能手',
        description: '邀请5个好友',
        category: 'social',
        tier: 'gold',
        points: 60,
        requirements: [{ type: 'count', metric: 'friends_invited', threshold: 5 }],
        reward: { xp: 400, coins: 800, gems: 15 },
        progress: 0,
        rarity: 0.25,
        icon: '🎉',
      },
      {
        id: 'social_viral',
        name: '病毒式传播',
        description: '你邀请的好友又邀请了其他人（二级传播）',
        category: 'social',
        tier: 'platinum',
        points: 150,
        requirements: [{ type: 'count', metric: 'viral_invites', threshold: 1 }],
        reward: { xp: 1200, coins: 2400, gems: 40 },
        progress: 0,
        rarity: 0.1,
        icon: '🚀',
      },
      {
        id: 'social_comments',
        name: '评论家',
        description: '发表50条评论',
        category: 'social',
        tier: 'silver',
        points: 35,
        requirements: [{ type: 'count', metric: 'comments_count', threshold: 50 }],
        reward: { xp: 230, coins: 460, gems: 5 },
        progress: 0,
        rarity: 0.35,
        icon: '💬',
      },
      {
        id: 'social_likes',
        name: '点赞狂人',
        description: '给其他用户点赞100次',
        category: 'social',
        tier: 'silver',
        points: 30,
        requirements: [{ type: 'count', metric: 'likes_given', threshold: 100 }],
        reward: { xp: 180, coins: 360, gems: 3 },
        progress: 0,
        rarity: 0.45,
        icon: '👍',
      },
      {
        id: 'social_popular',
        name: '人气之星',
        description: '获得100个点赞',
        category: 'social',
        tier: 'gold',
        points: 70,
        requirements: [{ type: 'count', metric: 'likes_received', threshold: 100 }],
        reward: { xp: 500, coins: 1000, gems: 18 },
        progress: 0,
        rarity: 0.18,
        icon: '⭐',
      },
      {
        id: 'social_influencer',
        name: '影响者',
        description: '获得50个关注者',
        category: 'social',
        tier: 'platinum',
        points: 130,
        requirements: [{ type: 'count', metric: 'followers_count', threshold: 50 }],
        reward: { xp: 1000, coins: 2000, gems: 35 },
        progress: 0,
        rarity: 0.08,
        icon: '🌟',
      },
      {
        id: 'social_superstar',
        name: '超级巨星',
        description: '获得200个关注者',
        category: 'social',
        tier: 'diamond',
        points: 300,
        requirements: [{ type: 'count', metric: 'followers_count', threshold: 200 }],
        reward: { xp: 3000, coins: 6000, gems: 100, badge: 'Superstar' },
        progress: 0,
        rarity: 0.02,
        icon: '💫',
      },

      // ========== Milestone类成就 (10个) ==========
      {
        id: 'milestone_first_login',
        name: '首次登录',
        description: '欢迎来到AgentForge！',
        category: 'milestone',
        tier: 'bronze',
        points: 5,
        requirements: [{ type: 'count', metric: 'login_count', threshold: 1 }],
        reward: { xp: 25, coins: 50 },
        progress: 0,
        rarity: 1.0,
        icon: '🎮',
      },
      {
        id: 'milestone_login_7',
        name: '一周坚持',
        description: '登录7天',
        category: 'milestone',
        tier: 'bronze',
        points: 20,
        requirements: [{ type: 'count', metric: 'login_days', threshold: 7 }],
        reward: { xp: 120, coins: 250, gems: 2 },
        progress: 0,
        rarity: 0.65,
        icon: '📅',
      },
      {
        id: 'milestone_login_30',
        name: '月度忠诚',
        description: '登录30天',
        category: 'milestone',
        tier: 'silver',
        points: 50,
        requirements: [{ type: 'count', metric: 'login_days', threshold: 30 }],
        reward: { xp: 350, coins: 700, gems: 10 },
        progress: 0,
        rarity: 0.3,
        icon: '🏅',
      },
      {
        id: 'milestone_login_100',
        name: '百日传承',
        description: '登录100天',
        category: 'milestone',
        tier: 'gold',
        points: 150,
        requirements: [{ type: 'count', metric: 'login_days', threshold: 100 }],
        reward: { xp: 1200, coins: 2500, gems: 40 },
        progress: 0,
        rarity: 0.1,
        icon: '💯',
      },
      {
        id: 'milestone_login_365',
        name: '年度坚守',
        description: '登录365天',
        category: 'milestone',
        tier: 'diamond',
        points: 500,
        requirements: [{ type: 'count', metric: 'login_days', threshold: 365 }],
        reward: { xp: 10000, coins: 20000, gems: 200, badge: 'Year Legend', title: 'Eternal User' },
        progress: 0,
        rarity: 0.01,
        icon: '👑',
      },
      {
        id: 'milestone_level_10',
        name: '初级玩家',
        description: '达到10级',
        category: 'milestone',
        tier: 'bronze',
        points: 25,
        requirements: [{ type: 'count', metric: 'user_level', threshold: 10 }],
        reward: { xp: 150, coins: 300 },
        progress: 0,
        rarity: 0.7,
        icon: '🎯',
      },
      {
        id: 'milestone_level_25',
        name: '中级玩家',
        description: '达到25级',
        category: 'milestone',
        tier: 'silver',
        points: 60,
        requirements: [{ type: 'count', metric: 'user_level', threshold: 25 }],
        reward: { xp: 500, coins: 1000, gems: 12 },
        progress: 0,
        rarity: 0.4,
        icon: '🎖️',
      },
      {
        id: 'milestone_level_50',
        name: '高级玩家',
        description: '达到50级',
        category: 'milestone',
        tier: 'gold',
        points: 150,
        requirements: [{ type: 'count', metric: 'user_level', threshold: 50 }],
        reward: { xp: 1500, coins: 3000, gems: 50 },
        progress: 0,
        rarity: 0.15,
        icon: '⭐',
      },
      {
        id: 'milestone_level_100',
        name: '传奇玩家',
        description: '达到100级',
        category: 'milestone',
        tier: 'diamond',
        points: 500,
        requirements: [{ type: 'count', metric: 'user_level', threshold: 100 }],
        reward: { xp: 10000, coins: 20000, gems: 200, badge: 'Level 100', title: 'Legend' },
        progress: 0,
        rarity: 0.02,
        icon: '💎',
      },
      {
        id: 'milestone_all_achievements',
        name: '成就猎人',
        description: '解锁50%的成就',
        category: 'milestone',
        tier: 'platinum',
        points: 200,
        requirements: [{ type: 'quality', metric: 'achievements_unlocked_percent', threshold: 50 }],
        reward: { xp: 2000, coins: 4000, gems: 80, badge: 'Achievement Hunter' },
        progress: 0,
        rarity: 0.05,
        icon: '🏆',
      },

      // ========== Speed类成就 (10个) ==========
      {
        id: 'speed_quick_agent',
        name: '快速创建',
        description: '30秒内创建Agent',
        category: 'speed',
        tier: 'bronze',
        points: 20,
        requirements: [{ type: 'speed', metric: 'agent_creation_time', threshold: 30 }],
        reward: { xp: 130, coins: 260 },
        progress: 0,
        rarity: 0.55,
        icon: '⚡',
      },
      {
        id: 'speed_lightning',
        name: '闪电侠',
        description: '10秒内完成一个简单任务',
        category: 'speed',
        tier: 'silver',
        points: 35,
        requirements: [{ type: 'speed', metric: 'task_completion_time', threshold: 10 }],
        reward: { xp: 220, coins: 440, gems: 5 },
        progress: 0,
        rarity: 0.4,
        icon: '⚡⚡',
      },
      {
        id: 'speed_5min_challenge',
        name: '五分钟挑战',
        description: '5分钟内完成5个任务',
        category: 'speed',
        tier: 'gold',
        points: 70,
        requirements: [
          { type: 'count', metric: 'tasks_in_timeframe', threshold: 5, timeframe: 300 },
        ],
        reward: { xp: 500, coins: 1000, gems: 15 },
        progress: 0,
        rarity: 0.2,
        icon: '🏃',
      },
      {
        id: 'speed_rapid_fire',
        name: '连发模式',
        description: '1分钟内执行3个操作',
        category: 'speed',
        tier: 'silver',
        points: 40,
        requirements: [{ type: 'count', metric: 'actions_in_minute', threshold: 3 }],
        reward: { xp: 250, coins: 500, gems: 6 },
        progress: 0,
        rarity: 0.35,
        icon: '🎯',
      },
      {
        id: 'speed_deploy_fast',
        name: '快速部署',
        description: '创建后1分钟内部署Agent',
        category: 'speed',
        tier: 'gold',
        points: 55,
        requirements: [{ type: 'speed', metric: 'create_to_deploy_time', threshold: 60 }],
        reward: { xp: 370, coins: 740, gems: 9 },
        progress: 0,
        rarity: 0.28,
        icon: '🚀',
      },
      {
        id: 'speed_combo_x5',
        name: '五连击',
        description: '连续5个快速操作（每个<30秒）',
        category: 'speed',
        tier: 'gold',
        points: 65,
        requirements: [{ type: 'combo', metric: 'fast_actions_combo', threshold: 5 }],
        reward: { xp: 450, coins: 900, gems: 12 },
        progress: 0,
        rarity: 0.22,
        icon: '💥',
      },
      {
        id: 'speed_efficiency',
        name: '效率大师',
        description: '平均操作时间低于45秒',
        category: 'speed',
        tier: 'platinum',
        points: 120,
        requirements: [{ type: 'quality', metric: 'average_action_time', threshold: 45 }],
        reward: { xp: 850, coins: 1700, gems: 25 },
        progress: 0,
        rarity: 0.12,
        icon: '⚙️',
      },
      {
        id: 'speed_hotkey_master',
        name: '快捷键大师',
        description: '使用快捷键完成50个操作',
        category: 'speed',
        tier: 'gold',
        points: 60,
        requirements: [{ type: 'count', metric: 'hotkey_actions', threshold: 50 }],
        reward: { xp: 400, coins: 800, gems: 10 },
        progress: 0,
        rarity: 0.25,
        icon: '⌨️',
      },
      {
        id: 'speed_speedrun',
        name: '速通选手',
        description: '1小时内完成20个不同操作',
        category: 'speed',
        tier: 'platinum',
        points: 150,
        requirements: [
          { type: 'count', metric: 'operations_in_hour', threshold: 20, timeframe: 3600 },
        ],
        reward: { xp: 1200, coins: 2400, gems: 40 },
        progress: 0,
        rarity: 0.08,
        icon: '🏁',
      },
      {
        id: 'speed_world_record',
        name: '世界纪录',
        description: '打破最快完成记录',
        category: 'speed',
        tier: 'diamond',
        points: 300,
        requirements: [{ type: 'quality', metric: 'world_record_holder', threshold: 1 }],
        reward: { xp: 3000, coins: 6000, gems: 100, badge: 'World Record', title: 'Speed King' },
        progress: 0,
        rarity: 0.001,
        icon: '🌍',
      },

      // ========== Quality类成就 (10个) ==========
      {
        id: 'quality_perfect_config',
        name: '完美配置',
        description: 'Agent配置完成度100%',
        category: 'quality',
        tier: 'silver',
        points: 40,
        requirements: [{ type: 'quality', metric: 'config_completeness', threshold: 100 }],
        reward: { xp: 280, coins: 560, gems: 7 },
        progress: 0,
        rarity: 0.35,
        icon: '✨',
      },
      {
        id: 'quality_high_success',
        name: '高成功率',
        description: 'Agent成功率95%以上',
        category: 'quality',
        tier: 'gold',
        points: 70,
        requirements: [{ type: 'quality', metric: 'success_rate', threshold: 95 }],
        reward: { xp: 500, coins: 1000, gems: 15 },
        progress: 0,
        rarity: 0.25,
        icon: '🎯',
      },
      {
        id: 'quality_zero_errors',
        name: '零错误',
        description: '连续完成50个任务无错误',
        category: 'quality',
        tier: 'platinum',
        points: 130,
        requirements: [{ type: 'streak', metric: 'error_free_tasks', threshold: 50 }],
        reward: { xp: 1000, coins: 2000, gems: 35 },
        progress: 0,
        rarity: 0.1,
        icon: '💎',
      },
      {
        id: 'quality_detailed',
        name: '细节控',
        description: '所有Agent都有详细描述（>100字）',
        category: 'quality',
        tier: 'silver',
        points: 45,
        requirements: [{ type: 'quality', metric: 'description_length_avg', threshold: 100 }],
        reward: { xp: 300, coins: 600, gems: 8 },
        progress: 0,
        rarity: 0.3,
        icon: '📝',
      },
      {
        id: 'quality_organized',
        name: '整理大师',
        description: '所有Agent都正确分类',
        category: 'quality',
        tier: 'gold',
        points: 60,
        requirements: [{ type: 'quality', metric: 'categorization_completeness', threshold: 100 }],
        reward: { xp: 420, coins: 840, gems: 11 },
        progress: 0,
        rarity: 0.22,
        icon: '📂',
      },
      {
        id: 'quality_best_practices',
        name: '最佳实践',
        description: '遵循所有推荐的最佳实践',
        category: 'quality',
        tier: 'platinum',
        points: 150,
        requirements: [{ type: 'quality', metric: 'best_practices_score', threshold: 100 }],
        reward: { xp: 1200, coins: 2400, gems: 40, badge: 'Best Practices' },
        progress: 0,
        rarity: 0.08,
        icon: '🏆',
      },
      {
        id: 'quality_documented',
        name: '文档专家',
        description: '为所有Agent添加完整文档',
        category: 'quality',
        tier: 'gold',
        points: 75,
        requirements: [{ type: 'quality', metric: 'documentation_completeness', threshold: 100 }],
        reward: { xp: 550, coins: 1100, gems: 16 },
        progress: 0,
        rarity: 0.18,
        icon: '📚',
      },
      {
        id: 'quality_tested',
        name: '测试先行',
        description: '所有Agent都经过测试',
        category: 'quality',
        tier: 'platinum',
        points: 140,
        requirements: [{ type: 'quality', metric: 'agents_tested_percent', threshold: 100 }],
        reward: { xp: 1100, coins: 2200, gems: 38 },
        progress: 0,
        rarity: 0.09,
        icon: '🧪',
      },
      {
        id: 'quality_maintained',
        name: '维护专家',
        description: '定期更新Agent（每月至少1次）',
        category: 'quality',
        tier: 'gold',
        points: 65,
        requirements: [{ type: 'quality', metric: 'maintenance_frequency', threshold: 1 }],
        reward: { xp: 460, coins: 920, gems: 13 },
        progress: 0,
        rarity: 0.2,
        icon: '🔧',
      },
      {
        id: 'quality_perfectionist',
        name: '完美主义者',
        description: '所有质量指标都达到90%以上',
        category: 'quality',
        tier: 'diamond',
        points: 400,
        requirements: [{ type: 'quality', metric: 'overall_quality_score', threshold: 90 }],
        reward: {
          xp: 4000,
          coins: 8000,
          gems: 150,
          badge: 'Perfectionist',
          title: 'Quality Master',
        },
        progress: 0,
        rarity: 0.02,
        icon: '💯',
      },

      // ========== Creativity类成就 (10个) ==========
      {
        id: 'creativity_unique_name',
        name: '独特命名',
        description: '使用一个非常独特的Agent名字',
        category: 'creativity',
        tier: 'bronze',
        points: 15,
        requirements: [{ type: 'quality', metric: 'name_uniqueness_score', threshold: 90 }],
        reward: { xp: 100, coins: 200 },
        progress: 0,
        rarity: 0.5,
        icon: '✍️',
      },
      {
        id: 'creativity_custom_avatar',
        name: '自定义头像',
        description: '使用自定义Emoji作为头像',
        category: 'creativity',
        tier: 'bronze',
        points: 20,
        requirements: [{ type: 'count', metric: 'custom_avatars_used', threshold: 1 }],
        reward: { xp: 120, coins: 240, gems: 2 },
        progress: 0,
        rarity: 0.45,
        icon: '🎨',
      },
      {
        id: 'creativity_theme_master',
        name: '主题大师',
        description: '尝试所有可用主题',
        category: 'creativity',
        tier: 'silver',
        points: 35,
        requirements: [{ type: 'count', metric: 'themes_used', threshold: 5 }],
        reward: { xp: 230, coins: 460, gems: 6 },
        progress: 0,
        rarity: 0.35,
        icon: '🌈',
      },
      {
        id: 'creativity_complex_workflow',
        name: '复杂工作流',
        description: '创建包含10+步骤的工作流',
        category: 'creativity',
        tier: 'gold',
        points: 70,
        requirements: [{ type: 'quality', metric: 'workflow_complexity', threshold: 10 }],
        reward: { xp: 500, coins: 1000, gems: 15 },
        progress: 0,
        rarity: 0.2,
        icon: '🔀',
      },
      {
        id: 'creativity_innovator',
        name: '创新者',
        description: '使用功能的独特组合',
        category: 'creativity',
        tier: 'gold',
        points: 80,
        requirements: [{ type: 'quality', metric: 'feature_combination_uniqueness', threshold: 85 }],
        reward: { xp: 600, coins: 1200, gems: 18 },
        progress: 0,
        rarity: 0.15,
        icon: '💡',
      },
      {
        id: 'creativity_storyteller',
        name: '故事讲述者',
        description: 'Agent描述富有创意（评分>85）',
        category: 'creativity',
        tier: 'silver',
        points: 45,
        requirements: [{ type: 'quality', metric: 'description_creativity_score', threshold: 85 }],
        reward: { xp: 300, coins: 600, gems: 8 },
        progress: 0,
        rarity: 0.28,
        icon: '📖',
      },
      {
        id: 'creativity_artist',
        name: '艺术家',
        description: '创建视觉上吸引人的Dashboard',
        category: 'creativity',
        tier: 'platinum',
        points: 120,
        requirements: [{ type: 'quality', metric: 'dashboard_visual_score', threshold: 90 }],
        reward: { xp: 900, coins: 1800, gems: 30 },
        progress: 0,
        rarity: 0.1,
        icon: '🎨',
      },
      {
        id: 'creativity_trendsetter',
        name: '潮流引领者',
        description: '创建的Agent被其他人复制5次以上',
        category: 'creativity',
        tier: 'platinum',
        points: 150,
        requirements: [{ type: 'count', metric: 'agent_copied_by_others', threshold: 5 }],
        reward: { xp: 1200, coins: 2400, gems: 40, badge: 'Trendsetter' },
        progress: 0,
        rarity: 0.08,
        icon: '🌟',
      },
      {
        id: 'creativity_pioneer',
        name: '先驱者',
        description: '第一个使用新功能',
        category: 'creativity',
        tier: 'gold',
        points: 90,
        requirements: [{ type: 'count', metric: 'first_to_use_features', threshold: 3 }],
        reward: { xp: 650, coins: 1300, gems: 20 },
        progress: 0,
        rarity: 0.12,
        icon: '🚀',
      },
      {
        id: 'creativity_genius',
        name: '天才',
        description: '所有创意指标都达到90+',
        category: 'creativity',
        tier: 'diamond',
        points: 350,
        requirements: [{ type: 'quality', metric: 'creativity_overall_score', threshold: 90 }],
        reward: {
          xp: 3500,
          coins: 7000,
          gems: 120,
          badge: 'Creative Genius',
          title: 'Genius',
        },
        progress: 0,
        rarity: 0.03,
        icon: '🧠',
      },

      // ========== Contribution类成就 (10个) ==========
      {
        id: 'contribution_feedback',
        name: '反馈提供者',
        description: '提交第一条反馈',
        category: 'contribution',
        tier: 'bronze',
        points: 15,
        requirements: [{ type: 'count', metric: 'feedback_submitted', threshold: 1 }],
        reward: { xp: 100, coins: 200 },
        progress: 0,
        rarity: 0.6,
        icon: '💭',
      },
      {
        id: 'contribution_bug_reporter',
        name: 'Bug猎人',
        description: '报告5个Bug',
        category: 'contribution',
        tier: 'silver',
        points: 40,
        requirements: [{ type: 'count', metric: 'bugs_reported', threshold: 5 }],
        reward: { xp: 280, coins: 560, gems: 8 },
        progress: 0,
        rarity: 0.3,
        icon: '🐛',
      },
      {
        id: 'contribution_feature_suggester',
        name: '功能建议者',
        description: '建议10个新功能',
        category: 'contribution',
        tier: 'gold',
        points: 60,
        requirements: [{ type: 'count', metric: 'features_suggested', threshold: 10 }],
        reward: { xp: 420, coins: 840, gems: 12 },
        progress: 0,
        rarity: 0.2,
        icon: '💡',
      },
      {
        id: 'contribution_helpful_answers',
        name: '乐于助人',
        description: '帮助其他用户解决20个问题',
        category: 'contribution',
        tier: 'gold',
        points: 80,
        requirements: [{ type: 'count', metric: 'helpful_answers', threshold: 20 }],
        reward: { xp: 600, coins: 1200, gems: 18 },
        progress: 0,
        rarity: 0.15,
        icon: '🤝',
      },
      {
        id: 'contribution_template_creator',
        name: '模板创建者',
        description: '创建并分享5个模板',
        category: 'contribution',
        tier: 'platinum',
        points: 120,
        requirements: [{ type: 'count', metric: 'templates_shared', threshold: 5 }],
        reward: { xp: 900, coins: 1800, gems: 30 },
        progress: 0,
        rarity: 0.1,
        icon: '📋',
      },
      {
        id: 'contribution_tutorial_writer',
        name: '教程作者',
        description: '编写3篇教程',
        category: 'contribution',
        tier: 'platinum',
        points: 150,
        requirements: [{ type: 'count', metric: 'tutorials_written', threshold: 3 }],
        reward: { xp: 1200, coins: 2400, gems: 40, badge: 'Tutorial Writer' },
        progress: 0,
        rarity: 0.07,
        icon: '📚',
      },
      {
        id: 'contribution_code_contributor',
        name: '代码贡献者',
        description: 'GitHub PR被合并',
        category: 'contribution',
        tier: 'platinum',
        points: 200,
        requirements: [{ type: 'count', metric: 'code_prs_merged', threshold: 1 }],
        reward: { xp: 1500, coins: 3000, gems: 60, badge: 'Code Contributor' },
        progress: 0,
        rarity: 0.05,
        icon: '💻',
      },
      {
        id: 'contribution_translator',
        name: '翻译志愿者',
        description: '帮助翻译到其他语言',
        category: 'contribution',
        tier: 'gold',
        points: 90,
        requirements: [{ type: 'count', metric: 'translations_contributed', threshold: 50 }],
        reward: { xp: 650, coins: 1300, gems: 22 },
        progress: 0,
        rarity: 0.12,
        icon: '🌐',
      },
      {
        id: 'contribution_moderator',
        name: '社区管理员',
        description: '成为社区管理员',
        category: 'contribution',
        tier: 'diamond',
        points: 300,
        requirements: [{ type: 'quality', metric: 'is_moderator', threshold: 1 }],
        reward: { xp: 3000, coins: 6000, gems: 100, badge: 'Moderator', title: 'Moderator' },
        progress: 0,
        rarity: 0.01,
        icon: '🛡️',
      },
      {
        id: 'contribution_mvp',
        name: 'MVP贡献者',
        description: '成为月度最有价值贡献者',
        category: 'contribution',
        tier: 'diamond',
        points: 500,
        requirements: [{ type: 'quality', metric: 'mvp_award', threshold: 1 }],
        reward: {
          xp: 5000,
          coins: 10000,
          gems: 200,
          badge: 'MVP',
          title: 'Most Valuable Player',
        },
        progress: 0,
        rarity: 0.005,
        icon: '🏆',
      },

      // ========== Loyalty类成就 (10个) ==========
      {
        id: 'loyalty_early_adopter',
        name: '早期采用者',
        description: '在v1.0发布时就开始使用',
        category: 'loyalty',
        tier: 'gold',
        points: 100,
        requirements: [{ type: 'quality', metric: 'join_date_before_v1', threshold: 1 }],
        reward: { xp: 800, coins: 1600, gems: 25, badge: 'Early Adopter' },
        progress: 0,
        rarity: 0.15,
        icon: '🌱',
      },
      {
        id: 'loyalty_beta_tester',
        name: 'Beta测试员',
        description: '参与Beta测试',
        category: 'loyalty',
        tier: 'platinum',
        points: 150,
        requirements: [{ type: 'quality', metric: 'beta_tester', threshold: 1 }],
        reward: { xp: 1200, coins: 2400, gems: 40, badge: 'Beta Tester' },
        progress: 0,
        rarity: 0.08,
        icon: '🧪',
      },
      {
        id: 'loyalty_founding_member',
        name: '创始成员',
        description: '前100名注册用户',
        category: 'loyalty',
        tier: 'diamond',
        points: 300,
        requirements: [{ type: 'quality', metric: 'user_registration_rank', threshold: 100 }],
        reward: {
          xp: 3000,
          coins: 6000,
          gems: 100,
          badge: 'Founding Member',
          title: 'Founder',
        },
        progress: 0,
        rarity: 0.02,
        icon: '🏛️',
      },
      {
        id: 'loyalty_subscriber',
        name: '订阅者',
        description: '订阅Pro版',
        category: 'loyalty',
        tier: 'silver',
        points: 50,
        requirements: [{ type: 'quality', metric: 'is_pro_subscriber', threshold: 1 }],
        reward: { xp: 350, coins: 700, gems: 10 },
        progress: 0,
        rarity: 0.25,
        icon: '💳',
      },
      {
        id: 'loyalty_long_term',
        name: '长期用户',
        description: '账号年龄超过1年',
        category: 'loyalty',
        tier: 'gold',
        points: 100,
        requirements: [{ type: 'quality', metric: 'account_age_days', threshold: 365 }],
        reward: { xp: 800, coins: 1600, gems: 30 },
        progress: 0,
        rarity: 0.1,
        icon: '⏳',
      },
      {
        id: 'loyalty_veteran',
        name: '老兵',
        description: '账号年龄超过2年',
        category: 'loyalty',
        tier: 'platinum',
        points: 200,
        requirements: [{ type: 'quality', metric: 'account_age_days', threshold: 730 }],
        reward: { xp: 1800, coins: 3600, gems: 60, badge: 'Veteran' },
        progress: 0,
        rarity: 0.05,
        icon: '🎖️',
      },
      {
        id: 'loyalty_legend',
        name: '传奇',
        description: '账号年龄超过5年',
        category: 'loyalty',
        tier: 'diamond',
        points: 500,
        requirements: [{ type: 'quality', metric: 'account_age_days', threshold: 1825 }],
        reward: {
          xp: 5000,
          coins: 10000,
          gems: 200,
          badge: 'Legend',
          title: 'Legendary User',
        },
        progress: 0,
        rarity: 0.01,
        icon: '👑',
      },
      {
        id: 'loyalty_daily_visitor',
        name: '每日访客',
        description: '连续30天每天登录',
        category: 'loyalty',
        tier: 'silver',
        points: 60,
        requirements: [{ type: 'streak', metric: 'daily_login_streak', threshold: 30 }],
        reward: { xp: 420, coins: 840, gems: 12 },
        progress: 0,
        rarity: 0.2,
        icon: '📅',
      },
      {
        id: 'loyalty_never_quit',
        name: '永不放弃',
        description: '即使中断也重新回归（3次以上）',
        category: 'loyalty',
        tier: 'gold',
        points: 80,
        requirements: [{ type: 'count', metric: 'comebacks', threshold: 3 }],
        reward: { xp: 600, coins: 1200, gems: 20 },
        progress: 0,
        rarity: 0.15,
        icon: '💪',
      },
      {
        id: 'loyalty_lifelong',
        name: '终身用户',
        description: '购买终身会员',
        category: 'loyalty',
        tier: 'diamond',
        points: 1000,
        requirements: [{ type: 'quality', metric: 'lifetime_member', threshold: 1 }],
        reward: {
          xp: 10000,
          coins: 20000,
          gems: 500,
          badge: 'Lifetime',
          title: 'Lifetime Member',
        },
        progress: 0,
        rarity: 0.005,
        icon: '💎',
      },
    ];
  }

  /**
   * 检查事件是否触发成就
   */
  checkAchievements(event: GameEvent): Achievement[] {
    const triggered: Achievement[] = [];

    for (const [id, achievement] of this.achievements) {
      // 如果已解锁，跳过
      if (achievement.unlockedAt) {
        continue;
      }

      // 检查所有要求是否满足
      const allMet = achievement.requirements.every((req) => {
        return this.checkRequirement(event, req, achievement);
      });

      if (allMet && achievement.progress >= 100) {
        this.unlockAchievement(id);
        triggered.push(achievement);
      }
    }

    return triggered;
  }

  /**
   * 检查单个要求
   */
  private checkRequirement(
    event: GameEvent,
    requirement: AchievementRequirement,
    achievement: Achievement
  ): boolean {
    // 实际实现需要根据具体的事件数据和用户统计来判断
    // 这里是简化版本的示例逻辑
    const metricValue = event.data[requirement.metric] ?? 0;

    switch (requirement.type) {
      case 'count':
        return metricValue >= requirement.threshold;

      case 'streak':
        return metricValue >= requirement.threshold;

      case 'quality':
        return metricValue >= requirement.threshold;

      case 'speed':
        return metricValue <= requirement.threshold; // 速度类是越小越好

      case 'combo':
        return metricValue >= requirement.threshold;

      default:
        return false;
    }
  }

  /**
   * 计算成就进度（0-100）
   */
  calculateProgress(achievement: Achievement): number {
    // 实际实现需要基于用户当前统计数据
    // 这里返回简化的逻辑
    if (achievement.unlockedAt) {
      return 100;
    }

    // 取第一个requirement的进度（简化版）
    const firstReq = achievement.requirements[0];
    const userProgress = this.getUserProgress(achievement.id, firstReq.metric);
    const progress = Math.min(100, (userProgress / firstReq.threshold) * 100);

    return Math.floor(progress);
  }

  /**
   * 获取用户在特定指标上的进度
   */
  private getUserProgress(achievementId: string, metric: string): number {
    const userMetrics = this.userProgress.get('current_user') || new Map();
    return userMetrics.get(metric) || 0;
  }

  /**
   * 解锁成就
   */
  unlockAchievement(achievementId: string): void {
    const achievement = this.achievements.get(achievementId);
    if (achievement && !achievement.unlockedAt) {
      achievement.unlockedAt = new Date();
      achievement.progress = 100;

      // 触发成就解锁事件（实际应发送到后端）
      console.log(`🎉 Achievement Unlocked: ${achievement.name}`);
      console.log(`Reward: +${achievement.reward.xp || 0} XP, +${achievement.reward.coins || 0} Coins`);
    }
  }

  /**
   * 领取奖励
   */
  claimReward(achievementId: string): Reward | null {
    const achievement = this.achievements.get(achievementId);
    if (achievement?.unlockedAt) {
      return achievement.reward;
    }
    return null;
  }

  /**
   * 获取所有成就
   */
  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  /**
   * 按类别获取成就
   */
  getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return this.getAllAchievements().filter((a) => a.category === category);
  }

  /**
   * 获取用户已解锁成就
   */
  getUnlockedAchievements(): Achievement[] {
    return this.getAllAchievements().filter((a) => a.unlockedAt !== undefined);
  }

  /**
   * 获取用户未解锁成就
   */
  getLockedAchievements(): Achievement[] {
    return this.getAllAchievements().filter((a) => a.unlockedAt === undefined);
  }

  /**
   * 获取稀有成就（rarity < 0.1）
   */
  getRareAchievements(): Achievement[] {
    return this.getAllAchievements().filter((a) => a.rarity < 0.1);
  }

  /**
   * 获取成就统计
   */
  getAchievementStats() {
    const all = this.getAllAchievements();
    const unlocked = this.getUnlockedAchievements();

    return {
      total: all.length,
      unlocked: unlocked.length,
      locked: all.length - unlocked.length,
      completionRate: (unlocked.length / all.length) * 100,
      totalPoints: unlocked.reduce((sum, a) => sum + a.points, 0),
      byCategory: this.getStatsByCategory(),
      byTier: this.getStatsByTier(),
    };
  }

  /**
   * 按类别统计
   */
  private getStatsByCategory() {
    const categories: Record<string, { total: number; unlocked: number }> = {};

    this.getAllAchievements().forEach((achievement) => {
      if (!categories[achievement.category]) {
        categories[achievement.category] = { total: 0, unlocked: 0 };
      }
      categories[achievement.category].total++;
      if (achievement.unlockedAt) {
        categories[achievement.category].unlocked++;
      }
    });

    return categories;
  }

  /**
   * 按层级统计
   */
  private getStatsByTier() {
    const tiers: Record<string, { total: number; unlocked: number }> = {};

    this.getAllAchievements().forEach((achievement) => {
      if (!tiers[achievement.tier]) {
        tiers[achievement.tier] = { total: 0, unlocked: 0 };
      }
      tiers[achievement.tier].total++;
      if (achievement.unlockedAt) {
        tiers[achievement.tier].unlocked++;
      }
    });

    return tiers;
  }
}

// 导出单例实例
export const achievementEngine = new AchievementEngine();
