import { createPortal } from 'react-dom'
import { useDrag } from 'react-dnd'
import { useEffect, useState } from 'react'
import type { AgentItem } from '../types'
import { RARITY_COLORS, CATEGORY_COLORS, CATEGORY_ICONS, DRAG_TYPE } from '../types'
import { useBuildStore } from '../stores/buildStore'
import { formatTokens } from '../utils/tokenizer'

interface InventoryItemProps {
  item: AgentItem
}

export default function InventoryItem({ item }: InventoryItemProps) {
  const { setDraggingItem } = useBuildStore()
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE,
    item: { type: DRAG_TYPE, item },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  useEffect(() => {
    if (isDragging) {
      setDraggingItem(item)
      setShowTooltip(false)
    } else {
      setDraggingItem(null)
    }
  }, [isDragging, item, setDraggingItem])

  // WoW-style slot glow based on rarity
  const getRarityGlow = () => {
    switch (item.rarity) {
      case 'legendary': return 'shadow-[0_0_8px_#ff8000,inset_0_0_6px_rgba(255,128,0,0.2)]'
      case 'epic': return 'shadow-[0_0_6px_#a335ee,inset_0_0_5px_rgba(163,53,238,0.2)]'
      case 'rare': return 'shadow-[0_0_5px_#0070dd,inset_0_0_4px_rgba(0,112,221,0.15)]'
      case 'uncommon': return 'shadow-[0_0_4px_#1eff00,inset_0_0_3px_rgba(30,255,0,0.1)]'
      default: return ''
    }
  }

  return (
    <div
      ref={drag}
      onMouseEnter={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const tooltipWidth = 260

        let x = rect.right + 8

        // Check if it fits on the right
        if (x + tooltipWidth > window.innerWidth) {
          x = rect.left - tooltipWidth - 8
        }

        // Clamp to window bounds
        if (x < 8) x = 8
        if (x + tooltipWidth > window.innerWidth) {
          x = window.innerWidth - tooltipWidth - 8
        }

        setTooltipPos({ x, y: rect.top })
        setShowTooltip(true)
      }}
      onMouseLeave={() => setShowTooltip(false)}
      className={`
        relative aspect-square cursor-grab transition-all duration-150
        ${isDragging ? 'opacity-40 scale-90' : 'hover:scale-105 hover:z-10'}
        ${getRarityGlow()}
      `}
    >
      {/* WoW-style slot */}
      <div
        className="absolute inset-0 rounded-sm bg-gradient-to-br from-[#3a3a3a] via-[#2a2a2a] to-[#1a1a1a] border-2"
        style={{ borderColor: RARITY_COLORS[item.rarity] }}
      >
        {/* Inner slot */}
        <div className="absolute inset-0.5 rounded-sm bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] flex items-center justify-center">
          <span
            className="text-2xl"
            style={{ color: CATEGORY_COLORS[item.category] }}
          >
            {(() => {
              const Icon = CATEGORY_ICONS[item.category]
              return <Icon size={24} />
            })()}
          </span>
        </div>
      </div>

      {/* Token count badge */}
      <div className="absolute bottom-0 right-0 px-1 text-[8px] font-bold text-amber-200 bg-black/80 rounded-tl">
        {formatTokens(item.tokens)}
      </div>

      {/* WoW-style tooltip */}
      {showTooltip && !isDragging && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div
            className="w-64 p-3 rounded bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border-2 shadow-xl"
            style={{ borderColor: RARITY_COLORS[item.rarity] }}
          >
            {/* Item name */}
            <h3
              className="font-bold text-sm mb-1"
              style={{ color: RARITY_COLORS[item.rarity] }}
            >
              {item.name}
            </h3>

            {/* Category */}
            <div className="flex items-center gap-1 mb-2">
              <span style={{ color: CATEGORY_COLORS[item.category] }}>
                {(() => {
                  const Icon = CATEGORY_ICONS[item.category]
                  return <Icon size={14} />
                })()}
              </span>
              <span
                className="text-xs capitalize"
                style={{ color: CATEGORY_COLORS[item.category] }}
              >
                {item.category}
              </span>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#3a3a3a] my-2" />

            {/* Content preview */}
            <p className="text-[11px] text-amber-100/70 leading-relaxed line-clamp-4">
              {item.content.slice(0, 150)}{item.content.length > 150 ? '...' : ''}
            </p>

            {/* Divider */}
            <div className="h-px bg-[#3a3a3a] my-2" />

            {/* Stats */}
            <div className="flex justify-between text-[10px]">
              <span className="text-amber-100/50">Tokens</span>
              <span className="text-amber-400">{item.tokens}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-amber-100/50">Rarity</span>
              <span style={{ color: RARITY_COLORS[item.rarity] }} className="capitalize">
                {item.rarity}
              </span>
            </div>

            {/* Equip text */}
            <div className="mt-2 text-[10px] text-green-400 text-center">
              Drag to equip
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
