/**
 * 能耗图表组件
 * 使用 Recharts 展示能耗趋势和分布
 */

import React, { useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { useEnergyStore } from '../store/useEnergyStore'
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity } from 'lucide-react'

type ChartType = 'trend' | 'category' | 'distribution' | 'heatmap'

export const EnergyChart: React.FC = () => {
  const [chartType, setChartType] = useState<ChartType>('trend')
  const { records } = useEnergyStore()

  // 准备趋势数据（最近7天）
  const getTrendData = () => {
    const days = 7
    const data: { date: string; tokens: number }[] = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })

      const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime()
      const dayEnd = new Date(date.setHours(23, 59, 59, 999)).getTime()

      const dayTokens = records
        .filter(r => {
          const time = new Date(r.timestamp).getTime()
          return time >= dayStart && time <= dayEnd
        })
        .reduce((sum, r) => sum + r.tokensUsed, 0)

      data.push({ date: dateStr, tokens: dayTokens })
    }

    return data
  }

  // 准备分类数据（按模型）
  const getCategoryData = () => {
    const modelMap: Record<string, number> = {}

    records.forEach(r => {
      if (!modelMap[r.model]) {
        modelMap[r.model] = 0
      }
      modelMap[r.model] += r.tokensUsed
    })

    return Object.entries(modelMap).map(([model, tokens]) => ({
      model,
      tokens
    }))
  }

  // 准备分布数据（输入 vs 输出 Token）
  const getDistributionData = () => {
    // 简化假设：60% 输入，40% 输出
    const totalTokens = records.reduce((sum, r) => sum + r.tokensUsed, 0)
    return [
      { name: '输入 Token', value: Math.round(totalTokens * 0.6), fill: '#3B82F6' },
      { name: '输出 Token', value: Math.round(totalTokens * 0.4), fill: '#10B981' }
    ]
  }

  // 准备热力图数据（24小时）
  const getHeatmapData = () => {
    const hourlyData: { hour: string; tokens: number }[] = []

    for (let i = 0; i < 24; i++) {
      const hour = `${i.toString().padStart(2, '0')}:00`
      const hourTokens = records
        .filter(r => new Date(r.timestamp).getHours() === i)
        .reduce((sum, r) => sum + r.tokensUsed, 0)

      hourlyData.push({ hour, tokens: hourTokens })
    }

    return hourlyData
  }

  const trendData = getTrendData()
  const categoryData = getCategoryData()
  const distributionData = getDistributionData()
  const heatmapData = getHeatmapData()

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      {/* 头部 */}
      <div className="p-6 border-b border-white/20">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-blue-400" />
          能耗统计图表
        </h2>

        {/* 图表类型切换 */}
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('trend')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${chartType === 'trend'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }
            `}
          >
            <TrendingUp className="w-4 h-4" />
            趋势
          </button>
          <button
            onClick={() => setChartType('category')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${chartType === 'category'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }
            `}
          >
            <BarChart3 className="w-4 h-4" />
            分类
          </button>
          <button
            onClick={() => setChartType('distribution')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${chartType === 'distribution'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }
            `}
          >
            <PieIcon className="w-4 h-4" />
            分布
          </button>
          <button
            onClick={() => setChartType('heatmap')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${chartType === 'heatmap'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }
            `}
          >
            <Activity className="w-4 h-4" />
            热力
          </button>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="flex-1 p-6">
        {chartType === 'trend' && (
          <div className="h-full">
            <h3 className="text-white font-bold mb-4">📈 7天消耗趋势</h3>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="tokens"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="Token 消耗"
                  dot={{ fill: '#3B82F6', r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {chartType === 'category' && (
          <div className="h-full">
            <h3 className="text-white font-bold mb-4">📊 按模型分类</h3>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="model" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Legend />
                <Bar dataKey="tokens" fill="#10B981" name="Token 消耗" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {chartType === 'distribution' && (
          <div className="h-full flex flex-col items-center justify-center">
            <h3 className="text-white font-bold mb-4">🥧 Token 分布</h3>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={150}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {chartType === 'heatmap' && (
          <div className="h-full">
            <h3 className="text-white font-bold mb-4">🔥 24小时热力图</h3>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={heatmapData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Legend />
                <Bar dataKey="tokens" name="Token 消耗">
                  {heatmapData.map((entry, index) => {
                    // 根据消耗量设置颜色
                    const maxTokens = Math.max(...heatmapData.map(d => d.tokens))
                    const ratio = entry.tokens / maxTokens
                    let color = '#10B981' // 绿色（低）
                    if (ratio > 0.7) color = '#EF4444' // 红色（高）
                    else if (ratio > 0.4) color = '#F59E0B' // 橙色（中）

                    return <Cell key={`cell-${index}`} fill={color} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
