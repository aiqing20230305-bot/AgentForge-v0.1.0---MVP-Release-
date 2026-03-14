/**
 * Component Showcase
 * 组件和 Hook 演示库 - 开发者参考
 */

import React, { useState } from 'react'
import {
  Code,
  Search,
  Copy,
  Smartphone,
  Loader2,
  Sparkles
} from 'lucide-react'
import { TaskSearchBar } from './TaskSearchBar'
import {
  CopyableCodeBlock,
  CopyableText,
  ShareLink,
  APIKeyDisplay
} from './CopyableCodeBlock'
import { ResponsiveLayout, ResponsiveGrid } from './ResponsiveContainer'
import {
  AutoDismissToast,
  LoadingSpinnerWithTimeout,
  ProgressWithAnimation,
  SkeletonWithDelayedContent
} from './LoadingStates'
import { useDebounce, useToggle, useCopy } from '@/hooks'

type TabType = 'search' | 'copy' | 'responsive' | 'loading'

export default function ComponentShowcase() {
  const [activeTab, setActiveTab] = useState<TabType>('search')

  const tabs = [
    { id: 'search' as TabType, label: '搜索组件', icon: Search },
    { id: 'copy' as TabType, label: '复制组件', icon: Copy },
    { id: 'responsive' as TabType, label: '响应式容器', icon: Smartphone },
    { id: 'loading' as TabType, label: '加载状态', icon: Loader2 }
  ]

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      {/* 头部 */}
      <div className="p-4 border-b border-white/20 bg-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              组件演示库
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                v0.3.6
              </span>
            </h2>
            <p className="text-xs text-white/60">
              交互式演示 Hook 和组件的实际应用
            </p>
          </div>
        </div>

        {/* 标签页 */}
        <div className="flex gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {activeTab === 'search' && <SearchShowcase />}
        {activeTab === 'copy' && <CopyShowcase />}
        {activeTab === 'responsive' && <ResponsiveShowcase />}
        {activeTab === 'loading' && <LoadingShowcase />}
      </div>
    </div>
  )
}

/**
 * 搜索组件演示
 */
function SearchShowcase() {
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [demoValue, setDemoValue] = useState('')
  const debouncedValue = useDebounce(demoValue, 500)

  const handleSearch = (query: string) => {
    // 模拟搜索结果
    if (query.trim()) {
      setSearchResults([
        `结果 1: ${query}`,
        `结果 2: ${query}`,
        `结果 3: ${query}`
      ])
    } else {
      setSearchResults([])
    }
  }

  return (
    <div className="space-y-6">
      {/* 演示区域 */}
      <DemoSection
        title="TaskSearchBar - 任务搜索栏"
        description="带防抖搜索、历史记录和动画的搜索组件"
      >
        <div className="space-y-4">
          <TaskSearchBar
            onSearch={handleSearch}
            placeholder="尝试搜索任务..."
            showHistory={true}
          />

          {searchResults.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">搜索结果:</div>
              <div className="space-y-2">
                {searchResults.map((result, i) => (
                  <div key={i} className="text-white text-sm">
                    • {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DemoSection>

      {/* useDebounce 演示 */}
      <DemoSection
        title="useDebounce Hook"
        description="防抖Hook，延迟更新值（500ms）"
      >
        <div className="space-y-3">
          <input
            type="text"
            value={demoValue}
            onChange={e => setDemoValue(e.target.value)}
            placeholder="输入文本，观察防抖效果..."
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">即时值:</div>
              <div className="text-white font-mono">{demoValue || '(空)'}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">防抖值 (500ms):</div>
              <div className="text-green-400 font-mono">{debouncedValue || '(空)'}</div>
            </div>
          </div>
        </div>
      </DemoSection>

      {/* 代码示例 */}
      <CodeExample
        code={`import { TaskSearchBar } from './TaskSearchBar'
import { useDebounce } from '@/hooks'

function MyComponent() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)

  useEffect(() => {
    // 搜索只在用户停止输入 300ms 后执行
    if (debouncedSearch) {
      performSearch(debouncedSearch)
    }
  }, [debouncedSearch])

  return (
    <TaskSearchBar
      onSearch={setSearchTerm}
      placeholder="搜索..."
      showHistory={true}
    />
  )
}`}
        title="使用示例"
      />
    </div>
  )
}

/**
 * 复制组件演示
 */
function CopyShowcase() {
  const [copy, copied] = useCopy(2000)

  return (
    <div className="space-y-6">
      {/* CopyableText */}
      <DemoSection
        title="CopyableText - 可复制文本"
        description="一键复制文本，带视觉反馈"
      >
        <div className="space-y-3">
          <CopyableText
            text="https://github.com/agentforge/agentforge"
            label="GitHub 仓库"
            showCopyIcon={true}
          />
          <CopyableText
            text="npm install @agentforge/core"
            label="安装命令"
            showCopyIcon={true}
          />
        </div>
      </DemoSection>

      {/* CopyableCodeBlock */}
      <DemoSection
        title="CopyableCodeBlock - 代码块"
        description="语法高亮代码块，支持行号和一键复制"
      >
        <CopyableCodeBlock
          code={`function greet(name: string): string {
  return \`Hello, \${name}!\`
}

const message = greet('AgentForge')
console.log(message)`}
          language="typescript"
          title="示例代码"
          showLineNumbers={true}
        />
      </DemoSection>

      {/* APIKeyDisplay */}
      <DemoSection
        title="APIKeyDisplay - API密钥显示"
        description="带遮罩和显示/隐藏切换的密钥显示"
      >
        <APIKeyDisplay
          apiKey="sk_test_1234567890abcdefghijklmnopqrstuvwxyz"
          label="API Key"
          masked={true}
        />
      </DemoSection>

      {/* ShareLink */}
      <DemoSection
        title="ShareLink - 分享链接"
        description="分享链接组件，带复制功能"
      >
        <ShareLink
          url="https://agentforge.app/invite/abc123xyz"
          title="邀请链接"
          description="分享此链接邀请团队成员"
        />
      </DemoSection>

      {/* useCopy Hook */}
      <DemoSection
        title="useCopy Hook"
        description="简化版复制Hook"
      >
        <div className="space-y-3">
          <button
            onClick={() => copy('复制成功！这是测试文本。')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {copied ? '✓ 已复制' : '点击复制'}
          </button>
        </div>
      </DemoSection>

      {/* 代码示例 */}
      <CodeExample
        code={`import { useCopy, CopyableText, APIKeyDisplay } from '@/hooks'

function MyComponent() {
  const [copy, copied] = useCopy(2000)

  return (
    <div>
      {/* 方式1: 使用组件 */}
      <CopyableText text="Hello World" />

      {/* 方式2: 使用Hook */}
      <button onClick={() => copy('Text to copy')}>
        {copied ? '已复制' : '复制'}
      </button>

      {/* 方式3: API密钥 */}
      <APIKeyDisplay apiKey="sk_..." masked={true} />
    </div>
  )
}`}
        title="使用示例"
      />
    </div>
  )
}

/**
 * 响应式容器演示
 */
function ResponsiveShowcase() {
  return (
    <div className="space-y-6">
      {/* ResponsiveLayout */}
      <DemoSection
        title="ResponsiveLayout - 响应式布局"
        description="根据屏幕尺寸自动调整布局"
      >
        <ResponsiveLayout
          mobileLayout={<div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 text-blue-300">移动端布局</div>}
          tabletLayout={<div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-300">平板布局</div>}
          desktopLayout={<div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4 text-purple-300">桌面端布局</div>}
        >
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 text-white">默认布局</div>
        </ResponsiveLayout>
      </DemoSection>

      {/* ResponsiveGrid */}
      <DemoSection
        title="ResponsiveGrid - 响应式网格"
        description="自适应列数的网格布局"
      >
        <ResponsiveGrid>
          {[1, 2, 3, 4, 5, 6].map(num => (
            <div
              key={num}
              className="bg-gray-800 border border-gray-600 rounded-lg p-4 text-center"
            >
              <div className="text-2xl font-bold text-white mb-1">{num}</div>
              <div className="text-xs text-gray-400">网格项目</div>
            </div>
          ))}
        </ResponsiveGrid>
      </DemoSection>

      {/* 代码示例 */}
      <CodeExample
        code={`import { ResponsiveLayout, ResponsiveGrid } from './ResponsiveContainer'

function MyComponent() {
  return (
    <div>
      {/* 方式1: 不同设备不同布局 */}
      <ResponsiveLayout
        mobileLayout={<MobileView />}
        tabletLayout={<TabletView />}
        desktopLayout={<DesktopView />}
      >
        <DefaultView />
      </ResponsiveLayout>

      {/* 方式2: 响应式网格 */}
      <ResponsiveGrid>
        <Card />
        <Card />
        <Card />
      </ResponsiveGrid>
    </div>
  )
}`}
        title="使用示例"
      />
    </div>
  )
}

/**
 * 加载状态演示
 */
function LoadingShowcase() {
  const [showToast, toggleToast] = useToggle(false)
  const [isLoading, toggleLoading] = useToggle(false)

  return (
    <div className="space-y-6">
      {/* 控制按钮 */}
      <div className="bg-gray-800 rounded-lg p-4 flex gap-3">
        <button
          onClick={toggleToast}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          显示 Toast
        </button>
        <button
          onClick={toggleLoading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          {isLoading ? '停止加载' : '开始加载'}
        </button>
      </div>

      {/* AutoDismissToast */}
      <DemoSection
        title="AutoDismissToast - 自动消失通知"
        description="带超时自动关闭的 Toast 通知"
      >
        {showToast && (
          <AutoDismissToast
            message="这是一条测试消息，3秒后自动消失"
            type="success"
            duration={3000}
            onDismiss={() => toggleToast()}
          />
        )}
        {!showToast && (
          <div className="text-sm text-gray-400 text-center py-4">
            点击上方按钮显示 Toast
          </div>
        )}
      </DemoSection>

      {/* LoadingSpinnerWithTimeout */}
      <DemoSection
        title="LoadingSpinnerWithTimeout - 超时加载器"
        description="带超时提示的加载旋转器"
      >
        {isLoading && (
          <LoadingSpinnerWithTimeout
            timeout={5000}
            onTimeout={() => console.log('加载超时')}
            message="加载中..."
            timeoutMessage="加载超时，请重试"
          />
        )}
        {!isLoading && (
          <div className="text-sm text-gray-400 text-center py-4">
            点击上方按钮显示加载器（5秒后超时）
          </div>
        )}
      </DemoSection>

      {/* ProgressWithAnimation */}
      <DemoSection
        title="ProgressWithAnimation - 动画进度条"
        description="平滑动画的进度指示器"
      >
        <ProgressWithAnimation
          value={isLoading ? 75 : 0}
          max={100}
          label="加载进度"
          showPercentage={true}
        />
      </DemoSection>

      {/* SkeletonWithDelayedContent */}
      <DemoSection
        title="SkeletonWithDelayedContent - 延迟加载骨架"
        description="显示骨架屏后延迟显示内容（2秒后显示）"
      >
        <SkeletonWithDelayedContent
          isLoading={false}
          delay={2000}
          skeletonContent={
            <div className="bg-gray-700 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-600 rounded w-1/2"></div>
            </div>
          }
        >
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-300">
            内容已加载！
          </div>
        </SkeletonWithDelayedContent>
      </DemoSection>

      {/* 代码示例 */}
      <CodeExample
        code={`import {
  AutoDismissToast,
  LoadingSpinnerWithTimeout,
  ProgressWithAnimation,
  SkeletonWithDelayedContent
} from './LoadingStates'

function MyComponent() {
  const [showToast, setShowToast] = useState(false)

  return (
    <div>
      {/* 自动消失通知 */}
      {showToast && (
        <AutoDismissToast
          message="操作成功"
          type="success"
          duration={3000}
          onDismiss={() => setShowToast(false)}
        />
      )}

      {/* 加载器 */}
      <LoadingSpinnerWithTimeout
        duration={5000}
        onTimeout={() => console.log('超时')}
      />

      {/* 进度条 */}
      <ProgressWithAnimation progress={75} duration={1000} />

      {/* 延迟加载 */}
      <SkeletonWithDelayedContent delay={2000}>
        <Content />
      </SkeletonWithDelayedContent>
    </div>
  )
}`}
        title="使用示例"
      />
    </div>
  )
}

/**
 * 演示区域容器
 */
function DemoSection({
  title,
  description,
  children
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="mb-4">
        <h3 className="text-base font-bold text-white mb-1">{title}</h3>
        <p className="text-sm text-white/60">{description}</p>
      </div>
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        {children}
      </div>
    </div>
  )
}

/**
 * 代码示例组件
 */
function CodeExample({ code, title }: { code: string; title: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <Code className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      <CopyableCodeBlock
        code={code}
        language="typescript"
        showLineNumbers={true}
      />
    </div>
  )
}
