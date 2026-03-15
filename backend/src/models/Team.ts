/**
 * Team Model
 * Mongoose schema for collaborative teams
 */

import mongoose, { Document, Schema } from 'mongoose'

export interface ITeamMember {
  agentId: string
  agentName: string
  role: 'leader' | 'member'
  joinedAt: Date
}

export interface ITeam extends Document {
  userId: string
  name: string
  description?: string
  members: ITeamMember[]

  // Statistics
  tasksCompleted: number
  totalTokensUsed: number

  // Settings
  isPublic: boolean
  maxMembers: number

  // Metadata
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const teamMemberSchema = new Schema<ITeamMember>(
  {
    agentId: {
      type: String,
      required: true
    },
    agentName: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['leader', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
)

const teamSchema = new Schema<ITeam>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      minlength: [3, 'Team name must be at least 3 characters'],
      maxlength: [50, 'Team name must be less than 50 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Team description must be less than 500 characters']
    },
    members: {
      type: [teamMemberSchema],
      default: [],
      validate: {
        validator: function (this: ITeam, members: ITeamMember[]): boolean {
          return members.length <= this.maxMembers
        },
        message: 'Team cannot exceed maximum members limit'
      }
    },
    tasksCompleted: {
      type: Number,
      min: [0, 'Tasks completed must be non-negative'],
      default: 0
    },
    totalTokensUsed: {
      type: Number,
      min: [0, 'Total tokens used must be non-negative'],
      default: 0
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    maxMembers: {
      type: Number,
      min: [2, 'Max members must be at least 2'],
      max: [20, 'Max members must be at most 20'],
      default: 5
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
teamSchema.index({ userId: 1, createdAt: -1 })
teamSchema.index({ isPublic: 1, createdAt: -1 })
teamSchema.index({ 'members.agentId': 1 })

export const Team = mongoose.model<ITeam>('Team', teamSchema)
