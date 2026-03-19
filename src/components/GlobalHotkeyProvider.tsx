/**
 * GlobalHotkeyProvider
 * 全局快捷键提供者 - 管理所有全局快捷键
 */

import { useHotkeys } from '../hooks/useHotkeys'
import { useBuildStore } from '../stores/buildStore'

export function GlobalHotkeyProvider() {
  const { toggleSettings } = useBuildStore()

  // 注册所有全局快捷键
  useHotkeys([
    // Settings
    {
      key: ',',
      meta: true,
      description: '打开设置',
      handler: () => {
        toggleSettings()
      },
    },

    // Tab navigation (1-9)
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => ({
      key: String(num),
      meta: true,
      description: `切换到标签 ${num}`,
      handler: () => {
        // 发送自定义事件来切换标签
        window.dispatchEvent(
          new CustomEvent('hotkey:switchTab', { detail: { index: num - 1 } })
        )
      },
    })),

    // Pause/Continue
    {
      key: 'p',
      meta: true,
      description: '暂停/继续任务执行',
      handler: () => {
        window.dispatchEvent(new CustomEvent('hotkey:togglePause'))
      },
    },

    // New Task
    {
      key: 'n',
      meta: true,
      description: '新建任务',
      handler: () => {
        window.dispatchEvent(new CustomEvent('hotkey:newTask'))
      },
    },

    // Refresh
    {
      key: 'r',
      meta: true,
      description: '刷新任务列表',
      preventDefault: true,
      handler: (e) => {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('hotkey:refresh'))
      },
    },

    // Toggle Sidebar
    {
      key: 'b',
      meta: true,
      description: '切换侧边栏',
      handler: () => {
        window.dispatchEvent(new CustomEvent('hotkey:toggleSidebar'))
      },
    },

    // Previous Tab
    {
      key: '[',
      meta: true,
      description: '上一个标签',
      handler: () => {
        window.dispatchEvent(new CustomEvent('hotkey:previousTab'))
      },
    },

    // Next Tab
    {
      key: ']',
      meta: true,
      description: '下一个标签',
      handler: () => {
        window.dispatchEvent(new CustomEvent('hotkey:nextTab'))
      },
    },
  ])

  // 这是一个逻辑组件，不渲染任何内容
  return null
}
