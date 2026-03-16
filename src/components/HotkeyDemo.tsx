/**
 * HotkeyDemo Component
 * 展示快捷键系统的所有功能
 */

import { useState } from 'react'
import {
  useHotkey,
  useHotkeys,
  useGetAllHotkeys,
  useCheckHotkeyConflict,
  formatHotkey,
  getPlatformModifierKey,
} from '../hooks/useHotkeys'
import { HotkeyIndicator } from './HotkeyHelp'

export function HotkeyDemo() {
  const [logs, setLogs] = useState<string[]>([])
  const [isEnabled, setIsEnabled] = useState(true)
  const [counter, setCounter] = useState(0)
  const getAllHotkeys = useGetAllHotkeys()
  const checkConflict = useCheckHotkeyConflict()

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 10))
  }

  // 示例1: 基础快捷键
  useHotkey(
    {
      key: 'a',
      meta: true,
      description: '测试快捷键 A',
    },
    () => {
      addLog('按下了 Cmd/Ctrl + A')
    }
  )

  // 示例2: 带Shift的快捷键
  useHotkey(
    {
      key: 's',
      meta: true,
      shift: true,
      description: '保存所有',
    },
    () => {
      addLog('按下了 Cmd/Ctrl + Shift + S')
    }
  )

  // 示例3: 可禁用的快捷键
  useHotkey(
    {
      key: 'e',
      meta: true,
      enabled: isEnabled,
      description: '可切换的快捷键',
    },
    () => {
      addLog('按下了可切换的快捷键 E')
    }
  )

  // 示例4: 全局快捷键（在输入框中也生效）
  useHotkey(
    {
      key: 'g',
      meta: true,
      global: true,
      description: '全局快捷键',
    },
    () => {
      addLog('按下了全局快捷键 G（在输入框中也生效）')
    }
  )

  // 示例5: ESC键
  useHotkey(
    {
      key: 'Escape',
      global: true,
      description: '按ESC清除日志',
    },
    () => {
      setLogs([])
      addLog('日志已清除')
    }
  )

  // 示例6: 批量注册快捷键
  useHotkeys([
    {
      key: '1',
      meta: true,
      handler: () => addLog('快捷键 1'),
    },
    {
      key: '2',
      meta: true,
      handler: () => addLog('快捷键 2'),
    },
    {
      key: '3',
      meta: true,
      handler: () => addLog('快捷键 3'),
    },
  ])

  // 示例7: 带计数器的快捷键
  useHotkey(
    {
      key: 'ArrowUp',
      description: '增加计数器',
    },
    () => {
      setCounter((c) => c + 1)
      addLog(`计数器增加: ${counter + 1}`)
    }
  )

  useHotkey(
    {
      key: 'ArrowDown',
      description: '减少计数器',
    },
    () => {
      setCounter((c) => c - 1)
      addLog(`计数器减少: ${counter - 1}`)
    }
  )

  // 获取所有注册的快捷键
  const allHotkeys = getAllHotkeys()

  // 检查冲突
  const hasConflict = checkConflict({ key: 'a', meta: true })

  return (
    <div className="p-8 space-y-8 bg-gray-900 text-white min-h-screen">
      {/* 标题 */}
      <div>
        <h1 className="text-3xl font-bold mb-2">快捷键系统演示</h1>
        <p className="text-gray-400">
          展示 useHotkeys Hook 的所有功能和用法
        </p>
      </div>

      {/* 平台信息 */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">平台信息</h2>
        <p className="text-gray-300">
          当前平台修饰键: <span className="text-cyan-400">{getPlatformModifierKey()}</span>
        </p>
        <p className="text-gray-300">
          用户代理: <span className="text-cyan-400 text-sm">{navigator.userAgent}</span>
        </p>
      </div>

      {/* 控制面板 */}
      <div className="bg-gray-800 p-4 rounded-lg space-y-4">
        <h2 className="text-lg font-semibold mb-2">控制面板</h2>

        {/* 启用/禁用开关 */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <span>启用 Cmd/Ctrl+E 快捷键</span>
          </label>
          <span className="text-sm text-gray-500">
            ({isEnabled ? '已启用' : '已禁用'})
          </span>
        </div>

        {/* 计数器 */}
        <div className="flex items-center gap-4">
          <span>计数器:</span>
          <span className="text-2xl font-bold text-cyan-400">{counter}</span>
          <div className="flex gap-2">
            <HotkeyIndicator keys="↑" />
            <span className="text-gray-500">增加</span>
            <HotkeyIndicator keys="↓" />
            <span className="text-gray-500">减少</span>
          </div>
        </div>

        {/* 清除日志按钮 */}
        <button
          onClick={() => setLogs([])}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
        >
          清除日志
        </button>
      </div>

      {/* 测试区域 */}
      <div className="bg-gray-800 p-4 rounded-lg space-y-4">
        <h2 className="text-lg font-semibold mb-2">测试区域</h2>

        {/* 普通输入框 */}
        <div>
          <label className="block mb-2 text-sm text-gray-400">
            普通输入框（非全局快捷键在此不生效）
          </label>
          <input
            type="text"
            placeholder="尝试在这里按快捷键..."
            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        {/* 全局快捷键提示 */}
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <p className="text-sm text-cyan-400">
            💡 提示: 按 <HotkeyIndicator keys="⌘G" className="mx-1" /> (或 Ctrl+G) 来测试全局快捷键
          </p>
        </div>
      </div>

      {/* 注册的快捷键列表 */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">
          已注册的快捷键 ({allHotkeys.length})
        </h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {allHotkeys.map((hotkey, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-700 rounded"
            >
              <span className="text-sm">{hotkey.config.description || '无描述'}</span>
              <HotkeyIndicator keys={formatHotkey(hotkey.config)} />
            </div>
          ))}
        </div>
      </div>

      {/* 冲突检测 */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">冲突检测</h2>
        <p className="text-sm">
          Cmd/Ctrl+A 是否有冲突:{' '}
          <span className={hasConflict ? 'text-red-400' : 'text-green-400'}>
            {hasConflict ? '是' : '否'}
          </span>
        </p>
      </div>

      {/* 事件日志 */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">事件日志</h2>
        <div className="space-y-1 max-h-60 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <p className="text-gray-500">按下快捷键查看日志...</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="text-gray-300">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 快捷键参考 */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">快捷键参考</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">测试 A</span>
              <HotkeyIndicator keys="⌘A" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">保存所有</span>
              <HotkeyIndicator keys="⌘⇧S" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">可切换</span>
              <HotkeyIndicator keys="⌘E" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">全局</span>
              <HotkeyIndicator keys="⌘G" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">快捷键 1-3</span>
              <HotkeyIndicator keys="⌘1-3" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">增加/减少</span>
              <div className="flex gap-1">
                <HotkeyIndicator keys="↑" />
                <HotkeyIndicator keys="↓" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">清除日志</span>
              <HotkeyIndicator keys="Esc" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">快捷键帮助</span>
              <HotkeyIndicator keys="⌘/" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
