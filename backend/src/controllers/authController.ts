/**
 * Authentication Controller
 * Handle user registration, login, and token refresh
 */

import { Request, Response, NextFunction } from 'express'
import { User } from '../models/User'
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt'
import { createError } from '../middleware/errorHandler'

/**
 * Register new user
 * POST /api/v1/auth/register
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, username } = req.body

    // Validate input
    if (!email || !password || !username) {
      throw createError('Email, password, and username are required', 400)
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      throw createError('User with this email or username already exists', 409)
    }

    // Create user
    const user = await User.create({ email, password, username })

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      username: user.username
    })

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          createdAt: user.createdAt
        },
        ...tokens
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      throw createError('Email and password are required', 400)
    }

    // Find user (include password field)
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      throw createError('Invalid email or password', 401)
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      throw createError('Invalid email or password', 401)
    }

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      username: user.username
    })

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          createdAt: user.createdAt
        },
        ...tokens
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body

    if (!token) {
      throw createError('Refresh token is required', 400)
    }

    // Verify refresh token
    const payload = verifyRefreshToken(token)

    // Generate new token pair
    const tokens = generateTokenPair({
      userId: payload.userId,
      email: payload.email,
      username: payload.username
    })

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokens
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get current user profile
 * GET /api/v1/auth/me
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const user = await User.findById(req.user.userId)
    if (!user) {
      throw createError('User not found', 404)
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          createdAt: user.createdAt
        }
      }
    })
  } catch (error) {
    next(error)
  }
}
