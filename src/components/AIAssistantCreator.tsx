/**
 * AI Assistant Creator Component
 * AI对话式Agent创建界面 - 通过自然对话创建Agent
 */

import React, { useState, useEffect, useRef } from 'react'
import {
  Bot,
  Send,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Zap,
  Star,
  TrendingUp,
  X,
  ChevronRight,
  Copy,
  Download
} from 'lucide-react'
import {
  agentCreator,
  type AgentCreationContext,
  type ConversationMessage,
  type AgentTemplate
} from '../services/ai/agentCreator'
import { templateRecommender } from '../services/ai/templateRecommender'

interface AIAssistantCreatorProps {
  onComplete: (config: any) => void
  onCancel: () => void
  initialPrompt?: string
}

export function AIAssistantCreator({
  onComplete,
  onCancel,
  initialPrompt
}: AIAssistantCreatorProps) {
  const [context, setContext] = useState<AgentCreationContext>(
    agentCreator.startConversation()
  )
  const [input, setInput] = useState(initialPrompt || '')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'templates' | 'preview'>(
    'chat'
  )
  const [templates, setTemplates] = useState<AgentTemplate[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 加载模板
  useEffect(() => {
    const loadedTemplates = agentCreator.getTemplates()
    setTemplates(loadedTemplates)

    // 如果有初始提示，自动发送
    if (initialPrompt) {
      handleSend()
    }
  }, [])

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [context.conversation])

  /**
   * 发送消息
   */
  const handleSend = async () => {
    if (!input.trim() || loading) return

    setLoading(true)
    try {
      const newContext = await agentCreator.processUserInput(context, input)
      setContext(newContext)
      setInput('')
    } catch (error) {
      console.error('Failed to process input:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 应用模板
   */
  const handleApplyTemplate = (templateId: string) => {
    try {
      const info = agentCreator.applyTemplate(templateId)
      setContext({
        ...context,
        extractedInfo: info,
        completeness: 90
      })
      setActiveTab('preview')
    } catch (error) {
      console.error('Failed to apply template:', error)
    }
  }

  /**
   * 应用建议
   */
  const handleApplySuggestion = (field: string, value: any) => {
    setContext({
      ...context,
      extractedInfo: {
        ...context.extractedInfo,
        [field]: value
      }
    })
  }

  /**
   * 完成创建
   */
  const handleComplete = () => {
    const config = agentCreator.generateAgentConfig(context.extractedInfo)
    onComplete(config)
  }

  /**
   * 快速提问
   */
  const quickQuestions = [
    '我需要一个代码审查助手',
    '帮我做产品分析',
    '写技术文档的专家',
    'DevOps自动化工程师'
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-purple-500/30 w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI智能创建</h2>
              <p className="text-sm text-gray-400">告诉我你的需求，我来帮你打造完美的Agent</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        {context.completeness > 0 && (
          <div className="px-6 py-3 bg-gray-800/50">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">完成度</span>
              <span className="text-purple-400 font-medium">
                {context.completeness}%
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                style={{ width: `${context.completeness}%` }}
              />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 border-b border-gray-700">
          <TabButton
            active={activeTab === 'chat'}
            onClick={() => setActiveTab('chat')}
            icon={<Sparkles className="w-4 h-4" />}
            label="AI对话"
            badge={context.conversation.length}
          />
          <TabButton
            active={activeTab === 'templates'}
            onClick={() => setActiveTab('templates')}
            icon={<Star className="w-4 h-4" />}
            label="模板库"
            badge={templates.length}
          />
          <TabButton
            active={activeTab === 'preview'}
            onClick={() => setActiveTab('preview')}
            icon={<CheckCircle className="w-4 h-4" />}
            label="预览配置"
            disabled={context.completeness < 60}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' && (
            <ChatTab
              context={context}
              input={input}
              loading={loading}
              onInputChange={setInput}
              onSend={handleSend}
              onApplySuggestion={handleApplySuggestion}
              quickQuestions={quickQuestions}
              messagesEndRef={messagesEndRef}
            />
          )}

          {activeTab === 'templates' && (
            <TemplatesTab
              templates={templates}
              onApply={handleApplyTemplate}
            />
          )}

          {activeTab === 'preview' && (
            <PreviewTab
              context={context}
              onComplete={handleComplete}
              onEdit={() => setActiveTab('chat')}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// === Tab Components ===

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
  disabled
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  badge?: number
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all
        ${
          active
            ? 'bg-gray-800 text-white border-b-2 border-purple-500'
            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {icon}
      <span className="font-medium">{label}</span>
      {badge !== undefined && (
        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs">
          {badge}
        </span>
      )}
    </button>
  )
}

function ChatTab({
  context,
  input,
  loading,
  onInputChange,
  onSend,
  onApplySuggestion,
  quickQuestions,
  messagesEndRef
}: any) {
  return (
    <div className="flex h-full">
      {/* 对话区 */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {context.conversation.map((message: ConversationMessage) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {loading && <LoadingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区 */}
        <div className="p-6 border-t border-gray-700">
          {/* 快捷问题 */}
          {context.conversation.length <= 1 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {quickQuestions.map((q: string, i: number) => (
                <button
                  key={i}
                  onClick={() => {
                    onInputChange(q)
                    setTimeout(() => onSend(), 100)
                  }}
                  className="text-xs px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => onInputChange(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && onSend()}
              placeholder="描述你想要的Agent..."
              className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
              disabled={loading}
            />
            <button
              onClick={onSend}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 建议侧边栏 */}
      {context.suggestions.length > 0 && (
        <div className="w-80 border-l border-gray-700 p-4 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            智能建议
          </h3>
          <div className="space-y-2">
            {context.suggestions.map((suggestion: any) => (
              <SuggestionCard
                key={suggestion.field}
                suggestion={suggestion}
                onApply={() =>
                  onApplySuggestion(suggestion.field, suggestion.value)
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TemplatesTab({
  templates,
  onApply
}: {
  templates: AgentTemplate[]
  onApply: (id: string) => void
}) {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">热门模板</h3>
        <p className="text-sm text-gray-400">
          从社区精选模板快速开始，已有 {templates.reduce((sum, t) => sum + t.usageCount, 0).toLocaleString()} 次使用
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(template => (
          <TemplateCard key={template.id} template={template} onApply={onApply} />
        ))}
      </div>
    </div>
  )
}

function PreviewTab({ context, onComplete, onEdit }: any) {
  const info = context.extractedInfo
  const config = agentCreator.generateAgentConfig(info)

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 配置摘要 */}
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-500/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-400" />
            Agent配置就绪
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="名称" value={info.name || '未命名'} />
            <InfoItem label="角色" value={info.role || '通用助手'} />
            <InfoItem
              label="技能"
              value={(info.skills || []).length + ' 项'}
            />
            <InfoItem
              label="个性"
              value={(info.personality || []).join('、') || '默认'}
            />
          </div>
        </div>

        {/* 系统提示词预览 */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-white">系统提示词</h4>
            <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-all">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <pre className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-900 p-4 rounded border border-gray-700 max-h-64 overflow-y-auto">
            {config.systemPrompt}
          </pre>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
          >
            继续编辑
          </button>
          <button
            onClick={onComplete}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium"
          >
            创建Agent
          </button>
        </div>
      </div>
    </div>
  )
}

// === Helper Components ===

function MessageBubble({ message }: { message: ConversationMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-gray-100 border border-purple-500/30'
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-purple-400">AI助手</span>
          </div>
        )}
        <p className="text-sm whitespace-pre-line leading-relaxed">
          {message.content}
        </p>
        <div className="mt-2 text-xs opacity-60">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}

function LoadingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-800 rounded-lg p-4 border border-purple-500/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
        </div>
      </div>
    </div>
  )
}

function SuggestionCard({ suggestion, onApply }: any) {
  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-purple-500/50 transition-all">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-purple-400">
          {suggestion.field}
        </span>
        <span className="text-xs text-gray-500">{suggestion.confidence}%</span>
      </div>
      <p className="text-xs text-gray-300 mb-2">{suggestion.reason}</p>
      <button
        onClick={onApply}
        className="w-full text-xs px-2 py-1.5 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-all"
      >
        应用建议
      </button>
    </div>
  )
}

function TemplateCard({
  template,
  onApply
}: {
  template: AgentTemplate
  onApply: (id: string) => void
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500/50 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-white">{template.name}</h4>
        <div className="flex items-center gap-1 text-xs text-yellow-400">
          <Star className="w-3 h-3 fill-current" />
          <span>{template.rating}</span>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-3">{template.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {template.usageCount.toLocaleString()}
          </span>
        </div>
        <button
          onClick={() => onApply(template.id)}
          className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-all text-xs font-medium flex items-center gap-1 group-hover:bg-purple-600 group-hover:text-white"
        >
          使用模板
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="text-sm text-white font-medium">{value}</div>
    </div>
  )
}

export default AIAssistantCreator
