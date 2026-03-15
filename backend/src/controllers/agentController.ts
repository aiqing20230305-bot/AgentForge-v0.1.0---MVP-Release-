/**
 * Agent Controller
 * Handle CRUD operations for agents
 */

import { Request, Response, NextFunction } from 'express'
import { Agent } from '../models/Agent'
import { createError } from '../middleware/errorHandler'

/**
 * Get all agents for current user
 * GET /api/v1/agents
 */
export const getAgents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const { status, sortBy = 'createdAt', order = 'desc' } = req.query

    const filter: any = { userId: req.user.userId }
    if (status) filter.status = status

    const sortOrder = order === 'asc' ? 1 : -1
    const agents = await Agent.find(filter).sort({ [sortBy as string]: sortOrder })

    res.status(200).json({
      success: true,
      count: agents.length,
      data: agents
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get single agent by ID
 * GET /api/v1/agents/:id
 */
export const getAgent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const agent = await Agent.findOne({
      _id: req.params.id,
      userId: req.user.userId
    })

    if (!agent) {
      throw createError('Agent not found', 404)
    }

    res.status(200).json({
      success: true,
      data: agent
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Create new agent
 * POST /api/v1/agents
 */
export const createAgent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const { name, aiModel, systemPrompt, temperature, maxTokens, avatar, tags } = req.body

    if (!name) {
      throw createError('Agent name is required', 400)
    }

    const agent = await Agent.create({
      userId: req.user.userId,
      name,
      aiModel: aiModel || 'gpt-3.5-turbo',
      systemPrompt,
      temperature: temperature !== undefined ? temperature : 0.7,
      maxTokens: maxTokens || 2000,
      avatar,
      tags: tags || []
    })

    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      data: agent
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update agent
 * PUT /api/v1/agents/:id
 */
export const updateAgent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const { name, aiModel, systemPrompt, temperature, maxTokens, status, avatar, tags } = req.body

    const agent = await Agent.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      {
        ...(name && { name }),
        ...(aiModel && { aiModel }),
        ...(systemPrompt !== undefined && { systemPrompt }),
        ...(temperature !== undefined && { temperature }),
        ...(maxTokens && { maxTokens }),
        ...(status && { status }),
        ...(avatar !== undefined && { avatar }),
        ...(tags && { tags })
      },
      { new: true, runValidators: true }
    )

    if (!agent) {
      throw createError('Agent not found', 404)
    }

    res.status(200).json({
      success: true,
      message: 'Agent updated successfully',
      data: agent
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Delete agent
 * DELETE /api/v1/agents/:id
 */
export const deleteAgent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const agent = await Agent.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    })

    if (!agent) {
      throw createError('Agent not found', 404)
    }

    res.status(200).json({
      success: true,
      message: 'Agent deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update agent statistics
 * PATCH /api/v1/agents/:id/stats
 */
export const updateAgentStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const { experience, tasksCompleted, tokensUsed, totalUptime } = req.body

    const agent = await Agent.findOne({
      _id: req.params.id,
      userId: req.user.userId
    })

    if (!agent) {
      throw createError('Agent not found', 404)
    }

    // Update statistics
    if (experience !== undefined) agent.experience += experience
    if (tasksCompleted !== undefined) agent.tasksCompleted += tasksCompleted
    if (tokensUsed !== undefined) agent.tokensUsed += tokensUsed
    if (totalUptime !== undefined) agent.totalUptime += totalUptime

    // Level up calculation
    const expPerLevel = 1000
    while (agent.experience >= expPerLevel && agent.level < 100) {
      agent.level += 1
      agent.experience -= expPerLevel
    }

    await agent.save()

    res.status(200).json({
      success: true,
      message: 'Agent statistics updated successfully',
      data: agent
    })
  } catch (error) {
    next(error)
  }
}
