/**
 * 时间旅行调试器 - 演示组件
 *
 * 展示如何集成和使用时间旅行调试功能
 */

import { useState } from 'react'
import { create } from 'zustand'
import { createStoreWithHistory } from '../../services/stateHistoryMiddleware'
import { TimeTravelDebugger } from './TimeTravelDebugger'

// 示例 Store
interface CounterState {
  count: number
  history: string[]
  increment: () => void
  decrement: () => void
  reset: () => void
  addToHistory: (message: string) => void
}

const { storeCreator, history } = createStoreWithHistory<CounterState>(
  (set, get) => ({
    count: 0,
    history: [],
    increment: () =>
      set(state => {
        const newCount = state.count + 1
        return {
          count: newCount,
          history: [...state.history, `Incremented to ${newCount}`],
        }
      }),
    decrement: () =>
      set(state => {
        const newCount = state.count - 1
        return {
          count: newCount,
          history: [...state.history, `Decremented to ${newCount}`],
        }
      }),
    reset: () =>
      set({
        count: 0,
        history: ['Reset counter'],
      }),
    addToHistory: (message: string) =>
      set(state => ({
        history: [...state.history, message],
      })),
  }),
  {
    maxSnapshots: 100,
    enableDevTools: true, // 启用 Redux DevTools
  }
)

const useCounterStore = create(storeCreator)

export function TimeTravelDebuggerDemo() {
  const { count, history: counterHistory, increment, decrement, reset, addToHistory } = useCounterStore()
  const [message, setMessage] = useState('')

  // 状态恢复处理
  const handleStateRestore = (state: CounterState) => {
    // 恢复状态时，直接更新 store
    useCounterStore.setState(state)
  }

  // 自定义状态渲染
  const renderState = (state: CounterState) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">count:</span>
          <span className="text-white font-mono">{state.count}</span>
        </div>
        <div className="space-y-1">
          <span className="text-gray-400">history:</span>
          <div className="pl-4 space-y-0.5">
            {state.history.map((item, index) => (
              <div key={index} className="text-xs text-gray-300 font-mono">
                {index + 1}. {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* 标题 */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">时间旅行调试器演示</h1>
          <p className="text-gray-400">
            使用下方的按钮改变状态，然后使用右下角的调试器进行时间旅行
          </p>
        </div>

        {/* 计数器演示 */}
        <div className="bg-gray-900 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">计数器</h2>

          {/* 当前值显示 */}
          <div className="bg-gray-800 rounded p-4 text-center">
            <div className="text-6xl font-bold text-purple-400">{count}</div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <button
              onClick={decrement}
              className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              -1
            </button>
            <button
              onClick={increment}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              +1
            </button>
            <button
              onClick={reset}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              重置
            </button>
          </div>

          {/* 添加历史消息 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyPress={e => {
                if (e.key === 'Enter' && message.trim()) {
                  addToHistory(message)
                  setMessage('')
                }
              }}
              placeholder="输入消息并按回车..."
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
            <button
              onClick={() => {
                if (message.trim()) {
                  addToHistory(message)
                  setMessage('')
                }
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              添加
            </button>
          </div>
        </div>

        {/* 历史记录 */}
        <div className="bg-gray-900 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">操作历史</h2>
          <div className="bg-gray-800 rounded p-4 max-h-64 overflow-y-auto">
            {counterHistory.length === 0 ? (
              <p className="text-gray-500 text-center">暂无历史记录</p>
            ) : (
              <div className="space-y-1">
                {counterHistory.map((item, index) => (
                  <div key={index} className="text-sm text-gray-300 font-mono">
                    <span className="text-gray-500">{index + 1}.</span> {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-gray-900 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">使用说明</h2>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">1.</span>
              <span>使用上方的按钮改变计数器状态</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">2.</span>
              <span>点击右下角的"时间旅行调试"按钮打开调试面板</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">3.</span>
              <span>拖动时间轴滑块可以回到任意时间点的状态</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">4.</span>
              <span>点击"暂停"可以停止记录新的状态变化</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">5.</span>
              <span>启用"对比模式"可以比较两个不同时间点的状态差异</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">6.</span>
              <span>使用"导出/导入"功能可以保存和加载调试会话</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">7.</span>
              <span>点击"恢复状态"可以将当前查看的历史状态应用到应用中</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 时间旅行调试器 */}
      <TimeTravelDebugger
        stateHistory={history}
        renderState={renderState}
        onStateRestore={handleStateRestore}
      />
    </div>
  )
}
