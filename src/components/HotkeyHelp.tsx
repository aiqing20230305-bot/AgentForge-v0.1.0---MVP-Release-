/**
 * HotkeyHelp Component
 * 快捷键帮助面板
 */

import { useState, useEffect } from 'react'
import { useHotkey, useGetAllHotkeys, formatHotkey } from '../hooks/useHotkeys'

interface HotkeyCategory {
  title: string
  hotkeys: Array<{
    keys: string
    description: string
  }>
}

export function HotkeyHelp() {
  const [isOpen, setIsOpen] = useState(false)
  const getAllHotkeys = useGetAllHotkeys()

  // 注册快捷键打开帮助
  useHotkey(
    {
      key: '/',
      meta: true,
      description: '显示快捷键帮助',
      preventDefault: true,
    },
    () => {
      setIsOpen(true)
    }
  )

  // ESC关闭
  useHotkey(
    {
      key: 'Escape',
      global: true,
      enabled: isOpen,
      preventDefault: true,
    },
    () => {
      setIsOpen(false)
    }
  )

  // 预定义的快捷键分类
  const categories: HotkeyCategory[] = [
    {
      title: '全局',
      hotkeys: [
        { keys: '⌘K / Ctrl+K', description: '全局搜索' },
        { keys: '⌘N / Ctrl+N', description: '新建任务' },
        { keys: '⌘P / Ctrl+P', description: '暂停/继续执行' },
        { keys: '⌘/ / Ctrl+/', description: '显示此帮助' },
        { keys: 'Esc', description: '关闭弹窗' },
      ],
    },
    {
      title: '导航',
      hotkeys: [
        { keys: '⌘1-9 / Ctrl+1-9', description: '切换标签页' },
        { keys: '⌘[ / Ctrl+[', description: '上一个标签' },
        { keys: '⌘] / Ctrl+]', description: '下一个标签' },
        { keys: '⌘B / Ctrl+B', description: '切换侧边栏' },
      ],
    },
    {
      title: '编辑',
      hotkeys: [
        { keys: '⌘S / Ctrl+S', description: '保存' },
        { keys: '⌘Z / Ctrl+Z', description: '撤销' },
        { keys: '⌘⇧Z / Ctrl+Shift+Z', description: '重做' },
        { keys: '⌘C / Ctrl+C', description: '复制' },
        { keys: '⌘V / Ctrl+V', description: '粘贴' },
      ],
    },
    {
      title: '任务管理',
      hotkeys: [
        { keys: '⌘Enter / Ctrl+Enter', description: '执行任务' },
        { keys: '⌘D / Ctrl+D', description: '删除任务' },
        { keys: '⌘E / Ctrl+E', description: '编辑任务' },
        { keys: '⌘R / Ctrl+R', description: '刷新任务列表' },
      ],
    },
    {
      title: '视图',
      hotkeys: [
        { keys: '⌘= / Ctrl+=', description: '放大' },
        { keys: '⌘- / Ctrl+-', description: '缩小' },
        { keys: '⌘0 / Ctrl+0', description: '重置缩放' },
        { keys: '⌘⇧F / Ctrl+Shift+F', description: '全屏' },
      ],
    },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* 帮助面板 */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900/95 border-2 border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* 标题栏 */}
        <div className="px-8 py-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">⌨️</span>
                <span>快捷键参考</span>
              </h2>
              <p className="text-gray-400 mt-2 text-sm">
                使用快捷键提升工作效率
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="关闭"
            >
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category) => (
              <div key={category.title} className="space-y-3">
                {/* 分类标题 */}
                <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2 mb-4">
                  <span className="w-1 h-6 bg-cyan-500 rounded-full" />
                  {category.title}
                </h3>

                {/* 快捷键列表 */}
                <div className="space-y-3">
                  {category.hotkeys.map((hotkey, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      {/* 描述 */}
                      <span className="text-gray-300 text-sm group-hover:text-white transition-colors">
                        {hotkey.description}
                      </span>

                      {/* 快捷键 */}
                      <div className="flex items-center gap-1">
                        {hotkey.keys.split(' / ').map((key, i) => (
                          <div key={i} className="flex items-center gap-1">
                            {i > 0 && (
                              <span className="text-gray-600 text-xs mx-1">或</span>
                            )}
                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-800/50 border border-gray-700/50 rounded shadow-sm text-gray-300 group-hover:border-cyan-500/50 transition-colors">
                              {key}
                            </kbd>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 提示信息 */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="flex items-start gap-3 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-cyan-400 mb-1">
                  提示
                </h4>
                <p className="text-sm text-gray-400">
                  大多数快捷键在 Mac 上使用 Command (⌘)，在 Windows/Linux 上使用 Ctrl。
                  某些快捷键可能在输入框中不生效，以避免干扰正常输入。
                </p>
              </div>
            </div>
          </div>

          {/* 自定义快捷键提示 */}
          <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚙️</span>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-400 mb-1">
                  自定义快捷键
                </h4>
                <p className="text-sm text-gray-400">
                  前往设置面板可以自定义和管理您的快捷键偏好。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 底部栏 */}
        <div className="px-8 py-4 bg-gray-900/50 border-t border-gray-800 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            按 <kbd className="px-2 py-1 text-xs font-mono bg-gray-800 border border-gray-700 rounded">Esc</kbd> 关闭
          </div>
          <div className="text-xs text-gray-600">
            AgentForge v1.0.0
          </div>
        </div>
      </div>

      {/* 自定义滚动条样式 */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </div>
  )
}

/**
 * 快捷键指示器组件
 * 用于在UI中显示快捷键提示
 */
interface HotkeyIndicatorProps {
  keys: string
  className?: string
}

export function HotkeyIndicator({ keys, className = '' }: HotkeyIndicatorProps) {
  return (
    <kbd
      className={`px-2 py-1 text-xs font-mono bg-gray-800/50 border border-gray-700/50 rounded shadow-sm text-gray-400 ${className}`}
    >
      {keys}
    </kbd>
  )
}
