import React, { useState, useEffect, useRef } from 'react'
import {
  Sparkles,
  Send,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  BarChart3,
  Zap,
  Target,
  Brain,
  X
} from 'lucide-react'
import { useTaskStore } from '../stores/taskStore'
import { aiAssistant, type Suggestion, type PerformanceMetrics } from '../services/aiAssistant'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function AIAssistantPanel() {
  const tasks = useTaskStore(state => state.tasks)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '你好！我是AI助手，可以帮你优化任务管理、分析性能、提供智能建议。试试问我："帮我优化任务队列"',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'suggestions' | 'metrics'>('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load suggestions on mount and when tasks change
  useEffect(() => {
    loadSuggestions()
    loadMetrics()
  }, [tasks])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadSuggestions = async () => {
    try {
      const newSuggestions = await aiAssistant.generateSuggestions(tasks)
      setSuggestions(newSuggestions)
    } catch (error) {
      console.error('Failed to load suggestions:', error)
    }
  }

  const loadMetrics = () => {
    try {
      const newMetrics = aiAssistant.getPerformanceMetrics(tasks)
      setMetrics(newMetrics)
    } catch (error) {
      console.error('Failed to load metrics:', error)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const result = await aiAssistant.parseCommand(input.trim(), tasks)

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        type: 'assistant',
        content: result.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Reload suggestions if command was about optimization
      if (result.intent === 'optimize_tasks' || result.intent === 'get_suggestions') {
        await loadSuggestions()
      }

      if (result.intent === 'analyze_performance') {
        loadMetrics()
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        type: 'assistant',
        content: '抱歉，处理您的请求时出现错误。请稍后再试。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'task_priority':
        return Target
      case 'skill_upgrade':
        return TrendingUp
      case 'resource_allocation':
        return BarChart3
      case 'performance_diagnosis':
        return AlertCircle
      case 'workflow_optimization':
        return Zap
      default:
        return Lightbulb
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-400'
      case 'medium':
        return 'text-yellow-400'
      case 'low':
        return 'text-green-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/30 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-500/30">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI 助手</h2>
            <p className="text-xs text-gray-400">智能建议与自动优化</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-purple-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-purple-500/20'
            }`}
          >
            对话
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'suggestions'
                ? 'bg-purple-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-purple-500/20'
            }`}
          >
            建议 {suggestions.length > 0 && `(${suggestions.length})`}
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'metrics'
                ? 'bg-purple-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-purple-500/20'
            }`}
          >
            指标
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'chat' && (
          <div className="space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-100 border border-purple-500/30'
                  }`}
                >
                  {message.type === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-medium text-purple-400">AI 助手</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  <div className="mt-2 text-xs opacity-60">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-lg p-3 border border-purple-500/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="space-y-3">
            {suggestions.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-400">一切正常！暂无优化建议</p>
              </div>
            ) : (
              suggestions.map(suggestion => {
                const Icon = getSuggestionIcon(suggestion.type)
                return (
                  <div
                    key={suggestion.id}
                    className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-purple-500/20 ${getImpactColor(suggestion.impact)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-white">{suggestion.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${getImpactColor(suggestion.impact)}`}>
                              {suggestion.impact === 'high' && '高影响'}
                              {suggestion.impact === 'medium' && '中影响'}
                              {suggestion.impact === 'low' && '低影响'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {suggestion.confidence}% 置信度
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{suggestion.description}</p>
                        {suggestion.actions && suggestion.actions.length > 0 && (
                          <div className="flex gap-2">
                            {suggestion.actions.map((action, idx) => (
                              <button
                                key={idx}
                                onClick={action.action}
                                className={`px-3 py-1 text-xs rounded-lg transition-all ${
                                  action.destructive
                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                    : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                                }`}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'metrics' && metrics && (
          <div className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-lg p-4 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-400">任务吞吐量</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {metrics.taskThroughput.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 mt-1">任务/天</p>
              </div>

              <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-lg p-4 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-gray-400">平均完成时间</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {metrics.averageCompletionTime.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 mt-1">小时</p>
              </div>

              <div className={`rounded-lg p-4 border ${
                metrics.failureRate > 20
                  ? 'bg-gradient-to-br from-red-600/20 to-red-800/20 border-red-500/30'
                  : 'bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border-yellow-500/30'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className={`w-4 h-4 ${
                    metrics.failureRate > 20 ? 'text-red-400' : 'text-yellow-400'
                  }`} />
                  <span className="text-xs text-gray-400">失败率</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {metrics.failureRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {metrics.failureRate > 20 ? '需要关注' : '正常范围'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-lg p-4 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-gray-400">瓶颈识别</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {metrics.bottlenecks.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">个瓶颈</p>
              </div>
            </div>

            {/* Bottlenecks */}
            {metrics.bottlenecks.length > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-red-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <h3 className="font-medium text-white">性能瓶颈</h3>
                </div>
                <ul className="space-y-2">
                  {metrics.bottlenecks.map((bottleneck, idx) => (
                    <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>{bottleneck}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Habits */}
            {aiAssistant.getUserHabits() && (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <h3 className="font-medium text-white">工作习惯</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">高优先级完成率</span>
                    <span className="text-white font-medium">
                      {((aiAssistant.getUserHabits()?.taskCompletionRate.high || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">常用标签</span>
                    <span className="text-white font-medium">
                      {aiAssistant.getUserHabits()?.frequentTags.slice(0, 3).map(t => t.tag).join(', ') || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input (only show in chat tab) */}
      {activeTab === 'chat' && (
        <div className="p-4 border-t border-purple-500/30">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="问我任何关于任务优化的问题..."
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none text-sm"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => setInput('帮我优化任务队列')}
              className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-all"
            >
              优化任务队列
            </button>
            <button
              onClick={() => setInput('分析性能指标')}
              className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-all"
            >
              分析性能
            </button>
            <button
              onClick={() => setInput('查看我的工作习惯')}
              className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-all"
            >
              工作习惯
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
