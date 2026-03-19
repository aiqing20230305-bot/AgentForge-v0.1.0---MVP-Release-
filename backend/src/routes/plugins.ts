/**
 * Plugin Routes
 * Plugin marketplace endpoints
 */

import express from 'express'
import {
  getPlugins,
  getPlugin,
  createPlugin,
  updatePlugin,
  deletePlugin,
  installPlugin,
  ratePlugin,
  reviewPlugin,
  featurePlugin,
  verifyPlugin,
  getPluginStats,
  getMyPlugins
} from '../controllers/pluginController'
import { authenticate, optionalAuth } from '../middleware/auth'

const router = express.Router()

// Public routes (no auth required)
router.get('/', optionalAuth, getPlugins)
router.get('/stats', getPluginStats)
router.get('/:id', getPlugin)

// Authenticated routes
router.post('/', authenticate, createPlugin)
router.get('/my/plugins', authenticate, getMyPlugins)
router.put('/:id', authenticate, updatePlugin)
router.delete('/:id', authenticate, deletePlugin)
router.post('/:id/install', installPlugin)
router.post('/:id/rate', authenticate, ratePlugin)

// Admin routes (authentication and authorization checked in controller)
router.post('/:id/review', authenticate, reviewPlugin)
router.post('/:id/feature', authenticate, featurePlugin)
router.post('/:id/verify', authenticate, verifyPlugin)

export default router
