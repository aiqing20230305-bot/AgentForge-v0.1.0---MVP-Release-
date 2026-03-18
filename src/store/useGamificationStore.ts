/**
 * 游戏化状态管理 - Gamification Store
 *
 * 使用Zustand管理游戏化系统的全局状态
 */

import { create } from 'zustand';
import type {
  Achievement,
  DailyChallenge,
  Currency,
  UserGameStats,
  Leaderboard,
} from '@/services/gamification/types';

interface GamificationState {
  // 用户统计
  userStats: UserGameStats | null;

  // 货币
  currency: Currency;

  // 成就
  achievements: Achievement[];
  unlockedAchievements: Achievement[];

  // 每日挑战
  dailyChallenge: DailyChallenge | null;

  // 排行榜
  leaderboards: Map<string, Leaderboard>;

  // 加载状态
  loading: boolean;

  // Actions
  setUserStats: (stats: UserGameStats) => void;
  updateCurrency: (currency: Currency) => void;
  addAchievement: (achievement: Achievement) => void;
  unlockAchievement: (achievementId: string) => void;
  setDailyChallenge: (challenge: DailyChallenge) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  setLeaderboard: (id: string, leaderboard: Leaderboard) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  userStats: null,
  currency: {
    coins: 1000,
    gems: 10,
    tokens: 5,
  },
  achievements: [],
  unlockedAchievements: [],
  dailyChallenge: null,
  leaderboards: new Map(),
  loading: false,
};

export const useGamificationStore = create<GamificationState>((set, get) => ({
  ...initialState,

  setUserStats: (stats) => set({ userStats: stats }),

  updateCurrency: (currency) => set({ currency }),

  addAchievement: (achievement) =>
    set((state) => ({
      achievements: [...state.achievements, achievement],
    })),

  unlockAchievement: (achievementId) =>
    set((state) => {
      const achievement = state.achievements.find((a) => a.id === achievementId);
      if (!achievement || achievement.unlockedAt) {
        return state;
      }

      // 标记为已解锁
      achievement.unlockedAt = new Date();
      achievement.progress = 100;

      return {
        achievements: [...state.achievements],
        unlockedAchievements: [...state.unlockedAchievements, achievement],
      };
    }),

  setDailyChallenge: (challenge) => set({ dailyChallenge: challenge }),

  updateTaskProgress: (taskId, progress) =>
    set((state) => {
      if (!state.dailyChallenge) return state;

      const task = state.dailyChallenge.tasks.find((t) => t.id === taskId);
      if (task) {
        task.progress = Math.min(progress, task.target);

        // 检查是否完成
        if (task.progress >= task.target) {
          state.dailyChallenge.completedCount++;
        }
      }

      return {
        dailyChallenge: { ...state.dailyChallenge },
      };
    }),

  setLeaderboard: (id, leaderboard) =>
    set((state) => {
      const newLeaderboards = new Map(state.leaderboards);
      newLeaderboards.set(id, leaderboard);
      return { leaderboards: newLeaderboards };
    }),

  setLoading: (loading) => set({ loading }),

  reset: () => set(initialState),
}));
