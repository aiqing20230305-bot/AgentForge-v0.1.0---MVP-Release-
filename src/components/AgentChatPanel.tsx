import { useState, useRef, useEffect } from 'react'
import { X, Send, Bot, User, Paperclip, Trash2 } from 'lucide-react'
import { useChatStore } from '../store/useChatStore'
import type { Task } from '../types/task'

interface AgentChatPanelProps {
  task: Task
  onClose: () => void
}

export default function AgentChatPanel({ task, onClose }: AgentChatPanelProps) {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { addMessage, getTaskMessages, markAsRead, deleteTaskMessages } = useChatStore()
  const messages = getTaskMessages(task.id)

  // 标记为已读
  useEffect(() => {
    markAsRead(task.id)
  }, [task.id, markAsRead])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 聚焦输入框
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = () => {
    if (!message.trim()) return

    // 添加用户消息
    addMessage({
      taskId: task.id,
      agentId: task.agentId,
      sender: 'user',
      content: message.trim()
    })

    setMessage('')

    // 模拟 Agent 回复
    setIsTyping(true)
    setTimeout(
      () => {
        const responses = [
          '好的，我已收到你的消息，正在处理...',
          '明白了，让我确认一下这个问题。',
          '我会尽快完成这个任务。',
          '需要我提供更多信息吗？',
          '这个问题我需要进一步研究。'
        ]
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]

        addMessage({
          taskId: task.id,
          agentId: task.agentId,
          sender: 'agent',
          content: randomResponse
        })

        setIsTyping(false)
      },
      1000 + Math.random() * 2000
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClearHistory = () => {
    if (confirm('确定要清空聊天记录吗？')) {
      deleteTaskMessages(task.id)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full h-[600px] flex flex-col border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700 bg-slate-900/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{task.agentId.toUpperCase()} 对话</h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">{task.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-red-400"
              title="清空历史"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Bot className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">还没有消息</p>
              <p className="text-xs mt-1">开始与 Agent 对话吧</p>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fadeInUp`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.sender === 'agent'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {msg.sender === 'agent' ? (
                    <Bot className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[70%] ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  } flex flex-col gap-1`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${
                      msg.sender === 'agent'
                        ? 'bg-slate-800 border border-slate-700 text-white'
                        : 'bg-gradient-to-r from-amber-600 to-amber-500 text-white'
                    } shadow-lg`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(msg.timestamp).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 animate-fadeInUp">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-2xl">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/50 flex-shrink-0">
          <div className="flex gap-3">
            <button
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white flex-shrink-0"
              title="附件"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea
              ref={inputRef}
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
              className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none scrollbar-thin"
              rows={2}
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || isTyping}
              className="p-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed rounded-lg transition-all flex-shrink-0"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
