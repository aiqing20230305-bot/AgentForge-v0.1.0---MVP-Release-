/**
 * Collapsible Card Component
 * 可折叠卡片 - 支持展开/折叠内容
 */

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

interface CollapsibleCardProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  defaultExpanded?: boolean
  onRemove?: () => void  // 可选的移除回调
  className?: string
}

export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  icon,
  children,
  defaultExpanded = true,
  onRemove,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className={`bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl flex-shrink-0 hover:bg-white/10 hover:border-white/30 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 shadow-lg ${className}`}>
      {/* 标题栏 - 可点击展开/折叠 */}
      <div className="flex items-center justify-between p-3 cursor-pointer group"
           onClick={() => setIsExpanded(!isExpanded)}>
        <div className="text-[9px] text-white/50 uppercase tracking-wider flex items-center gap-1 group-hover:text-white/70 transition-colors">
          {icon && <span>{icon}</span>}
          <span>{title}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* 展开/折叠按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center transition-all"
            aria-label={isExpanded ? '折叠' : '展开'}
          >
            {isExpanded ? (
              <ChevronUp className="w-3 h-3 text-white/70" />
            ) : (
              <ChevronDown className="w-3 h-3 text-white/70" />
            )}
          </button>

          {/* 关闭按钮（可选） */}
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              className="w-6 h-6 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-400/30 flex items-center justify-center transition-all group/close"
              aria-label="关闭"
            >
              <X className="w-3 h-3 text-white/70 group-hover/close:text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* 内容区域 - 可折叠 */}
      <div className={`overflow-hidden transition-all duration-300 ${
        isExpanded ? 'max-h-[2000px] opacity-100 p-3 pt-0' : 'max-h-0 opacity-0'
      }`}>
        {children}
      </div>
    </div>
  )
}
