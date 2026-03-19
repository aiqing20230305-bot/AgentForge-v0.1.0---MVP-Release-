/**
 * Agent Performance Chart - Agent性能图表
 * v2.4.0 Phase 1.1
 */
import React, { Suspense, lazy } from 'react'

// 懒加载Recharts组件
const BarChart = lazy(() => import('../../charts/BarChartWrapper'))

export const AgentPerformanceChart: React.FC = () => {
  // TODO: 从API获取实际数据
  const data = [
    { name: 'Agent-001', tasks: 45, success: 42 },
    { name: 'Agent-002', tasks: 38, success: 36 },
    { name: 'Agent-003', tasks: 32, success: 30 },
    { name: 'Agent-004', tasks: 28, success: 27 },
    { name: 'Agent-005', tasks: 25, success: 23 }
  ]

  const config = {
    xKey: 'name',
    bars: [
      { dataKey: 'tasks', fill: '#06b6d4', name: '总任务' },
      { dataKey: 'success', fill: '#10b981', name: '成功任务' }
    ]
  }

  return (
    <div className="w-full h-64">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-gray-400">加载图表中...</div>
        </div>
      }>
        <BarChart data={data} config={config} />
      </Suspense>
    </div>
  )
}

export default AgentPerformanceChart
