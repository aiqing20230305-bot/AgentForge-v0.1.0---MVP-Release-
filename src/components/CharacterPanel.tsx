import { useBuildStore } from '../stores/buildStore'
import { SLOT_CONFIG } from '../types'
import EquipmentSlot from './EquipmentSlot'
import LoadoutPanel from './LoadoutPanel'

import headLayer from '../assets/character/head_layer.png'
import chestLayer from '../assets/character/chest_layer.png'
import handsLayer from '../assets/character/hands_layer.png'
import legsLayer from '../assets/character/legs_layer.png'
import feetLayer from '../assets/character/feet_layer.png'
import weaponLayer from '../assets/character/weapon_layer.png'
import offhandLayer from '../assets/character/offhand_layer.png'

export default function CharacterPanel() {
  const { equippedSlots, clearAllSlots, getTotalTokens } = useBuildStore()

  const equippedCount = Object.values(equippedSlots).filter(Boolean).length
  const totalSlots = Object.keys(SLOT_CONFIG).length

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d]">
      {/* Header - WoW style */}
      <div className="px-4 py-2 border-b border-[#3a3a3a] bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 text-lg">⚔️</span>
          <div>
            <h2 className="text-sm font-bold text-amber-100 uppercase tracking-wider">Character</h2>
            <p className="text-[10px] text-amber-100/60">
              {equippedCount}/{totalSlots} equipped • {getTotalTokens()} tokens
            </p>
          </div>
        </div>
        {equippedCount > 0 && (
          <button
            onClick={clearAllSlots}
            className="text-[10px] px-2 py-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded border border-red-900/50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* WoW-style character frame */}
      <div className="flex-1 relative p-2">
        <div className="h-full rounded-lg border-2 border-[#4a4a4a] bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] overflow-hidden relative group">
          {/* Character Paper Doll System */}
          <div className="absolute inset-0 flex items-center justify-center opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="relative w-full h-full max-w-[360px] max-h-[600px]">
              {/* Layers - Z-Index Ordered */}

              {/* Feet */}
              {equippedSlots.FEET && (
                <img
                  src={feetLayer}
                  alt="Feet"
                  className="absolute top-[68%] left-1/2 -translate-x-1/2 w-[42%] h-auto object-contain z-10 filter drop-shadow-lg"
                />
              )}

              {/* Legs */}
              {(equippedSlots.LEGS_1 || equippedSlots.LEGS_2) && (
                <img
                  src={legsLayer}
                  alt="Legs"
                  className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[56%] h-auto object-contain z-20 filter drop-shadow-lg"
                />
              )}

              {/* Chest */}
              {(equippedSlots.CHEST_1 || equippedSlots.CHEST_2) && (
                <img
                  src={chestLayer}
                  alt="Chest"
                  className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[55%] h-auto object-contain z-30 filter drop-shadow-lg"
                />
              )}

              {/* Hands (Gauntlets) - Left */}
              {(equippedSlots.HANDS_1 || equippedSlots.HANDS_2 || equippedSlots.HANDS_3) && (
                <img
                  src={handsLayer}
                  alt="Left Hand"
                  className="absolute top-[25%] left-[12%] w-[28%] h-auto object-contain z-40 filter drop-shadow-lg"
                />
              )}

              {/* Hands (Gauntlets) - Right (Mirrored) */}
              {(equippedSlots.HANDS_1 || equippedSlots.HANDS_2 || equippedSlots.HANDS_3) && (
                <img
                  src={handsLayer}
                  alt="Right Hand"
                  className="absolute top-[25%] right-[12%] w-[28%] h-auto object-contain z-40 filter drop-shadow-lg scale-x-[-1]"
                />
              )}

              {/* Head */}
              {equippedSlots.HEAD && (
                <img
                  src={headLayer}
                  alt="Head"
                  className="absolute top-[0%] left-1/2 -translate-x-1/2 w-[28%] h-auto object-contain z-50 filter drop-shadow-lg"
                />
              )}

              {/* Main Hand / Weapon */}
              {equippedSlots.WEAPON && (
                <img
                  src={weaponLayer}
                  alt="Weapon"
                  className="absolute bottom-[10%] left-[7%] w-[35%] h-auto object-contain z-50 filter drop-shadow-xl -rotate-12 origin-bottom"
                />
              )}

              {/* Off Hand */}
              {equippedSlots.OFFHAND && (
                <img
                  src={offhandLayer}
                  alt="Offhand"
                  className="absolute bottom-[8%] right-[1%] w-[40%] h-auto object-contain z-50 filter drop-shadow-xl"
                />
              )}
            </div>
          </div>

          {/* Equipment slots - WoW layout (Overlay) */}
          <div className="relative h-full p-3 z-50">
            {/* Left column */}
            <div className="absolute left-2 top-2 flex flex-col gap-1">
              <EquipmentSlot slotType="HEAD" />
              <EquipmentSlot slotType="CHEST_1" />
              <EquipmentSlot slotType="CHEST_2" />
              <EquipmentSlot slotType="HANDS_1" />
              <EquipmentSlot slotType="HANDS_2" />
              <EquipmentSlot slotType="RING1" />
            </div>

            {/* Right column */}
            <div className="absolute right-2 top-2 flex flex-col gap-1">
              <EquipmentSlot slotType="HANDS_3" />
              <EquipmentSlot slotType="LEGS_1" />
              <EquipmentSlot slotType="LEGS_2" />
              <EquipmentSlot slotType="FEET" />
              <EquipmentSlot slotType="RING2" />
              <EquipmentSlot slotType="OFFHAND" />
            </div>

            {/* Bottom center - weapons */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              <EquipmentSlot slotType="WEAPON" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="px-3 py-2 border-t border-[#3a3a3a] bg-[#1a1a1a]/80 text-[10px] text-amber-100/60">
        <div className="flex justify-between">
          <span>Right-click to unequip</span>
          <span>Drag items from inventory</span>
        </div>
      </div>

      {/* Loadouts */}
      <LoadoutPanel />
    </div>
  )
}
