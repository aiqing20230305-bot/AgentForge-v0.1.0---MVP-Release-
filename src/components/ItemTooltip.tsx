import type { AgentItem, SlotType } from '../types'
import { RARITY_COLORS, CATEGORY_COLORS, CATEGORY_ICONS, SLOT_CONFIG } from '../types'
import { formatTokens } from '../utils/tokenizer'

interface ItemTooltipProps {
  item: AgentItem
  showSlot?: SlotType
}

export default function ItemTooltip({ item, showSlot }: ItemTooltipProps) {
  // Truncate content for preview
  const previewContent =
    item.content.length > 200 ? item.content.slice(0, 200) + '...' : item.content

  return (
    <div className="tooltip w-72 text-sm" style={{ borderColor: RARITY_COLORS[item.rarity] }}>
      {/* Header */}
      <div className="mb-2">
        <h3 className="font-semibold text-base" style={{ color: RARITY_COLORS[item.rarity] }}>
          {item.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: `${CATEGORY_COLORS[item.category]}20`,
              color: CATEGORY_COLORS[item.category]
            }}
          >
            {(() => {
              const Icon = CATEGORY_ICONS[item.category]
              return <Icon size={12} className="inline mr-1" />
            })()}
            {item.category}
          </span>
          <span className="text-xs capitalize" style={{ color: RARITY_COLORS[item.rarity] }}>
            {item.rarity}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border-dark my-2" />

      {/* Content Preview */}
      <div className="text-text-secondary text-xs leading-relaxed whitespace-pre-wrap">
        {previewContent}
      </div>

      {/* Divider */}
      <div className="h-px bg-border-dark my-2" />

      {/* Stats */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-muted">Tokens:</span>
        <span className="text-accent-gold font-medium">{formatTokens(item.tokens)}</span>
      </div>

      {/* Compatible slots */}
      {showSlot && (
        <div className="mt-2 text-xs text-text-muted">
          Equipped in: {SLOT_CONFIG[showSlot].label}
        </div>
      )}

      {/* Path */}
      <div className="mt-2 text-[10px] text-text-muted truncate">{item.path}</div>
    </div>
  )
}
