/**
 * Agent Model
 * Mongoose schema for AI agents
 */

import mongoose, { Document, Schema } from 'mongoose'

export interface IAgent extends Document {
  userId: string
  name: string
  aiModel: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  status: 'idle' | 'busy' | 'error'

  // RPG attributes
  level: number
  experience: number

  // Statistics
  tasksCompleted: number
  tokensUsed: number
  totalUptime: number

  // Metadata
  avatar?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const agentSchema = new Schema<IAgent>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Agent name is required'],
      trim: true,
      minlength: [2, 'Agent name must be at least 2 characters'],
      maxlength: [50, 'Agent name must be less than 50 characters']
    },
    aiModel: {
      type: String,
      required: [true, 'AI model is required'],
      enum: ['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
      default: 'gpt-3.5-turbo'
    },
    systemPrompt: {
      type: String,
      maxlength: [2000, 'System prompt must be less than 2000 characters']
    },
    temperature: {
      type: Number,
      min: [0, 'Temperature must be at least 0'],
      max: [2, 'Temperature must be at most 2'],
      default: 0.7
    },
    maxTokens: {
      type: Number,
      min: [100, 'Max tokens must be at least 100'],
      max: [32000, 'Max tokens must be at most 32000'],
      default: 2000
    },
    status: {
      type: String,
      enum: ['idle', 'busy', 'error'],
      default: 'idle'
    },
    level: {
      type: Number,
      min: [1, 'Level must be at least 1'],
      max: [100, 'Level must be at most 100'],
      default: 1
    },
    experience: {
      type: Number,
      min: [0, 'Experience must be non-negative'],
      default: 0
    },
    tasksCompleted: {
      type: Number,
      min: [0, 'Tasks completed must be non-negative'],
      default: 0
    },
    tokensUsed: {
      type: Number,
      min: [0, 'Tokens used must be non-negative'],
      default: 0
    },
    totalUptime: {
      type: Number,
      min: [0, 'Total uptime must be non-negative'],
      default: 0
    },
    avatar: {
      type: String,
      default: null
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
agentSchema.index({ userId: 1, createdAt: -1 })
agentSchema.index({ userId: 1, status: 1 })
agentSchema.index({ userId: 1, level: -1 })

export const Agent = mongoose.model<IAgent>('Agent', agentSchema)
