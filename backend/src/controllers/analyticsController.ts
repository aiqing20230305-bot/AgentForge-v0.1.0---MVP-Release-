/**
 * Analytics Controller
 * v2.4.0 Phase 1.2 - Analytics API
 */
import { Request, Response } from 'express'
import { AnalyticsService } from '../services/analyticsService'

const analyticsService = new AnalyticsService()

/**
 * GET /api/analytics/overview
 * 获取分析概览数据
 */
export const getOverview = async (req: Request, res: Response) => {
  try {
    const { timeRange = 'week', teamId, userId } = req.query

    const overview = await analyticsService.getOverview({
      timeRange: timeRange as string,
      teamId: teamId as string,
      userId: userId as string
    })

    res.json({
      success: true,
      data: overview,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[Analytics] Get overview error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics overview',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * GET /api/analytics/agents/performance
 * 获取Agent性能数据
 */
export const getAgentPerformance = async (req: Request, res: Response) => {
  try {
    const { timeRange = 'week', limit = 10, teamId } = req.query

    const performance = await analyticsService.getAgentPerformance({
      timeRange: timeRange as string,
      limit: parseInt(limit as string),
      teamId: teamId as string
    })

    res.json({
      success: true,
      data: performance,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[Analytics] Get agent performance error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get agent performance',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * GET /api/analytics/tasks/completion
 * 获取任务完成统计
 */
export const getTaskCompletion = async (req: Request, res: Response) => {
  try {
    const { timeRange = 'week', teamId, agentId } = req.query

    const completion = await analyticsService.getTaskCompletion({
      timeRange: timeRange as string,
      teamId: teamId as string,
      agentId: agentId as string
    })

    res.json({
      success: true,
      data: completion,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[Analytics] Get task completion error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get task completion',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * GET /api/analytics/users/activity
 * 获取用户活动数据
 */
export const getUserActivity = async (req: Request, res: Response) => {
  try {
    const { timeRange = 'week', teamId } = req.query

    const activity = await analyticsService.getUserActivity({
      timeRange: timeRange as string,
      teamId: teamId as string
    })

    res.json({
      success: true,
      data: activity,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[Analytics] Get user activity error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get user activity',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * GET /api/analytics/custom
 * 自定义查询
 */
export const getCustomAnalytics = async (req: Request, res: Response) => {
  try {
    const { metric, timeRange = 'week', groupBy, filters } = req.query

    if (!metric) {
      return res.status(400).json({
        success: false,
        error: 'Metric parameter is required'
      })
    }

    const data = await analyticsService.getCustomAnalytics({
      metric: metric as string,
      timeRange: timeRange as string,
      groupBy: groupBy as string,
      filters: filters ? JSON.parse(filters as string) : {}
    })

    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[Analytics] Custom analytics error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get custom analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * GET /api/analytics/trends
 * 获取趋势数据
 */
export const getTrends = async (req: Request, res: Response) => {
  try {
    const { timeRange = 'week', metrics = 'agents,tasks', teamId } = req.query

    const trends = await analyticsService.getTrends({
      timeRange: timeRange as string,
      metrics: (metrics as string).split(','),
      teamId: teamId as string
    })

    res.json({
      success: true,
      data: trends,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[Analytics] Get trends error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get trends',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
