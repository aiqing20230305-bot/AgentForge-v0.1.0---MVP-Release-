/**
 * Agent Routes
 * Agent management endpoints
 */

import express from 'express'
import {
  getAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  updateAgentStats
} from '../controllers/agentController'
import { authenticate } from '../middleware/auth'

const router = express.Router()

// All agent routes require authentication
router.use(authenticate)

router.route('/')
  .get(getAgents)
  .post(createAgent)

router.route('/:id')
  .get(getAgent)
  .put(updateAgent)
  .delete(deleteAgent)

router.patch('/:id/stats', updateAgentStats)

export default router
