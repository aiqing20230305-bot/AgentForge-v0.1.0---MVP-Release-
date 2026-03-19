import { useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useBuildStore } from './stores/buildStore'
import { initializeDefaultDataSources } from './store/useDataSourceStore'
import { initializeTheme } from './store/useThemeStore'
import TopBar from './components/TopBar'
import AgentDisplayPanel from './components/AgentDisplayPanel'
import { MainNavigationTabs } from './components/MainNavigationTabs'
import PreviewPanel from './components/PreviewPanel'
import SettingsModal from './components/SettingsModal'
import SpaceBackground from './components/SpaceBackground'
import CockpitLoading from './components/CockpitLoading'
import OnboardingWizard from './components/OnboardingWizard'
import { QuickDemo } from './components/QuickDemo'
import { GlobalExpBar } from './components/GlobalExpBar'
import { DailyQuestPanel } from './components/DailyQuestPanel'
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import { GlobalSocketEventHandler } from './components/GlobalSocketEventHandler'
import { OfflineIndicator } from './components/OfflineIndicator'
import { getHeartbeatService } from './services/evolution/heartbeatService'
import { getEvolutionEngine } from './services/evolution/evolutionEngine'
import { ErrorBoundary } from './components/ErrorBoundary'
import { autoLoadTestAgentInDev } from './utils/testAgentLoader'
import { loadDemoAgentsIfNeeded } from './utils/demoAgentLoader'
import { GlobalSearch, useGlobalSearchHotkey } from './components/GlobalSearch'
import { HotkeyHelp } from './components/HotkeyHelp'
import { GlobalHotkeyProvider } from './components/GlobalHotkeyProvider'
import { VoiceControlButton } from './components/VoiceControlButton'
import { useVoiceCommands } from './hooks/useVoiceCommands'
import { NewTaskModal } from './components/TaskManagementPanel'
import './i18n/config' // 🌍 Initialize i18n

function App() {
  const { loadSettings, scanForItems, settingsOpen, setSettingsOpen } = useBuildStore()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showQuickDemo, setShowQuickDemo] = useState(false)
  // Web版跳过CockpitLoading动画（避免useEffect依赖问题）
  const [showLoading, setShowLoading] = useState(false)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const globalSearch = useGlobalSearchHotkey()

  // 语音命令集成
  useVoiceCommands({
    onOpenSettings: () => setSettingsOpen(true),
    onCreateTask: () => {
      console.log('[App] Voice: Create task')
      setShowTaskDialog(true)
    },
    onPauseAll: () => {
      console.log('[App] Voice: Pause all tasks')
    },
    onShowStats: () => {
      console.log('[App] Voice: Show stats')
    },
    onShowTasks: () => {
      console.log('[App] Voice: Show tasks')
    }
  })

  useEffect(() => {
    // Check if onboarding has been completed
    const completed = localStorage.getItem('onboarding-completed')
    const quickDemoSeen = localStorage.getItem('quick-demo-seen')

    if (!completed) {
      setShowOnboarding(true)
    }

    // 显示快速体验（可以与onboarding一起，或者单独显示）
    if (!quickDemoSeen) {
      setShowQuickDemo(true)
    }

    // Initialize default data sources (only once on first run)
    console.log('[App] Initializing default data sources...')
    initializeDefaultDataSources()

    // 📦 加载演示Agent (仅首次启动)
    console.log('[App] Loading demo agents if needed...')
    loadDemoAgentsIfNeeded()

    // Initialize theme system
    console.log('[App] Initializing theme system...')
    initializeTheme()

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

    // 🎭 开发环境：测试Agent加载（已禁用，使用window.loadLinaJie()手动加载）
    autoLoadTestAgentInDev()

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

  useEffect(() => {
    // Listen for task creation events
    const handleCreateTask = () => setShowTaskDialog(true)
    window.addEventListener('agentforge:createTask', handleCreateTask)

    return () => {
      window.removeEventListener('agentforge:createTask', handleCreateTask)
    }
  }, [])

  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider autoConnect={false}>
          <GlobalSocketEventHandler />
          <GlobalHotkeyProvider />
          <DndProvider backend={HTML5Backend}>
            {/* 驾驶舱启动Loading */}
            {showLoading && <CockpitLoading onComplete={() => setShowLoading(false)} />}

            <div className="h-screen flex flex-col bg-[#0a0a0a] overflow-hidden relative">
              {/* 星空背景 - Web版暂时禁用，避免渲染问题 */}
              {false && <SpaceBackground />}

              {/* 主内容 */}
              <div className="h-full flex flex-col">
                {/* Web版测试：确保有可见内容 */}
                <div style={{
                  position: 'fixed',
                  top: '20px',
                  left: '20px',
                  background: 'rgba(6, 182, 212, 0.95)',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  zIndex: 9999,
                  fontFamily: 'sans-serif'
                }}>
                  <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
                    ✅ AgentForge Web 版
                  </h1>
                  <p>如果你能看到这个，说明React已经渲染了！</p>
                </div>

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

              {/* 快速体验模式 */}
              {showQuickDemo && (
                <QuickDemo
                  onComplete={() => {
                    setShowQuickDemo(false);
                    localStorage.setItem('quick-demo-seen', 'true');
                  }}
                  onSkip={() => {
                    setShowQuickDemo(false);
                    localStorage.setItem('quick-demo-seen', 'true');
                  }}
                />
              )}

              {/* 每日任务面板 */}
              <DailyQuestPanel />

              {/* 全局搜索 */}
              <GlobalSearch isOpen={globalSearch.isOpen} onClose={globalSearch.close} />

              {/* 快捷键帮助 */}
              <HotkeyHelp />

              {/* 语音控制按钮 */}
              <VoiceControlButton onOpenSettings={() => setSettingsOpen(true)} />

              {/* 任务创建对话框 */}
              {showTaskDialog && <NewTaskModal onClose={() => setShowTaskDialog(false)} />}
              </div>
              {/* 主内容容器结束 */}
            </div>
          </DndProvider>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
