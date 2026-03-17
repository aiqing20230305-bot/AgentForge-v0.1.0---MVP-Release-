/**
 * Shop Integration Examples
 * Shows how to integrate the shop system with various features
 */

import { useShopStore } from '../store/useShopStore'
import { useShopIntegration } from '../hooks/useShopIntegration'
import { useDataSourceStore } from '../store/useDataSourceStore'

/**
 * Example 1: Award coins when a task is completed
 */
export function onTaskCompleted(taskId: string, complexity: 'simple' | 'medium' | 'complex') {
  const { awardTaskCoins } = useShopIntegration()

  // Award coins based on task complexity
  awardTaskCoins(complexity)

  console.log(`Task ${taskId} completed! Coins awarded.`)
}

/**
 * Example 2: Award coins when an achievement is unlocked
 */
export function onAchievementUnlocked(achievementId: string) {
  const { awardAchievementCoins } = useShopIntegration()

  // Award coins from achievement rewards
  awardAchievementCoins(achievementId)

  console.log(`Achievement ${achievementId} unlocked! Coins awarded.`)
}

/**
 * Example 3: Award coins on level up
 */
export function onLevelUp(newLevel: number) {
  const { awardLevelUpCoins } = useShopIntegration()

  // Award coins with level-based bonuses
  awardLevelUpCoins(newLevel)

  console.log(`Level up to ${newLevel}! Coins awarded.`)
}

/**
 * Example 4: Award coins for battle victory
 */
export function onBattleEnd(battleType: 'pvp' | 'pve' | 'ranked', won: boolean) {
  const { awardBattleCoins } = useShopIntegration()

  // Award coins if battle was won
  awardBattleCoins(battleType, won)

  if (won) {
    console.log(`Battle won! Coins awarded.`)
  }
}

/**
 * Example 5: Award coins for daily login
 */
export function onDailyLogin() {
  const { dailyRewardStreak } = useShopStore.getState()
  const { awardDailyLoginCoins } = useShopIntegration()

  // Award coins with streak bonus
  awardDailyLoginCoins(dailyRewardStreak)

  console.log(`Daily login! Coins awarded. Streak: ${dailyRewardStreak} days`)
}

/**
 * Example 6: Check if player can afford an item
 */
export function canAffordItem(itemId: string): boolean {
  const { coins, getShopItems, canPurchase } = useShopStore.getState()
  const agents = useDataSourceStore.getState().agents
  const agentLevel = agents[0]?.level || 1

  const item = getShopItems().find(i => i.id === itemId)
  if (!item) return false

  const check = canPurchase(item, agentLevel)
  return check.can
}

/**
 * Example 7: Purchase and immediately use an item
 */
export function purchaseAndUseItem(itemId: string) {
  const { purchaseItem, useItem } = useShopStore.getState()

  // Purchase
  const purchased = purchaseItem(itemId)
  if (!purchased) {
    console.error('Purchase failed')
    return false
  }

  // Use immediately
  const used = useItem(itemId)
  if (!used) {
    console.error('Use failed')
    return false
  }

  console.log('Item purchased and used successfully!')
  return true
}

/**
 * Example 8: Apply experience boost to task completion
 */
export function calculateExpWithBoost(baseExp: number): number {
  const { getActiveBoosts } = useShopIntegration()
  const { expBoost } = getActiveBoosts()

  const finalExp = baseExp * expBoost

  console.log(`Base EXP: ${baseExp}, Multiplier: ${expBoost}x, Final: ${finalExp}`)
  return finalExp
}

/**
 * Example 9: Apply speed boost to task execution
 */
export function calculateTaskDurationWithBoost(baseDuration: number): number {
  const { getActiveBoosts } = useShopIntegration()
  const { speedBoost } = getActiveBoosts()

  // Speed boost reduces duration
  const finalDuration = baseDuration / speedBoost

  console.log(`Base duration: ${baseDuration}s, Speed: ${speedBoost}x, Final: ${finalDuration}s`)
  return finalDuration
}

/**
 * Example 10: Get player's shop statistics
 */
export function getShopStats() {
  const {
    coins,
    totalCoinsEarned,
    totalCoinsSpent,
    inventory,
    activeEffects,
    dailyRewardStreak
  } = useShopStore.getState()

  return {
    currentCoins: coins,
    totalEarned: totalCoinsEarned,
    totalSpent: totalCoinsSpent,
    itemsOwned: inventory.length,
    activeEffectsCount: activeEffects.length,
    loginStreak: dailyRewardStreak,
    netWorth: totalCoinsEarned - totalCoinsSpent
  }
}

/**
 * Example 11: Check if any effects are active
 */
export function hasAnyActiveEffects(): boolean {
  const { getActiveBoosts } = useShopIntegration()
  const { hasSpeedBoost, hasExpBoost } = getActiveBoosts()

  return hasSpeedBoost || hasExpBoost
}

/**
 * Example 12: Get time remaining on active effects
 */
export function getEffectTimeRemaining(effectType: 'speed' | 'exp'): number | null {
  const { activeEffects } = useShopStore.getState()

  const effect = activeEffects.find(e => e.effectType === effectType)
  if (!effect) return null

  const timeRemaining = Math.max(
    0,
    Math.floor((new Date(effect.expiresAt).getTime() - Date.now()) / 1000)
  )

  return timeRemaining
}

/**
 * Example 13: Award bonus coins for achievements
 */
export function awardBonusCoins(amount: number, reason: string) {
  const { addCoins } = useShopStore.getState()
  addCoins(amount, reason)

  console.log(`Bonus coins awarded: ${amount} (${reason})`)
}

/**
 * Example 14: Implement a referral reward system
 */
export function onReferralComplete(referrerId: string, newUserId: string) {
  const { addCoins } = useShopStore.getState()

  // Award referrer 500 coins
  addCoins(500, `推荐奖励: 邀请了新用户 ${newUserId}`)

  // New user would get 200 coins (handled in their session)
  console.log(`Referral completed! Referrer ${referrerId} earned 500 coins.`)
}

/**
 * Example 15: Seasonal event bonus
 */
export function onSeasonalEventComplete(eventName: string) {
  const { addCoins } = useShopStore.getState()

  // Award special event coins
  const eventCoins = 1000
  addCoins(eventCoins, `季节活动奖励: ${eventName}`)

  console.log(`Event "${eventName}" completed! ${eventCoins} coins awarded.`)
}
