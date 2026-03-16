/**
 * Shop Integration Hook
 * Integrates shop system with achievements, leveling, and other systems
 */

import { useEffect, useCallback } from 'react'
import { useShopStore } from '../store/useShopStore'
import { useDataSourceStore } from '../store/useDataSourceStore'
import { ACHIEVEMENTS } from '../data/achievements'

export const useShopIntegration = (agentId?: string) => {
  const addCoins = useShopStore(state => state.addCoins)
  const agents = useDataSourceStore(state => state.agents)
  const currentAgent = agentId ? agents.find(a => a.id === agentId) : agents[0]

  /**
   * Award coins when achievements are unlocked
   */
  const awardAchievementCoins = useCallback(
    (achievementId: string) => {
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
      if (!achievement || !achievement.rewards.coins) return

      addCoins(achievement.rewards.coins, `成就奖励: ${achievement.name}`)
    },
    [addCoins]
  )

  /**
   * Award coins on level up
   */
  const awardLevelUpCoins = useCallback(
    (level: number) => {
      // Base coins: 100 per level
      // Bonus: +50 per 5 levels (milestones)
      const baseCoins = 100
      const milestoneBonus = level % 5 === 0 ? 50 : 0
      const prestigeMultiplier = (currentAgent?.levelSystem?.prestigeLevel || 0) + 1

      const totalCoins = (baseCoins + milestoneBonus) * prestigeMultiplier

      addCoins(totalCoins, `升级奖励 (Lv.${level})`)
    },
    [addCoins, currentAgent]
  )

  /**
   * Award coins for task completion
   */
  const awardTaskCoins = useCallback(
    (taskComplexity: 'simple' | 'medium' | 'complex' = 'medium') => {
      const coinRewards = {
        simple: 10,
        medium: 25,
        complex: 50
      }

      addCoins(coinRewards[taskComplexity], '任务奖励')
    },
    [addCoins]
  )

  /**
   * Award coins for battle victory
   */
  const awardBattleCoins = useCallback(
    (battleType: 'pvp' | 'pve' | 'ranked', won: boolean) => {
      if (!won) return

      const coinRewards = {
        pvp: 50,
        pve: 30,
        ranked: 100
      }

      addCoins(coinRewards[battleType], `${battleType === 'ranked' ? '排位' : battleType === 'pvp' ? 'PvP' : 'PvE'}战斗胜利`)
    },
    [addCoins]
  )

  /**
   * Award coins for daily login
   */
  const awardDailyLoginCoins = useCallback(
    (streak: number) => {
      const baseCoins = 50
      const streakBonus = Math.min(streak, 7) * 10 // Max +70 coins at 7-day streak

      addCoins(baseCoins + streakBonus, `每日登录 (连续${streak}天)`)
    },
    [addCoins]
  )

  /**
   * Check for active boost effects
   */
  const getActiveBoosts = useCallback(() => {
    const activeEffects = useShopStore.getState().getActiveEffects()

    return {
      speedBoost: activeEffects.find(e => e.effectType === 'speed')?.multiplier || 1,
      expBoost: activeEffects.find(e => e.effectType === 'exp')?.multiplier || 1,
      hasSpeedBoost: activeEffects.some(e => e.effectType === 'speed'),
      hasExpBoost: activeEffects.some(e => e.effectType === 'exp')
    }
  }, [])

  return {
    awardAchievementCoins,
    awardLevelUpCoins,
    awardTaskCoins,
    awardBattleCoins,
    awardDailyLoginCoins,
    getActiveBoosts
  }
}
