/**
 * 快捷键提示组件
 * HotkeyTooltip - Shows keyboard shortcut hints on hover
 */

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getHotkeyManager } from '../services/hotkeyManager'

interface HotkeyTooltipProps {
  hotkeyId?: string // 快捷键ID，从hotkeyManager获取
  hotkey?: string // 或直接提供快捷键字符串
  description?: string // 描述文本
  children: React.ReactElement // 目标元素
  position?: 'top' | 'bottom' | 'left' | 'right' // 提示位置
  disabled?: boolean // 禁用提示
  showDelay?: number // 显示延迟（毫秒）
}

/**
 * HotkeyTooltip - 悬停显示快捷键提示
 */
export const HotkeyTooltip: React.FC<HotkeyTooltipProps> = ({
  hotkeyId,
  hotkey,
  description,
  children,
  position = 'bottom',
  disabled = false,
  showDelay = 500,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const targetRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // 获取快捷键信息
  const hotkeyManager = getHotkeyManager()
  let displayKey = ''
  let displayDescription = description || ''

  if (hotkeyId) {
    const definition = hotkeyManager.getAllHotkeys().get(hotkeyId)
    if (definition) {
      displayKey = hotkeyManager.getDisplayKey(definition.key)
      displayDescription = definition.description
    }
  } else if (hotkey) {
    displayKey = hotkeyManager.getDisplayKey(hotkey)
  }

  // 如果没有快捷键，不显示提示
  if (!displayKey || disabled) {
    return children
  }

  // 计算提示框位置
  const calculatePosition = () => {
    if (!targetRef.current) return

    const rect = targetRef.current.getBoundingClientRect()
    const tooltipWidth = 200 // 估计宽度
    const tooltipHeight = 60 // 估计高度
    const offset = 8 // 偏移量

    let top = 0
    let left = 0

    switch (position) {
      case 'top':
        top = rect.top - tooltipHeight - offset
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        break
      case 'bottom':
        top = rect.bottom + offset
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        break
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        left = rect.left - tooltipWidth - offset
        break
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        left = rect.right + offset
        break
    }

    // 边界检查
    const padding = 8
    if (left < padding) left = padding
    if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth - padding
    }
    if (top < padding) top = padding
    if (top + tooltipHeight > window.innerHeight - padding) {
      top = window.innerHeight - tooltipHeight - padding
    }

    setTooltipPosition({ top, left })
  }

  // 鼠标进入
  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      calculatePosition()
      setIsVisible(true)
    }, showDelay)
  }

  // 鼠标离开
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // 克隆子元素并添加事件监听
  const clonedChild = React.cloneElement(children, {
    ref: targetRef,
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter()
      children.props.onMouseEnter?.(e)
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave()
      children.props.onMouseLeave?.(e)
    },
  })

  return (
    <>
      {clonedChild}

      <AnimatePresence>
        {isVisible && (
          <TooltipPortal>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 5 : -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed z-[9999] pointer-events-none"
              style={{
                top: tooltipPosition.top,
                left: tooltipPosition.left,
              }}
            >
              <div className="bg-gray-900 dark:bg-gray-800 text-white px-3 py-2 rounded-lg shadow-xl border border-gray-700 max-w-xs">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 text-xs font-semibold bg-gray-800 dark:bg-gray-700 rounded border border-gray-600">
                    {displayKey}
                  </kbd>
                  {displayDescription && (
                    <span className="text-xs text-gray-300">{displayDescription}</span>
                  )}
                </div>
              </div>
            </motion.div>
          </TooltipPortal>
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * 快捷键卡片 - 用于快捷键帮助页面
 */
interface HotkeyCardProps {
  hotkey: string
  description: string
  category?: string
}

export const HotkeyCard: React.FC<HotkeyCardProps> = ({
  hotkey,
  description,
  category,
}) => {
  const hotkeyManager = getHotkeyManager()
  const displayKey = hotkeyManager.getDisplayKey(hotkey)

  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {description}
        </p>
        {category && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {category}
          </p>
        )}
      </div>
      <kbd className="ml-3 px-3 py-1.5 text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded border border-gray-300 dark:border-gray-600 whitespace-nowrap">
        {displayKey}
      </kbd>
    </div>
  )
}

/**
 * Portal 组件 - 将提示框渲染到 body
 */
const TooltipPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return ReactDOM.createPortal(children, document.body)
}

// 需要导入 ReactDOM
import ReactDOM from 'react-dom'

export default HotkeyTooltip
