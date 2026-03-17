/**
 * Plugin Model
 * Mongoose schema for plugin marketplace
 */

import mongoose, { Document, Schema } from 'mongoose'

export interface IPlugin extends Document {
  // Basic Information
  pluginId: string // Unique identifier (e.g., 'github-pro')
  name: string // Display name
  version: string // Semantic version (e.g., '1.2.3')
  description: string
  longDescription?: string // Markdown supported
  author: {
    name: string
    email: string
    url?: string
    userId?: string // Link to internal user if applicable
  }

  // Technical Details
  manifest: {
    id: string
    name: string
    version: string
    description: string
    author: string
    homepage?: string
    repository?: string
    license: string
    main: string // Entry point
    icon?: string
    keywords: string[]
    dependencies?: Record<string, string>
    permissions: string[]
    minVersion: string // Min AgentForge version
    maxVersion?: string // Max AgentForge version
  }

  // Distribution
  package: {
    url: string // Download URL
    size: number // Package size in bytes
    hash: string // SHA256 hash for integrity
    downloadCount: number
  }

  // Categorization
  category: 'integration' | 'workflow' | 'ai' | 'developer-tools' | 'productivity' | 'analytics' | 'communication'
  tags: string[]

  // Status & Review
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'deprecated'
  reviewStatus: {
    reviewer?: string
    reviewedAt?: Date
    comments?: string
    securityChecked: boolean
    codeReviewed: boolean
  }

  // Ratings & Reviews
  rating: {
    average: number // 0-5
    count: number
    distribution: {
      1: number
      2: number
      3: number
      4: number
      5: number
    }
  }

  // Statistics
  stats: {
    installs: number
    activeInstalls: number
    views: number
    lastUpdated: Date
  }

  // Compatibility
  compatibility: {
    agentForgeVersions: string[] // ['1.4.x', '1.5.x']
    platforms: string[] // ['web', 'desktop', 'mobile']
  }

  // Screenshots & Media
  media: {
    screenshots: string[] // URLs
    videos?: string[]
    banner?: string
  }

  // Support & Documentation
  support: {
    email?: string
    url?: string
    documentation?: string
    changelog?: string
  }

  // Pricing (for future paid plugins)
  pricing: {
    model: 'free' | 'freemium' | 'paid' | 'subscription'
    price?: number
    currency?: string
    trialDays?: number
  }

  // Metadata
  featured: boolean
  verified: boolean // Official or verified developer
  opensource: boolean
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  deprecatedAt?: Date
}

const pluginSchema = new Schema<IPlugin>(
  {
    pluginId: {
      type: String,
      required: [true, 'Plugin ID is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Plugin ID can only contain lowercase letters, numbers, and hyphens'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Plugin name is required'],
      trim: true,
      minlength: [3, 'Plugin name must be at least 3 characters'],
      maxlength: [100, 'Plugin name must be less than 100 characters']
    },
    version: {
      type: String,
      required: [true, 'Version is required'],
      match: [/^\d+\.\d+\.\d+$/, 'Version must follow semantic versioning (e.g., 1.2.3)']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [500, 'Description must be less than 500 characters']
    },
    longDescription: {
      type: String,
      maxlength: [10000, 'Long description must be less than 10000 characters']
    },
    author: {
      name: {
        type: String,
        required: [true, 'Author name is required']
      },
      email: {
        type: String,
        required: [true, 'Author email is required'],
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
      },
      url: String,
      userId: String
    },
    manifest: {
      type: Schema.Types.Mixed,
      required: [true, 'Manifest is required']
    },
    package: {
      url: {
        type: String,
        required: [true, 'Package URL is required']
      },
      size: {
        type: Number,
        required: [true, 'Package size is required'],
        min: [0, 'Package size must be non-negative']
      },
      hash: {
        type: String,
        required: [true, 'Package hash is required']
      },
      downloadCount: {
        type: Number,
        default: 0,
        min: [0, 'Download count must be non-negative']
      }
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['integration', 'workflow', 'ai', 'developer-tools', 'productivity', 'analytics', 'communication'],
      index: true
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function(v: string[]) {
          return v.length <= 10
        },
        message: 'Maximum 10 tags allowed'
      }
    },
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'approved', 'rejected', 'deprecated'],
      default: 'draft',
      index: true
    },
    reviewStatus: {
      reviewer: String,
      reviewedAt: Date,
      comments: String,
      securityChecked: {
        type: Boolean,
        default: false
      },
      codeReviewed: {
        type: Boolean,
        default: false
      }
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: [0, 'Rating must be between 0 and 5'],
        max: [5, 'Rating must be between 0 and 5']
      },
      count: {
        type: Number,
        default: 0,
        min: [0, 'Rating count must be non-negative']
      },
      distribution: {
        1: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        5: { type: Number, default: 0 }
      }
    },
    stats: {
      installs: {
        type: Number,
        default: 0,
        min: [0, 'Installs must be non-negative']
      },
      activeInstalls: {
        type: Number,
        default: 0,
        min: [0, 'Active installs must be non-negative']
      },
      views: {
        type: Number,
        default: 0,
        min: [0, 'Views must be non-negative']
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      }
    },
    compatibility: {
      agentForgeVersions: {
        type: [String],
        default: ['1.4.x']
      },
      platforms: {
        type: [String],
        default: ['web', 'desktop']
      }
    },
    media: {
      screenshots: {
        type: [String],
        default: []
      },
      videos: [String],
      banner: String
    },
    support: {
      email: String,
      url: String,
      documentation: String,
      changelog: String
    },
    pricing: {
      model: {
        type: String,
        enum: ['free', 'freemium', 'paid', 'subscription'],
        default: 'free'
      },
      price: Number,
      currency: String,
      trialDays: Number
    },
    featured: {
      type: Boolean,
      default: false,
      index: true
    },
    verified: {
      type: Boolean,
      default: false,
      index: true
    },
    opensource: {
      type: Boolean,
      default: false
    },
    publishedAt: Date,
    deprecatedAt: Date
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
pluginSchema.index({ pluginId: 1, version: 1 }, { unique: true })
pluginSchema.index({ status: 1, featured: -1, 'rating.average': -1 })
pluginSchema.index({ category: 1, status: 1 })
pluginSchema.index({ tags: 1 })
pluginSchema.index({ 'author.userId': 1 })
pluginSchema.index({ createdAt: -1 })
pluginSchema.index({ 'stats.installs': -1 })
pluginSchema.index({ 'rating.average': -1 })

// Text search index
pluginSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text'
})

// Virtual for full plugin identifier
pluginSchema.virtual('fullId').get(function() {
  return `${this.pluginId}@${this.version}`
})

// Methods
pluginSchema.methods.incrementDownloads = async function() {
  this.package.downloadCount += 1
  this.stats.installs += 1
  return this.save()
}

pluginSchema.methods.updateRating = async function(newRating: number) {
  const { rating } = this

  // Update distribution
  if (newRating >= 1 && newRating <= 5) {
    rating.distribution[newRating] += 1
    rating.count += 1

    // Recalculate average
    let sum = 0
    for (let i = 1; i <= 5; i++) {
      sum += i * rating.distribution[i]
    }
    rating.average = sum / rating.count

    return this.save()
  }

  throw new Error('Rating must be between 1 and 5')
}

pluginSchema.methods.isCompatibleWith = function(agentForgeVersion: string): boolean {
  const { minVersion, maxVersion } = this.manifest

  // Simple version comparison (can be enhanced)
  const compare = (v1: string, v2: string): number => {
    const parts1 = v1.split('.').map(Number)
    const parts2 = v2.split('.').map(Number)

    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1
      if (parts1[i] < parts2[i]) return -1
    }
    return 0
  }

  if (compare(agentForgeVersion, minVersion) < 0) return false
  if (maxVersion && compare(agentForgeVersion, maxVersion) > 0) return false

  return true
}

export const Plugin = mongoose.model<IPlugin>('Plugin', pluginSchema)
