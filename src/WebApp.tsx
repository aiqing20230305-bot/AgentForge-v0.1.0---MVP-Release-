/**
 * Web版优化App - 完整功能 + 移动端支持
 */
import React, { useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import { useBuildStore } from './stores/buildStore'
import { initializeDefaultDataSources } from './store/useDataSourceStore'
import { initializeTheme } from './store/useThemeStore'
import { loadDemoAgentsIfNeeded } from './utils/demoAgentLoader'
import { useIsMobile, useIsTouchDevice } from './hooks/useIsMobile'
import { loadOpenClawAgents } from './utils/openclawLoader'
import TopBar from './components/TopBar'
import AgentDisplayPanel from './components/AgentDisplayPanel'
import { MainNavigationTabs } from './components/MainNavigationTabs'
import PreviewPanel from './components/PreviewPanel'
import SettingsModal from './components/SettingsModal'
import SpaceBackground from './components/SpaceBackground'
import OnboardingWizard from './components/OnboardingWizard'
import { QuickDemo } from './components/QuickDemo'
import { GlobalExpBar } from './components/GlobalExpBar'
import { ErrorBoundary } from './components/ErrorBoundary'
import { GlobalSearch, useGlobalSearchHotkey } from './components/GlobalSearch'
import { MobileLayout } from './components/mobile/MobileLayout'
import { MobileAgentGrid } from './components/mobile/MobileAgentGrid'
import { PWAInstallPrompt } from './components/mobile/PWAInstallPrompt'
import { LeaderboardModal } from './components/leaderboard/LeaderboardModal'
import { initPerformanceMonitoring } from './utils/performance'
import './index.css'
import './styles/animations.css'

export default function WebApp() {
  const { loadSettings, scanForItems, settingsOpen, setSettingsOpen } = useBuildStore()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showQuickDemo, setShowQuickDemo] = useState(false)
  const [agents, setAgents] = useState<any[]>([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [activeTab, setActiveTab] = useState<'agents' | 'tasks' | 'leaderboard' | 'evolution' | 'settings'>('agents')
  const globalSearch = useGlobalSearchHotkey()

  // 设备检测
  const isMobile = useIsMobile()
  const isTouch = useIsTouchDevice()

  // 选择DnD后端（触摸设备用TouchBackend）
  const dndBackend = isTouch ? TouchBackend : HTML5Backend

  useEffect(() => {
    // 初始化
    const completed = localStorage.getItem('onboarding-completed')
    const quickDemoSeen = localStorage.getItem('quick-demo-seen')

    if (!completed) {
      setShowOnboarding(true)
    }

    if (!quickDemoSeen) {
      setShowQuickDemo(true)
    }

    console.log('[WebApp] Initializing...')
    initializeDefaultDataSources()
    loadDemoAgentsIfNeeded()
    initializeTheme()
    loadSettings()

    // 加载Agent数据（用于移动端）
    loadOpenClawAgents().then(setAgents)

    // Phase 3: 性能监控
    initPerformanceMonitoring()
  }, [loadSettings])

  useEffect(() => {
    scanForItems()
  }, [scanForItems])

  // Handle mobile tab changes
  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId)

    if (tabId === 'leaderboard') {
      setShowLeaderboard(true)
    } else if (tabId === 'settings') {
      setSettingsOpen(true)
    }
    // TODO: Handle other tabs (tasks, evolution)
  }

  return (
    <ErrorBoundary>
      <DndProvider backend={dndBackend}>
        <div className="h-screen flex flex-col bg-[#0a0a0a] overflow-hidden relative">
          {/* 星空背景 - z-index: 0 */}
          <SpaceBackground />

          {/* 主UI容器 - z-index: 10 确保在背景之上 */}
          <div className="relative z-10 h-full flex flex-col">
            {isMobile ? (
              // ==================== 移动端布局 ====================
              <MobileLayout activeTab={activeTab} onTabChange={handleTabChange}>
                <div className="h-full flex flex-col">
                  {/* 移动端TopBar（简化版） */}
                  <div className="sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/10 px-4 py-3">
                    <h1 className="text-xl font-bold text-white">AgentForge</h1>
                  </div>

                  {/* Agent网格 */}
                  <MobileAgentGrid
                    agents={agents}
                    onAgentClick={(agent) => {
                      console.log('[Mobile] Agent clicked:', agent)
                      // TODO: 打开Agent详情
                    }}
                    onCreateAgent={() => {
                      console.log('[Mobile] Create agent')
                      // TODO: 打开创建Agent
                    }}
                  />
                </div>

                {/* PWA安装提示 */}
                <PWAInstallPrompt />

                {/* 排行榜弹窗 */}
                <LeaderboardModal
                  isOpen={showLeaderboard}
                  onClose={() => {
                    setShowLeaderboard(false)
                    setActiveTab('agents')
                  }}
                  agents={agents}
                  currentUserId="current-user-id" // TODO: 从auth获取实际用户ID
                />
              </MobileLayout>
            ) : (
              // ==================== 桌面端布局 ====================
              <>
                {/* 全局经验条 */}
                <GlobalExpBar />

                {/* TopBar */}
                <TopBar />

                {/* 主内容区 */}
                <div className="flex-1 flex min-h-0 h-full mt-12">
                  {/* Agent Display Panel */}
                  <div className="flex-1 min-w-0 overflow-hidden h-full">
                    <AgentDisplayPanel />
                  </div>

                  {/* 右侧导航 */}
                  <MainNavigationTabs />
                </div>

                {/* Preview Panel */}
                <PreviewPanel />
              </>
            )}

            {/* 通用弹窗和Modal */}
            {settingsOpen && <SettingsModal />}

            {showOnboarding && (
              <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
            )}

            {showQuickDemo && (
              <QuickDemo
                onComplete={() => {
                  setShowQuickDemo(false)
                  localStorage.setItem('quick-demo-seen', 'true')
                }}
                onSkip={() => {
                  setShowQuickDemo(false)
                  localStorage.setItem('quick-demo-seen', 'true')
                }}
              />
            )}

            <GlobalSearch isOpen={globalSearch.isOpen} onClose={globalSearch.close} />
          </div>
        </div>
      </DndProvider>
    </ErrorBoundary>
  )
}
