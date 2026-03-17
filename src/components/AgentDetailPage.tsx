/**
 * Agent详情页面 - 完整信息面板
 * 显示Agent的详细信息、统计数据、技能、任务历史、PVP战绩和成就
 */

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Shield,
  Zap,
  Trophy,
  Swords,
  Clock,
  TrendingUp,
  Edit2,
  Save,
  X,
  BarChart3,
  Activity,
  Target,
  Award,
  Star,
  ChevronLeft
} from 'lucide-react'
import type { AgentData } from '../store/useDataSourceStore'
import { useDataSourceStore } from '../store/useDataSourceStore'
import { usePortraitStore } from '../store/usePortraitStore'
import { useTaskStore } from '../stores/taskStore'
import { transitions } from '../utils/animations'
import { audioSystem } from '../services/audioSystem'
import { ACHIEVEMENTS } from '../data/achievements'

interface AgentDetailPageProps {
  agentId: string
  onClose?: () => void
}

export const AgentDetailPage: React.FC<AgentDetailPageProps> = ({ agentId, onClose }) => {
  const { agentsCache, updateAgentInCache } = useDataSourceStore()
  const { getAgentPortrait, setAgentPortrait, portraits } = usePortraitStore()
  const { tasks, getTaskStats } = useTaskStore()

  const agent = agentsCache.find(a => a.id === agentId)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(agent?.displayName || '')
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)

  if (!agent) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0a] text-white">
        <div className="text-center">
          <p className="text-xl mb-2">Agent未找到</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    )
  }

  const currentPortrait = getAgentPortrait(agentId)
  const agentTasks = tasks.filter(t => t.agentId === agentId.toLowerCase())
  const taskStats = getTaskStats(agentId)

  // 计算统计数据
  const stats = useMemo(() => {
    const completedTasks = agentTasks.filter(t => t.status === 'completed')
    const failedTasks = agentTasks.filter(t => t.status === 'failed')
    const totalTasks = agentTasks.length

    const successRate = totalTasks > 0 ? ((completedTasks.length / totalTasks) * 100).toFixed(1) : '0.0'

    // 计算平均用时（只统计已完成的任务）
    const tasksWithDuration = completedTasks.filter(
      t => t.startedAt && t.completedAt
    )
    const totalDuration = tasksWithDuration.reduce((sum, task) => {
      if (task.startedAt && task.completedAt) {
        const duration = new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime()
        return sum + duration
      }
      return sum
    }, 0)
    const avgDuration = tasksWithDuration.length > 0
      ? Math.round(totalDuration / tasksWithDuration.length / 1000 / 60) // 转换为分钟
      : 0

    return {
      totalTasks,
      completedTasks: completedTasks.length,
      failedTasks: failedTasks.length,
      successRate,
      avgDuration
    }
  }, [agentTasks])

  // 获取最近20个任务
  const recentTasks = useMemo(() => {
    return [...agentTasks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20)
  }, [agentTasks])

  // 成就统计
  const achievementStats = useMemo(() => {
    const unlockedCount = agent.achievements?.unlocked.length || 0
    const totalCount = ACHIEVEMENTS.length
    const percentage = totalCount > 0 ? ((unlockedCount / totalCount) * 100).toFixed(1) : '0.0'

    return { unlockedCount, totalCount, percentage }
  }, [agent.achievements])

  // 保存编辑
  const handleSaveEdit = () => {
    if (editedName.trim()) {
      updateAgentInCache(agentId, { displayName: editedName.trim() })
      audioSystem.playSound('success')
    }
    setIsEditing(false)
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setEditedName(agent.displayName)
    setIsEditing(false)
  }

  // 选择头像
  const handleSelectAvatar = (portraitId: string) => {
    setAgentPortrait(agentId, portraitId)
    setShowAvatarSelector(false)
    audioSystem.playSound('success')
  }

  // 获取任务状态颜色
  const getTaskStatusColor = (status: string) => {
    const colors = {
      pending: 'text-gray-400 bg-gray-700/30',
      in_progress: 'text-blue-400 bg-blue-700/30',
      completed: 'text-green-400 bg-green-700/30',
      failed: 'text-red-400 bg-red-700/30'
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  // 获取任务状态文本
  const getTaskStatusText = (status: string) => {
    const texts = {
      pending: '待处理',
      in_progress: '进行中',
      completed: '已完成',
      failed: '失败'
    }
    return texts[status as keyof typeof texts] || status
  }

  // 获取优先级颜色
  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-400',
      medium: 'text-yellow-400',
      high: 'text-orange-400',
      urgent: 'text-red-400'
    }
    return colors[priority as keyof typeof colors] || colors.low
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#0a0a0a] to-[#050505] text-white">
      {/* 头部导航 */}
      <div className="flex items-center gap-4 p-4 border-b border-white/10 bg-black/30 backdrop-blur-sm">
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="返回"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-2xl font-bold">Agent详情</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 基本信息卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitions.fast}
          className="p-6"
        >
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-white/10 p-6 backdrop-blur-sm">
            <div className="flex items-start gap-6">
              {/* 头像 */}
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-white/20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 cursor-pointer"
                  onClick={() => setShowAvatarSelector(true)}
                >
                  {currentPortrait ? (
                    currentPortrait.mediaType === 'image' ? (
                      <img
                        src={currentPortrait.path}
                        alt={agent.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        {currentPortrait.path}
                      </div>
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-white/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Edit2 className="w-6 h-6 text-white" />
                  </div>
                </motion.div>
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full px-3 py-1 text-sm font-bold shadow-lg">
                  Lv.{agent.level}
                </div>
              </div>

              {/* 基本信息 */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={editedName}
                      onChange={e => setEditedName(e.target.value)}
                      className="flex-1 bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-xl font-bold focus:outline-none focus:border-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-2xl font-bold">{agent.displayName}</h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-400">角色:</span>
                    <span className="text-blue-400 font-medium">{agent.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span className="text-gray-400">状态:</span>
                    <span
                      className={`font-medium ${
                        agent.status === 'online'
                          ? 'text-green-400'
                          : agent.status === 'working'
                          ? 'text-yellow-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {agent.status === 'online'
                        ? '在线'
                        : agent.status === 'offline'
                        ? '离线'
                        : agent.status === 'working'
                        ? '工作中'
                        : '空闲'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400">数据源:</span>
                    <span className="text-purple-400 font-medium">{agent.sourceName}</span>
                  </div>
                </div>

                {/* 经验条 */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">经验值</span>
                    <span className="text-white">
                      {agent.exp} / {agent.maxExp}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(agent.exp / agent.maxExp) * 100}%` }}
                      transition={transitions.medium}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 技能列表 */}
            {agent.skills && agent.skills.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  技能列表
                </h3>
                <div className="flex flex-wrap gap-2">
                  {agent.skills.map((skill, index) => {
                    const skillLevel = agent.skillTree?.skillLevels?.[skill] || 1
                    return (
                      <div
                        key={index}
                        className="px-3 py-1.5 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-lg text-sm flex items-center gap-2"
                      >
                        <span>{skill}</span>
                        {skillLevel > 1 && (
                          <span className="text-xs text-yellow-400 font-bold">Lv.{skillLevel}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* 统计数据 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transitions.fast, delay: 0.1 }}
          className="px-6 pb-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            统计数据
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 完成率 */}
            <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">完成率</span>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-green-400">{stats.successRate}%</div>
              <div className="text-xs text-gray-400 mt-1">
                {stats.completedTasks} / {stats.totalTasks} 任务
              </div>
            </div>

            {/* 平均用时 */}
            <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">平均用时</span>
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-400">{stats.avgDuration}m</div>
              <div className="text-xs text-gray-400 mt-1">每个任务平均</div>
            </div>

            {/* 失败次数 */}
            <div className="bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">失败次数</span>
                <X className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-3xl font-bold text-red-400">{stats.failedTasks}</div>
              <div className="text-xs text-gray-400 mt-1">总失败任务数</div>
            </div>
          </div>
        </motion.div>

        {/* 任务历史 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transitions.fast, delay: 0.2 }}
          className="px-6 pb-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            任务历史 (最近20个)
          </h3>
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-white/10 overflow-hidden">
            {recentTasks.length > 0 ? (
              <div className="divide-y divide-white/10">
                {recentTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{task.title}</h4>
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${getTaskStatusColor(
                              task.status
                            )}`}
                          >
                            {getTaskStatusText(task.status)}
                          </span>
                          <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority === 'urgent'
                              ? '紧急'
                              : task.priority === 'high'
                              ? '高'
                              : task.priority === 'medium'
                              ? '中'
                              : '低'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{task.description}</p>
                        {task.result && (
                          <p className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded">
                            {task.result}
                          </p>
                        )}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {task.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-gray-700/50 text-gray-300 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right text-xs text-gray-400 whitespace-nowrap">
                        <div>{new Date(task.createdAt).toLocaleDateString()}</div>
                        <div>{new Date(task.createdAt).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无任务历史</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* 成就展示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transitions.fast, delay: 0.3 }}
          className="px-6 pb-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            成就展示
          </h3>
          <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold text-yellow-400">
                  {achievementStats.unlockedCount} / {achievementStats.totalCount}
                </div>
                <div className="text-sm text-gray-300">已解锁成就</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-400">
                  {achievementStats.percentage}%
                </div>
                <div className="text-sm text-gray-300">完成度</div>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${achievementStats.percentage}%` }}
                transition={transitions.medium}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full"
              />
            </div>

            {/* 最近解锁的成就 */}
            {agent.achievements?.unlocked && agent.achievements.unlocked.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">最近解锁</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {agent.achievements.unlocked.slice(0, 8).map(achievementId => {
                    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
                    if (!achievement) return null
                    return (
                      <div
                        key={achievementId}
                        className="bg-black/30 border border-yellow-500/30 rounded-lg p-2 text-center"
                      >
                        <div className="text-2xl mb-1">{achievement.icon}</div>
                        <div className="text-xs text-gray-300 truncate">{achievement.title}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* PVP战绩 (占位) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transitions.fast, delay: 0.4 }}
          className="px-6 pb-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Swords className="w-5 h-5 text-red-400" />
            PVP战绩
          </h3>
          <div className="bg-gradient-to-br from-red-600/20 to-pink-600/20 border border-red-500/30 rounded-xl p-6 text-center">
            <Swords className="w-12 h-12 mx-auto mb-2 text-red-400 opacity-50" />
            <p className="text-gray-400">PVP功能开发中...</p>
            <p className="text-sm text-gray-500 mt-1">即将上线战斗统计数据</p>
          </div>
        </motion.div>
      </div>

      {/* 头像选择器 */}
      <AnimatePresence>
        {showAvatarSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAvatarSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-white/20 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">选择头像</h3>
                <button
                  onClick={() => setShowAvatarSelector(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {portraits.map(portrait => (
                  <motion.button
                    key={portrait.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectAvatar(portrait.id)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      currentPortrait?.id === portrait.id
                        ? 'border-blue-500'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    {portrait.mediaType === 'image' ? (
                      <img
                        src={portrait.path}
                        alt={portrait.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-gray-700 to-gray-800">
                        {portrait.path}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AgentDetailPage
