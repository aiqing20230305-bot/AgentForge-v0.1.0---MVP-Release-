import { useBuildStore } from '../stores/buildStore'
import { CATEGORY_COLORS, CATEGORY_ICONS, type Category } from '../types'
import InventoryItem from './InventoryItem'

const CATEGORIES: (Category | 'all')[] = [
  'all',
  'roles',
  'skills',
  'behaviors',
  'personalities',
  'constraints',
  'contexts',
  'formats',
  'tools'
]

export default function InventoryPanel() {
  const {
    filteredItems,
    inventoryItems,
    selectedCategory,
    searchQuery,
    setSelectedCategory,
    setSearchQuery,
    isLoading,
    error,
    settings
  } = useBuildStore()

  // Sort by rarity then name
  const sortedItems = [...filteredItems].sort((a, b) => {
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 }
    const rarityDiff = rarityOrder[a.rarity] - rarityOrder[b.rarity]
    if (rarityDiff !== 0) return rarityDiff
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d]">
      {/* Header - WoW style */}
      <div className="px-4 py-2 border-b border-[#3a3a3a] bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 text-lg">🎒</span>
            <h2 className="text-sm font-bold text-amber-100 uppercase tracking-wider">
              Inventory
            </h2>
            <span className="text-[10px] text-amber-100/60">
              ({filteredItems.length} items)
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full px-3 py-1.5 pl-8 bg-[#0a0a0a] border border-[#3a3a3a] rounded
                       text-amber-100 placeholder-amber-100/30 text-xs
                       focus:outline-none focus:border-amber-600"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-100/40 text-xs">🔍</span>
        </div>
      </div>

      {/* Category Tabs - WoW style */}
      <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-[#3a3a3a] bg-[#1a1a1a]">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat
          const count = cat === 'all'
            ? inventoryItems.length
            : inventoryItems.filter(i => i.category === cat).length

          if (count === 0 && cat !== 'all') return null

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-2 py-1 text-[10px] rounded transition-colors flex items-center gap-1
                ${isActive
                  ? 'bg-amber-700/50 text-amber-100 border border-amber-600'
                  : 'bg-[#2a2a2a] text-amber-100/60 border border-[#3a3a3a] hover:bg-[#3a3a3a]'
                }
              `}
            >
              {cat !== 'all' && (
                <span style={{ color: isActive ? CATEGORY_COLORS[cat as Category] : undefined }}>
                  {CATEGORY_ICONS[cat as Category]}
                </span>
              )}
              <span className="capitalize">{cat}</span>
              <span className="text-amber-100/40">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Inventory Grid - WoW bag style */}
      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-amber-100/60 flex items-center gap-2">
              <span className="animate-spin">⚙️</span>
              Scanning...
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <span className="text-red-400 text-3xl mb-2">⚠️</span>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : !settings.rootFolderPath ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <span className="text-4xl mb-2">📁</span>
            <p className="text-amber-100/60 text-sm">No folder selected</p>
            <button
              onClick={() => useBuildStore.getState().setSettingsOpen(true)}
              className="mt-2 text-xs text-amber-400 hover:text-amber-300"
            >
              Open Settings
            </button>
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <span className="text-3xl mb-2">🔍</span>
            <p className="text-amber-100/60 text-sm">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-1">
            {sortedItems.map((item) => (
              <InventoryItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-[#3a3a3a] bg-[#1a1a1a]/80 text-[10px] text-amber-100/40 flex justify-between">
        <span>Drag to equip</span>
        <span>{settings.rootFolderPath?.split('/').pop() || 'No folder'}</span>
      </div>
    </div>
  )
}
