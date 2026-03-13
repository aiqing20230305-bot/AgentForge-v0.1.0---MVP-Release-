import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChatMessage {
  id: string
  taskId: string
  agentId: string
  sender: 'agent' | 'user'
  content: string
  timestamp: string
  read: boolean
  attachments?: string[]
}

interface ChatStore {
  // 消息列表
  messages: ChatMessage[]

  // 未读消息数
  unreadCount: Record<string, number> // taskId -> count

  // 添加消息
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp' | 'read'>) => void

  // 标记消息为已读
  markAsRead: (taskId: string) => void

  // 获取指定任务的消息
  getTaskMessages: (taskId: string) => ChatMessage[]

  // 获取指定任务的未读数
  getUnreadCount: (taskId: string) => number

  // 删除任务相关消息
  deleteTaskMessages: (taskId: string) => void

  // 清空所有消息
  clearAll: () => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: [],
      unreadCount: {},

      addMessage: message => {
        const newMessage: ChatMessage = {
          ...message,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          read: message.sender === 'user' // 用户发的消息默认已读
        }

        set(state => {
          const messages = [...state.messages, newMessage]
          const unreadCount = { ...state.unreadCount }

          // 如果是 Agent 发的消息，增加未读数
          if (newMessage.sender === 'agent' && !newMessage.read) {
            unreadCount[newMessage.taskId] = (unreadCount[newMessage.taskId] || 0) + 1
          }

          return { messages, unreadCount }
        })
      },

      markAsRead: taskId => {
        set(state => {
          const messages = state.messages.map(msg =>
            msg.taskId === taskId && !msg.read ? { ...msg, read: true } : msg
          )

          const unreadCount = { ...state.unreadCount }
          unreadCount[taskId] = 0

          return { messages, unreadCount }
        })
      },

      getTaskMessages: taskId => {
        return get().messages.filter(msg => msg.taskId === taskId)
      },

      getUnreadCount: taskId => {
        return get().unreadCount[taskId] || 0
      },

      deleteTaskMessages: taskId => {
        set(state => {
          const messages = state.messages.filter(msg => msg.taskId !== taskId)
          const unreadCount = { ...state.unreadCount }
          delete unreadCount[taskId]

          return { messages, unreadCount }
        })
      },

      clearAll: () => {
        set({ messages: [], unreadCount: {} })
      }
    }),
    {
      name: 'agent-chat-store'
    }
  )
)
