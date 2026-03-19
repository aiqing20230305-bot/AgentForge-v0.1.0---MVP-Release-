/**
 * User Activity Heatmap - 用户活动热力图
 * v2.4.0 Phase 1.1
 */
import React from 'react'
import { motion } from 'framer-motion'

interface HeatmapCell {
  day: string
  hour: number
  value: number
}

export const UserActivityHeatmap: React.FC = () => {
  // TODO: 从API获取实际数据
  // 生成模拟数据：7天 x 24小时
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const generateHeatmapData = (): HeatmapCell[] => {
    const data: HeatmapCell[] = []
    days.forEach((day) => {
      hours.forEach((hour) => {
        // 模拟数据：工作时间活跃度高
        let value = Math.random() * 10
        if (hour >= 9 && hour <= 18 && !day.includes('周')) {
          value += Math.random() * 20 // 工作日工作时间活跃度高
        }
        data.push({ day, hour, value: Math.floor(value) })
      })
    })
    return data
  }

  const heatmapData = generateHeatmapData()

  // 获取颜色强度
  const getColor = (value: number) => {
    if (value < 5) return 'bg-cyan-500/10'
    if (value < 10) return 'bg-cyan-500/30'
    if (value < 15) return 'bg-cyan-500/50'
    if (value < 20) return 'bg-cyan-500/70'
    return 'bg-cyan-500/90'
  }

  return (
    <div className="w-full">
      {/* 时间轴 */}
      <div className="flex gap-1 mb-2">
        <div className="w-12"></div>
        {hours.filter(h => h % 3 === 0).map((hour) => (
          <div key={hour} className="flex-1 text-xs text-gray-500 text-center">
            {hour}:00
          </div>
        ))}
      </div>

      {/* 热力图 */}
      <div className="space-y-1">
        {days.map((day, dayIndex) => (
          <div key={day} className="flex gap-1">
            {/* 星期标签 */}
            <div className="w-12 text-xs text-gray-400 flex items-center">
              {day}
            </div>

            {/* 小时格子 */}
            <div className="flex-1 flex gap-1">
              {hours.map((hour) => {
                const cell = heatmapData.find(
                  (d) => d.day === day && d.hour === hour
                )
                return (
                  <motion.div
                    key={`${day}-${hour}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (dayIndex * 24 + hour) * 0.002 }}
                    className={`flex-1 h-6 rounded ${getColor(cell?.value || 0)} border border-white/5 hover:border-cyan-500/50 transition-colors cursor-pointer group relative`}
                    title={`${day} ${hour}:00 - 活跃度: ${cell?.value || 0}`}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {day} {hour}:00<br />
                        活跃度: {cell?.value || 0}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 图例 */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <span className="text-xs text-gray-400">低</span>
        {[10, 30, 50, 70, 90].map((opacity) => (
          <div
            key={opacity}
            className={`w-6 h-4 rounded bg-cyan-500/${opacity}`}
          />
        ))}
        <span className="text-xs text-gray-400">高</span>
      </div>
    </div>
  )
}

export default UserActivityHeatmap
