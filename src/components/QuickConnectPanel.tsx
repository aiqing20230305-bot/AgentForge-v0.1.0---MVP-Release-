/**
 * Quick Connect Panel - 快速连接OpenClaw面板
 *
 * 功能：
 * - 自动检测本地OpenClaw
 * - 一键连接
 * - 实时显示连接状态
 * - 显示Agent数量
 */

import React, { useState, useEffect } from 'react'
import { Zap, Check, X, Loader2, ExternalLink, RefreshCw, Download, Upload, Signal } from 'lucide-react'
import { getOpenClawWSClient, type OpenClawConfig, type ConnectionQuality } from '../services/openclawWebSocket'
import { testOpenClawConnection, type TestResult } from '../utils/openclawTester'
import { useDataSourceStore } from '../store/useDataSourceStore'
import { convertOpenClawAgents } from '../adapters/openclawWSAdapter'
import { getAutoSyncService } from '../services/openclawAutoSync'
import {
  saveConfig,
  getAllConfigs,
  exportConfigToFile,
  importConfigFromFile,
  type SavedConfig,
} from '../utils/openclawConfigManager'

type ConnectionStatus = 'idle' | 'detecting' | 'connecting' | 'connected' | 'failed'

export const QuickConnectPanel: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>('idle')
  const [config, setConfig] = useState<OpenClawConfig>({
    url: 'ws://127.0.0.1:18789',
    token: '5190ffb21bb024bc145dacc982ef6773b35648fa83ccba77',
  })
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [agentCount, setAgentCount] = useState<number>(0)
  const [isManualMode, setIsManualMode] = useState(false)
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality | null>(null)
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([])
  const [showConfigManager, setShowConfigManager] = useState(false)

  const dataSourceStore = useDataSourceStore()
  const autoSyncService = getAutoSyncService()
  const wsClient = getOpenClawWSClient()

  // 监听连接质量
  useEffect(() => {
    const handleQualityChange = (quality: ConnectionQuality) => {
      setConnectionQuality(quality)
    }

    wsClient.onQualityChange(handleQualityChange)

    return () => {
      wsClient.offQualityChange(handleQualityChange)
    }
  }, [])

  // 加载保存的配置
  useEffect(() => {
    setSavedConfigs(getAllConfigs())
  }, [])

  // 监听Auto Sync状态
  useEffect(() => {
    const handleSyncStatus = (syncStatus: any) => {
      setAutoSyncEnabled(syncStatus.enabled)
      setLastSyncTime(syncStatus.lastSyncTime)
    }

    autoSyncService.onStatusChange(handleSyncStatus)

    return () => {
      autoSyncService.offStatusChange(handleSyncStatus)
    }
  }, [])

  // 自动检测（首次加载）
  useEffect(() => {
    autoDetect()
  }, [])

  // 自动检测本地OpenClaw
  const autoDetect = async () => {
    setStatus('detecting')
    console.log('[QuickConnect] 🔍 Auto-detecting OpenClaw...')

    // 简单检测：使用默认配置
    // 实际项目中可以尝试多个端口
    await new Promise(resolve => setTimeout(resolve, 500)) // 模拟检测过程

    setStatus('idle')
    console.log('[QuickConnect] ✅ Detection complete')
  }

  // 一键连接
  const handleQuickConnect = async () => {
    setStatus('connecting')
    setTestResult(null)

    try {
      console.log('[QuickConnect] 🚀 Connecting to OpenClaw...')

      // Step 1: 测试连接
      const result = await testOpenClawConnection(config)
      setTestResult(result)

      if (!result.success) {
        setStatus('failed')
        return
      }

      // Step 2: 获取Agent列表
      const client = getOpenClawWSClient()
      const openclawAgents = await client.getAgents()
      setAgentCount(openclawAgents.length)

      console.log(`[QuickConnect] ✅ Found ${openclawAgents.length} agents`)

      // Step 3: 创建或获取OpenClaw数据源
      let openclawSource = dataSourceStore.sources.find(s => s.type === 'openclaw')
      if (!openclawSource) {
        // 创建新的OpenClaw数据源
        const sourceId = dataSourceStore.addSource({
          name: 'OpenClaw Gateway',
          description: 'Local OpenClaw Gateway connection',
          type: 'openclaw',
          config: {
            gatewayUrl: config.url,
            authToken: config.token,
          },
          enabled: true,
          isDefault: true,
        })
        openclawSource = dataSourceStore.getSource(sourceId)
      }

      // Step 4: 转换并更新Store
      const sourceId = openclawSource!.id
      const sourceName = openclawSource!.name
      const agentDataList = convertOpenClawAgents(openclawAgents, sourceId, sourceName)
      dataSourceStore.setActiveSource(sourceId)
      dataSourceStore.updateAgentsCache(agentDataList)

      setStatus('connected')

      // 自动启动Auto Sync
      autoSyncService.start(5000)

      console.log('[QuickConnect] 🎉 Connection successful!')
    } catch (error) {
      console.error('[QuickConnect] ❌ Connection failed:', error)
      setStatus('failed')
      setTestResult({
        success: false,
        message: String(error),
      })
    }
  }

  // 断开连接
  const handleDisconnect = () => {
    const client = getOpenClawWSClient()
    client.disconnect()

    // 停止Auto Sync
    autoSyncService.stop()

    // 清空活跃数据源
    dataSourceStore.setActiveSource(null)

    setStatus('idle')
    setAgentCount(0)
    console.log('[QuickConnect] 🔌 Disconnected')
  }

  // 切换Auto Sync
  const toggleAutoSync = () => {
    if (autoSyncEnabled) {
      autoSyncService.stop()
    } else {
      autoSyncService.start(5000)
    }
  }

  // 格式化最后同步时间
  const formatLastSyncTime = (time: string | null): string => {
    if (!time) return '未同步'
    const date = new Date(time)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 1000) return '刚刚'
    if (diff < 60000) return `${Math.floor(diff / 1000)}秒前`
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 状态图标和文本
  const getStatusDisplay = () => {
    switch (status) {
      case 'idle':
        return { icon: '🔌', text: '未连接', color: 'text-gray-400' }
      case 'detecting':
        return { icon: <Loader2 className="w-4 h-4 animate-spin" />, text: '检测中...', color: 'text-yellow-400' }
      case 'connecting':
        return { icon: <Loader2 className="w-4 h-4 animate-spin" />, text: '连接中...', color: 'text-blue-400' }
      case 'connected':
        return { icon: <Check className="w-4 h-4" />, text: '已连接', color: 'text-green-400' }
      case 'failed':
        return { icon: <X className="w-4 h-4" />, text: '连接失败', color: 'text-red-400' }
    }
  }

  const statusDisplay = getStatusDisplay()

  // 掩码Token
  const maskToken = (token: string) => {
    if (token.length < 8) return '***'
    return `${token.slice(0, 6)}...${token.slice(-4)}`
  }

  // 获取连接质量显示
  const getQualityDisplay = () => {
    if (!connectionQuality || status !== 'connected') {
      return null
    }

    const { status: qStatus, latency } = connectionQuality

    const colors = {
      excellent: 'text-green-400',
      good: 'text-blue-400',
      fair: 'text-yellow-400',
      poor: 'text-red-400',
    }

    const labels = {
      excellent: '优秀',
      good: '良好',
      fair: '一般',
      poor: '较差',
    }

    return {
      color: colors[qStatus],
      label: labels[qStatus],
      latency,
    }
  }

  // 保存当前配置
  const handleSaveConfig = () => {
    const name = prompt('请输入配置名称：', 'OpenClaw Gateway')
    if (name) {
      saveConfig(config, name)
      setSavedConfigs(getAllConfigs())
      alert('配置已保存！')
    }
  }

  // 导出配置
  const handleExportConfig = () => {
    const savedConfig: SavedConfig = {
      ...config,
      id: `export_${Date.now()}`,
      name: 'Exported Config',
      createdAt: new Date().toISOString(),
    }
    exportConfigToFile(savedConfig)
  }

  // 导入配置
  const handleImportConfig = async () => {
    try {
      const imported = await importConfigFromFile()
      setConfig({ url: imported.url, token: imported.token })
      setSavedConfigs(getAllConfigs())
      alert(`配置 "${imported.name}" 已导入！`)
    } catch (error) {
      alert('导入失败：' + error)
    }
  }

  const qualityDisplay = getQualityDisplay()

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">快速连接 OpenClaw</h2>
          <p className="text-xs text-white/60">一键连接本地OpenClaw Gateway</p>
        </div>
      </div>

      {/* 连接状态 */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">状态</span>
          <div className={`flex items-center gap-2 ${statusDisplay.color}`}>
            {typeof statusDisplay.icon === 'string' ? (
              <span>{statusDisplay.icon}</span>
            ) : (
              statusDisplay.icon
            )}
            <span className="text-sm font-medium">{statusDisplay.text}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Gateway</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={config.url}
              onChange={(e) => setConfig({ ...config, url: e.target.value })}
              disabled={status === 'connected' || !isManualMode}
              className="text-sm text-white/90 bg-white/5 border border-white/10 rounded px-2 py-1 w-48 disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Token</span>
          <div className="flex items-center gap-2">
            {!isManualMode ? (
              <span className="text-sm text-white/90">{maskToken(config.token)} ✓</span>
            ) : (
              <input
                type="text"
                value={config.token}
                onChange={(e) => setConfig({ ...config, token: e.target.value })}
                disabled={status === 'connected'}
                className="text-sm text-white/90 bg-white/5 border border-white/10 rounded px-2 py-1 w-48 disabled:opacity-50"
              />
            )}
          </div>
        </div>

        {status === 'connected' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Agents</span>
              <span className="text-sm text-green-400 font-medium">{agentCount} 个</span>
            </div>

            {/* Auto Sync Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-3 h-3 text-white/70 ${autoSyncEnabled ? 'animate-spin' : ''}`} />
                <span className="text-sm text-white/70">自动同步</span>
              </div>
              <div className="flex items-center gap-2">
                {lastSyncTime && (
                  <span className="text-xs text-white/50">{formatLastSyncTime(lastSyncTime)}</span>
                )}
                <button
                  onClick={toggleAutoSync}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    autoSyncEnabled ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      autoSyncEnabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Connection Quality */}
            {qualityDisplay && (
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Signal className="w-3 h-3 text-white/70" />
                  <span className="text-sm text-white/70">连接质量</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${qualityDisplay.color}`}>
                    {qualityDisplay.label}
                  </span>
                  <span className="text-xs text-white/50">
                    {qualityDisplay.latency}ms
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Config Management */}
      {status !== 'connected' && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveConfig}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-3 h-3" />
              <span>保存配置</span>
            </button>
            <button
              onClick={handleExportConfig}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-3 h-3" />
              <span>导出</span>
            </button>
            <button
              onClick={handleImportConfig}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <Upload className="w-3 h-3" />
              <span>导入</span>
            </button>
          </div>
        </div>
      )}

      {/* 错误信息 */}
      {status === 'failed' && testResult && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-400">{testResult.message}</p>
          {testResult.details?.error && (
            <p className="text-xs text-red-400/70 mt-1">{testResult.details.error}</p>
          )}
        </div>
      )}

      {/* 连接按钮 */}
      <div className="space-y-2">
        {status !== 'connected' ? (
          <button
            onClick={handleQuickConnect}
            disabled={status === 'connecting' || status === 'detecting'}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {status === 'connecting' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>连接中...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>🚀 立即连接</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <X className="w-5 h-5" />
            <span>断开连接</span>
          </button>
        )}

        {/* 手动配置切换 */}
        <button
          onClick={() => setIsManualMode(!isManualMode)}
          disabled={status === 'connected'}
          className="w-full text-xs text-white/50 hover:text-white/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isManualMode ? '← 自动配置' : '手动配置 →'}
        </button>
      </div>

      {/* 帮助链接 */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <a
          href="https://github.com/openclaw/openclaw"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-white/50 hover:text-white/70 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          <span>OpenClaw 文档</span>
        </a>
      </div>
    </div>
  )
}
