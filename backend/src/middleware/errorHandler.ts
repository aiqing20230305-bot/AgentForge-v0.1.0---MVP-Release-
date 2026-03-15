/**
 * Error Handler Middleware
 * Global error handling for Express
 */

import { Request, Response, NextFunction } from 'express'
import config from '../config/env'

export interface ApiError extends Error {
  statusCode?: number
  isOperational?: boolean
}

/**
 * Error handler middleware
 */
export const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  // Log error in development
  if (config.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      message,
      statusCode,
      stack: err.stack
    })
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(config.NODE_ENV === 'development' && { stack: err.stack })
  })
}

/**
 * 404 Not Found handler
 */
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  })
}

/**
 * Create operational error
 */
export const createError = (message: string, statusCode: number = 500): ApiError => {
  const error: ApiError = new Error(message)
  error.statusCode = statusCode
  error.isOperational = true
  return error
}
