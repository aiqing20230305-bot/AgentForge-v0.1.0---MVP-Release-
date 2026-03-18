/**
 * 游戏化系统v2.0 - 类型定义
 *
 * 包含：
 * - Achievement（成就系统）
 * - DailyChallenge（每日任务）
 * - Leaderboard（排行榜）
 * - Currency & Economy（虚拟货币）
 */

// ============ 成就系统 ============

/**
 * 成就类别
 */
export type AchievementCategory =
  | 'agent'        // Agent相关（创建、部署、优化）
  | 'task'         // 任务相关（完成、连续完成）
  | 'team'         // 团队协作
  | 'social'       // 社交分享、邀请
  | 'milestone'    // 里程碑成就
  | 'speed'        // 速度挑战
  | 'quality'      // 质量相关
  | 'creativity'   // 创意奖励
  | 'contribution' // 贡献奖励
  | 'loyalty';     // 忠诚度奖励

/**
 * 成就层级
 */
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

/**
 * 成就要求
 */
export interface AchievementRequirement {
  type: 'count' | 'streak' | 'quality' | 'speed' | 'combo';
  metric: string;
  threshold: number;
  timeframe?: number; // 时间限制（秒）
}

/**
 * 成就奖励
 */
export interface Reward {
  xp?: number;
  coins?: number;
  gems?: number;
  tokens?: number;
  badge?: string;
  title?: string;
}

/**
 * 成就接口
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  points: number;
  requirements: AchievementRequirement[];
  reward: Reward;
  unlockedAt?: Date;
  progress: number; // 0-100
  rarity: number;   // 0.0-1.0（稀有度）
  icon?: string;
  hidden?: boolean; // 隐藏成就
}

/**
 * 游戏事件（用于触发成就检查）
 */
export interface GameEvent {
  type: string;
  userId: string;
  data: Record<string, any>;
  timestamp: Date;
}

// ============ 每日任务系统 ============

/**
 * 任务难度
 */
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

/**
 * 每日任务
 */
export interface DailyTask {
  id: string;
  name: string;
  description: string;
  type: 'create_agent' | 'complete_task' | 'achieve' | 'use_feature';
  target: number;
  progress: number;
  reward: Reward;
}

/**
 * 每日挑战
 */
export interface DailyChallenge {
  id: string;
  date: string; // YYYY-MM-DD
  tasks: DailyTask[];
  rewards: Reward[];
  difficulty: Difficulty;
  timeLimit?: number; // 秒
  completedCount: number;
  maxCompletions: number;
  expiresAt: Date;
}

// ============ 排行榜系统 ============

/**
 * 排行榜类型
 */
export type LeaderboardType = 'global' | 'team' | 'friends' | 'region';

/**
 * 排行榜周期
 */
export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all-time';

/**
 * 排行榜指标
 */
export type LeaderboardMetric = 'xp' | 'agents' | 'tasks' | 'achievements' | 'streak';

/**
 * 排行榜条目
 */
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  score: number;
  change: number; // 排名变化（正数=上升，负数=下降）
  badge?: string;
  tier?: AchievementTier;
}

/**
 * 排行榜
 */
export interface Leaderboard {
  id: string;
  type: LeaderboardType;
  metric: LeaderboardMetric;
  period: LeaderboardPeriod;
  entries: LeaderboardEntry[];
  myRank?: number;
  totalEntries: number;
  lastUpdated: Date;
}

// ============ 虚拟货币系统 ============

/**
 * 货币类型
 */
export type CurrencyType = 'coins' | 'gems' | 'tokens';

/**
 * 货币余额
 */
export interface Currency {
  coins: number;  // 普通货币（完成任务获得）
  gems: number;   // 高级货币（成就奖励）
  tokens: number; // 活动代币（限时活动）
}

/**
 * 货币交易记录
 */
export interface CurrencyTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'spend' | 'exchange';
  currencyType: CurrencyType;
  amount: number;
  balance: Currency;
  reason: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

/**
 * 经济系统接口
 */
export interface EconomySystem {
  /**
   * 获得货币
   */
  earnCurrency(type: CurrencyType, amount: number, reason: string): Promise<Currency>;

  /**
   * 消费货币
   */
  spendCurrency(type: CurrencyType, amount: number, reason: string): Promise<boolean>;

  /**
   * 兑换货币
   */
  exchangeCurrency(from: CurrencyType, to: CurrencyType, amount: number): Promise<Currency>;

  /**
   * 获取每日奖励
   */
  getDailyBonus(): Promise<Currency>;

  /**
   * 获取货币余额
   */
  getBalance(): Promise<Currency>;

  /**
   * 获取交易历史
   */
  getTransactions(limit?: number): Promise<CurrencyTransaction[]>;
}

// ============ 用户游戏化数据 ============

/**
 * 用户游戏化统计
 */
export interface UserGameStats {
  userId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  currency: Currency;
  achievementsUnlocked: number;
  achievementsTotal: number;
  dailyStreak: number;
  longestStreak: number;
  rank: {
    global: number;
    team?: number;
  };
  lastActiveAt: Date;
}

/**
 * 进度更新
 */
export interface ProgressUpdate {
  achievementId: string;
  oldProgress: number;
  newProgress: number;
  completed: boolean;
  reward?: Reward;
}
