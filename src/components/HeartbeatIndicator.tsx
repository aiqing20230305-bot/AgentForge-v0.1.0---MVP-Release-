/**
 * Heartbeat Indicator Component
 * 心跳指示器 - 显示Agent生命力和心跳动画
 */

import React from 'react'
import { Heart, HeartCrack, HeartOff } from 'lucide-react'

interface HeartbeatIndicatorProps {
  vitality: number              // 0-100
  heartRate?: number            // 心跳频率
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  onClick?: () => void
}

export const HeartbeatIndicator: React.FC<HeartbeatIndicatorProps> = ({
  vitality,
  heartRate = 70,
  status,
  size = 'md',
  showLabel = false,
  onClick
}) => {
  // 尺寸配置
  const sizeConfig = {
    sm: { icon: 'w-4 h-4', text: 'text-xs', container: 'gap-1' },
    md: { icon: 'w-5 h-5', text: 'text-sm', container: 'gap-1.5' },
    lg: { icon: 'w-6 h-6', text: 'text-base', container: 'gap-2' }
  }

  const { icon: iconSize, text: textSize, container: containerGap } = sizeConfig[size]

  // 颜色和图标配置
  const statusConfig = {
    healthy: {
      color: '#10B981',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-400/50',
      Icon: Heart,
      label: '健康',
      pulseSpeed: 'animate-pulse-slow'
    },
    warning: {
      color: '#F59E0B',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-400/50',
      Icon: Heart,
      label: '警告',
      pulseSpeed: 'animate-pulse'
    },
    critical: {
      color: '#EF4444',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-400/50',
      Icon: HeartCrack,
      label: '危急',
      pulseSpeed: 'animate-pulse-fast'
    },
    offline: {
      color: '#6B7280',
      bgColor: 'bg-gray-500/20',
      borderColor: 'border-gray-400/50',
      Icon: HeartOff,
      label: '离线',
      pulseSpeed: ''
    }
  }

  const config = statusConfig[status]
  const StatusIcon = config.Icon

  return (
    <div
      className={`flex items-center ${containerGap} px-2 py-1 rounded-lg ${config.bgColor} border ${config.borderColor} transition-all hover:scale-105 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      title={`生命力: ${vitality}% | 心率: ${heartRate} BPM | 状态: ${config.label}`}
    >
      {/* 心跳图标 */}
      <div className="relative">
        <StatusIcon
          className={`${iconSize} ${config.pulseSpeed}`}
          style={{ color: config.color }}
        />

        {/* 脉冲光环（仅在活跃状态） */}
        {status !== 'offline' && (
          <div
            className={`absolute inset-0 rounded-full ${config.pulseSpeed}`}
            style={{
              boxShadow: `0 0 8px ${config.color}`,
              opacity: 0.5
            }}
          />
        )}
      </div>

      {/* 生命力百分比 */}
      <span className={`font-bold ${textSize}`} style={{ color: config.color }}>
        {vitality}%
      </span>

      {/* 标签（可选） */}
      {showLabel && (
        <span className={`${textSize} text-white/70`}>
          {config.label}
        </span>
      )}
    </div>
  )
}

// 添加自定义动画（需要在tailwind.config.js中配置）
// animation: {
//   'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
//   'pulse-fast': 'pulse 0.75s cubic-bezier(0.4, 0, 0.6, 1) infinite',
// }
