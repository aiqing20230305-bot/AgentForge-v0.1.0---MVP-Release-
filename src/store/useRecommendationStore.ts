/**
 * 推荐系统 Store
 * 管理任务推荐的状态和历史
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TaskRecommendation } from '../services/ai/recommendationEngine'

/**
 * 推荐反馈
 */
export interface RecommendationFeedback {
  recommendationId: string
  taskId: string
  agentId: string
  accepted: boolean // 是否接受推荐
  timestamp: Date
  actualOutcome?: 'success' | 'failed' // 实际结果
  userRating?: number // 1-5 用户评分
}

/**
 * 推荐统计
 */
export interface RecommendationStats {
  totalRecommendations: number
  acceptedRecommendations: number
  rejectedRecommendations: number
  accuracyRate: number // 准确率
  avgUserRating: number
}

/**
 * Store 接口
 */
interface RecommendationStore {
  // 状态
  feedbackHistory: RecommendationFeedback[]
  isEnabled: boolean
  confidenceThreshold: number // 0-1，低于此值不显示推荐

  // 操作
  addFeedback: (feedback: RecommendationFeedback) => void
  updateFeedbackOutcome: (
    recommendationId: string,
    outcome: 'success' | 'failed',
    rating?: number
  ) => void
  getStats: () => RecommendationStats
  clearHistory: () => void
  setEnabled: (enabled: boolean) => void
  setConfidenceThreshold: (threshold: number) => void

  // 查询
  getAccuracyForAgent: (agentId: string) => number
  getRecentFeedback: (limit: number) => RecommendationFeedback[]
}

/**
 * 创建 Store
 */
export const useRecommendationStore = create<RecommendationStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      feedbackHistory: [],
      isEnabled: true,
      confidenceThreshold: 0.5,

      // 添加反馈
      addFeedback: (feedback) => {
        set((state) => ({
          feedbackHistory: [
            ...state.feedbackHistory,
            { ...feedback, timestamp: new Date() }
          ],
        }))
      },

      // 更新反馈结果
      updateFeedbackOutcome: (recommendationId, outcome, rating) => {
        set((state) => ({
          feedbackHistory: state.feedbackHistory.map((f) =>
            f.recommendationId === recommendationId
              ? { ...f, actualOutcome: outcome, userRating: rating }
              : f
          ),
        }))
      },

      // 获取统计信息
      getStats: () => {
        const { feedbackHistory } = get()

        const total = feedbackHistory.length
        const accepted = feedbackHistory.filter((f) => f.accepted).length
        const rejected = total - accepted

        // 计算准确率（接受的推荐中，成功的比例）
        const acceptedWithOutcome = feedbackHistory.filter(
          (f) => f.accepted && f.actualOutcome
        )
        const successfulRecommendations = acceptedWithOutcome.filter(
          (f) => f.actualOutcome === 'success'
        ).length

        const accuracyRate =
          acceptedWithOutcome.length > 0
            ? successfulRecommendations / acceptedWithOutcome.length
            : 1

        // 计算平均评分
        const ratingsHistory = feedbackHistory.filter(f => f.userRating !== undefined)
        const avgUserRating =
          ratingsHistory.length > 0
            ? ratingsHistory.reduce((sum, f) => sum + (f.userRating || 0), 0) /
              ratingsHistory.length
            : 0

        return {
          totalRecommendations: total,
          acceptedRecommendations: accepted,
          rejectedRecommendations: rejected,
          accuracyRate,
          avgUserRating,
        }
      },

      // 清空历史
      clearHistory: () => {
        set({ feedbackHistory: [] })
      },

      // 设置启用状态
      setEnabled: (enabled) => {
        set({ isEnabled: enabled })
      },

      // 设置置信度阈值
      setConfidenceThreshold: (threshold) => {
        set({ confidenceThreshold: Math.max(0, Math.min(1, threshold)) })
      },

      // 获取Agent的推荐准确率
      getAccuracyForAgent: (agentId) => {
        const { feedbackHistory } = get()

        const agentFeedback = feedbackHistory.filter(
          (f) => f.agentId === agentId && f.accepted && f.actualOutcome
        )

        if (agentFeedback.length === 0) return 1

        const successful = agentFeedback.filter(
          (f) => f.actualOutcome === 'success'
        ).length

        return successful / agentFeedback.length
      },

      // 获取最近的反馈
      getRecentFeedback: (limit) => {
        const { feedbackHistory } = get()

        return feedbackHistory
          .sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime()
            const timeB = new Date(b.timestamp).getTime()
            return timeB - timeA
          })
          .slice(0, limit)
      },
    }),
    {
      name: 'recommendation-storage',
      partialize: (state) => ({
        feedbackHistory: state.feedbackHistory.slice(-100), // 只保留最近100条
        isEnabled: state.isEnabled,
        confidenceThreshold: state.confidenceThreshold,
      }),
    }
  )
)
