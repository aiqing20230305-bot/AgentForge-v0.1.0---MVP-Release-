/**
 * Web版优化App - 完整功能
 */
import React, { useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useBuildStore } from './stores/buildStore'
import { initializeDefaultDataSources } from './store/useDataSourceStore'
import { initializeTheme } from './store/useThemeStore'
import { loadDemoAgentsIfNeeded } from './utils/demoAgentLoader'
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
import './index.css'
import './styles/animations.css'

export default function WebApp() {
  const { loadSettings, scanForItems, settingsOpen, setSettingsOpen } = useBuildStore()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showQuickDemo, setShowQuickDemo] = useState(false)
  const globalSearch = useGlobalSearchHotkey()

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
  }, [loadSettings])

  useEffect(() => {
    scanForItems()
  }, [scanForItems])

  return (
    <ErrorBoundary>
      <DndProvider backend={HTML5Backend}>
        <div className="h-screen flex flex-col bg-[#0a0a0a] overflow-hidden relative">
          {/* 星空背景 - z-index: 0 */}
          <SpaceBackground />

          {/* 主UI容器 - z-index: 10 确保在背景之上 */}
          <div className="relative z-10 h-full flex flex-col">
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

            {/* Settings Modal */}
            {settingsOpen && <SettingsModal />}

            {/* Onboarding */}
            {showOnboarding && (
              <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
            )}

            {/* Quick Demo */}
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

            {/* 全局搜索 */}
            <GlobalSearch isOpen={globalSearch.isOpen} onClose={globalSearch.close} />
          </div>
        </div>
      </DndProvider>
    </ErrorBoundary>
  )
}
