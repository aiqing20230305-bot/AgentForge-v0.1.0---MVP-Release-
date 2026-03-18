/**
 * 每日任务生成器 - Daily Challenge Generator
 *
 * 负责：
 * - 每日任务生成
 * - 难度调整
 * - 奖励计算
 * - 任务进度跟踪
 */

import type { DailyChallenge, DailyTask, Difficulty, Reward } from './types';

/**
 * 每日任务生成器类
 */
export class DailyChallengeGenerator {
  private currentChallenge: DailyChallenge | null = null;

  /**
   * 生成今日任务
   */
  generateDailyTasks(userLevel: number = 1): DailyChallenge {
    const today = new Date().toISOString().split('T')[0];
    const difficulty = this.adjustDifficulty(userLevel);
    const tasks = this.generateTasksForDifficulty(difficulty, userLevel);
    const rewards = this.calculateRewards(difficulty);

    const challenge: DailyChallenge = {
      id: `daily-${today}`,
      date: today,
      tasks,
      rewards,
      difficulty,
      timeLimit: undefined, // 无时间限制（全天有效）
      completedCount: 0,
      maxCompletions: tasks.length,
      expiresAt: this.getEndOfDay(),
    };

    this.currentChallenge = challenge;
    return challenge;
  }

  /**
   * 根据用户等级调整难度
   */
  adjustDifficulty(userLevel: number): Difficulty {
    if (userLevel < 10) {
      return 'easy';
    } else if (userLevel < 25) {
      return 'medium';
    } else if (userLevel < 50) {
      return 'hard';
    } else {
      return 'expert';
    }
  }

  /**
   * 为指定难度生成任务
   */
  private generateTasksForDifficulty(difficulty: Difficulty, userLevel: number): DailyTask[] {
    const taskTemplates = this.getTaskTemplates(difficulty);

    // 根据难度选择任务数量
    const taskCount = {
      easy: 3,
      medium: 4,
      hard: 5,
      expert: 6,
    }[difficulty];

    // 随机选择任务模板
    const selectedTemplates = this.shuffleArray(taskTemplates).slice(0, taskCount);

    // 生成具体任务
    return selectedTemplates.map((template, index) => ({
      id: `task-${index + 1}`,
      name: template.name,
      description: template.description,
      type: template.type,
      target: this.adjustTarget(template.baseTarget, difficulty, userLevel),
      progress: 0,
      reward: this.calculateTaskReward(difficulty),
    }));
  }

  /**
   * 获取任务模板
   */
  private getTaskTemplates(difficulty: Difficulty): Array<{
    name: string;
    description: string;
    type: DailyTask['type'];
    baseTarget: number;
  }> {
    const allTemplates = [
      // Create Agent类型
      {
        name: '创建新Agent',
        description: '创建指定数量的新Agent',
        type: 'create_agent' as const,
        baseTarget: 1,
      },
      {
        name: 'Agent大师',
        description: '创建多个不同类型的Agent',
        type: 'create_agent' as const,
        baseTarget: 2,
      },
      {
        name: 'Agent工厂',
        description: '批量创建Agent',
        type: 'create_agent' as const,
        baseTarget: 5,
      },

      // Complete Task类型
      {
        name: '完成任务',
        description: '完成指定数量的任务',
        type: 'complete_task' as const,
        baseTarget: 3,
      },
      {
        name: '任务清单',
        description: '完成多个任务',
        type: 'complete_task' as const,
        baseTarget: 5,
      },
      {
        name: '任务马拉松',
        description: '完成大量任务',
        type: 'complete_task' as const,
        baseTarget: 10,
      },

      // Achieve类型
      {
        name: '成就猎人',
        description: '解锁任意成就',
        type: 'achieve' as const,
        baseTarget: 1,
      },
      {
        name: '成就收集者',
        description: '解锁多个成就',
        type: 'achieve' as const,
        baseTarget: 2,
      },
      {
        name: '成就大师',
        description: '解锁大量成就',
        type: 'achieve' as const,
        baseTarget: 5,
      },

      // Use Feature类型
      {
        name: '探索者',
        description: '使用新功能',
        type: 'use_feature' as const,
        baseTarget: 1,
      },
      {
        name: '功能专家',
        description: '使用多个不同功能',
        type: 'use_feature' as const,
        baseTarget: 3,
      },
      {
        name: '全能选手',
        description: '使用各种功能',
        type: 'use_feature' as const,
        baseTarget: 5,
      },

      // 组合任务
      {
        name: '创建并部署',
        description: '创建Agent并立即部署',
        type: 'create_agent' as const,
        baseTarget: 1,
      },
      {
        name: '完美配置',
        description: '创建配置完整的Agent',
        type: 'create_agent' as const,
        baseTarget: 1,
      },
      {
        name: '快速行动',
        description: '在30分钟内完成任务',
        type: 'complete_task' as const,
        baseTarget: 5,
      },
    ];

    // 根据难度过滤合适的任务
    return allTemplates.filter((template) => {
      const target = template.baseTarget;

      switch (difficulty) {
        case 'easy':
          return target <= 3;
        case 'medium':
          return target <= 5;
        case 'hard':
          return target <= 10;
        case 'expert':
          return true; // 专家难度包含所有任务
        default:
          return true;
      }
    });
  }

  /**
   * 根据难度调整目标数量
   */
  private adjustTarget(baseTarget: number, difficulty: Difficulty, userLevel: number): number {
    const multiplier = {
      easy: 1.0,
      medium: 1.5,
      hard: 2.0,
      expert: 3.0,
    }[difficulty];

    // 基于用户等级的额外调整（高等级玩家需要完成更多）
    const levelBonus = Math.floor(userLevel / 20);

    return Math.ceil(baseTarget * multiplier) + levelBonus;
  }

  /**
   * 计算任务奖励
   */
  private calculateTaskReward(difficulty: Difficulty): Reward {
    const baseRewards = {
      easy: { xp: 50, coins: 100 },
      medium: { xp: 100, coins: 200, gems: 2 },
      hard: { xp: 200, coins: 400, gems: 5 },
      expert: { xp: 400, coins: 800, gems: 10 },
    };

    return baseRewards[difficulty];
  }

  /**
   * 计算完成所有任务的总奖励
   */
  calculateRewards(difficulty: Difficulty): Reward[] {
    const baseRewards = {
      easy: [
        { xp: 150, coins: 300 },
        { xp: 50, coins: 100 }, // 连续完成奖励
      ],
      medium: [
        { xp: 400, coins: 800, gems: 8 },
        { xp: 100, coins: 200, gems: 2 },
      ],
      hard: [
        { xp: 1000, coins: 2000, gems: 20 },
        { xp: 300, coins: 600, gems: 5 },
      ],
      expert: [
        { xp: 2500, coins: 5000, gems: 50 },
        { xp: 800, coins: 1600, gems: 15 },
        { tokens: 10 }, // 专家难度额外奖励活动代币
      ],
    };

    return baseRewards[difficulty];
  }

  /**
   * 更新任务进度
   */
  updateTaskProgress(taskId: string, progress: number): DailyTask | null {
    if (!this.currentChallenge) {
      return null;
    }

    const task = this.currentChallenge.tasks.find((t) => t.id === taskId);
    if (!task) {
      return null;
    }

    task.progress = Math.min(progress, task.target);

    // 检查是否完成
    if (task.progress >= task.target) {
      this.currentChallenge.completedCount++;
      console.log(`✅ Task Completed: ${task.name}`);
      console.log(`Reward: +${task.reward.xp || 0} XP, +${task.reward.coins || 0} Coins`);
    }

    return task;
  }

  /**
   * 检查每日挑战是否完成
   */
  isChallengeCompleted(): boolean {
    if (!this.currentChallenge) {
      return false;
    }

    return this.currentChallenge.completedCount >= this.currentChallenge.maxCompletions;
  }

  /**
   * 领取完成奖励
   */
  claimCompletionRewards(): Reward[] {
    if (!this.isChallengeCompleted()) {
      return [];
    }

    console.log('🎉 Daily Challenge Completed!');
    return this.currentChallenge!.rewards;
  }

  /**
   * 获取当前挑战
   */
  getCurrentChallenge(): DailyChallenge | null {
    // 检查是否过期
    if (this.currentChallenge && new Date() > this.currentChallenge.expiresAt) {
      this.currentChallenge = null;
    }

    return this.currentChallenge;
  }

  /**
   * 获取今天结束时间
   */
  private getEndOfDay(): Date {
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return endOfDay;
  }

  /**
   * 洗牌数组（Fisher-Yates算法）
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * 生成周挑战（7天挑战）
   */
  generateWeeklyChallenge(userLevel: number = 1): DailyChallenge {
    const today = new Date();
    const weekStart = today.toISOString().split('T')[0];

    const difficulty: Difficulty = userLevel < 30 ? 'medium' : userLevel < 60 ? 'hard' : 'expert';

    const tasks: DailyTask[] = [
      {
        id: 'weekly-1',
        name: '连续登录',
        description: '连续7天登录',
        type: 'achieve',
        target: 7,
        progress: 0,
        reward: { xp: 500, coins: 1000, gems: 15 },
      },
      {
        id: 'weekly-2',
        name: '创建多个Agent',
        description: '本周创建10个Agent',
        type: 'create_agent',
        target: 10,
        progress: 0,
        reward: { xp: 800, coins: 1600, gems: 25 },
      },
      {
        id: 'weekly-3',
        name: '完成大量任务',
        description: '本周完成50个任务',
        type: 'complete_task',
        target: 50,
        progress: 0,
        reward: { xp: 1200, coins: 2400, gems: 40 },
      },
      {
        id: 'weekly-4',
        name: '解锁成就',
        description: '本周解锁5个成就',
        type: 'achieve',
        target: 5,
        progress: 0,
        reward: { xp: 600, coins: 1200, gems: 20 },
      },
    ];

    return {
      id: `weekly-${weekStart}`,
      date: weekStart,
      tasks,
      rewards: [
        { xp: 3000, coins: 6000, gems: 100 },
        { tokens: 50 }, // 周挑战额外奖励
      ],
      difficulty,
      timeLimit: 7 * 24 * 60 * 60, // 7天（秒）
      completedCount: 0,
      maxCompletions: tasks.length,
      expiresAt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
    };
  }

  /**
   * 获取挑战统计
   */
  getChallengeStats() {
    if (!this.currentChallenge) {
      return null;
    }

    const totalTasks = this.currentChallenge.tasks.length;
    const completedTasks = this.currentChallenge.completedCount;
    const totalProgress = this.currentChallenge.tasks.reduce(
      (sum, task) => sum + (task.progress / task.target) * 100,
      0
    );

    return {
      difficulty: this.currentChallenge.difficulty,
      totalTasks,
      completedTasks,
      remainingTasks: totalTasks - completedTasks,
      overallProgress: Math.floor(totalProgress / totalTasks),
      timeRemaining: this.getTimeRemaining(),
      isExpired: new Date() > this.currentChallenge.expiresAt,
    };
  }

  /**
   * 获取剩余时间（秒）
   */
  private getTimeRemaining(): number {
    if (!this.currentChallenge) {
      return 0;
    }

    const now = Date.now();
    const expiresAt = this.currentChallenge.expiresAt.getTime();
    return Math.max(0, Math.floor((expiresAt - now) / 1000));
  }
}

// 导出单例实例
export const dailyChallengeGenerator = new DailyChallengeGenerator();
