/**
 * OpenClaw Status Badge
 *
 * TopBar右上角的连接状态指示器
 * - 绿色：已连接
 * - 黄色：连接中
 * - 红色：未连接
 * - 点击展开快速配置面板
 */

import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, Loader2 } from 'lucide-react'
import { getOpenClawWSClient, type ConnectionStatus } from '../services/openclawWebSocket'
import { QuickConnectPanel } from './QuickConnectPanel'
import { useDataSourceStore } from '../store/useDataSourceStore'

export const OpenClawStatusBadge: React.FC = () => {
  const [wsStatus, setWsStatus] = useState<ConnectionStatus>('disconnected')
  const [showPanel, setShowPanel] = useState(false)
  const activeSourceId = useDataSourceStore(state => state.activeSourceId)
  const sources = useDataSourceStore(state => state.sources)

  // 监听WebSocket状态变化
  useEffect(() => {
    const client = getOpenClawWSClient()

    const handleStatusChange = (status: ConnectionStatus) => {
      setWsStatus(status)
    }

    client.onStatusChange(handleStatusChange)

    // 初始化状态
    setWsStatus(client.getStatus())

    return () => {
      client.offStatusChange(handleStatusChange)
    }
  }, [])

  // 根据状态获取显示内容
  const getStatusDisplay = () => {
    // 检查当前活跃数据源是否是OpenClaw类型
    const activeSource = activeSourceId ? sources.find(s => s.id === activeSourceId) : null
    const isOpenClawActive = activeSource?.type === 'openclaw'

    // 如果数据源不是OpenClaw，显示本地模式
    if (!isOpenClawActive) {
      return {
        icon: <WifiOff className="w-4 h-4" />,
        text: '本地',
        color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        dotColor: 'bg-gray-400',
      }
    }

    switch (wsStatus) {
      case 'connected':
        return {
          icon: <Wifi className="w-4 h-4" />,
          text: 'OpenClaw',
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          dotColor: 'bg-green-400',
        }
      case 'connecting':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: '连接中',
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          dotColor: 'bg-yellow-400 animate-pulse',
        }
      case 'error':
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: '错误',
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
          dotColor: 'bg-red-400',
        }
      case 'disconnected':
      default:
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: '未连接',
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
          dotColor: 'bg-gray-400',
        }
    }
  }

  const statusDisplay = getStatusDisplay()

  return (
    <div className="relative">
      {/* Status Badge */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-sm
          transition-all duration-200 hover:scale-105
          ${statusDisplay.color}
        `}
        title="点击配置OpenClaw连接"
      >
        {/* 状态点 */}
        <div className="relative">
          <div className={`w-2 h-2 rounded-full ${statusDisplay.dotColor}`} />
          {wsStatus === 'connected' && (
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping opacity-75" />
          )}
        </div>

        {/* 图标 */}
        {statusDisplay.icon}

        {/* 文本 */}
        <span className="text-xs font-medium">{statusDisplay.text}</span>
      </button>

      {/* Quick Connect Panel (弹出) */}
      {showPanel && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setShowPanel(false)}
          />

          {/* 弹出面板 */}
          <div className="absolute top-full right-0 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <QuickConnectPanel />
          </div>
        </>
      )}
    </div>
  )
}
