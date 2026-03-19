/**
 * 移动端布局组件
 * 针对小屏幕设备优化的布局
 */
import React, { ReactNode } from 'react'
import { BottomTabBar } from './BottomTabBar'

type TabId = 'agents' | 'tasks' | 'leaderboard' | 'evolution' | 'settings'

interface MobileLayoutProps {
  children: ReactNode
  hideTabBar?: boolean
  activeTab?: TabId
  onTabChange?: (tabId: TabId) => void
}

export function MobileLayout({ children, hideTabBar = false, activeTab, onTabChange }: MobileLayoutProps) {
  return (
    <div className="mobile-layout h-screen flex flex-col bg-[#0a0a0a] overflow-hidden">
      {/* 主内容区 - 自动填充剩余空间 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {children}
      </div>

      {/* 底部Tab栏 - 仅移动端显示 */}
      {!hideTabBar && (
        <div className="md:hidden">
          <BottomTabBar activeTab={activeTab} onTabChange={onTabChange} />
        </div>
      )}
    </div>
  )
}
