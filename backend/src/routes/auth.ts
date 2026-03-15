/**
 * Auth Routes
 * Authentication endpoints
 */

import express from 'express'
import { register, login, refreshToken, getMe } from '../controllers/authController'
import { authenticate } from '../middleware/auth'

const router = express.Router()

// Public routes
router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refreshToken)

// Protected routes
router.get('/me', authenticate, getMe)

export default router
