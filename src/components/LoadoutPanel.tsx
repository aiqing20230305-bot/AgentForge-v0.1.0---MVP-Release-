import { useState } from 'react'
import { useBuildStore } from '../stores/buildStore'

export default function LoadoutPanel() {
  const {
    loadouts,
    activeLoadoutId,
    saveLoadout,
    loadLoadout,
    deleteLoadout,
    equippedSlots
  } = useBuildStore()

  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [expanded, setExpanded] = useState(true)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const hasEquippedItems = Object.values(equippedSlots).some(Boolean)
  const equippedCount = Object.values(equippedSlots).filter(Boolean).length

  const handleSave = async () => {
    if (!newName.trim()) return
    await saveLoadout(newName.trim())
    setNewName('')
    setIsCreating(false)
    setSaveMessage(`Saved!`)
    setTimeout(() => setSaveMessage(null), 2000)
  }

  const handleDelete = async (e: React.MouseEvent, loadoutId: string) => {
    e.stopPropagation()
    await deleteLoadout(loadoutId)
  }

  const handleLoad = (loadoutId: string) => {
    loadLoadout(loadoutId)
    setSaveMessage('Loaded!')
    setTimeout(() => setSaveMessage(null), 2000)
  }

  return (
    <div className="border-t-2 border-[#4a4a4a] bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d]">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#2a2a2a] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className={`text-amber-100/60 transition-transform ${expanded ? 'rotate-90' : ''}`}>▶</span>
          <span className="text-xs font-bold text-amber-100 uppercase tracking-wider">Loadouts</span>
          <span className="text-[10px] text-amber-100/40">({loadouts.length})</span>
        </div>
        {saveMessage && (
          <span className="text-[10px] text-green-400">{saveMessage}</span>
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {/* Save Button */}
          {!isCreating && hasEquippedItems && (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-1.5 text-[10px] bg-amber-700/30 hover:bg-amber-700/50 text-amber-100 border border-amber-600/50 rounded transition-colors"
            >
              💾 Save Build ({equippedCount} items)
            </button>
          )}

          {/* Create Form */}
          {isCreating && (
            <div className="flex gap-1">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Name..."
                className="flex-1 px-2 py-1 bg-[#0a0a0a] border border-[#3a3a3a] rounded text-amber-100 placeholder-amber-100/30 text-[10px] focus:outline-none focus:border-amber-600"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave()
                  if (e.key === 'Escape') setIsCreating(false)
                }}
              />
              <button
                onClick={handleSave}
                disabled={!newName.trim()}
                className="px-2 py-1 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-[10px] rounded"
              >
                ✓
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-2 py-1 text-amber-100/60 hover:text-amber-100 text-[10px]"
              >
                ✕
              </button>
            </div>
          )}

          {/* Loadout List */}
          {loadouts.length === 0 ? (
            <p className="text-[10px] text-amber-100/40 text-center py-2">
              {hasEquippedItems ? 'Save your build' : 'Equip items first'}
            </p>
          ) : (
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {loadouts.map((loadout) => {
                const itemCount = Object.values(loadout.slots).filter(Boolean).length
                const isActive = activeLoadoutId === loadout.id

                return (
                  <div
                    key={loadout.id}
                    onClick={() => handleLoad(loadout.id)}
                    className={`
                      flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors group
                      ${isActive
                        ? 'bg-amber-700/30 border border-amber-600/50'
                        : 'bg-[#1a1a1a] border border-[#3a3a3a] hover:bg-[#2a2a2a]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {isActive && <span className="text-amber-400 text-[10px]">▶</span>}
                      <span className="text-[11px] text-amber-100">{loadout.name}</span>
                      <span className="text-[9px] text-amber-100/40">{itemCount} items</span>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, loadout.id)}
                      className="text-amber-100/30 hover:text-red-400 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
