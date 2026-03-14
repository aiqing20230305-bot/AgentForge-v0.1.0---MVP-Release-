/**
 * Task Search Bar Component
 * 任务搜索栏 - 使用新的 Hook 库进行优化
 */

import React, { useState } from 'react'
import { Search, X, Clock, Filter } from 'lucide-react'
import { useDebounce, useLocalStorage, useToggle } from '@/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeVariants, slideUpVariants, transitions } from '@/utils/animations'

interface TaskSearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  showHistory?: boolean
}

export const TaskSearchBar: React.FC<TaskSearchBarProps> = ({
  onSearch,
  placeholder = '搜索任务...',
  showHistory = true
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 300)
  const [searchHistory, setSearchHistory] = useLocalStorage<string[]>('task-search-history', [])
  const [showSuggestions, toggleSuggestions, , closeSuggestions] = useToggle(false)

  // 当防抖后的查询变化时，执行搜索
  React.useEffect(() => {
    onSearch(debouncedQuery)

    // 保存到搜索历史（非空且不重复）
    if (debouncedQuery && !searchHistory.includes(debouncedQuery)) {
      const newHistory = [debouncedQuery, ...searchHistory].slice(0, 5)
      setSearchHistory(newHistory)
    }
  }, [debouncedQuery])

  const handleClear = () => {
    setSearchQuery('')
    onSearch('')
    closeSuggestions()
  }

  const handleSelectHistory = (query: string) => {
    setSearchQuery(query)
    onSearch(query)
    closeSuggestions()
  }

  const handleRemoveHistory = (query: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSearchHistory(searchHistory.filter(h => h !== query))
  }

  return (
    <div className="relative">
      {/* 搜索输入框 */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-gray-400" />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={showHistory ? toggleSuggestions : undefined}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
        />

        {/* 清除按钮 */}
        <AnimatePresence>
          {searchQuery && (
            <motion.button
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={transitions.fast}
              onClick={handleClear}
              className="absolute right-3 p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-white" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* 搜索建议/历史 */}
      <AnimatePresence>
        {showSuggestions && showHistory && searchHistory.length > 0 && !searchQuery && (
          <motion.div
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transitions.fast}
            className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50"
          >
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>搜索历史</span>
                </div>
                <button
                  onClick={() => setSearchHistory([])}
                  className="hover:text-white transition-colors"
                >
                  清空
                </button>
              </div>

              <div className="mt-1 space-y-1">
                {searchHistory.map((query, index) => (
                  <motion.div
                    key={query}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectHistory(query)}
                    className="group flex items-center justify-between px-3 py-2 text-sm text-white hover:bg-white/10 rounded cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Search className="w-3 h-3 text-gray-400" />
                      <span>{query}</span>
                    </div>
                    <button
                      onClick={(e) => handleRemoveHistory(query, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                    >
                      <X className="w-3 h-3 text-gray-400 hover:text-white" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Advanced Task Filter Component
 * 高级任务过滤器
 */

interface TaskFilterOption {
  id: string
  label: string
  count?: number
  color?: string
}

interface TaskAdvancedFilterProps {
  statuses?: TaskFilterOption[]
  priorities?: TaskFilterOption[]
  onFilterChange?: (filters: any) => void
}

export const TaskAdvancedFilter: React.FC<TaskAdvancedFilterProps> = ({
  statuses = [],
  priorities = [],
  onFilterChange
}) => {
  const [isExpanded, toggle] = useToggle(false)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])

  const handleStatusToggle = (statusId: string) => {
    const newStatuses = selectedStatuses.includes(statusId)
      ? selectedStatuses.filter(s => s !== statusId)
      : [...selectedStatuses, statusId]

    setSelectedStatuses(newStatuses)
    onFilterChange?.({ statuses: newStatuses, priorities: selectedPriorities })
  }

  const handlePriorityToggle = (priorityId: string) => {
    const newPriorities = selectedPriorities.includes(priorityId)
      ? selectedPriorities.filter(p => p !== priorityId)
      : [...selectedPriorities, priorityId]

    setSelectedPriorities(newPriorities)
    onFilterChange?.({ statuses: selectedStatuses, priorities: newPriorities })
  }

  const handleClearAll = () => {
    setSelectedStatuses([])
    setSelectedPriorities([])
    onFilterChange?.({ statuses: [], priorities: [] })
  }

  const activeFilterCount = selectedStatuses.length + selectedPriorities.length

  return (
    <div className="space-y-2">
      {/* 过滤器切换按钮 */}
      <button
        onClick={toggle}
        className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg transition-all"
      >
        <Filter className="w-3 h-3" />
        <span>高级过滤</span>
        {activeFilterCount > 0 && (
          <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* 过滤器面板 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transitions.normal}
            className="p-3 bg-white/5 border border-white/20 rounded-lg space-y-3"
          >
            {/* 状态过滤 */}
            {statuses.length > 0 && (
              <div>
                <div className="text-xs text-gray-400 mb-2">状态</div>
                <div className="flex flex-wrap gap-2">
                  {statuses.map(status => (
                    <button
                      key={status.id}
                      onClick={() => handleStatusToggle(status.id)}
                      className={`px-2 py-1 text-xs rounded transition-all ${
                        selectedStatuses.includes(status.id)
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {status.label}
                      {status.count !== undefined && (
                        <span className="ml-1 opacity-70">({status.count})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 优先级过滤 */}
            {priorities.length > 0 && (
              <div>
                <div className="text-xs text-gray-400 mb-2">优先级</div>
                <div className="flex flex-wrap gap-2">
                  {priorities.map(priority => (
                    <button
                      key={priority.id}
                      onClick={() => handlePriorityToggle(priority.id)}
                      className={`px-2 py-1 text-xs rounded transition-all ${
                        selectedPriorities.includes(priority.id)
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {priority.label}
                      {priority.count !== undefined && (
                        <span className="ml-1 opacity-70">({priority.count})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 清除按钮 */}
            {activeFilterCount > 0 && (
              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={handleClearAll}
                  className="w-full px-3 py-1.5 text-xs text-red-400 bg-red-900/20 hover:bg-red-900/30 border border-red-500/30 rounded transition-all"
                >
                  清除所有过滤器
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
