/**
 * 时间旅行调试 - 集成示例
 *
 * 展示如何将时间旅行调试集成到现有的 AgentForge 应用中
 */

import { useEffect } from 'react'
import { createStateHistory } from '../services/stateHistory'
import { TimeTravelDebugger } from '../components/debug'
import { useChatStore } from '../store/useChatStore'
import { useAgentImageStore } from '../store/useAgentImageStore'

// 创建状态历史实例（全局单例）
const chatHistory = createStateHistory({
  maxSnapshots: 500, // 聊天消息可能很多，限制为500条
  enableDevTools: process.env.NODE_ENV === 'development'
})

const imageHistory = createStateHistory({
  maxSnapshots: 100, // 图片偏好变化不频繁，100条足够
  enableDevTools: process.env.NODE_ENV === 'development'
})

/**
 * 为现有 Store 添加历史记录
 */
export function useStateHistoryIntegration() {
  // 订阅 ChatStore 变化
  useEffect(() => {
    const unsubscribe = useChatStore.subscribe((state) => {
      chatHistory.recordSnapshot(state, {
        type: 'CHAT_STORE_UPDATE',
        payload: { messageCount: state.messages.length }
      })
    })

    // 记录初始状态
    chatHistory.recordSnapshot(useChatStore.getState(), {
      type: '@@INIT/CHAT_STORE'
    })

    return unsubscribe
  }, [])

  // 订阅 AgentImageStore 变化
  useEffect(() => {
    const unsubscribe = useAgentImageStore.subscribe((state) => {
      imageHistory.recordSnapshot(state, {
        type: 'AGENT_IMAGE_STORE_UPDATE',
        payload: { preferences: state.preferences }
      })
    })

    // 记录初始状态
    imageHistory.recordSnapshot(useAgentImageStore.getState(), {
      type: '@@INIT/AGENT_IMAGE_STORE'
    })

    return unsubscribe
  }, [])
}

/**
 * 聊天历史调试器
 */
export function ChatHistoryDebugger() {
  useStateHistoryIntegration()

  return (
    <TimeTravelDebugger
      stateHistory={chatHistory}
      renderState={(state) => (
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-gray-400">消息总数:</span>
            <span className="text-white ml-2">{state.messages.length}</span>
          </div>
          <div>
            <span className="text-gray-400">未读消息:</span>
            <span className="text-white ml-2">
              {Object.values(state.unreadCount).reduce((a: number, b: number) => a + b, 0)}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-gray-400">最近消息:</span>
            <div className="pl-2 space-y-0.5 max-h-40 overflow-y-auto">
              {state.messages.slice(-5).map((msg: any) => (
                <div key={msg.id} className="text-gray-300">
                  <span className="text-purple-400">{msg.sender}:</span> {msg.content.slice(0, 50)}...
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      onStateRestore={(state) => {
        // 恢复聊天状态
        useChatStore.setState(state)
        console.log('Chat state restored:', state)
      }}
    />
  )
}

/**
 * Agent 图片偏好调试器
 */
export function ImagePreferenceDebugger() {
  useStateHistoryIntegration()

  return (
    <TimeTravelDebugger
      stateHistory={imageHistory}
      renderState={(state) => (
        <div className="space-y-2 text-xs">
          <div className="text-gray-400 font-semibold">Agent 图片偏好:</div>
          <div className="pl-2 space-y-1">
            {Object.entries(state.preferences).map(([agentId, pref]: [string, any]) => (
              <div key={agentId} className="text-gray-300">
                <span className="text-purple-400">{agentId}:</span>
                <span className="ml-2">{pref.gender} / {pref.style}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      onStateRestore={(state) => {
        // 恢复图片偏好状态
        useAgentImageStore.setState(state)
        console.log('Image preferences restored:', state)
      }}
    />
  )
}

/**
 * 使用示例：
 *
 * ```tsx
 * import { ChatHistoryDebugger } from './examples/TimeTravelExample'
 *
 * function App() {
 *   return (
 *     <>
 *       <YourApp />
 *       {process.env.NODE_ENV === 'development' && <ChatHistoryDebugger />}
 *     </>
 *   )
 * }
 * ```
 */
