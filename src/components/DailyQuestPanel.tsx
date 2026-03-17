/**
 * 每日任务面板
 * FOMO机制：今日不做，奖励消失！
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Circle, Gift, Clock, Flame, Star, X, Minimize2 } from 'lucide-react'
import { useInstantFeedback } from '../hooks/useInstantFeedback'
import { audioSystem } from '../services/audioSystem'
import { useDataSourceStore } from '../store/useDataSourceStore'
import { useTaskStore } from '../stores/taskStore'

export interface DailyQuest {
  id: string
  title: string
  description: string
  progress: number
  target: number
  completed: boolean
  reward: {
    exp: number
    coins: number
    special?: string
  }
}

export const DailyQuestPanel: React.FC = () => {
  const feedback = useInstantFeedback()
  const { agentsCache, addAgentExp, addAgentCoins } = useDataSourceStore()
  const { tasks, selectedAgentId } = useTaskStore()
  const [quests, setQuests] = useState<DailyQuest[]>([])
  const [streak, setStreak] = useState(1) // 连续签到天数
  const [timeLeft, setTimeLeft] = useState('')
  const [isMinimized, setIsMinimized] = useState(false) // 最小化状态
  const [isVisible, setIsVisible] = useState(true) // 显示/隐藏

  // 获取当前选中的Agent
  const currentAgent = agentsCache.find(a => a.id === selectedAgentId) || agentsCache[0]

  // 初始化每日任务
  useEffect(() => {
    const today = new Date().toDateString()
    const savedDate = localStorage.getItem('daily-quests-date')
    const savedQuests = localStorage.getItem('daily-quests')

    if (savedDate === today && savedQuests) {
      setQuests(JSON.parse(savedQuests))
    } else {
      // 生成新的每日任务
      const newQuests: DailyQuest[] = [
        {
          id: 'quest-1',
          title: '完成5个任务',
          description: '今日完成5个任何类型的任务',
          progress: 0,
          target: 5,
          completed: false,
          reward: {
            exp: 500,
            coins: 100
          }
        },
        {
          id: 'quest-2',
          title: '解锁1个技能',
          description: '在技能树中解锁或升级任意技能',
          progress: 0,
          target: 1,
          completed: false,
          reward: {
            exp: 1000,
            coins: 200,
            special: '🎖️ 特殊徽章'
          }
        },
        {
          id: 'quest-3',
          title: '进行1场PvP战斗',
          description: '参与一场Agent对战（胜负不重要）',
          progress: 0,
          target: 1,
          completed: false,
          reward: {
            exp: 800,
            coins: 150,
            special: '⚔️ 战斗积分+10'
          }
        }
      ]
      setQuests(newQuests)
      localStorage.setItem('daily-quests', JSON.stringify(newQuests))
      localStorage.setItem('daily-quests-date', today)
    }

    // 加载连续签到天数
    const savedStreak = localStorage.getItem('daily-streak')
    if (savedStreak) {
      setStreak(parseInt(savedStreak))
    }
  }, [])

  // 监听任务完成，自动更新每日任务进度
  useEffect(() => {
    if (!currentAgent) return

    const today = new Date().toDateString()
    const savedDate = localStorage.getItem('daily-quests-date')
    if (savedDate !== today) return // 只在当天有效

    // 统计今日已完成的任务数
    const completedTasksToday = tasks.filter(t =>
      t.agentId === currentAgent.id &&
      t.status === 'completed' &&
      t.completedAt &&
      new Date(t.completedAt).toDateString() === today
    ).length

    // 更新任务进度
    setQuests(prev => {
      const updated = prev.map(q => {
        if (q.id === 'quest-1') {
          // 完成5个任务
          const newProgress = Math.min(completedTasksToday, q.target)
          return {
            ...q,
            progress: newProgress,
            completed: newProgress >= q.target
          }
        }

        // 其他任务类型的进度追踪
        if (q.id === 'daily_earn_coins' && q.requirement.type === 'earn_coins') {
          // 金币获取追踪
          const totalCoins = agents.reduce((sum, a) => sum + (a.metadata?.coins || 0), 0)
          q.progress = Math.min(totalCoins, q.requirement.target)
        }

        if (q.id === 'daily_level_up' && q.requirement.type === 'level_up') {
          // 升级追踪
          const todayLevelUps = agents.filter(a => {
            const lastLevelUp = a.levelSystem?.lastLevelUp
            if (!lastLevelUp) return false
            const diff = Date.now() - new Date(lastLevelUp).getTime()
            return diff < 86400000 // 24小时内
          }).length
          q.progress = Math.min(todayLevelUps, q.requirement.target)
        }

        return q
      })
      localStorage.setItem('daily-quests', JSON.stringify(updated))
      return updated
    })
  }, [tasks, currentAgent])

  // 更新倒计时
  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0)
      const diff = midnight.getTime() - now.getTime()

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(`${hours}时 ${minutes}分 ${seconds}秒`)
    }

    updateTimeLeft()
    const timer = setInterval(updateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleClaimReward = (questId: string, event: React.MouseEvent) => {
    const quest = quests.find(q => q.id === questId)
    if (!quest || !quest.completed || !currentAgent) return

    // 触发成功反馈和音效
    feedback.onSuccess(event.clientX, event.clientY)
    audioSystem.play('coin')
    setTimeout(() => audioSystem.play('exp_gain'), 100)

    // 实际增加经验和金币
    const bonusMultiplier = 1 + (streak * 0.1) // 连续签到加成
    const finalExp = Math.round(quest.reward.exp * bonusMultiplier)
    const finalCoins = Math.round(quest.reward.coins * bonusMultiplier)

    addAgentExp(currentAgent.id, finalExp)
    addAgentCoins(currentAgent.id, finalCoins)

    console.log(`[DailyQuest] Claimed reward: ${finalExp} EXP, ${finalCoins} coins (${streak}x bonus)`)

    // 标记为已领取
    const updatedQuests = quests.map(q =>
      q.id === questId ? { ...q, completed: false, progress: 0 } : q
    )
    setQuests(updatedQuests)
    localStorage.setItem('daily-quests', JSON.stringify(updatedQuests))
  }

  const completedCount = quests.filter(q => q.completed).length
  const totalRewards = quests.reduce(
    (sum, q) => ({
      exp: sum.exp + (q.completed ? q.reward.exp : 0),
      coins: sum.coins + (q.completed ? q.reward.coins : 0)
    }),
    { exp: 0, coins: 0 }
  )

  if (!isVisible) return null

  return (
    <div data-testid="daily-quest-panel" className="fixed bottom-6 right-6 z-40">
      <motion.div
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        className="w-96 bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30 rounded-xl shadow-2xl overflow-hidden"
      >
        {/* 头部 */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6 text-white" />
              <div>
                <h3 className="text-lg font-bold text-white">每日任务</h3>
                <div className="text-xs text-yellow-100">完成 {completedCount}/3</div>
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="flex items-center gap-2">
              {/* 倒计时 */}
              <div className="flex flex-col items-end mr-2">
                <div className="flex items-center gap-1 text-yellow-100">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-mono">{timeLeft}</span>
                </div>
                <div className="text-[10px] text-yellow-200">后重置</div>
              </div>

              <button
                onClick={(e) => {
                  feedback.onClick(e)
                  audioSystem.play('click')
                  setIsMinimized(!isMinimized)
                }}
                className="p-1.5 hover:bg-white/10 rounded transition-all feedback-button-scale"
                title={isMinimized ? "展开" : "最小化"}
              >
                <Minimize2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={(e) => {
                  feedback.onClick(e)
                  audioSystem.play('click')
                  setIsVisible(false)
                }}
                className="p-1.5 hover:bg-white/10 rounded transition-all feedback-button-scale"
                title="关闭"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* 连续签到 */}
          <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
            <Flame className="w-5 h-5 text-orange-400" />
            <div className="flex-1">
              <div className="text-xs text-yellow-100">连续签到</div>
              <div className="text-lg font-bold text-white">{streak} 天</div>
            </div>
            <div className="text-xs text-yellow-200">+{streak * 10}% 奖励</div>
          </div>
        </div>

        {/* 任务列表（可折叠）*/}
        {!isMinimized && (
        <>
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {quests.map((quest, index) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border-2 transition-all ${
                quest.completed
                  ? 'bg-green-900/30 border-green-500'
                  : 'bg-gray-800/50 border-gray-700'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* 状态图标 */}
                <div className="mt-0.5">
                  {quest.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-400 fill-green-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-500" />
                  )}
                </div>

                {/* 任务信息 */}
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-sm ${quest.completed ? 'text-green-400' : 'text-white'}`}>
                    {quest.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">{quest.description}</p>

                  {/* 进度条 */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>进度</span>
                      <span>{quest.progress}/{quest.target}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${quest.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(quest.progress / quest.target) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* 奖励 */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-900/30 rounded text-xs">
                      <Star className="w-3 h-3 text-blue-400" />
                      <span className="text-blue-400 font-bold">+{quest.reward.exp} XP</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-900/30 rounded text-xs">
                      <span className="text-yellow-400">💰</span>
                      <span className="text-yellow-400 font-bold">+{quest.reward.coins}</span>
                    </div>
                    {quest.reward.special && (
                      <div className="px-2 py-1 bg-purple-900/30 rounded text-xs text-purple-400 font-bold">
                        {quest.reward.special}
                      </div>
                    )}
                  </div>

                  {/* 领取按钮 */}
                  {quest.completed && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleClaimReward(quest.id, e)}
                      className="mt-2 w-full py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-lg font-bold text-white text-sm shadow-lg hover:shadow-green-500/50 transition-all feedback-button-glow"
                    >
                      <Gift className="inline w-4 h-4 mr-1" />
                      领取奖励
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 底部总结 */}
        {completedCount > 0 && (
          <div className="p-4 bg-gradient-to-r from-green-900/30 to-blue-900/30 border-t border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">今日可获得：</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-blue-400 font-bold">
                  <Star className="w-4 h-4" />
                  +{totalRewards.exp} XP
                </div>
                <div className="flex items-center gap-1 text-yellow-400 font-bold">
                  💰 +{totalRewards.coins}
                </div>
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </motion.div>
    </div>
  )
}
