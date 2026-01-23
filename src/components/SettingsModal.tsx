import { useState, useEffect } from 'react'
import { useBuildStore } from '../stores/buildStore'

export default function SettingsModal() {
  const { settings, saveSettings, setSettingsOpen, scanForItems } = useBuildStore()

  const [rootPath, setRootPath] = useState(settings.rootFolderPath)
  const [maxTokens, setMaxTokens] = useState(settings.maxTokenBudget)

  useEffect(() => {
    setRootPath(settings.rootFolderPath)
    setMaxTokens(settings.maxTokenBudget)
  }, [settings])

  const handleSelectFolder = async () => {
    const path = await window.electronAPI.selectDirectory()
    if (path) {
      setRootPath(path)
    }
  }

  const handleSave = async () => {
    await saveSettings({
      rootFolderPath: rootPath,
      maxTokenBudget: maxTokens
    })
    await scanForItems()
    setSettingsOpen(false)
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={() => setSettingsOpen(false)}
    >
      <div
        className="w-full max-w-md bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#4a4a4a] rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b-2 border-[#4a4a4a] flex items-center justify-between bg-gradient-to-r from-[#3a3a3a] to-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <span>⚙️</span>
            <h2 className="text-sm font-bold text-amber-100 uppercase tracking-wider">Settings</h2>
          </div>
          <button
            onClick={() => setSettingsOpen(false)}
            className="text-amber-100/60 hover:text-amber-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Root Folder */}
          <div>
            <label className="block text-xs font-bold text-amber-100 uppercase tracking-wider mb-2">
              Components Folder
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={rootPath}
                onChange={(e) => setRootPath(e.target.value)}
                placeholder="~/.claude"
                className="flex-1 px-3 py-2 bg-[#0a0a0a] border-2 border-[#3a3a3a] rounded
                           text-amber-100 placeholder-amber-100/30 text-sm
                           focus:outline-none focus:border-amber-600"
              />
              <button
                onClick={handleSelectFolder}
                className="px-3 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] border-2 border-[#4a4a4a] rounded text-amber-100 text-sm transition-colors"
              >
                Browse
              </button>
            </div>
            <p className="mt-1 text-[10px] text-amber-100/40">
              Folder containing your .md agent components
            </p>
          </div>

          {/* Token Budget */}
          <div>
            <label className="block text-xs font-bold text-amber-100 uppercase tracking-wider mb-2">
              Max Token Budget
            </label>
            <input
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              min={100}
              max={100000}
              step={100}
              className="w-full px-3 py-2 bg-[#0a0a0a] border-2 border-[#3a3a3a] rounded
                         text-amber-100 text-sm
                         focus:outline-none focus:border-amber-600"
            />
          </div>

          {/* Presets */}
          <div>
            <label className="block text-[10px] text-amber-100/60 uppercase tracking-wider mb-2">
              Quick Presets
            </label>
            <div className="flex flex-wrap gap-1">
              {[2000, 4000, 8000, 16000, 32000].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setMaxTokens(preset)}
                  className={`
                    px-2 py-1 text-[10px] rounded border transition-colors
                    ${maxTokens === preset
                      ? 'bg-amber-700/50 border-amber-600 text-amber-100'
                      : 'bg-[#1a1a1a] border-[#3a3a3a] text-amber-100/60 hover:bg-[#2a2a2a]'
                    }
                  `}
                >
                  {preset >= 1000 ? `${preset / 1000}k` : preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t-2 border-[#4a4a4a] flex justify-end gap-2 bg-[#1a1a1a]">
          <button
            onClick={() => setSettingsOpen(false)}
            className="px-4 py-2 text-sm text-amber-100/60 hover:text-amber-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-600 border border-amber-500 text-amber-100 text-sm font-bold rounded transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
