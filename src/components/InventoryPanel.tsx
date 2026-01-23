import { useBuildStore } from '../stores/buildStore'
import { CATEGORY_ICONS, type Category } from '../types'
import InventoryItem from './InventoryItem'
import { Search, Briefcase, Loader2, AlertTriangle, FolderOpen, Layers } from 'lucide-react'

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
    <div className="h-full flex flex-col bg-[#111] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 bg-[#161616]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="text-amber-500 p-1.5 bg-amber-500/10 rounded-md">
              <Briefcase size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider leading-none">
                Inventory
              </h2>
              <span className="text-[10px] text-zinc-500">
                {filteredItems.length} items available
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full px-3 py-2 pl-9 bg-black/40 border border-white/10 rounded-md
                       text-zinc-300 placeholder-zinc-600 text-xs
                       focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-amber-500 transition-colors" />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 p-3 border-b border-white/10 bg-[#161616]/50">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat
          const count = cat === 'all'
            ? inventoryItems.length
            : inventoryItems.filter(i => i.category === cat).length

          // Render icon manually for 'all' or fetch from map
          const Icon = cat === 'all' ? Layers : CATEGORY_ICONS[cat as Category]

          if (count === 0 && cat !== 'all') return null

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-2.5 py-1.5 text-[11px] rounded transition-all flex items-center gap-1.5 border
                ${isActive
                  ? 'bg-amber-500/10 text-amber-200 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                  : 'bg-zinc-800/50 text-zinc-400 border-transparent hover:bg-zinc-800 hover:text-zinc-200'
                }
              `}
            >
              <Icon size={12} className={isActive ? 'text-amber-400' : 'text-zinc-500'} />
              <span className="capitalize font-medium">{cat}</span>
              <span className={`text-[10px] ${isActive ? 'text-amber-500/70' : 'text-zinc-600'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Inventory Grid */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-zinc-500 flex flex-col items-center gap-3">
              <Loader2 size={24} className="animate-spin text-amber-500" />
              <span className="text-xs">Loading resources...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <AlertTriangle size={32} className="text-red-400 mb-2" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : !settings.rootFolderPath ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <FolderOpen size={32} className="text-zinc-600 mb-2" />
            <p className="text-zinc-500 text-sm">No folder selected</p>
            <button
              onClick={() => useBuildStore.getState().setSettingsOpen(true)}
              className="mt-2 text-xs text-amber-500 hover:text-amber-400 underline"
            >
              Open Settings
            </button>
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Search size={32} className="text-zinc-700 mb-2" />
            <p className="text-zinc-600 text-sm">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-2">
            {sortedItems.map((item) => (
              <InventoryItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-white/5 bg-[#0f0f0f] text-[10px] text-zinc-600 flex justify-between items-center">
        <span>Drag items to equip</span>
        <span className="truncate max-w-[150px]" title={settings.rootFolderPath || ''}>
          {settings.rootFolderPath?.split('/').pop() || 'No context'}
        </span>
      </div>
    </div>
  )
}
