/**
 * Analytics Routes
 * v2.4.0 Phase 1.2
 */
import { Router } from 'express'
import {
  getOverview,
  getAgentPerformance,
  getTaskCompletion,
  getUserActivity,
  getCustomAnalytics,
  getTrends
} from '../controllers/analyticsController'

const router = Router()

/**
 * @route   GET /api/analytics/overview
 * @desc    获取分析概览数据
 * @query   timeRange: 'day' | 'week' | 'month' | 'year'
 * @query   teamId: string (optional)
 * @query   userId: string (optional)
 * @access  Private (TODO: 添加认证中间件)
 */
router.get('/overview', getOverview)

/**
 * @route   GET /api/analytics/agents/performance
 * @desc    获取Agent性能数据
 * @query   timeRange: 'day' | 'week' | 'month' | 'year'
 * @query   limit: number (default: 10)
 * @query   teamId: string (optional)
 * @access  Private
 */
router.get('/agents/performance', getAgentPerformance)

/**
 * @route   GET /api/analytics/tasks/completion
 * @desc    获取任务完成统计
 * @query   timeRange: 'day' | 'week' | 'month' | 'year'
 * @query   teamId: string (optional)
 * @query   agentId: string (optional)
 * @access  Private
 */
router.get('/tasks/completion', getTaskCompletion)

/**
 * @route   GET /api/analytics/users/activity
 * @desc    获取用户活动数据（热力图）
 * @query   timeRange: 'day' | 'week' | 'month' | 'year'
 * @query   teamId: string (optional)
 * @access  Private
 */
router.get('/users/activity', getUserActivity)

/**
 * @route   GET /api/analytics/trends
 * @desc    获取趋势数据
 * @query   timeRange: 'day' | 'week' | 'month' | 'year'
 * @query   metrics: 'agents,tasks,users' (comma-separated)
 * @query   teamId: string (optional)
 * @access  Private
 */
router.get('/trends', getTrends)

/**
 * @route   GET /api/analytics/custom
 * @desc    自定义分析查询
 * @query   metric: string (required)
 * @query   timeRange: 'day' | 'week' | 'month' | 'year'
 * @query   groupBy: string (optional)
 * @query   filters: JSON string (optional)
 * @access  Private
 */
router.get('/custom', getCustomAnalytics)

export default router
