/**
 * Game Shop Component
 * Virtual currency shop with items and daily rewards
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Coins,
  Gift,
  Package,
  Sparkles,
  Clock,
  TrendingUp,
  Zap,
  Star,
  Crown,
  X,
  Check,
  AlertCircle
} from 'lucide-react'
import { useShopStore, type ShopItem, type ItemCategory } from '../store/useShopStore'
import { useDataSourceStore } from '../store/useDataSourceStore'

interface GameShopProps {
  agentId?: string
}

export const GameShop: React.FC<GameShopProps> = ({ agentId }) => {
  const {
    coins,
    totalCoinsEarned,
    totalCoinsSpent,
    inventory,
    activeEffects,
    dailyRewardStreak,
    getShopItems,
    canPurchase,
    purchaseItem,
    useItem,
    claimDailyReward,
    canClaimDailyReward,
    resetDailyLimits,
    getActiveEffects
  } = useShopStore()

  const agents = useDataSourceStore(state => state.agents)
  const currentAgent = agentId ? agents.find(a => a.id === agentId) : agents[0]
  const agentLevel = currentAgent?.level || 1

  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all')
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const [activeTab, setActiveTab] = useState<'shop' | 'inventory' | 'effects'>('shop')
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const shopItems = getShopItems()

  // Reset daily limits on mount
  useEffect(() => {
    resetDailyLimits()
  }, [resetDailyLimits])

  // Update active effects
  useEffect(() => {
    const interval = setInterval(() => {
      getActiveEffects()
    }, 1000)
    return () => clearInterval(interval)
  }, [getActiveEffects])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const handlePurchase = (item: ShopItem) => {
    const check = canPurchase(item, agentLevel)
    if (!check.can) {
      showNotification('error', check.reason || '无法购买')
      return
    }

    const success = purchaseItem(item.id)
    if (success) {
      showNotification('success', `成功购买 ${item.name}!`)
      setSelectedItem(null)
    } else {
      showNotification('error', '购买失败')
    }
  }

  const handleUseItem = (itemId: string) => {
    const item = shopItems.find(i => i.id === itemId)
    if (!item) return

    const success = useItem(itemId)
    if (success) {
      showNotification('success', `成功使用 ${item.name}!`)
    } else {
      showNotification('error', '使用失败')
    }
  }

  const handleClaimDailyReward = () => {
    if (!canClaimDailyReward()) {
      showNotification('error', '今日奖励已领取')
      return
    }

    const result = claimDailyReward()
    if (result.success && result.reward) {
      let message = `获得 ${result.reward.coins} 金币!`
      if (result.reward.item) {
        message += ` 额外获得 ${result.reward.item.name}!`
      }
      showNotification('success', message)
    }
  }

  const filteredItems =
    selectedCategory === 'all'
      ? shopItems
      : shopItems.filter(item => item.category === selectedCategory)

  const rarityColors = {
    common: 'from-gray-500 to-gray-600',
    rare: 'from-blue-500 to-blue-600',
    epic: 'from-purple-500 to-purple-600',
    legendary: 'from-yellow-500 to-orange-600'
  }

  const categoryIcons = {
    boost: Zap,
    exp: TrendingUp,
    skill: Sparkles,
    cosmetic: Star
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">游戏化商店</h2>
            <p className="text-sm text-gray-400">使用金币购买道具提升你的Agent</p>
          </div>
        </div>

        {/* Currency Display */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="text-xl font-bold text-yellow-500">{coins.toLocaleString()}</span>
          </div>

          {canClaimDailyReward() && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClaimDailyReward}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg text-white font-semibold"
            >
              <Gift className="w-5 h-5" />
              每日奖励
            </motion.button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-800/50">
        <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-xs text-gray-400">总收入</p>
            <p className="text-lg font-bold text-white">{totalCoinsEarned.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
          <ShoppingCart className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-xs text-gray-400">总支出</p>
            <p className="text-lg font-bold text-white">{totalCoinsSpent.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
          <Star className="w-5 h-5 text-yellow-500" />
          <div>
            <p className="text-xs text-gray-400">连续签到</p>
            <p className="text-lg font-bold text-white">{dailyRewardStreak} 天</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-4 border-b border-gray-700">
        {(['shop', 'inventory', 'effects'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === tab
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tab === 'shop' && '商店'}
            {tab === 'inventory' && '背包'}
            {tab === 'effects' && '效果'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'shop' && (
          <>
            {/* Category Filter */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  selectedCategory === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                全部
              </button>
              {(['boost', 'exp', 'skill', 'cosmetic'] as ItemCategory[]).map(cat => {
                const Icon = categoryIcons[cat]
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                      selectedCategory === cat
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat === 'boost' && '加速'}
                    {cat === 'exp' && '经验'}
                    {cat === 'skill' && '技能'}
                    {cat === 'cosmetic' && '装饰'}
                  </button>
                )
              })}
            </div>

            {/* Shop Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map(item => {
                const check = canPurchase(item, agentLevel)
                const owned = inventory.find(i => i.itemId === item.id)

                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedItem(item)}
                    className={`relative p-4 rounded-xl bg-gradient-to-br ${rarityColors[item.rarity]} cursor-pointer shadow-lg`}
                  >
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 text-xs font-bold text-white bg-black/30 rounded-full">
                        {item.rarity}
                      </span>
                    </div>

                    <div className="text-4xl mb-3">{item.icon}</div>

                    <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                    <p className="text-sm text-white/80 mb-3 line-clamp-2">{item.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-300" />
                        <span className="font-bold text-white">{item.price}</span>
                      </div>

                      {owned && owned.quantity > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-black/30 rounded-full">
                          <Package className="w-3 h-3 text-white" />
                          <span className="text-xs font-bold text-white">{owned.quantity}</span>
                        </div>
                      )}
                    </div>

                    {!check.can && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-red-300">
                        <AlertCircle className="w-3 h-3" />
                        {check.reason}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </>
        )}

        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {inventory.map(ownedItem => {
              const item = shopItems.find(i => i.id === ownedItem.itemId)
              if (!item) return null

              return (
                <motion.div
                  key={ownedItem.itemId}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-xl bg-gradient-to-br ${rarityColors[item.rarity]} shadow-lg`}
                >
                  <div className="text-4xl mb-3">{item.icon}</div>

                  <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                  <p className="text-sm text-white/80 mb-3 line-clamp-2">{item.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-white" />
                      <span className="font-bold text-white">x{ownedItem.quantity}</span>
                    </div>

                    {item.type === 'consumable' && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleUseItem(item.id)}
                        className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-semibold"
                      >
                        使用
                      </motion.button>
                    )}

                    {item.type === 'permanent' && (
                      <div className="flex items-center gap-1 text-green-300">
                        <Check className="w-4 h-4" />
                        <span className="text-xs font-bold">已拥有</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}

            {inventory.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
                <Package className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg">背包空空如也</p>
                <p className="text-sm">去商店购买道具吧!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="space-y-4">
            {activeEffects.map(effect => {
              const item = shopItems.find(i => i.id === effect.itemId)
              if (!item) return null

              const timeRemaining = Math.max(
                0,
                Math.floor((new Date(effect.expiresAt).getTime() - Date.now()) / 1000)
              )
              const hours = Math.floor(timeRemaining / 3600)
              const minutes = Math.floor((timeRemaining % 3600) / 60)
              const seconds = timeRemaining % 60

              return (
                <motion.div
                  key={effect.itemId + effect.startedAt}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30"
                >
                  <div className="text-3xl">{item.icon}</div>

                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white">{item.name}</h4>
                    <p className="text-sm text-gray-300">
                      {effect.effectType === 'speed' && `速度 ${effect.multiplier}x`}
                      {effect.effectType === 'exp' && `经验 ${effect.multiplier}x`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2 bg-black/30 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-mono text-white">
                      {hours > 0 && `${hours}:`}
                      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </span>
                  </div>
                </motion.div>
              )
            })}

            {activeEffects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Sparkles className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg">暂无激活效果</p>
                <p className="text-sm">使用道具来获得增益效果</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className={`max-w-md w-full p-6 rounded-2xl bg-gradient-to-br ${
                rarityColors[selectedItem.rarity]
              } shadow-2xl`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-6xl">{selectedItem.icon}</div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">{selectedItem.name}</h3>
              <p className="text-white/90 mb-4">{selectedItem.description}</p>

              {selectedItem.effect && (
                <div className="p-3 bg-black/20 rounded-lg mb-4">
                  <p className="text-sm text-white/80 font-semibold mb-1">效果:</p>
                  <p className="text-white">
                    {selectedItem.effect.type === 'speed' &&
                      `速度提升 ${selectedItem.effect.value}x`}
                    {selectedItem.effect.type === 'exp' &&
                      `经验提升 ${(selectedItem.effect.value - 1) * 100}%`}
                    {selectedItem.effect.type === 'skill_points' &&
                      `获得 ${selectedItem.effect.value} 技能点`}
                    {selectedItem.effect.duration &&
                      ` (${Math.floor(selectedItem.effect.duration / 60)}分钟)`}
                  </p>
                </div>
              )}

              {selectedItem.requirement && (
                <div className="mb-4 text-sm text-white/80">
                  {selectedItem.requirement.level && (
                    <p>需要等级: {selectedItem.requirement.level}</p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6 text-yellow-300" />
                  <span className="text-2xl font-bold text-white">{selectedItem.price}</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePurchase(selectedItem)}
                  disabled={!canPurchase(selectedItem, agentLevel).can}
                  className="px-6 py-3 bg-white text-gray-900 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  购买
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div
              className={`flex items-center gap-3 px-6 py-3 rounded-lg shadow-lg ${
                notification.type === 'success'
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {notification.type === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-semibold">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
