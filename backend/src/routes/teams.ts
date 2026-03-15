/**
 * Team Routes
 * Team management endpoints
 */

import express from 'express'
import {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  updateTeamStats
} from '../controllers/teamController'
import { authenticate } from '../middleware/auth'

const router = express.Router()

// All team routes require authentication
router.use(authenticate)

router.route('/')
  .get(getTeams)
  .post(createTeam)

router.route('/:id')
  .get(getTeam)
  .put(updateTeam)
  .delete(deleteTeam)

router.post('/:id/members', addTeamMember)
router.delete('/:id/members/:agentId', removeTeamMember)
router.patch('/:id/stats', updateTeamStats)

export default router
