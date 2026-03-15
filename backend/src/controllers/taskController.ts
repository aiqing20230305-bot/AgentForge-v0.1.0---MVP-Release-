/**
 * Task Controller
 * Handle CRUD operations for tasks
 */

import { Request, Response, NextFunction } from 'express'
import { Task } from '../models/Task'
import { Agent } from '../models/Agent'
import { createError } from '../middleware/errorHandler'

/**
 * Get all tasks for current user
 * GET /api/v1/tasks
 */
export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const { status, priority, agentId, sortBy = 'createdAt', order = 'desc' } = req.query

    const filter: any = { userId: req.user.userId }
    if (status) filter.status = status
    if (priority) filter.priority = priority
    if (agentId) filter.agentId = agentId

    const sortOrder = order === 'asc' ? 1 : -1
    const tasks = await Task.find(filter).sort({ [sortBy as string]: sortOrder })

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get single task by ID
 * GET /api/v1/tasks/:id
 */
export const getTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.userId
    })

    if (!task) {
      throw createError('Task not found', 404)
    }

    res.status(200).json({
      success: true,
      data: task
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Create new task
 * POST /api/v1/tasks
 */
export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const { agentId, title, description, priority, estimatedDuration, scheduledAt, tags } = req.body

    if (!agentId || !title) {
      throw createError('Agent ID and title are required', 400)
    }

    // Verify agent exists and belongs to user
    const agent = await Agent.findOne({
      _id: agentId,
      userId: req.user.userId
    })

    if (!agent) {
      throw createError('Agent not found', 404)
    }

    const task = await Task.create({
      userId: req.user.userId,
      agentId,
      title,
      description,
      priority: priority || 'medium',
      estimatedDuration,
      scheduledAt,
      tags: tags || []
    })

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update task
 * PUT /api/v1/tasks/:id
 */
export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const {
      title,
      description,
      status,
      priority,
      result,
      errorMessage,
      actualDuration,
      tokensUsed,
      tags
    } = req.body

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(result !== undefined && { result }),
        ...(errorMessage !== undefined && { errorMessage }),
        ...(actualDuration && { actualDuration }),
        ...(tokensUsed && { tokensUsed }),
        ...(tags && { tags }),
        ...(status === 'in_progress' && !req.body.startedAt && { startedAt: new Date() }),
        ...(status === 'completed' && !req.body.completedAt && { completedAt: new Date() })
      },
      { new: true, runValidators: true }
    )

    if (!task) {
      throw createError('Task not found', 404)
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Delete task
 * DELETE /api/v1/tasks/:id
 */
export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    })

    if (!task) {
      throw createError('Task not found', 404)
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Add execution log entry
 * POST /api/v1/tasks/:id/logs
 */
export const addTaskLog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const { logEntry } = req.body

    if (!logEntry) {
      throw createError('Log entry is required', 400)
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { $push: { executionLog: logEntry } },
      { new: true }
    )

    if (!task) {
      throw createError('Task not found', 404)
    }

    res.status(200).json({
      success: true,
      message: 'Log entry added successfully',
      data: task
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get task statistics for user
 * GET /api/v1/tasks/stats
 */
export const getTaskStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const stats = await Task.aggregate([
      { $match: { userId: req.user.userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalTokens: { $sum: '$tokensUsed' },
          avgDuration: { $avg: '$actualDuration' }
        }
      }
    ])

    const totalTasks = await Task.countDocuments({ userId: req.user.userId })

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        byStatus: stats
      }
    })
  } catch (error) {
    next(error)
  }
}
