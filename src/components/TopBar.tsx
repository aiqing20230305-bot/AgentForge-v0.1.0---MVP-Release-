import { useBuildStore } from '../stores/buildStore'
import TokenBudgetBar from './TokenBudgetBar'
import SaveAgentModal from './SaveAgentModal'
import { useState } from 'react'

export default function TopBar() {
  const {
    setSettingsOpen,
    scanForItems,
    exportToFile,
    exportToClipboard,
    exportToClaudeDir,
    isLoading
  } = useBuildStore()

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)

  return (
    <div className="h-12 flex items-center justify-between px-4 bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] border-b-2 border-[#4a4a4a] shadow-lg">
      {/* Title - WoW style */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚔️</span>
          <h1 className="text-lg font-bold text-amber-100 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
            Agent Builder
          </h1>
        </div>
      </div>

      {/* Token Budget Bar */}
      <div className="flex-1 max-w-sm mx-8">
        <TokenBudgetBar />
      </div>

      {/* Action Buttons - WoW style */}
      <div className="flex items-center gap-2">
        {/* Refresh */}
        <button
          onClick={() => scanForItems()}
          disabled={isLoading}
          className="p-2 rounded bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-[#4a4a4a] transition-colors disabled:opacity-50"
          title="Refresh inventory"
        >
          <span className={`text-amber-100 ${isLoading ? 'animate-spin inline-block' : ''}`}>🔄</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative group">
          <button
            className="px-3 py-1.5 rounded bg-amber-700/80 hover:bg-amber-600 border border-amber-500 text-amber-100 text-sm font-bold transition-colors"
            title="Export"
          >
            📤 Export
          </button>

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-1 w-48 py-1 bg-[#1a1a1a] border-2 border-[#4a4a4a] rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <button
              onClick={() => exportToFile()}
              className="w-full px-4 py-2 text-left text-sm text-amber-100 hover:bg-[#2a2a2a] flex items-center gap-2"
            >
              <span>💾</span> Save as file...
            </button>
            <button
              onClick={() => exportToClipboard()}
              className="w-full px-4 py-2 text-left text-sm text-amber-100 hover:bg-[#2a2a2a] flex items-center gap-2"
            >
              <span>📋</span> Copy to clipboard
            </button>
            <div className="h-px bg-[#3a3a3a] my-1" />
            <button
              onClick={() => setIsSaveModalOpen(true)}
              className="w-full px-4 py-2 text-left text-sm text-green-400 hover:bg-[#2a2a2a] flex items-center gap-2"
            >
              <span>🤖</span> Save to .claude/
            </button>
          </div>
        </div>

        {/* Settings */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 rounded bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-[#4a4a4a] transition-colors"
          title="Settings"
        >
          <span className="text-amber-100">⚙️</span>
        </button>
      </div>

      <SaveAgentModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={(filename) => exportToClaudeDir(filename)}
      />
    </div>
  )
}
