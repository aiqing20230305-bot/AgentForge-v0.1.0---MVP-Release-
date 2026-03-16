/**
 * Agent性能分析仪表盘
 * 提供全面的性能数据可视化和分析
 */

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
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
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import {
  Activity,
  TrendingUp,
  Download,
  Calendar,
  Clock,
  Zap,
  Target,
  Users,
  BarChart3,
  PieChart as PieChartIcon,
  Image as ImageIcon,
  FileText
} from 'lucide-react'
import { useTaskStore } from '../stores/taskStore'
import {
  calculateCompletionTrend,
  calculateTaskTypeDistribution,
  calculateExecutionTimeTrend,
  generateTokenHeatmap,
  calculateAgentPerformance,
  generateAnalyticsSummary,
  exportToCSV,
  exportToPNG
} from '../utils/analyticsProcessor'

type TimeRange = '7days' | '30days'
type ExportFormat = 'csv' | 'png'

export const AnalyticsDashboard: React.FC = () => {
  const { tasks } = useTaskStore()
  const [timeRange, setTimeRange] = useState<TimeRange>('7days')
  const [isExporting, setIsExporting] = useState(false)

  // 计算所有分析数据
  const analyticsData = useMemo(() => {
    const days = timeRange === '7days' ? 7 : 30
    return {
      completionTrend: calculateCompletionTrend(tasks, days),
      taskTypes: calculateTaskTypeDistribution(tasks),
      executionTrend: calculateExecutionTimeTrend(tasks, days),
      tokenHeatmap: generateTokenHeatmap(tasks),
      agentPerformance: calculateAgentPerformance(tasks),
      summary: generateAnalyticsSummary(tasks)
    }
  }, [tasks, timeRange])

  /**
   * 导出数据
   */
  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true)
    try {
      if (format === 'csv') {
        // 导出多个CSV文件
        exportToCSV(
          analyticsData.completionTrend,
          `completion-trend-${Date.now()}.csv`
        )
        exportToCSV(
          analyticsData.taskTypes,
          `task-types-${Date.now()}.csv`
        )
        exportToCSV(
          analyticsData.agentPerformance,
          `agent-performance-${Date.now()}.csv`
        )
      } else if (format === 'png') {
        // 导出仪表盘截图
        await exportToPNG('analytics-dashboard', `analytics-${Date.now()}.png`)
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  /**
   * 获取热力图单元格颜色
   */
  const getHeatmapColor = (intensity: number): string => {
    if (intensity === 0) return '#1F2937'
    if (intensity < 0.2) return '#065F46'
    if (intensity < 0.4) return '#047857'
    if (intensity < 0.6) return '#10B981'
    if (intensity < 0.8) return '#34D399'
    return '#6EE7B7'
  }

  return (
    <div
      id="analytics-dashboard"
      className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-7 h-7 text-blue-400" />
              Agent 性能分析仪表盘
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              实时监控Agent表现和任务执行情况
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Time Range Selector */}
            <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setTimeRange('7days')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  timeRange === '7days'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-1" />
                7天
              </button>
              <button
                onClick={() => setTimeRange('30days')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  timeRange === '30days'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-1" />
                30天
              </button>
            </div>

            {/* Export Buttons */}
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
              title="导出CSV"
            >
              <FileText className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => handleExport('png')}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
              title="导出PNG"
            >
              <ImageIcon className="w-4 h-4" />
              PNG
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/50 rounded-lg"
          >
            <div className="flex items-center gap-2 text-blue-300 text-sm mb-1">
              <Target className="w-4 h-4" />
              总任务数
            </div>
            <div className="text-2xl font-bold text-white">
              {analyticsData.summary.totalTasks}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              完成率 {analyticsData.summary.completionRate}%
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-3 bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700/50 rounded-lg"
          >
            <div className="flex items-center gap-2 text-green-300 text-sm mb-1">
              <Clock className="w-4 h-4" />
              平均执行时间
            </div>
            <div className="text-2xl font-bold text-white">
              {analyticsData.summary.avgExecutionTime}
            </div>
            <div className="text-xs text-gray-400 mt-1">分钟</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-3 bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/50 rounded-lg"
          >
            <div className="flex items-center gap-2 text-purple-300 text-sm mb-1">
              <Zap className="w-4 h-4" />
              Token消耗
            </div>
            <div className="text-2xl font-bold text-white">
              {(analyticsData.summary.totalTokens / 1000).toFixed(1)}K
            </div>
            <div className="text-xs text-gray-400 mt-1">高峰时段 {analyticsData.summary.peakHour}:00</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-3 bg-gradient-to-br from-amber-900/30 to-amber-800/20 border border-amber-700/50 rounded-lg"
          >
            <div className="flex items-center gap-2 text-amber-300 text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              周环比增长
            </div>
            <div className="text-2xl font-bold text-white">
              {analyticsData.summary.weekOverWeekGrowth > 0 ? '+' : ''}
              {analyticsData.summary.weekOverWeekGrowth}%
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {analyticsData.summary.mostActiveAgent}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Row 1: Completion Trend & Task Types */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 任务完成率折线图 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
          >
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              任务完成率趋势
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analyticsData.completionTrend}>
                <defs>
                  <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#completionGradient)"
                  name="完成率 (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* 任务类型饼图 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
          >
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-blue-400" />
              任务类型分布
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData.taskTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percentage }) => `${type}: ${percentage}%`}
                  outerRadius={80}
                  dataKey="count"
                >
                  {analyticsData.taskTypes.map((entry, index) => (
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
          </motion.div>
        </div>

        {/* Row 2: Execution Time Trend & Token Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 平均执行时间趋势 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
          >
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              平均执行时间趋势
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analyticsData.executionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
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
                  dataKey="avgTime"
                  stroke="#A855F7"
                  strokeWidth={2}
                  name="平均时间 (分钟)"
                  dot={{ fill: '#A855F7', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="minTime"
                  stroke="#10B981"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="最短时间"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="maxTime"
                  stroke="#EF4444"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="最长时间"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Token消耗热力图 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
          >
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Token消耗热力图 (24h × 7d)
            </h3>
            <div className="flex flex-col items-center">
              {/* 热力图网格 */}
              <div className="w-full overflow-x-auto">
                <div className="inline-block min-w-full">
                  {/* 小时标签 */}
                  <div className="flex mb-1">
                    <div className="w-12"></div>
                    {Array.from({ length: 24 }, (_, i) => (
                      <div
                        key={i}
                        className="w-6 text-center text-xs text-gray-400"
                        style={{ fontSize: '10px' }}
                      >
                        {i % 4 === 0 ? i : ''}
                      </div>
                    ))}
                  </div>
                  {/* 热力图行 */}
                  {Array.from({ length: 7 }, (_, day) => (
                    <div key={day} className="flex mb-1">
                      <div className="w-12 text-xs text-gray-400 flex items-center">
                        {['日', '一', '二', '三', '四', '五', '六'][6 - day]}
                      </div>
                      {Array.from({ length: 24 }, (_, hour) => {
                        const data = analyticsData.tokenHeatmap.find(
                          d => d.day === day && d.hour === hour
                        )
                        return (
                          <div
                            key={hour}
                            className="w-6 h-6 rounded-sm mx-0.5"
                            style={{
                              backgroundColor: getHeatmapColor(data?.intensity || 0)
                            }}
                            title={`${data?.tokens || 0} tokens`}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
              {/* 图例 */}
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                <span>低</span>
                <div className="flex gap-1">
                  {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-sm"
                      style={{ backgroundColor: getHeatmapColor(intensity) }}
                    />
                  ))}
                </div>
                <span>高</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Row 3: Agent Performance Comparison */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
        >
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Agent性能对比
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.agentPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="agentName" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Legend />
              <Bar dataKey="completed" fill="#10B981" name="完成任务数" />
              <Bar dataKey="successRate" fill="#3B82F6" name="成功率 (%)" />
              <Bar dataKey="avgTime" fill="#A855F7" name="平均耗时 (分钟)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Performance Tips */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-lg"
        >
          <h4 className="text-sm font-bold text-blue-300 mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            数据洞察
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
            <div>
              <span className="text-blue-400 font-semibold">最活跃Agent:</span>{' '}
              {analyticsData.summary.mostActiveAgent}
            </div>
            <div>
              <span className="text-green-400 font-semibold">最常见任务类型:</span>{' '}
              {analyticsData.summary.topTaskType}
            </div>
            <div>
              <span className="text-purple-400 font-semibold">高峰工作时段:</span>{' '}
              {analyticsData.summary.peakHour}:00 - {analyticsData.summary.peakHour + 1}:00
            </div>
            <div>
              <span className="text-amber-400 font-semibold">任务增长趋势:</span>{' '}
              {analyticsData.summary.weekOverWeekGrowth > 0 ? '上升' : '下降'}{' '}
              {Math.abs(analyticsData.summary.weekOverWeekGrowth)}%
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
