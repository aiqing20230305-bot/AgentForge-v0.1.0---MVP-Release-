/**
 * 移动端底部Tab导航栏
 * 替代桌面版的右侧导航
 */
import React, { useState } from 'react'
import { Home, ListTodo, Trophy, Settings, Zap } from 'lucide-react'

type TabId = 'agents' | 'tasks' | 'leaderboard' | 'evolution' | 'settings'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
}

interface BottomTabBarProps {
  activeTab?: TabId
  onTabChange?: (tabId: TabId) => void
}

const tabs: Tab[] = [
  {
    id: 'agents',
    label: 'Agents',
    icon: <Home size={24} />
  },
  {
    id: 'tasks',
    label: '任务',
    icon: <ListTodo size={24} />
  },
  {
    id: 'leaderboard',
    label: '排行',
    icon: <Trophy size={24} />
  },
  {
    id: 'evolution',
    label: '进化',
    icon: <Zap size={24} />
  },
  {
    id: 'settings',
    label: '设置',
    icon: <Settings size={24} />
  }
]

export function BottomTabBar({ activeTab: controlledActiveTab, onTabChange }: BottomTabBarProps = {}) {
  const [internalActiveTab, setInternalActiveTab] = useState<TabId>('agents')

  // 使用受控或非受控模式
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab

  const handleTabClick = (tabId: TabId) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId)
    }

    onTabChange?.(tabId)
    console.log(`[BottomTabBar] Switch to tab: ${tabId}`)
  }

  return (
    <div
      className="bottom-tab-bar fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(10, 10, 10, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
        paddingBottom: 'env(safe-area-inset-bottom)' // iPhone X等刘海屏适配
      }}
    >
      <div className="flex justify-around items-center h-16">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`
              flex flex-col items-center justify-center
              flex-1 h-full
              transition-all duration-200
              ${activeTab === tab.id
                ? 'text-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
              }
            `}
            style={{
              touchAction: 'manipulation', // 优化触摸响应
              WebkitTapHighlightColor: 'transparent' // 移除iOS点击高亮
            }}
          >
            {/* 图标 */}
            <div
              className={`
                mb-1 transition-transform duration-200
                ${activeTab === tab.id ? 'scale-110' : 'scale-100'}
              `}
            >
              {tab.icon}
            </div>

            {/* 标签 */}
            <span className="text-xs font-medium">
              {tab.label}
            </span>

            {/* 活动指示器 */}
            {activeTab === tab.id && (
              <div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-cyan-400 rounded-full"
                style={{
                  animation: 'slideIn 0.2s ease-out'
                }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// CSS动画（需要添加到全局样式或内联）
const styles = `
@keyframes slideIn {
  from {
    width: 0;
    opacity: 0;
  }
  to {
    width: 2rem;
    opacity: 1;
  }
}
`
