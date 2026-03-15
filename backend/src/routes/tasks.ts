/**
 * Task Routes
 * Task management endpoints
 */

import express from 'express'
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addTaskLog,
  getTaskStats
} from '../controllers/taskController'
import { authenticate } from '../middleware/auth'

const router = express.Router()

// All task routes require authentication
router.use(authenticate)

router.get('/stats', getTaskStats)

router.route('/')
  .get(getTasks)
  .post(createTask)

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask)

router.post('/:id/logs', addTaskLog)

export default router
