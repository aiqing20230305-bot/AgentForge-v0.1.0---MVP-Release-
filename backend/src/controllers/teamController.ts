/**
 * Team Controller
 * Handle CRUD operations for teams
 */

import { Request, Response, NextFunction } from 'express'
import { Team } from '../models/Team'
import { Agent } from '../models/Agent'
import { createError } from '../middleware/errorHandler'

/**
 * Get all teams for current user
 * GET /api/v1/teams
 */
export const getTeams = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const { isPublic, sortBy = 'createdAt', order = 'desc' } = req.query

    const filter: any = { userId: req.user.userId }
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true'

    const sortOrder = order === 'asc' ? 1 : -1
    const teams = await Team.find(filter).sort({ [sortBy as string]: sortOrder })

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get single team by ID
 * GET /api/v1/teams/:id
 */
export const getTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const team = await Team.findOne({
      _id: req.params.id,
      userId: req.user.userId
    })

    if (!team) {
      throw createError('Team not found', 404)
    }

    res.status(200).json({
      success: true,
      data: team
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Create new team
 * POST /api/v1/teams
 */
export const createTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const { name, description, isPublic, maxMembers, tags } = req.body

    if (!name) {
      throw createError('Team name is required', 400)
    }

    const team = await Team.create({
      userId: req.user.userId,
      name,
      description,
      isPublic: isPublic || false,
      maxMembers: maxMembers || 5,
      tags: tags || []
    })

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: team
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update team
 * PUT /api/v1/teams/:id
 */
export const updateTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const { name, description, isPublic, maxMembers, tags } = req.body

    const team = await Team.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic }),
        ...(maxMembers && { maxMembers }),
        ...(tags && { tags })
      },
      { new: true, runValidators: true }
    )

    if (!team) {
      throw createError('Team not found', 404)
    }

    res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      data: team
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Delete team
 * DELETE /api/v1/teams/:id
 */
export const deleteTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const team = await Team.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    })

    if (!team) {
      throw createError('Team not found', 404)
    }

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Add member to team
 * POST /api/v1/teams/:id/members
 */
export const addTeamMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const { agentId, role } = req.body

    if (!agentId) {
      throw createError('Agent ID is required', 400)
    }

    // Verify agent exists and belongs to user
    const agent = await Agent.findOne({
      _id: agentId,
      userId: req.user.userId
    })

    if (!agent) {
      throw createError('Agent not found', 404)
    }

    const team = await Team.findOne({
      _id: req.params.id,
      userId: req.user.userId
    })

    if (!team) {
      throw createError('Team not found', 404)
    }

    // Check if agent already in team
    const existingMember = team.members.find((m: { agentId: string }) => m.agentId === agentId)
    if (existingMember) {
      throw createError('Agent is already a member of this team', 409)
    }

    // Check if team is full
    if (team.members.length >= team.maxMembers) {
      throw createError('Team is full', 400)
    }

    team.members.push({
      agentId,
      agentName: agent.name,
      role: role || 'member',
      joinedAt: new Date()
    })

    await team.save()

    res.status(200).json({
      success: true,
      message: 'Member added to team successfully',
      data: team
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Remove member from team
 * DELETE /api/v1/teams/:id/members/:agentId
 */
export const removeTeamMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const team = await Team.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { $pull: { members: { agentId: req.params.agentId } } },
      { new: true }
    )

    if (!team) {
      throw createError('Team not found', 404)
    }

    res.status(200).json({
      success: true,
      message: 'Member removed from team successfully',
      data: team
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update team statistics
 * PATCH /api/v1/teams/:id/stats
 */
export const updateTeamStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const { tasksCompleted, totalTokensUsed } = req.body

    const team = await Team.findOne({
      _id: req.params.id,
      userId: req.user.userId
    })

    if (!team) {
      throw createError('Team not found', 404)
    }

    if (tasksCompleted !== undefined) team.tasksCompleted += tasksCompleted
    if (totalTokensUsed !== undefined) team.totalTokensUsed += totalTokensUsed

    await team.save()

    res.status(200).json({
      success: true,
      message: 'Team statistics updated successfully',
      data: team
    })
  } catch (error) {
    next(error)
  }
}
