import { useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useBuildStore } from './stores/buildStore'
import { initializeDefaultDataSources } from './store/useDataSourceStore'
import TopBar from './components/TopBar'
import AgentDisplayPanel from './components/AgentDisplayPanel'
import { MainNavigationTabs } from './components/MainNavigationTabs'
import PreviewPanel from './components/PreviewPanel'
import SettingsModal from './components/SettingsModal'
import SpaceBackground from './components/SpaceBackground'
import CockpitLoading from './components/CockpitLoading'
import OnboardingWizard from './components/OnboardingWizard'
import { GlobalExpBar } from './components/GlobalExpBar'
import { DailyQuestPanel } from './components/DailyQuestPanel'
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import { GlobalSocketEventHandler } from './components/GlobalSocketEventHandler'
import { OfflineIndicator } from './components/OfflineIndicator'
import { getHeartbeatService } from './services/evolution/heartbeatService'
import { getEvolutionEngine } from './services/evolution/evolutionEngine'
import { ErrorBoundary } from './components/ErrorBoundary'

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
    console.log('[App] Initializing default data sources...')
    initializeDefaultDataSources()

    // Load settings and scan for items on mount
    loadSettings()

    // 🫀 启动心跳监控系统
    const heartbeatService = getHeartbeatService()
    heartbeatService.start()
    console.log('[App] 🫀 Heartbeat monitoring started')

    // 🧬 启动进化引擎
    const evolutionEngine = getEvolutionEngine()
    evolutionEngine.start()
    console.log('[App] 🧬 Evolution engine started')

    // Cleanup on unmount
    return () => {
      heartbeatService.stop()
      evolutionEngine.stop()
      console.log('[App] 💔 Heartbeat & Evolution stopped')
    }
  }, [loadSettings])

  useEffect(() => {
    // Scan for items when settings are loaded
    scanForItems()
  }, [scanForItems])

  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider autoConnect={false}>
          <GlobalSocketEventHandler />
          <DndProvider backend={HTML5Backend}>
            {/* 驾驶舱启动Loading */}
            {showLoading && <CockpitLoading onComplete={() => setShowLoading(false)} />}

            <div className="h-screen flex flex-col bg-[#0a0a0a] overflow-hidden relative">
              {/* 星空背景 */}
              <SpaceBackground />

              {/* 离线指示器 */}
              <OfflineIndicator />

              {/* 全局经验条 */}
              <GlobalExpBar />

              <TopBar />

              <div className="flex-1 flex min-h-0 h-full mt-12">
                {/* Agent Display Panel - Full Width */}
                <div className="flex-1 min-w-0 overflow-hidden h-full">
                  <AgentDisplayPanel />
                </div>

                {/* Main Navigation Tabs - Right */}
                <MainNavigationTabs />
              </div>

              {/* Preview Panel */}
              <PreviewPanel />

              {/* Settings Modal */}
              {settingsOpen && <SettingsModal />}

              {/* Onboarding Wizard */}
              {showOnboarding && <OnboardingWizard onComplete={() => setShowOnboarding(false)} />}

              {/* 每日任务面板 */}
              <DailyQuestPanel />
            </div>
          </DndProvider>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
