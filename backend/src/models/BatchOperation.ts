/**
 * BatchOperation Model
 * Mongoose schema for batch operations tracking
 */

import mongoose, { Document, Schema } from 'mongoose'

export type BatchOperationType =
  | 'agent_create' | 'agent_update' | 'agent_delete' | 'agent_activate' | 'agent_deactivate' | 'agent_export'
  | 'task_create' | 'task_update' | 'task_delete' | 'task_assign' | 'task_complete' | 'task_export'
  | 'user_create' | 'user_update' | 'user_delete' | 'user_activate' | 'user_deactivate' | 'user_export'

export type BatchStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'partial'

export interface IBatchOperation extends Document {
  userId: string
  operationType: BatchOperationType
  status: BatchStatus

  // Target items
  targetIds: string[]
  totalItems: number
  processedItems: number
  successfulItems: number
  failedItems: number

  // Operation data
  operationData?: Record<string, any>

  // Results
  results: Array<{
    itemId: string
    success: boolean
    error?: string
    data?: any
  }>

  // Progress tracking
  startedAt?: Date
  completedAt?: Date
  progress: number // 0-100

  // Error tracking
  errors: Array<{
    itemId: string
    error: string
    timestamp: Date
  }>

  // Import/Export specific
  fileName?: string
  fileType?: 'csv' | 'excel' | 'json'
  importData?: any[]
  validationErrors?: Array<{
    row: number
    field: string
    error: string
  }>

  createdAt: Date
  updatedAt: Date
}

const batchOperationSchema = new Schema<IBatchOperation>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true
    },
    operationType: {
      type: String,
      required: [true, 'Operation type is required'],
      enum: [
        'agent_create', 'agent_update', 'agent_delete', 'agent_activate', 'agent_deactivate', 'agent_export',
        'task_create', 'task_update', 'task_delete', 'task_assign', 'task_complete', 'task_export',
        'user_create', 'user_update', 'user_delete', 'user_activate', 'user_deactivate', 'user_export'
      ],
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'partial'],
      default: 'pending',
      index: true
    },
    targetIds: {
      type: [String],
      default: []
    },
    totalItems: {
      type: Number,
      default: 0,
      min: [0, 'Total items must be non-negative']
    },
    processedItems: {
      type: Number,
      default: 0,
      min: [0, 'Processed items must be non-negative']
    },
    successfulItems: {
      type: Number,
      default: 0,
      min: [0, 'Successful items must be non-negative']
    },
    failedItems: {
      type: Number,
      default: 0,
      min: [0, 'Failed items must be non-negative']
    },
    operationData: {
      type: Schema.Types.Mixed,
      default: {}
    },
    results: {
      type: [
        {
          itemId: String,
          success: Boolean,
          error: String,
          data: Schema.Types.Mixed
        }
      ],
      default: []
    },
    startedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, 'Progress must be at least 0'],
      max: [100, 'Progress must be at most 100']
    },
    errors: {
      type: [
        {
          itemId: String,
          error: String,
          timestamp: { type: Date, default: Date.now }
        }
      ],
      default: []
    },
    fileName: {
      type: String
    },
    fileType: {
      type: String,
      enum: ['csv', 'excel', 'json']
    },
    importData: {
      type: [Schema.Types.Mixed],
      default: []
    },
    validationErrors: {
      type: [
        {
          row: Number,
          field: String,
          error: String
        }
      ],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret
      }
    }
  }
)

// Indexes for performance
batchOperationSchema.index({ userId: 1, status: 1, createdAt: -1 })
batchOperationSchema.index({ userId: 1, operationType: 1, createdAt: -1 })
batchOperationSchema.index({ status: 1, createdAt: 1 })

export const BatchOperation = mongoose.model<IBatchOperation>('BatchOperation', batchOperationSchema)
