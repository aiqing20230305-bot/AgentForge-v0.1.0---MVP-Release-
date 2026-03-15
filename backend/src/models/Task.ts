/**
 * Task Model
 * Mongoose schema for agent tasks
 */

import mongoose, { Document, Schema } from 'mongoose'

export interface ITask extends Document {
  userId: string
  agentId: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high' | 'urgent'

  // Execution details
  result?: string
  errorMessage?: string
  executionLog: string[]

  // Metrics
  estimatedDuration?: number
  actualDuration?: number
  tokensUsed?: number
  retryCount: number

  // Scheduling
  scheduledAt?: Date
  startedAt?: Date
  completedAt?: Date

  // Metadata
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const taskSchema = new Schema<ITask>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true
    },
    agentId: {
      type: String,
      required: [true, 'Agent ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Task title must be at least 3 characters'],
      maxlength: [200, 'Task title must be less than 200 characters']
    },
    description: {
      type: String,
      maxlength: [5000, 'Task description must be less than 5000 characters']
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed'],
      default: 'pending',
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true
    },
    result: {
      type: String,
      maxlength: [10000, 'Task result must be less than 10000 characters']
    },
    errorMessage: {
      type: String,
      maxlength: [2000, 'Error message must be less than 2000 characters']
    },
    executionLog: {
      type: [String],
      default: []
    },
    estimatedDuration: {
      type: Number,
      min: [0, 'Estimated duration must be non-negative']
    },
    actualDuration: {
      type: Number,
      min: [0, 'Actual duration must be non-negative']
    },
    tokensUsed: {
      type: Number,
      min: [0, 'Tokens used must be non-negative']
    },
    retryCount: {
      type: Number,
      min: [0, 'Retry count must be non-negative'],
      default: 0
    },
    scheduledAt: {
      type: Date
    },
    startedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    tags: {
      type: [String],
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
taskSchema.index({ userId: 1, status: 1, createdAt: -1 })
taskSchema.index({ agentId: 1, status: 1 })
taskSchema.index({ userId: 1, priority: -1, createdAt: -1 })
taskSchema.index({ scheduledAt: 1 })

export const Task = mongoose.model<ITask>('Task', taskSchema)
