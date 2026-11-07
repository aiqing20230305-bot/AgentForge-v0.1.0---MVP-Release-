/**
 * 懒加载图表组件
 * 减少初始bundle大小，按需加载Recharts
 */
import React, { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// 懒加载各种图表类型
const LazyLineChart = lazy(() => import('./LineChartWrapper'))
const LazyBarChart = lazy(() => import('./BarChartWrapper'))
const LazyAreaChart = lazy(() => import('./AreaChartWrapper'))
const LazyPieChart = lazy(() => import('./PieChartWrapper'))
const LazyRadarChart = lazy(() => import('./RadarChartWrapper'))

// 加载中占位符
function ChartSkeleton() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px] bg-white/5 rounded-lg">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        <p className="text-sm text-gray-400">加载图表中...</p>
      </div>
    </div>
  )
}

// 图表类型
export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'radar'

interface LazyChartProps {
  type: ChartType
  data: any[]
  config?: any
  className?: string
}

/**
 * 懒加载图表容器
 * 根据type动态加载对应的图表组件
 */
export function LazyChart({ type, data, config, className = '' }: LazyChartProps) {
  const ChartComponent = {
    line: LazyLineChart,
    bar: LazyBarChart,
    area: LazyAreaChart,
    pie: LazyPieChart,
    radar: LazyRadarChart
  }[type]

  if (!ChartComponent) {
    return (
      <div className="text-red-400 p-4">
        不支持的图表类型: {type}
      </div>
    )
  }

  return (
    <Suspense fallback={<ChartSkeleton />}>
      <ChartComponent data={data} config={config} className={className} />
    </Suspense>
  )
}

// 预加载函数（可选）
export function preloadChart(type: ChartType) {
  switch (type) {
    case 'line':
      return import('./LineChartWrapper')
    case 'bar':
      return import('./BarChartWrapper')
    case 'area':
      return import('./AreaChartWrapper')
    case 'pie':
      return import('./PieChartWrapper')
    case 'radar':
      return import('./RadarChartWrapper')
  }
}

// 预加载所有图表（在路由即将进入分析页面时调用）
export function preloadAllCharts() {
  return Promise.all([
    import('./LineChartWrapper'),
    import('./BarChartWrapper'),
    import('./AreaChartWrapper'),
    import('./PieChartWrapper'),
    import('./RadarChartWrapper')
  ])
}
