/**
 * 排行榜系统 - Leaderboard System
 *
 * 负责：
 * - 排行榜生成和更新
 * - 排名计算
 * - 多种排行榜类型支持
 * - 实时排名更新
 */

import type {
  Leaderboard,
  LeaderboardEntry,
  LeaderboardType,
  LeaderboardPeriod,
  LeaderboardMetric,
  AchievementTier,
} from './types';

/**
 * 排行榜系统类
 */
export class LeaderboardSystem {
  private leaderboards: Map<string, Leaderboard> = new Map();
  private userScores: Map<string, Record<string, number>> = new Map();

  /**
   * 获取排行榜
   */
  getLeaderboard(
    type: LeaderboardType,
    metric: LeaderboardMetric,
    period: LeaderboardPeriod,
    limit: number = 100
  ): Leaderboard {
    const id = this.getLeaderboardId(type, metric, period);

    // 如果已存在且未过期，返回缓存
    const cached = this.leaderboards.get(id);
    if (cached && this.isLeaderboardValid(cached, period)) {
      return cached;
    }

    // 生成新的排行榜
    const leaderboard = this.generateLeaderboard(id, type, metric, period, limit);
    this.leaderboards.set(id, leaderboard);

    return leaderboard;
  }

  /**
   * 生成排行榜ID
   */
  private getLeaderboardId(
    type: LeaderboardType,
    metric: LeaderboardMetric,
    period: LeaderboardPeriod
  ): string {
    return `${type}-${metric}-${period}`;
  }

  /**
   * 检查排行榜是否有效（未过期）
   */
  private isLeaderboardValid(leaderboard: Leaderboard, period: LeaderboardPeriod): boolean {
    const now = Date.now();
    const lastUpdated = leaderboard.lastUpdated.getTime();
    const diff = now - lastUpdated;

    // 根据周期设置缓存时间
    const cacheTime = {
      daily: 5 * 60 * 1000, // 5分钟
      weekly: 15 * 60 * 1000, // 15分钟
      monthly: 30 * 60 * 1000, // 30分钟
      'all-time': 60 * 60 * 1000, // 1小时
    }[period];

    return diff < cacheTime;
  }

  /**
   * 生成排行榜数据
   */
  private generateLeaderboard(
    id: string,
    type: LeaderboardType,
    metric: LeaderboardMetric,
    period: LeaderboardPeriod,
    limit: number
  ): Leaderboard {
    // 模拟数据生成（实际应从数据库查询）
    const entries = this.generateMockEntries(metric, limit);

    return {
      id,
      type,
      metric,
      period,
      entries,
      myRank: this.calculateMyRank(entries, 'current_user'),
      totalEntries: entries.length,
      lastUpdated: new Date(),
    };
  }

  /**
   * 生成模拟排行榜条目（实际应从数据库查询）
   */
  private generateMockEntries(metric: LeaderboardMetric, limit: number): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = [];

    // 用户名和头像池
    const usernames = [
      'AgentMaster',
      'TaskHero',
      'CodeNinja',
      'DataWizard',
      'AIExpert',
      'BugHunter',
      'FeatureKing',
      'SpeedRunner',
      'QualityGuru',
      'TeamLeader',
      'SocialStar',
      'CreativeGenius',
      'LoyalUser',
      'MilestoneChaser',
      'AchievementHunter',
    ];

    const avatars = ['🤖', '👨‍💻', '👩‍💻', '🧙', '🦸', '🥷', '👑', '⭐', '💎', '🏆'];

    const tiers: AchievementTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

    for (let i = 0; i < limit; i++) {
      const rank = i + 1;
      const score = this.generateScoreForRank(rank, metric);
      const change = Math.floor(Math.random() * 21) - 10; // -10 to +10

      entries.push({
        rank,
        userId: `user-${i + 1}`,
        username: `${usernames[i % usernames.length]}_${Math.floor(Math.random() * 999)}`,
        avatar: avatars[i % avatars.length],
        score,
        change,
        badge: rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : undefined,
        tier: rank <= 10 ? tiers[Math.min(4, Math.floor(rank / 2))] : undefined,
      });
    }

    return entries;
  }

  /**
   * 为特定排名生成合理的分数
   */
  private generateScoreForRank(rank: number, metric: LeaderboardMetric): number {
    // 基础分数（第一名）
    const baseScores: Record<LeaderboardMetric, number> = {
      xp: 100000,
      agents: 500,
      tasks: 1000,
      achievements: 95,
      streak: 365,
    };

    const baseScore = baseScores[metric] || 10000;

    // 使用对数递减公式，使排名差距合理
    const decayFactor = 1 - Math.log(rank) / Math.log(100);
    const score = Math.floor(baseScore * Math.max(0.1, decayFactor));

    return score;
  }

  /**
   * 计算我的排名
   */
  private calculateMyRank(entries: LeaderboardEntry[], userId: string): number | undefined {
    const myEntry = entries.find((e) => e.userId === userId);
    return myEntry?.rank;
  }

  /**
   * 更新用户排名
   */
  updateRank(userId: string, metric: LeaderboardMetric, score: number): void {
    // 获取用户的所有分数记录
    let userScores = this.userScores.get(userId);
    if (!userScores) {
      userScores = {};
      this.userScores.set(userId, userScores);
    }

    // 更新分数
    userScores[metric] = score;

    // 使所有相关排行榜失效（需要重新生成）
    this.invalidateLeaderboardsForMetric(metric);

    console.log(`📊 Rank Updated: ${userId} - ${metric}: ${score}`);
  }

  /**
   * 使特定指标的所有排行榜失效
   */
  private invalidateLeaderboardsForMetric(metric: LeaderboardMetric): void {
    for (const [id, leaderboard] of this.leaderboards) {
      if (leaderboard.metric === metric) {
        // 设置为过期状态（通过修改lastUpdated）
        leaderboard.lastUpdated = new Date(0);
      }
    }
  }

  /**
   * 获取用户的排名（所有排行榜）
   */
  getMyRank(userId: string, leaderboardId: string): number {
    const leaderboard = this.leaderboards.get(leaderboardId);
    if (!leaderboard) {
      return -1;
    }

    const entry = leaderboard.entries.find((e) => e.userId === userId);
    return entry?.rank ?? -1;
  }

  /**
   * 获取用户的所有排名
   */
  getMyAllRanks(userId: string) {
    const ranks: Record<string, number> = {};

    for (const [id, leaderboard] of this.leaderboards) {
      const rank = this.getMyRank(userId, id);
      if (rank > 0) {
        ranks[id] = rank;
      }
    }

    return ranks;
  }

  /**
   * 获取前N名用户
   */
  getTopUsers(
    metric: LeaderboardMetric,
    period: LeaderboardPeriod = 'all-time',
    limit: number = 10
  ): LeaderboardEntry[] {
    const leaderboard = this.getLeaderboard('global', metric, period, limit);
    return leaderboard.entries.slice(0, limit);
  }

  /**
   * 获取用户周围的排名（前后各N名）
   */
  getNearbyRanks(
    userId: string,
    metric: LeaderboardMetric,
    period: LeaderboardPeriod,
    range: number = 5
  ): LeaderboardEntry[] {
    const leaderboard = this.getLeaderboard('global', metric, period, 1000);
    const myRank = this.calculateMyRank(leaderboard.entries, userId);

    if (!myRank) {
      return [];
    }

    const startIndex = Math.max(0, myRank - range - 1);
    const endIndex = Math.min(leaderboard.entries.length, myRank + range);

    return leaderboard.entries.slice(startIndex, endIndex);
  }

  /**
   * 获取团队排行榜
   */
  getTeamLeaderboard(
    teamId: string,
    metric: LeaderboardMetric,
    period: LeaderboardPeriod,
    limit: number = 50
  ): Leaderboard {
    // 实际应从数据库查询团队成员数据
    // 这里返回模拟数据
    return this.getLeaderboard('team', metric, period, limit);
  }

  /**
   * 获取好友排行榜
   */
  getFriendsLeaderboard(
    userId: string,
    metric: LeaderboardMetric,
    period: LeaderboardPeriod
  ): Leaderboard {
    // 实际应查询用户的好友列表
    return this.getLeaderboard('friends', metric, period, 50);
  }

  /**
   * 获取地区排行榜
   */
  getRegionLeaderboard(
    region: string,
    metric: LeaderboardMetric,
    period: LeaderboardPeriod,
    limit: number = 100
  ): Leaderboard {
    // 实际应根据地区筛选用户
    return this.getLeaderboard('region', metric, period, limit);
  }

  /**
   * 批量更新排名
   */
  batchUpdateRanks(updates: Array<{ userId: string; metric: LeaderboardMetric; score: number }>): void {
    updates.forEach(({ userId, metric, score }) => {
      this.updateRank(userId, metric, score);
    });

    console.log(`📊 Batch Rank Update: ${updates.length} updates processed`);
  }

  /**
   * 计算用户的总排名分数
   */
  calculateOverallScore(userId: string): number {
    const scores = this.userScores.get(userId);
    if (!scores) {
      return 0;
    }

    // 加权计算总分
    const weights: Record<LeaderboardMetric, number> = {
      xp: 1.0,
      agents: 10,
      tasks: 5,
      achievements: 20,
      streak: 15,
    };

    let totalScore = 0;
    for (const [metric, score] of Object.entries(scores)) {
      const weight = weights[metric as LeaderboardMetric] || 1;
      totalScore += score * weight;
    }

    return Math.floor(totalScore);
  }

  /**
   * 获取排行榜统计信息
   */
  getLeaderboardStats(leaderboardId: string) {
    const leaderboard = this.leaderboards.get(leaderboardId);
    if (!leaderboard) {
      return null;
    }

    const scores = leaderboard.entries.map((e) => e.score);
    const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const medianScore = this.calculateMedian(scores);
    const topScore = Math.max(...scores);
    const bottomScore = Math.min(...scores);

    return {
      totalEntries: leaderboard.totalEntries,
      averageScore: Math.floor(averageScore),
      medianScore,
      topScore,
      bottomScore,
      scoreRange: topScore - bottomScore,
      lastUpdated: leaderboard.lastUpdated,
      type: leaderboard.type,
      metric: leaderboard.metric,
      period: leaderboard.period,
    };
  }

  /**
   * 计算中位数
   */
  private calculateMedian(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      return sorted[mid];
    }
  }

  /**
   * 获取排名变化趋势
   */
  getRankTrend(userId: string, metric: LeaderboardMetric, periods: number = 7): number[] {
    // 实际应从历史数据查询
    // 这里返回模拟趋势数据
    const trend: number[] = [];
    let currentRank = 50;

    for (let i = 0; i < periods; i++) {
      currentRank += Math.floor(Math.random() * 11) - 5; // -5 to +5 变化
      currentRank = Math.max(1, currentRank); // 至少是第1名
      trend.push(currentRank);
    }

    return trend;
  }

  /**
   * 预测下次更新的排名
   */
  predictNextRank(
    userId: string,
    metric: LeaderboardMetric,
    currentScore: number,
    predictedIncrease: number
  ): number {
    const leaderboard = this.getLeaderboard('global', metric, 'all-time', 1000);
    const newScore = currentScore + predictedIncrease;

    // 找到新分数应该在的位置
    let predictedRank = 1;
    for (const entry of leaderboard.entries) {
      if (newScore < entry.score) {
        predictedRank++;
      } else {
        break;
      }
    }

    return predictedRank;
  }

  /**
   * 清除所有缓存的排行榜
   */
  clearCache(): void {
    this.leaderboards.clear();
    console.log('🗑️ Leaderboard cache cleared');
  }

  /**
   * 清除特定排行榜缓存
   */
  clearLeaderboardCache(type: LeaderboardType, metric: LeaderboardMetric, period: LeaderboardPeriod): void {
    const id = this.getLeaderboardId(type, metric, period);
    this.leaderboards.delete(id);
    console.log(`🗑️ Leaderboard cache cleared: ${id}`);
  }
}

// 导出单例实例
export const leaderboardSystem = new LeaderboardSystem();
