/**
 * 虚拟滚动列表组件
 * 用于优化大量数据渲染性能
 */

import { useRef, useState, useEffect, useCallback } from 'react'

export interface VirtualListProps<T> {
  items: T[]
  itemHeight: number           // 每个项目的高度
  containerHeight: number      // 容器高度
  overscan?: number           // 预渲染项目数（防止滚动时白屏）
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
  renderItem,
  className = ''
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  // 计算可见区域
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const totalHeight = items.length * itemHeight

  // 计算可见项的起始和结束索引
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2)

  // 可见项
  const visibleItems = items.slice(startIndex, endIndex + 1)

  // 滚动处理
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      style={{ height: containerHeight }}
    >
      {/* 占位容器（维持滚动条正确高度） */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* 可见项容器 */}
        <div
          style={{
            position: 'absolute',
            top: startIndex * itemHeight,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, i) => (
            <div
              key={startIndex + i}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * 使用示例：
 *
 * <VirtualList
 *   items={leaderboardData}
 *   itemHeight={80}
 *   containerHeight={600}
 *   overscan={5}
 *   renderItem={(entry, index) => (
 *     <LeaderboardEntry entry={entry} rank={index + 1} />
 *   )}
 * />
 */
