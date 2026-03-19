/**
 * Trend Chart - 趋势图表
 * v2.4.0 Phase 1.1
 */
import React, { Suspense, lazy } from 'react'

// 懒加载Recharts组件
const LineChart = lazy(() => import('../../charts/LineChartWrapper'))

export const TrendChart: React.FC = () => {
  // TODO: 从API获取实际数据
  const data = [
    { date: '03-13', agents: 28, tasks: 65 },
    { date: '03-14', agents: 32, tasks: 78 },
    { date: '03-15', agents: 35, tasks: 92 },
    { date: '03-16', agents: 38, tasks: 103 },
    { date: '03-17', agents: 40, tasks: 128 },
    { date: '03-18', agents: 41, tasks: 142 },
    { date: '03-19', agents: 42, tasks: 156 }
  ]

  const config = {
    xKey: 'date',
    lines: [
      { dataKey: 'agents', stroke: '#06b6d4', name: 'Agent数量' },
      { dataKey: 'tasks', stroke: '#8b5cf6', name: '任务数量' }
    ]
  }

  return (
    <div className="w-full h-64">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-gray-400">加载图表中...</div>
        </div>
      }>
        <LineChart data={data} config={config} />
      </Suspense>
    </div>
  )
}

export default TrendChart
