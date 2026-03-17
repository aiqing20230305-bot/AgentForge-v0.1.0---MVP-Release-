/**
 * Batch Operations Controller
 * Handles all batch operation requests
 */

import { Request, Response } from 'express'
import { BatchOperation, BatchOperationType, BatchStatus } from '../models/BatchOperation'
import { Agent } from '../models/Agent'
import { Task } from '../models/Task'
import { User } from '../models/User'

/**
 * Create a new batch operation
 */
export const createBatchOperation = async (req: Request, res: Response) => {
  try {
    const { operationType, targetIds, operationData } = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Validate operation type
    const validOperations: BatchOperationType[] = [
      'agent_create', 'agent_update', 'agent_delete', 'agent_activate', 'agent_deactivate', 'agent_export',
      'task_create', 'task_update', 'task_delete', 'task_assign', 'task_complete', 'task_export',
      'user_create', 'user_update', 'user_delete', 'user_activate', 'user_deactivate', 'user_export'
    ]

    if (!validOperations.includes(operationType)) {
      return res.status(400).json({ error: 'Invalid operation type' })
    }

    // Create batch operation
    const batchOp = new BatchOperation({
      userId,
      operationType,
      targetIds: targetIds || [],
      totalItems: targetIds?.length || 0,
      operationData,
      status: 'pending'
    })

    await batchOp.save()

    res.status(201).json(batchOp)
  } catch (error: any) {
    console.error('Error creating batch operation:', error)
    res.status(500).json({ error: error.message || 'Failed to create batch operation' })
  }
}

/**
 * Execute batch operation
 */
export const executeBatchOperation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const batchOp = await BatchOperation.findOne({ _id: id, userId })
    if (!batchOp) {
      return res.status(404).json({ error: 'Batch operation not found' })
    }

    if (batchOp.status !== 'pending') {
      return res.status(400).json({ error: 'Batch operation already started or completed' })
    }

    // Update status to processing
    batchOp.status = 'processing'
    batchOp.startedAt = new Date()
    await batchOp.save()

    // Execute batch operation in background
    executeBatchAsync(batchOp)

    res.json({ message: 'Batch operation started', operation: batchOp })
  } catch (error: any) {
    console.error('Error executing batch operation:', error)
    res.status(500).json({ error: error.message || 'Failed to execute batch operation' })
  }
}

/**
 * Get batch operation by ID
 */
export const getBatchOperation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const batchOp = await BatchOperation.findOne({ _id: id, userId })
    if (!batchOp) {
      return res.status(404).json({ error: 'Batch operation not found' })
    }

    res.json(batchOp)
  } catch (error: any) {
    console.error('Error getting batch operation:', error)
    res.status(500).json({ error: error.message || 'Failed to get batch operation' })
  }
}

/**
 * List all batch operations
 */
export const listBatchOperations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { status, operationType, limit = 50, skip = 0 } = req.query

    const query: any = { userId }
    if (status) query.status = status
    if (operationType) query.operationType = operationType

    const operations = await BatchOperation.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))

    const total = await BatchOperation.countDocuments(query)

    res.json({
      operations,
      total,
      limit: Number(limit),
      skip: Number(skip)
    })
  } catch (error: any) {
    console.error('Error listing batch operations:', error)
    res.status(500).json({ error: error.message || 'Failed to list batch operations' })
  }
}

/**
 * Cancel batch operation
 */
export const cancelBatchOperation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const batchOp = await BatchOperation.findOne({ _id: id, userId })
    if (!batchOp) {
      return res.status(404).json({ error: 'Batch operation not found' })
    }

    if (batchOp.status === 'completed' || batchOp.status === 'failed') {
      return res.status(400).json({ error: 'Cannot cancel completed or failed operation' })
    }

    batchOp.status = 'failed'
    batchOp.completedAt = new Date()
    await batchOp.save()

    res.json({ message: 'Batch operation cancelled', operation: batchOp })
  } catch (error: any) {
    console.error('Error cancelling batch operation:', error)
    res.status(500).json({ error: error.message || 'Failed to cancel batch operation' })
  }
}

/**
 * Delete batch operation
 */
export const deleteBatchOperation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const batchOp = await BatchOperation.findOneAndDelete({ _id: id, userId })
    if (!batchOp) {
      return res.status(404).json({ error: 'Batch operation not found' })
    }

    res.json({ message: 'Batch operation deleted' })
  } catch (error: any) {
    console.error('Error deleting batch operation:', error)
    res.status(500).json({ error: error.message || 'Failed to delete batch operation' })
  }
}

/**
 * Batch import from CSV/Excel
 */
export const batchImport = async (req: Request, res: Response) => {
  try {
    const { entityType, data, fileName, fileType } = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!['agent', 'task', 'user'].includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entity type' })
    }

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty import data' })
    }

    // Validate import data
    const validationErrors = validateImportData(entityType, data)

    // Create batch operation
    const operationType = `${entityType}_create` as BatchOperationType
    const batchOp = new BatchOperation({
      userId,
      operationType,
      totalItems: data.length,
      status: validationErrors.length > 0 ? 'failed' : 'pending',
      fileName,
      fileType,
      importData: data,
      validationErrors
    })

    await batchOp.save()

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        operation: batchOp,
        validationErrors
      })
    }

    // Execute import in background
    executeBatchImport(batchOp, entityType, data)

    res.status(201).json({ message: 'Import started', operation: batchOp })
  } catch (error: any) {
    console.error('Error importing batch data:', error)
    res.status(500).json({ error: error.message || 'Failed to import batch data' })
  }
}

/**
 * Batch export to CSV/Excel
 */
export const batchExport = async (req: Request, res: Response) => {
  try {
    const { entityType, ids, format = 'csv', fields } = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!['agent', 'task', 'user'].includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entity type' })
    }

    let data: any[] = []

    // Fetch data based on entity type
    switch (entityType) {
      case 'agent':
        data = await Agent.find({ userId, _id: { $in: ids } }).lean()
        break
      case 'task':
        data = await Task.find({ userId, _id: { $in: ids } }).lean()
        break
      case 'user':
        if (req.user?.role !== 'admin') {
          return res.status(403).json({ error: 'Forbidden' })
        }
        data = await User.find({ _id: { $in: ids } }).lean()
        break
    }

    // Filter fields if specified
    if (fields && Array.isArray(fields)) {
      data = data.map(item => {
        const filtered: any = {}
        fields.forEach(field => {
          if (field in item) filtered[field] = item[field]
        })
        return filtered
      })
    }

    // Create batch operation
    const operationType = `${entityType}_export` as BatchOperationType
    const batchOp = new BatchOperation({
      userId,
      operationType,
      totalItems: data.length,
      status: 'completed',
      processedItems: data.length,
      successfulItems: data.length,
      progress: 100,
      completedAt: new Date(),
      fileName: `${entityType}_export_${Date.now()}.${format}`,
      fileType: format as 'csv' | 'excel' | 'json'
    })

    await batchOp.save()

    res.json({
      message: 'Export completed',
      operation: batchOp,
      data
    })
  } catch (error: any) {
    console.error('Error exporting batch data:', error)
    res.status(500).json({ error: error.message || 'Failed to export batch data' })
  }
}

// Helper functions

/**
 * Execute batch operation asynchronously
 */
async function executeBatchAsync(batchOp: any) {
  try {
    const { operationType, targetIds, operationData, userId } = batchOp

    const results: any[] = []
    let successCount = 0
    let failCount = 0

    for (let i = 0; i < targetIds.length; i++) {
      const itemId = targetIds[i]
      try {
        let result: any = null

        // Execute based on operation type
        switch (operationType) {
          case 'agent_update':
            result = await Agent.findOneAndUpdate(
              { _id: itemId, userId },
              { $set: operationData },
              { new: true }
            )
            break

          case 'agent_delete':
            result = await Agent.findOneAndDelete({ _id: itemId, userId })
            break

          case 'agent_activate':
            result = await Agent.findOneAndUpdate(
              { _id: itemId, userId },
              { $set: { status: 'idle' } },
              { new: true }
            )
            break

          case 'agent_deactivate':
            result = await Agent.findOneAndUpdate(
              { _id: itemId, userId },
              { $set: { status: 'error' } },
              { new: true }
            )
            break

          case 'task_update':
            result = await Task.findOneAndUpdate(
              { _id: itemId, userId },
              { $set: operationData },
              { new: true }
            )
            break

          case 'task_delete':
            result = await Task.findOneAndDelete({ _id: itemId, userId })
            break

          case 'task_assign':
            result = await Task.findOneAndUpdate(
              { _id: itemId, userId },
              { $set: { agentId: operationData.agentId } },
              { new: true }
            )
            break

          case 'task_complete':
            result = await Task.findOneAndUpdate(
              { _id: itemId, userId },
              { $set: { status: 'completed', completedAt: new Date() } },
              { new: true }
            )
            break

          default:
            throw new Error(`Unsupported operation type: ${operationType}`)
        }

        results.push({
          itemId,
          success: !!result,
          data: result
        })

        if (result) successCount++
        else failCount++
      } catch (error: any) {
        results.push({
          itemId,
          success: false,
          error: error.message
        })
        failCount++

        batchOp.errors.push({
          itemId,
          error: error.message,
          timestamp: new Date()
        })
      }

      // Update progress
      batchOp.processedItems = i + 1
      batchOp.progress = Math.round(((i + 1) / targetIds.length) * 100)
      await batchOp.save()
    }

    // Update final status
    batchOp.successfulItems = successCount
    batchOp.failedItems = failCount
    batchOp.results = results
    batchOp.completedAt = new Date()

    if (failCount === 0) {
      batchOp.status = 'completed'
    } else if (successCount === 0) {
      batchOp.status = 'failed'
    } else {
      batchOp.status = 'partial'
    }

    await batchOp.save()
  } catch (error) {
    console.error('Error executing batch operation:', error)
    batchOp.status = 'failed'
    batchOp.completedAt = new Date()
    await batchOp.save()
  }
}

/**
 * Execute batch import asynchronously
 */
async function executeBatchImport(batchOp: any, entityType: string, data: any[]) {
  try {
    batchOp.status = 'processing'
    batchOp.startedAt = new Date()
    await batchOp.save()

    const results: any[] = []
    let successCount = 0
    let failCount = 0

    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      try {
        let created: any = null

        switch (entityType) {
          case 'agent':
            created = await Agent.create({
              ...item,
              userId: batchOp.userId
            })
            break

          case 'task':
            created = await Task.create({
              ...item,
              userId: batchOp.userId
            })
            break

          case 'user':
            created = await User.create(item)
            break
        }

        results.push({
          itemId: created._id,
          success: true,
          data: created
        })
        successCount++
      } catch (error: any) {
        results.push({
          itemId: `row_${i + 1}`,
          success: false,
          error: error.message
        })
        failCount++

        batchOp.errors.push({
          itemId: `row_${i + 1}`,
          error: error.message,
          timestamp: new Date()
        })
      }

      // Update progress
      batchOp.processedItems = i + 1
      batchOp.progress = Math.round(((i + 1) / data.length) * 100)
      await batchOp.save()
    }

    // Update final status
    batchOp.successfulItems = successCount
    batchOp.failedItems = failCount
    batchOp.results = results
    batchOp.completedAt = new Date()

    if (failCount === 0) {
      batchOp.status = 'completed'
    } else if (successCount === 0) {
      batchOp.status = 'failed'
    } else {
      batchOp.status = 'partial'
    }

    await batchOp.save()
  } catch (error) {
    console.error('Error executing batch import:', error)
    batchOp.status = 'failed'
    batchOp.completedAt = new Date()
    await batchOp.save()
  }
}

/**
 * Validate import data
 */
function validateImportData(entityType: string, data: any[]): Array<{ row: number; field: string; error: string }> {
  const errors: Array<{ row: number; field: string; error: string }> = []

  data.forEach((item, index) => {
    const row = index + 1

    switch (entityType) {
      case 'agent':
        if (!item.name || item.name.trim().length < 2) {
          errors.push({ row, field: 'name', error: 'Name must be at least 2 characters' })
        }
        if (!item.aiModel) {
          errors.push({ row, field: 'aiModel', error: 'AI model is required' })
        }
        break

      case 'task':
        if (!item.title || item.title.trim().length < 3) {
          errors.push({ row, field: 'title', error: 'Title must be at least 3 characters' })
        }
        if (!item.agentId) {
          errors.push({ row, field: 'agentId', error: 'Agent ID is required' })
        }
        break

      case 'user':
        if (!item.email || !/^\S+@\S+\.\S+$/.test(item.email)) {
          errors.push({ row, field: 'email', error: 'Valid email is required' })
        }
        if (!item.username || item.username.trim().length < 3) {
          errors.push({ row, field: 'username', error: 'Username must be at least 3 characters' })
        }
        if (!item.password || item.password.length < 6) {
          errors.push({ row, field: 'password', error: 'Password must be at least 6 characters' })
        }
        break
    }
  })

  return errors
}
