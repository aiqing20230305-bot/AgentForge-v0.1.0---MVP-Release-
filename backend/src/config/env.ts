/**
 * Environment Configuration
 * Centralized environment variables with type safety
 */

import dotenv from 'dotenv'
import path from 'path'

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') })

interface EnvConfig {
  // Server
  NODE_ENV: string
  PORT: number
  API_VERSION: string

  // MongoDB
  MONGODB_URI: string
  MONGODB_TEST_URI: string

  // JWT
  JWT_SECRET: string
  JWT_REFRESH_SECRET: string
  JWT_EXPIRES_IN: string
  JWT_REFRESH_EXPIRES_IN: string

  // CORS
  CORS_ORIGIN: string[]

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number
  RATE_LIMIT_MAX_REQUESTS: number

  // Logging
  LOG_LEVEL: string
}

const config: EnvConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  API_VERSION: process.env.API_VERSION || 'v1',

  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/agentforge',
  MONGODB_TEST_URI: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/agentforge_test',

  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  CORS_ORIGIN: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000').split(','),

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
}

// Validate required environment variables in production
if (config.NODE_ENV === 'production') {
  const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'MONGODB_URI']
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  // Warn if using default secrets
  if (config.JWT_SECRET.includes('dev-') || config.JWT_REFRESH_SECRET.includes('dev-')) {
    console.warn('⚠️  WARNING: Using default JWT secrets in production! Please set custom secrets.')
  }
}

export default config
