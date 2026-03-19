/**
 * Batch Operation Service
 * Handles batch operations for agents, tasks, and users
 */

export type BatchOperationType =
  | 'agent_create' | 'agent_update' | 'agent_delete' | 'agent_activate' | 'agent_deactivate' | 'agent_export'
  | 'task_create' | 'task_update' | 'task_delete' | 'task_assign' | 'task_complete' | 'task_export'
  | 'user_create' | 'user_update' | 'user_delete' | 'user_activate' | 'user_deactivate' | 'user_export'

export type BatchStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'partial'

export interface BatchOperation {
  id: string
  userId: string
  operationType: BatchOperationType
  status: BatchStatus
  targetIds: string[]
  totalItems: number
  processedItems: number
  successfulItems: number
  failedItems: number
  operationData?: Record<string, any>
  results: Array<{
    itemId: string
    success: boolean
    error?: string
    data?: any
  }>
  startedAt?: string
  completedAt?: string
  progress: number
  errors: Array<{
    itemId: string
    error: string
    timestamp: string
  }>
  fileName?: string
  fileType?: 'csv' | 'excel' | 'json'
  importData?: any[]
  validationErrors?: Array<{
    row: number
    field: string
    error: string
  }>
  createdAt: string
  updatedAt: string
}

export interface BatchOperationCreateInput {
  operationType: BatchOperationType
  targetIds: string[]
  operationData?: Record<string, any>
}

export interface BatchImportInput {
  entityType: 'agent' | 'task' | 'user'
  data: any[]
  fileName?: string
  fileType?: 'csv' | 'excel' | 'json'
}

export interface BatchExportInput {
  entityType: 'agent' | 'task' | 'user'
  ids: string[]
  format?: 'csv' | 'excel' | 'json'
  fields?: string[]
}

export interface BatchOperationListQuery {
  status?: BatchStatus
  operationType?: BatchOperationType
  limit?: number
  skip?: number
}

class BatchOperationService {
  private baseUrl = '/api/batch'

  /**
   * Create a new batch operation
   */
  async createBatchOperation(input: BatchOperationCreateInput): Promise<BatchOperation> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create batch operation')
      }

      return await response.json()
    } catch (error: any) {
      console.error('Error creating batch operation:', error)
      throw error
    }
  }

  /**
   * Execute a batch operation
   */
  async executeBatchOperation(id: string): Promise<BatchOperation> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to execute batch operation')
      }

      const result = await response.json()
      return result.operation
    } catch (error: any) {
      console.error('Error executing batch operation:', error)
      throw error
    }
  }

  /**
   * Get batch operation by ID
   */
  async getBatchOperation(id: string): Promise<BatchOperation> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to get batch operation')
      }

      return await response.json()
    } catch (error: any) {
      console.error('Error getting batch operation:', error)
      throw error
    }
  }

  /**
   * List all batch operations
   */
  async listBatchOperations(query?: BatchOperationListQuery): Promise<{
    operations: BatchOperation[]
    total: number
    limit: number
    skip: number
  }> {
    try {
      const params = new URLSearchParams()
      if (query?.status) params.append('status', query.status)
      if (query?.operationType) params.append('operationType', query.operationType)
      if (query?.limit) params.append('limit', query.limit.toString())
      if (query?.skip) params.append('skip', query.skip.toString())

      const response = await fetch(`${this.baseUrl}?${params.toString()}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to list batch operations')
      }

      return await response.json()
    } catch (error: any) {
      console.error('Error listing batch operations:', error)
      throw error
    }
  }

  /**
   * Cancel a batch operation
   */
  async cancelBatchOperation(id: string): Promise<BatchOperation> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel batch operation')
      }

      const result = await response.json()
      return result.operation
    } catch (error: any) {
      console.error('Error cancelling batch operation:', error)
      throw error
    }
  }

  /**
   * Delete a batch operation
   */
  async deleteBatchOperation(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete batch operation')
      }
    } catch (error: any) {
      console.error('Error deleting batch operation:', error)
      throw error
    }
  }

  /**
   * Import data from CSV/Excel
   */
  async batchImport(input: BatchImportInput): Promise<BatchOperation> {
    try {
      const response = await fetch(`${this.baseUrl}/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to import data')
      }

      const result = await response.json()
      return result.operation
    } catch (error: any) {
      console.error('Error importing data:', error)
      throw error
    }
  }

  /**
   * Export data to CSV/Excel
   */
  async batchExport(input: BatchExportInput): Promise<{
    operation: BatchOperation
    data: any[]
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to export data')
      }

      return await response.json()
    } catch (error: any) {
      console.error('Error exporting data:', error)
      throw error
    }
  }

  /**
   * Poll for batch operation status
   */
  async pollBatchOperation(
    id: string,
    onProgress?: (operation: BatchOperation) => void,
    intervalMs: number = 1000
  ): Promise<BatchOperation> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const operation = await this.getBatchOperation(id)

          if (onProgress) {
            onProgress(operation)
          }

          if (operation.status === 'completed' || operation.status === 'failed' || operation.status === 'partial') {
            resolve(operation)
          } else {
            setTimeout(poll, intervalMs)
          }
        } catch (error) {
          reject(error)
        }
      }

      poll()
    })
  }
}

export const batchOperationService = new BatchOperationService()
