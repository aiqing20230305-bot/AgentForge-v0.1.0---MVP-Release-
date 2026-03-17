/**
 * Express App Configuration
 * Middleware and route setup
 */

import express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import config from './config/env'
import { errorHandler, notFound } from './middleware/errorHandler'

// Import routes
import authRoutes from './routes/auth'
import agentRoutes from './routes/agents'
import taskRoutes from './routes/tasks'
import teamRoutes from './routes/teams'
import socketRoutes from './routes/socket'
import batchRoutes from './routes/batch'
import pluginRoutes from './routes/plugins'

const app: Application = express()

// Security middleware
app.use(helmet())

// CORS configuration
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true
  })
)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging middleware (only in development)
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'AgentForge Backend is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV
  })
})

// API routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/agents', agentRoutes)
app.use('/api/v1/tasks', taskRoutes)
app.use('/api/v1/teams', teamRoutes)
app.use('/api/v1/socket', socketRoutes)
app.use('/api/batch', batchRoutes)
app.use('/api/v1/plugins', pluginRoutes)

// 404 handler
app.use(notFound)

// Global error handler
app.use(errorHandler)

export default app
