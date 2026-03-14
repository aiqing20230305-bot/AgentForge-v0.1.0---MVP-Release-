/**
 * Hooks Demo Panel
 * 展示自定义 Hook 库的使用示例
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  useDebounce,
  useToggle,
  useCopy,
  useHoverState,
  useMediaQuery,
  useWindowSize,
  useClickOutside,
  useAnimatedCounter,
  useLocalStorage,
  usePrevious,
  useScrollDirection
} from '@/hooks'
import { fadeVariants, slideUpVariants, transitions } from '@/utils/animations'

export const HooksDemoPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('animation')

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-6">
        🪝 Custom Hooks Demo
      </h2>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: 'animation', label: '动画' },
          { id: 'storage', label: '存储' },
          { id: 'performance', label: '性能' },
          { id: 'ui', label: 'UI/UX' },
          { id: 'state', label: '状态' },
          { id: 'window', label: '窗口' },
          { id: 'clipboard', label: '剪贴板' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Demo Content */}
      <motion.div
        key={activeTab}
        variants={slideUpVariants}
        initial="hidden"
        animate="visible"
        transition={transitions.fast}
      >
        {activeTab === 'animation' && <AnimationDemo />}
        {activeTab === 'storage' && <StorageDemo />}
        {activeTab === 'performance' && <PerformanceDemo />}
        {activeTab === 'ui' && <UIDemo />}
        {activeTab === 'state' && <StateDemo />}
        {activeTab === 'window' && <WindowDemo />}
        {activeTab === 'clipboard' && <ClipboardDemo />}
      </motion.div>
    </div>
  )
}

// Animation Demo
const AnimationDemo: React.FC = () => {
  const [target, setTarget] = useState(1000)
  const animatedValue = useAnimatedCounter(target, { duration: 800 })

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          useAnimatedCounter
        </h3>
        <div className="text-4xl font-bold text-blue-400 mb-4">
          {animatedValue.toFixed(0)}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTarget(target + 500)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            +500
          </button>
          <button
            onClick={() => setTarget(Math.max(0, target - 500))}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            -500
          </button>
          <button
            onClick={() => setTarget(Math.floor(Math.random() * 5000))}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            随机
          </button>
        </div>
      </div>
    </div>
  )
}

// Storage Demo
const StorageDemo: React.FC = () => {
  const [username, setUsername, removeUsername] = useLocalStorage('demo_username', 'Guest')

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          useLocalStorage
        </h3>
        <p className="text-gray-300 mb-4">
          当前用户: <span className="text-blue-400 font-semibold">{username}</span>
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg"
            placeholder="输入用户名"
          />
          <button
            onClick={removeUsername}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            清除
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          💡 数据会自动保存到 localStorage，刷新页面仍然存在
        </p>
      </div>
    </div>
  )
}

// Performance Demo
const PerformanceDemo: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [searchCount, setSearchCount] = useState(0)

  React.useEffect(() => {
    if (debouncedSearchTerm) {
      setSearchCount((prev) => prev + 1)
    }
  }, [debouncedSearchTerm])

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          useDebounce
        </h3>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg mb-2"
          placeholder="输入搜索关键词..."
        />
        <div className="text-sm text-gray-300">
          <p>当前输入: {searchTerm}</p>
          <p>防抖后值: {debouncedSearchTerm}</p>
          <p className="text-blue-400 mt-2">
            搜索次数: {searchCount} (停止输入 500ms 后才触发)
          </p>
        </div>
      </div>
    </div>
  )
}

// UI Demo
const UIDemo: React.FC = () => {
  const [ref, isHovered] = useHoverState()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useClickOutside(() => setIsDropdownOpen(false))

  return (
    <div className="space-y-4">
      {/* Hover Demo */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          useHoverState
        </h3>
        <motion.div
          ref={ref}
          className={`p-8 rounded-lg text-center font-semibold transition-colors ${
            isHovered
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300'
          }`}
          whileHover={{ scale: 1.05 }}
        >
          {isHovered ? '鼠标悬停中 ✨' : '悬停我试试'}
        </motion.div>
      </div>

      {/* Media Query Demo */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          useMediaQuery
        </h3>
        <p className="text-gray-300">
          当前设备:  {' '}
          <span className="text-blue-400 font-semibold">
            {isMobile ? '📱 Mobile' : '💻 Desktop'}
          </span>
        </p>
        <p className="text-sm text-gray-400 mt-2">
          💡 调整浏览器窗口宽度查看变化
        </p>
      </div>

      {/* Click Outside Demo */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          useClickOutside
        </h3>
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isDropdownOpen ? '关闭下拉菜单' : '打开下拉菜单'}
          </button>
          {isDropdownOpen && (
            <motion.div
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute mt-2 w-48 bg-gray-700 rounded-lg shadow-lg p-2"
            >
              <div className="p-2 hover:bg-gray-600 rounded cursor-pointer text-white">
                选项 1
              </div>
              <div className="p-2 hover:bg-gray-600 rounded cursor-pointer text-white">
                选项 2
              </div>
              <div className="p-2 hover:bg-gray-600 rounded cursor-pointer text-white">
                选项 3
              </div>
            </motion.div>
          )}
        </div>
        <p className="text-sm text-gray-400 mt-2">
          💡 点击外部区域会自动关闭
        </p>
      </div>
    </div>
  )
}

// State Demo
const StateDemo: React.FC = () => {
  const [count, setCount] = useState(0)
  const prevCount = usePrevious(count)
  const [isEnabled, toggle, enable, disable] = useToggle(false)

  return (
    <div className="space-y-4">
      {/* Previous Value Demo */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          usePrevious
        </h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCount(count + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            增加
          </button>
          <div className="text-gray-300">
            <p>当前值: <span className="text-blue-400">{count}</span></p>
            <p>上次值: <span className="text-gray-400">{prevCount ?? '无'}</span></p>
          </div>
        </div>
      </div>

      {/* Toggle Demo */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          useToggle
        </h3>
        <div className="flex gap-2">
          <button
            onClick={toggle}
            className={`px-4 py-2 rounded-lg ${
              isEnabled
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 hover:bg-gray-700'
            } text-white`}
          >
            {isEnabled ? '✓ 已启用' : '✗ 已禁用'}
          </button>
          <button
            onClick={enable}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            启用
          </button>
          <button
            onClick={disable}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            禁用
          </button>
        </div>
      </div>
    </div>
  )
}

// Window Demo
const WindowDemo: React.FC = () => {
  const windowSize = useWindowSize()
  const scrollDirection = useScrollDirection()

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          useWindowSize
        </h3>
        <div className="text-gray-300">
          <p>宽度: <span className="text-blue-400">{windowSize.width}px</span></p>
          <p>高度: <span className="text-blue-400">{windowSize.height}px</span></p>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          💡 调整窗口大小查看变化
        </p>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          useScrollDirection
        </h3>
        <p className="text-gray-300">
          滚动方向: {' '}
          <span className={`font-semibold ${
            scrollDirection === 'down' ? 'text-red-400' :
            scrollDirection === 'up' ? 'text-green-400' :
            'text-gray-400'
          }`}>
            {scrollDirection === 'down' && '⬇️ 向下'}
            {scrollDirection === 'up' && '⬆️ 向上'}
            {scrollDirection === 'none' && '— 静止'}
          </span>
        </p>
        <p className="text-sm text-gray-400 mt-2">
          💡 滚动页面查看方向变化
        </p>
      </div>
    </div>
  )
}

// Clipboard Demo
const ClipboardDemo: React.FC = () => {
  const [copy, copied] = useCopy(2000)
  const textToCopy = 'AgentForge v0.3.4 - Hook Revolution!'

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          useCopy
        </h3>
        <div className="bg-gray-700 p-3 rounded-lg mb-2">
          <code className="text-blue-400 text-sm">{textToCopy}</code>
        </div>
        <button
          onClick={() => copy(textToCopy)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {copied ? '✓ 已复制!' : '📋 复制'}
        </button>
        <p className="text-sm text-gray-400 mt-2">
          💡 点击按钮复制文本到剪贴板
        </p>
      </div>
    </div>
  )
}
