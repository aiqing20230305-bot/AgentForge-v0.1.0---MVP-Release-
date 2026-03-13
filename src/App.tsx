import { useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useBuildStore } from './stores/buildStore'
import { initializeDefaultDataSources } from './store/useDataSourceStore'
import TopBar from './components/TopBar'
import AgentDisplayPanel from './components/AgentDisplayPanel'
import TaskManagementPanel from './components/TaskManagementPanel'
import PreviewPanel from './components/PreviewPanel'
import SettingsModal from './components/SettingsModal'
import OpenClawAgentsPanel from './components/OpenClawAgentsPanel'
import ParticleBackground from './components/ParticleBackground'
import SpaceBackground from './components/SpaceBackground'
import CockpitLoading from './components/CockpitLoading'
import OnboardingWizard from './components/OnboardingWizard'

function App() {
  const { loadSettings, scanForItems, settingsOpen } = useBuildStore()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showLoading, setShowLoading] = useState(true)

  useEffect(() => {
    // Check if onboarding has been completed
    const completed = localStorage.getItem('onboarding-completed')
    if (!completed) {
      setShowOnboarding(true)
    }

    // Initialize default data sources (only once on first run)
    initializeDefaultDataSources()

    // Load settings and scan for items on mount
    loadSettings()
  }, [loadSettings])

  useEffect(() => {
    // Scan for items when settings are loaded
    scanForItems()
  }, [scanForItems])

  return (
    <DndProvider backend={HTML5Backend}>
      {/* 驾驶舱启动Loading */}
      {showLoading && <CockpitLoading onComplete={() => setShowLoading(false)} />}

      <div className="h-screen flex flex-col bg-[#0a0a0a] overflow-hidden relative">
        {/* 星空背景 */}
        <SpaceBackground />

        <TopBar />

        <div className="flex-1 flex min-h-0 h-full">
          {/* Agent Display Panel - Full Width */}
          <div className="flex-1 min-w-0 overflow-hidden h-full">
            <AgentDisplayPanel />
          </div>

          {/* Task Management Panel - Right */}
          <div className="w-[480px] flex-shrink-0 border-l border-white/10 overflow-hidden h-full">
            <TaskManagementPanel />
          </div>
        </div>

        {/* Preview Panel */}
        <PreviewPanel />

        {/* Settings Modal */}
        {settingsOpen && <SettingsModal />}

        {/* Onboarding Wizard */}
        {showOnboarding && <OnboardingWizard onComplete={() => setShowOnboarding(false)} />}
      </div>
    </DndProvider>
  )
}

export default App
