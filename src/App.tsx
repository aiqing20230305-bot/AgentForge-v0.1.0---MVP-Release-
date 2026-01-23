import { useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useBuildStore } from './stores/buildStore'
import TopBar from './components/TopBar'
import CharacterPanel from './components/CharacterPanel'
import InventoryPanel from './components/InventoryPanel'
import PreviewPanel from './components/PreviewPanel'
import SettingsModal from './components/SettingsModal'

function App() {
  const { loadSettings, scanForItems, settingsOpen } = useBuildStore()

  useEffect(() => {
    // Load settings and scan for items on mount
    loadSettings()
  }, [loadSettings])

  useEffect(() => {
    // Scan for items when settings are loaded
    scanForItems()
  }, [scanForItems])

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
        <TopBar />

        <div className="flex-1 flex min-h-0">
          {/* Character Equipment Panel */}
          <div className="w-[280px] flex-shrink-0 border-r-2 border-[#4a4a4a] overflow-y-auto">
            <CharacterPanel />
          </div>

          {/* Inventory Panel */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <InventoryPanel />
          </div>
        </div>

        {/* Preview Panel */}
        <PreviewPanel />

        {/* Settings Modal */}
        {settingsOpen && <SettingsModal />}
      </div>
    </DndProvider>
  )
}

export default App
