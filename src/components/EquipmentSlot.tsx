import { useDrop } from 'react-dnd'
import { useBuildStore } from '../stores/buildStore'
import {
  SLOT_CONFIG,
  SLOT_ICONS,
  RARITY_COLORS,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  DRAG_TYPE,
  type SlotType,
  type DragItem
} from '../types'

interface EquipmentSlotProps {
  slotType: SlotType
}

export default function EquipmentSlot({ slotType }: EquipmentSlotProps) {
  const { equippedSlots, equipItem, unequipItem, canEquipItem, draggingItem } = useBuildStore()
  const item = equippedSlots[slotType]
  const config = SLOT_CONFIG[slotType]

  const [{ isOver, canDrop }, drop] = useDrop<DragItem, void, { isOver: boolean; canDrop: boolean }>({
    accept: DRAG_TYPE,
    canDrop: (dragItem) => canEquipItem(slotType, dragItem.item),
    drop: (dragItem) => {
      equipItem(slotType, dragItem.item)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  })

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (item) {
      unequipItem(slotType)
    }
  }

  const isCompatibleWithDragging = draggingItem && config.acceptedCategories.includes(draggingItem.category)

  // WoW-style slot appearance
  const getRarityGlow = () => {
    if (!item) return ''
    switch (item.rarity) {
      case 'legendary': return 'shadow-[0_0_10px_#ff8000,inset_0_0_10px_rgba(255,128,0,0.3)]'
      case 'epic': return 'shadow-[0_0_8px_#a335ee,inset_0_0_8px_rgba(163,53,238,0.3)]'
      case 'rare': return 'shadow-[0_0_6px_#0070dd,inset_0_0_6px_rgba(0,112,221,0.2)]'
      case 'uncommon': return 'shadow-[0_0_4px_#1eff00,inset_0_0_4px_rgba(30,255,0,0.2)]'
      default: return ''
    }
  }

  return (
    <div
      ref={drop}
      onContextMenu={handleRightClick}
      className={`
        relative w-12 h-12 cursor-pointer transition-all duration-150
        ${getRarityGlow()}
      `}
      title={`${config.label}: ${config.acceptedCategories.join(', ')}`}
    >
      {/* WoW-style slot border */}
      <div
        className={`
          absolute inset-0 rounded-sm
          bg-gradient-to-br from-[#3a3a3a] via-[#2a2a2a] to-[#1a1a1a]
          border-2 transition-colors duration-150
          ${item
            ? `border-[${RARITY_COLORS[item.rarity]}]`
            : isOver && canDrop
              ? 'border-green-500'
              : isOver && !canDrop
                ? 'border-red-500'
                : isCompatibleWithDragging
                  ? 'border-green-500/70 animate-pulse'
                  : 'border-[#4a4a4a]'
          }
        `}
        style={item ? { borderColor: RARITY_COLORS[item.rarity] } : undefined}
      >
        {/* Inner shadow for depth */}
        <div className="absolute inset-0.5 rounded-sm bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
          {item ? (
            // Equipped item
            <div className="w-full h-full flex items-center justify-center">
              <span
                className="text-xl"
                style={{ color: CATEGORY_COLORS[item.category] }}
              >
                {(() => {
                  const Icon = CATEGORY_ICONS[item.category]
                  return <Icon size={24} />
                })()}
              </span>
            </div>
          ) : (
            // Empty slot
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-lg text-[#3a3a3a]">
                {(() => {
                  const Icon = SLOT_ICONS[slotType]
                  return <Icon size={20} />
                })()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Slot label on hover */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        <span className="text-[8px] text-amber-100/60 bg-black/80 px-1 rounded">
          {config.label}
        </span>
      </div>

      {/* Drop indicator */}
      {isCompatibleWithDragging && !item && (
        <div className="absolute inset-0 rounded-sm bg-green-500/20 flex items-center justify-center">
          <span className="text-green-400 text-sm font-bold">+</span>
        </div>
      )}

      {/* Item name tooltip on hover when equipped */}
      {item && (
        <div className="absolute left-full ml-2 top-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-50">
          <div
            className="px-2 py-1 rounded text-xs whitespace-nowrap bg-black/95 border"
            style={{ borderColor: RARITY_COLORS[item.rarity], color: RARITY_COLORS[item.rarity] }}
          >
            {item.name}
          </div>
        </div>
      )}
    </div>
  )
}
