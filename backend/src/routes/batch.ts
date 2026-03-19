/**
 * Batch Operations Routes
 * API endpoints for batch operations
 */

import { Router } from 'express'
import {
  createBatchOperation,
  executeBatchOperation,
  getBatchOperation,
  listBatchOperations,
  cancelBatchOperation,
  deleteBatchOperation,
  batchImport,
  batchExport
} from '../controllers/batchController'

const router = Router()

// Batch operation CRUD
router.post('/', createBatchOperation)
router.get('/', listBatchOperations)
router.get('/:id', getBatchOperation)
router.delete('/:id', deleteBatchOperation)

// Batch operation execution
router.post('/:id/execute', executeBatchOperation)
router.post('/:id/cancel', cancelBatchOperation)

// Import/Export
router.post('/import', batchImport)
router.post('/export', batchExport)

export default router
