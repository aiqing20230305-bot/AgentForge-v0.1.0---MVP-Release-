import { useState, useRef, useEffect } from 'react'
import { X, Send, Loader2, MessageCircle } from 'lucide-react'
import { useDataSourceStore } from '../store/useDataSourceStore'
import { AdapterManager } from '../adapters/AdapterManager'

interface AgentChatProps {
  agentId: string
  agentName: string
  sourceId: string
  originalName?: string // 原始agent名称（用于API调用）
  onClose: () => void
}

interface Message {
  id: string
  role: 'user' | 'agent'
  content: string
  timestamp: Date
}

export default function AgentChat({
  agentId,
  agentName,
  sourceId,
  originalName,
  onClose
}: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'agent',
      content: `你好！我是 ${agentName}，有什么我可以帮助你的吗？`,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { sources } = useDataSourceStore()
  const adapterManager = AdapterManager.getInstance()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || sending) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setSending(true)

    try {
      const source = sources.find(s => s.id === sourceId)
      if (!source) {
        throw new Error('数据源不存在')
      }

      const adapter = adapterManager.getAdapter(source.type)
      if (!adapter) {
        throw new Error('未找到适配器')
      }

      // 发送消息给Agent
      const client = (adapter as any).createClient?.(source)
      if (client && client.sendMessage) {
        // 使用originalName（OpenClaw原始名称）或agentId
        const targetAgentId = originalName || agentId
        // console.log('发送消息到agent:', targetAgentId, '消息:', userMessage.content)

        const result = await client.sendMessage(targetAgentId, userMessage.content)
        // console.log('收到响应:', result)

        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'agent',
          content:
            result.success && result.response
              ? result.response
              : '抱歉，我暂时无法回复。请稍后再试。',
          timestamp: new Date()
        }

        setMessages(prev => [...prev, agentMessage])
      } else {
        console.error('无法创建API客户端或sendMessage方法不存在')
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: '抱歉，发送消息时出现错误。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full h-[80vh] overflow-hidden border border-slate-700 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">与 {agentName} 对话</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-slate-700/50 text-slate-100 border border-slate-600'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                <div
                  className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-purple-200' : 'text-slate-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-slate-700/50 rounded-2xl px-4 py-3 border border-slate-600">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-700 bg-slate-900/50 p-4 flex-shrink-0">
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息... (Shift+Enter 换行)"
              disabled={sending}
              className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 resize-none transition-colors disabled:opacity-50"
              rows={3}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium transition-all shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span>发送</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
