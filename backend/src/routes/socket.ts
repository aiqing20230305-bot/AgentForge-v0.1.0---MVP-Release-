/**
 * Socket.io Status Route
 * Get WebSocket connection statistics
 */

import express from 'express'
import { getSocketService } from '../services/socketService'
import { authenticate } from '../middleware/auth'

const router = express.Router()

/**
 * Get Socket.io statistics
 * GET /api/v1/socket/stats
 */
router.get('/stats', authenticate, (_req, res) => {
  try {
    const socketService = getSocketService()

    const stats = {
      connectedUsers: socketService.getConnectedUsersCount(),
      activeRooms: socketService.getActiveRooms(),
      timestamp: new Date()
    }

    res.status(200).json({
      success: true,
      data: stats
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get socket statistics'
    })
  }
})

export default router
