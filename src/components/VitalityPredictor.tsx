/**
 * Vitality Predictor Component
 * 状态预测系统 - 基于历史数据预测未来生命力
 */

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import type { HeartbeatData } from '../types/evolution'
import { getHeartbeatService } from '../services/evolution/heartbeatService'

interface VitalityPredictorProps {
  agentId: string
}

/**
 * 预测生命力值（线性回归）
 */
function predictVitality(historicalData: HeartbeatData[], hoursAhead: number): number {
  // 取最近20个数据点
  const recentData = historicalData.slice(-20)

  if (recentData.length < 2) return 0

  // 计算线性回归
  const xValues = recentData.map((_, i) => i)
  const yValues = recentData.map(d => d.vitality)

  const n = xValues.length
  const sumX = xValues.reduce((a, b) => a + b, 0)
  const sumY = yValues.reduce((a, b) => a + b, 0)
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0)
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0)

  // 计算斜率和截距
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // 预测未来值（假设每30分钟一个数据点）
  const futureX = n + hoursAhead * 2
  const predicted = slope * futureX + intercept

  return Math.max(0, Math.min(100, Math.round(predicted)))
}

/**
 * 生成预测曲线数据
 */
function generatePredictionCurve(
  historicalData: HeartbeatData[],
  hoursAhead: number
): Array<{ time: string; actual?: number; predicted?: number }> {
  const data: Array<{ time: string; actual?: number; predicted?: number }> = []

  // 历史数据（最近10个点）
  const recentHistory = historicalData.slice(-10)
  recentHistory.forEach((h, i) => {
    data.push({
      time: `${i * 30}分钟前`,
      actual: h.vitality
    })
  })

  // 当前点
  if (recentHistory.length > 0) {
    const latest = recentHistory[recentHistory.length - 1]
    data.push({
      time: '现在',
      actual: latest.vitality,
      predicted: latest.vitality
    })
  }

  // 预测数据
  for (let i = 1; i <= hoursAhead; i++) {
    data.push({
      time: `${i}小时后`,
      predicted: predictVitality(historicalData, i)
    })
  }

  return data
}

/**
 * 预测卡片组件
 */
const PredictionCard: React.FC<{
  label: string
  value: number
  icon: string
}> = ({ label, value, icon }) => {
  const getColor = (v: number) => {
    if (v >= 70) return 'text-green-400 border-green-400/50 bg-green-500/10'
    if (v >= 40) return 'text-amber-400 border-amber-400/50 bg-amber-500/10'
    return 'text-red-400 border-red-400/50 bg-red-500/10'
  }

  return (
    <div
      className={`rounded-lg p-4 border backdrop-blur-xl ${getColor(value)}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm opacity-80">{label}</span>
        <span className="text-2xl opacity-80">{icon}</span>
      </div>
      <div className="text-3xl font-bold">{value}%</div>
    </div>
  )
}

/**
 * 生命力预测器主组件
 */
export const VitalityPredictor: React.FC<VitalityPredictorProps> = ({ agentId }) => {
  const heartbeatHistory = getHeartbeatService().getHeartbeatHistory(agentId)
  const historicalData = heartbeatHistory?.records || []

  if (historicalData.length < 2) {
    return (
      <div className="text-center text-gray-400 py-12">
        <p className="text-xl mb-2">🔮</p>
        <p>数据不足，无法进行预测</p>
        <p className="text-sm mt-2">至少需要2个以上的历史数据点</p>
      </div>
    )
  }

  const predictions = {
    in1Hour: predictVitality(historicalData, 1),
    in6Hours: predictVitality(historicalData, 6),
    in24Hours: predictVitality(historicalData, 24)
  }

  const curveData = generatePredictionCurve(historicalData, 8)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">生命力预测</h3>

      {/* 预测卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <PredictionCard label="1小时后" value={predictions.in1Hour} icon="⏱️" />
        <PredictionCard label="6小时后" value={predictions.in6Hours} icon="⏰" />
        <PredictionCard label="24小时后" value={predictions.in24Hours} icon="📅" />
      </div>

      {/* 预测曲线图 */}
      <div className="bg-white/5 border border-white/20 rounded-lg p-4">
        <h4 className="text-sm font-medium mb-3">预测趋势</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={curveData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="time"
              stroke="rgba(255,255,255,0.4)"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              domain={[0, 100]}
              stroke="rgba(255,255,255,0.4)"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px'
              }}
            />
            <ReferenceLine
              x="现在"
              stroke="rgba(147, 51, 234, 0.5)"
              strokeDasharray="3 3"
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="历史数据"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              name="预测数据"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 预测说明 */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <span className="text-blue-400">💡</span>
          <div className="text-xs text-blue-300 flex-1">
            <p className="font-medium mb-1">预测说明</p>
            <p className="text-blue-400/80">
              预测基于最近20次心跳数据的线性回归算法，仅供参考。
              实际生命力可能因任务执行、Token消耗等因素产生波动。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
