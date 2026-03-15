/**
 * Vitality Gauge Component
 * 生命力仪表盘 - 圆形仪表盘显示Agent生命力
 */

import React from 'react'

interface VitalityGaugeProps {
  vitality: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
}

/**
 * 获取生命力颜色
 */
function getVitalityColor(vitality: number): string {
  if (vitality >= 70) return '#10b981' // green
  if (vitality >= 40) return '#f59e0b' // amber
  return '#ef4444' // red
}

/**
 * 获取生命力状态文字
 */
function getVitalityStatus(vitality: number): string {
  if (vitality >= 90) return '优秀'
  if (vitality >= 70) return '良好'
  if (vitality >= 50) return '一般'
  if (vitality >= 40) return '警告'
  return '危急'
}

export const VitalityGauge: React.FC<VitalityGaugeProps> = ({
  vitality,
  size = 'md',
  showLabel = true,
  animated = true
}) => {
  const sizeConfig = {
    sm: { radius: 40, strokeWidth: 6, fontSize: '1.25rem' },
    md: { radius: 60, strokeWidth: 8, fontSize: '1.75rem' },
    lg: { radius: 80, strokeWidth: 10, fontSize: '2.5rem' }
  }

  const config = sizeConfig[size]
  const circumference = 2 * Math.PI * config.radius
  const offset = circumference - (vitality / 100) * circumference

  const color = getVitalityColor(vitality)
  const status = getVitalityStatus(vitality)

  return (
    <div className="flex flex-col items-center gap-2">
      {/* SVG 仪表盘 */}
      <div className="relative">
        <svg
          width={config.radius * 2 + config.strokeWidth * 2}
          height={config.radius * 2 + config.strokeWidth * 2}
          className={animated ? 'transform transition-transform duration-500' : ''}
        >
          {/* 背景圆环 */}
          <circle
            cx={config.radius + config.strokeWidth}
            cy={config.radius + config.strokeWidth}
            r={config.radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={config.strokeWidth}
          />

          {/* 刻度线 */}
          {[...Array(20)].map((_, i) => {
            const angle = (i * 18 - 90) * (Math.PI / 180)
            const x1 = config.radius + config.strokeWidth + (config.radius - 10) * Math.cos(angle)
            const y1 = config.radius + config.strokeWidth + (config.radius - 10) * Math.sin(angle)
            const x2 = config.radius + config.strokeWidth + config.radius * Math.cos(angle)
            const y2 = config.radius + config.strokeWidth + config.radius * Math.sin(angle)

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth={i % 5 === 0 ? 2 : 1}
              />
            )
          })}

          {/* 进度圆环 */}
          <circle
            cx={config.radius + config.strokeWidth}
            cy={config.radius + config.strokeWidth}
            r={config.radius}
            fill="none"
            stroke={color}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${config.radius + config.strokeWidth} ${
              config.radius + config.strokeWidth
            })`}
            className={animated ? 'transition-all duration-1000 ease-out' : ''}
            style={{
              filter: `drop-shadow(0 0 8px ${color})`
            }}
          />

          {/* 中心文字 */}
          <text
            x={config.radius + config.strokeWidth}
            y={config.radius + config.strokeWidth}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize={config.fontSize}
            fontWeight="bold"
            className="font-mono"
          >
            {Math.round(vitality)}
          </text>

          {/* 单位 */}
          <text
            x={config.radius + config.strokeWidth}
            y={config.radius + config.strokeWidth + 20}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255, 255, 255, 0.6)"
            fontSize="0.75rem"
          >
            生命力
          </text>
        </svg>

        {/* 脉冲动画 */}
        {animated && vitality > 40 && (
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{
              backgroundColor: color
            }}
          />
        )}
      </div>

      {/* 状态标签 */}
      {showLabel && (
        <div className="flex flex-col items-center gap-1">
          <span
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${color}20`,
              color: color,
              border: `1px solid ${color}40`
            }}
          >
            {status}
          </span>

          {/* 百分比进度条 */}
          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${vitality}%`,
                backgroundColor: color
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
