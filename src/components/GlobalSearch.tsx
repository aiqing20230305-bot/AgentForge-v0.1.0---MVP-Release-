/**
 * Global Search Component
 * 全局搜索功能 - Cmd/Ctrl + K 快捷键
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, Command, ArrowUp, ArrowDown, Clock, Hash, Box, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebounce, useLocalStorage, useEventListener } from '@/hooks'
import { useBuildStore } from '@/stores/buildStore'
import { useTaskStore } from '@/stores/taskStore'
import type { AgentItem } from '@/types'
import type { Task } from '@/types/task'

// 搜索结果项类型
type SearchResultType = 'agent' | 'task' | 'feature'

interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  subtitle?: string
  description?: string
  icon?: React.ReactNode
  data?: any
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

// 模糊匹配算法 - 计算相似度得分
function fuzzyMatch(text: string, query: string): number {
  const textLower = text.toLowerCase()
  const queryLower = query.toLowerCase()

  // 完全匹配
  if (textLower === queryLower) return 100

  // 包含匹配
  if (textLower.includes(queryLower)) return 80

  // 模糊匹配 - 计算字符匹配度
  let score = 0
  let queryIndex = 0

  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      score += 1
      queryIndex++
    }
  }

  if (queryIndex === queryLower.length) {
    return (score / queryLower.length) * 60
  }

  return 0
}

// 功能列表
const FEATURES = [
  { id: 'agents', title: 'Agent 管理', description: '查看和管理所有 Agent', category: 'navigation' },
  { id: 'tasks', title: '任务列表', description: '查看所有任务', category: 'navigation' },
  { id: 'inventory', title: '背包', description: '查看装备和道具', category: 'navigation' },
  { id: 'settings', title: '设置', description: '系统设置和配置', category: 'navigation' },
  { id: 'leaderboard', title: '排行榜', description: '查看排行榜', category: 'navigation' },
  { id: 'achievements', title: '成就', description: '查看成就系统', category: 'navigation' },
]

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchHistory, setSearchHistory] = useLocalStorage<string[]>('global-search-history', [])

  const debouncedQuery = useDebounce(searchQuery, 150)

  // 获取数据
  const { inventoryItems } = useBuildStore()
  const { tasks } = useTaskStore()

  // 搜索结果
  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return []
    }

    const query = debouncedQuery.trim()
    const results: SearchResult[] = []

    // 搜索 Agents (装备道具)
    inventoryItems.forEach(item => {
      const titleScore = fuzzyMatch(item.name, query)
      const contentScore = fuzzyMatch(item.content, query)
      const categoryScore = fuzzyMatch(item.category, query)
      const maxScore = Math.max(titleScore, contentScore, categoryScore)

      if (maxScore > 30) {
        results.push({
          id: `agent-${item.id}`,
          type: 'agent',
          title: item.name,
          subtitle: item.category,
          description: item.content.slice(0, 100) + '...',
          icon: <Box className="w-4 h-4" />,
          data: item
        })
      }
    })

    // 搜索 Tasks
    tasks.forEach(task => {
      const titleScore = fuzzyMatch(task.title, query)
      const descScore = fuzzyMatch(task.description, query)
      const agentScore = fuzzyMatch(task.agentName, query)
      const tagScore = task.tags ? Math.max(...task.tags.map(tag => fuzzyMatch(tag, query))) : 0
      const maxScore = Math.max(titleScore, descScore, agentScore, tagScore)

      if (maxScore > 30) {
        results.push({
          id: `task-${task.id}`,
          type: 'task',
          title: task.title,
          subtitle: `${task.agentName} - ${task.status}`,
          description: task.description,
          icon: <CheckCircle className="w-4 h-4" />,
          data: task
        })
      }
    })

    // 搜索功能
    FEATURES.forEach(feature => {
      const titleScore = fuzzyMatch(feature.title, query)
      const descScore = fuzzyMatch(feature.description, query)
      const maxScore = Math.max(titleScore, descScore)

      if (maxScore > 30) {
        results.push({
          id: `feature-${feature.id}`,
          type: 'feature',
          title: feature.title,
          subtitle: feature.category,
          description: feature.description,
          icon: <Hash className="w-4 h-4" />,
          data: feature
        })
      }
    })

    // 按相关度排序（简单实现：按类型优先级）
    return results.sort((a, b) => {
      const typeOrder = { feature: 0, task: 1, agent: 2 }
      return typeOrder[a.type] - typeOrder[b.type]
    })
  }, [debouncedQuery, inventoryItems, tasks])

  // 重置选中索引
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchResults])

  // 处理选择
  const handleSelect = useCallback((result: SearchResult) => {
    // 保存到搜索历史
    if (searchQuery && !searchHistory.includes(searchQuery)) {
      setSearchHistory([searchQuery, ...searchHistory].slice(0, 10))
    }

    // ✅ 根据类型执行导航操作
    console.log('Selected:', result)

    try {
      switch (result.type) {
        case 'agent':
          // ✅ 导航到 Agent 详情 - 选中Agent
          if (result.data && result.data.id) {
            const buildStore = useBuildStore.getState()
            // 选中该Agent
            buildStore.selectAgent(result.data.id)

            // 如果有详情面板，打开它
            const event = new CustomEvent('agentforge:showDetails', {
              detail: { agentId: result.data.id, type: 'agent' }
            })
            window.dispatchEvent(event)

            console.log('✅ Navigated to agent:', result.data.name || result.data.id)
          }
          break

        case 'task':
          // ✅ 导航到任务详情 - 选中Task
          if (result.data && result.data.id) {
            const taskStore = useTaskStore.getState()
            // 高亮显示该任务
            const event = new CustomEvent('agentforge:showTask', {
              detail: { taskId: result.data.id }
            })
            window.dispatchEvent(event)

            console.log('✅ Navigated to task:', result.data.title || result.data.id)
          }
          break

        case 'feature':
          // ✅ 导航到功能页面 - 根据feature.route导航
          if (result.data && result.data.route) {
            const event = new CustomEvent('agentforge:navigate', {
              detail: { route: result.data.route, feature: result.data.name }
            })
            window.dispatchEvent(event)

            console.log('✅ Navigated to feature:', result.data.name)
          }
          break

        default:
          console.warn('Unknown result type:', result.type)
      }
    } catch (error) {
      console.error('Navigation failed:', error)
    }

    onClose()
  }, [searchQuery, searchHistory, setSearchHistory, onClose])

  // 键盘导航
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (searchResults[selectedIndex]) {
          handleSelect(searchResults[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }, [isOpen, searchResults, selectedIndex, handleSelect, onClose])

  useEventListener('keydown', handleKeyDown)

  // 当打开时聚焦输入框
  useEffect(() => {
    if (isOpen) {
      const input = document.getElementById('global-search-input')
      if (input) {
        setTimeout(() => input.focus(), 50)
      }
    } else {
      setSearchQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
        {/* 背景遮罩 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* 搜索框 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl mx-4 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* 搜索输入 */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索 Agents、Tasks、功能..."
              className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
            />
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded">ESC</kbd>
              <span>关闭</span>
            </div>
          </div>

          {/* 搜索结果 */}
          <div className="max-h-96 overflow-y-auto">
            {searchResults.length === 0 && searchQuery ? (
              <div className="px-4 py-8 text-center text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>未找到相关结果</p>
                <p className="text-sm mt-1">试试搜索其他关键词</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="px-4 py-8">
                <div className="text-center text-gray-400 mb-4">
                  <Command className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>开始搜索...</p>
                  <p className="text-sm mt-1">输入关键词查找 Agents、Tasks 或功能</p>
                </div>

                {/* 搜索历史 */}
                {searchHistory.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 px-2">
                      <Clock className="w-3 h-3" />
                      <span>最近搜索</span>
                    </div>
                    <div className="space-y-1">
                      {searchHistory.slice(0, 5).map((item, index) => (
                        <button
                          key={index}
                          onClick={() => setSearchQuery(item)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-2">
                {searchResults.map((result, index) => (
                  <motion.button
                    key={result.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      index === selectedIndex
                        ? 'bg-blue-500/20 border-l-2 border-blue-500'
                        : 'hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${index === selectedIndex ? 'text-blue-400' : 'text-gray-400'}`}>
                        {result.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium truncate">{result.title}</span>
                          {result.subtitle && (
                            <span className="text-xs text-gray-500 truncate">{result.subtitle}</span>
                          )}
                        </div>
                        {result.description && (
                          <p className="text-sm text-gray-400 mt-1 truncate">{result.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 opacity-0 group-hover:opacity-100">
                        <span className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded uppercase">
                          {result.type}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* 底部提示 */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-t border-gray-700">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                <ArrowDown className="w-3 h-3" />
                <span>导航</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-700 border border-gray-600 rounded text-[10px]">↵</kbd>
                <span>选择</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {searchResults.length > 0 && `${searchResults.length} 个结果`}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// Hook: 全局搜索快捷键
export function useGlobalSearchHotkey() {
  const [isOpen, setIsOpen] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Cmd/Ctrl + K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setIsOpen(prev => !prev)
    }
  }, [])

  useEventListener('keydown', handleKeyDown)

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev)
  }
}
