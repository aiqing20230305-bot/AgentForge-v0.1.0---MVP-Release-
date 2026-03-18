/**
 * 游戏化系统v2.0 - 统一导出
 *
 * @module gamification
 */

// 类型定义
export type * from './types';

// 成就引擎
export { AchievementEngine, achievementEngine } from './achievementEngine';

// 每日任务生成器
export { DailyChallengeGenerator, dailyChallengeGenerator } from './dailyChallengeGenerator';

// 排行榜系统
export { LeaderboardSystem, leaderboardSystem } from './leaderboardSystem';

// 货币管理器
export { CurrencyManager, currencyManager } from './currencyManager';

/**
 * 游戏化系统主类
 *
 * 统一管理所有游戏化功能
 */
export class GamificationSystem {
  constructor(
    public readonly achievements = achievementEngine,
    public readonly dailyChallenge = dailyChallengeGenerator,
    public readonly leaderboard = leaderboardSystem,
    public readonly currency = currencyManager
  ) {}

  /**
   * 初始化游戏化系统
   */
  async initialize(userId: string): Promise<void> {
    console.log('🎮 Initializing Gamification System v2.0...');

    // 加载用户数据（实际应从后端API获取）
    // await this.loadUserData(userId);

    // 生成今日挑战
    const userLevel = 1; // 实际应从用户数据获取
    this.dailyChallenge.generateDailyTasks(userLevel);

    console.log('✅ Gamification System initialized');
  }

  /**
   * 获取用户游戏化统计
   */
  getUserStats() {
    return {
      achievements: this.achievements.getAchievementStats(),
      dailyChallenge: this.dailyChallenge.getChallengeStats(),
      currency: this.currency.getCurrencyStats(),
      // leaderboard排名需要单独查询
    };
  }

  /**
   * 处理游戏事件
   */
  async handleGameEvent(event: import('./types').GameEvent): Promise<void> {
    // 检查成就触发
    const triggeredAchievements = this.achievements.checkAchievements(event);

    // 发放成就奖励
    for (const achievement of triggeredAchievements) {
      if (achievement.reward.coins) {
        await this.currency.earnCurrency('coins', achievement.reward.coins, `Achievement: ${achievement.name}`);
      }
      if (achievement.reward.gems) {
        await this.currency.earnCurrency('gems', achievement.reward.gems, `Achievement: ${achievement.name}`);
      }
      if (achievement.reward.xp) {
        // XP应该在用户等级系统中处理
        console.log(`✨ Earned ${achievement.reward.xp} XP from achievement: ${achievement.name}`);
      }
    }

    // 更新每日任务进度
    // 根据事件类型更新对应任务
    // ...

    // 更新排行榜
    // this.leaderboard.updateRank(...)
  }
}

// 导出全局单例
export const gamificationSystem = new GamificationSystem();
