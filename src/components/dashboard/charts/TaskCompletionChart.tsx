/**
 * Task Completion Chart - 任务完成率图表
 * v2.4.0 Phase 1.1
 */
import React, { Suspense, lazy } from 'react'

// 懒加载Recharts组件
const PieChart = lazy(() => import('../../charts/PieChartWrapper'))

export const TaskCompletionChart: React.FC = () => {
  // TODO: 从API获取实际数据
  const data = [
    { name: '已完成', value: 142, fill: '#10b981' },
    { name: '进行中', value: 18, fill: '#f59e0b' },
    { name: '待处理', value: 8, fill: '#6b7280' },
    { name: '失败', value: 4, fill: '#ef4444' }
  ]

  const config = {
    nameKey: 'name',
    dataKey: 'value'
  }

  return (
    <div className="w-full h-64">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-gray-400">加载图表中...</div>
        </div>
      }>
        <PieChart data={data} config={config} />
      </Suspense>

      {/* 图例 */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-sm text-gray-400">
              {item.name}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaskCompletionChart
