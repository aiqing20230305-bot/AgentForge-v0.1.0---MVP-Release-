/**
 * Plugin Controller
 * Handle CRUD operations for plugins in marketplace
 */

import { Request, Response, NextFunction } from 'express'
import { Plugin } from '../models/Plugin'
import { createError } from '../middleware/errorHandler'
import crypto from 'crypto'

/**
 * Get all plugins (marketplace listing)
 * GET /api/v1/plugins
 */
export const getPlugins = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      category,
      status = 'approved',
      featured,
      verified,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query

    const filter: any = {}

    // Public marketplace only shows approved plugins
    if (!req.user || req.user.role !== 'admin') {
      filter.status = 'approved'
    } else if (status) {
      filter.status = status
    }

    if (category) filter.category = category
    if (featured === 'true') filter.featured = true
    if (verified === 'true') filter.verified = true

    // Text search
    if (search) {
      filter.$text = { $search: search as string }
    }

    const sortOrder = order === 'asc' ? 1 : -1
    const skip = (Number(page) - 1) * Number(limit)

    const plugins = await Plugin.find(filter)
      .sort({ [sortBy as string]: sortOrder })
      .skip(skip)
      .limit(Number(limit))

    const total = await Plugin.countDocuments(filter)

    res.status(200).json({
      success: true,
      count: plugins.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: plugins
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get single plugin by ID or pluginId
 * GET /api/v1/plugins/:id
 */
export const getPlugin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    // Try to find by MongoDB _id first, then by pluginId
    let plugin = await Plugin.findById(id)

    if (!plugin) {
      plugin = await Plugin.findOne({ pluginId: id })
    }

    if (!plugin) {
      throw createError('Plugin not found', 404)
    }

    // Increment view count
    plugin.stats.views += 1
    await plugin.save()

    res.status(200).json({
      success: true,
      data: plugin
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Create/Submit new plugin
 * POST /api/v1/plugins
 */
export const createPlugin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const {
      pluginId,
      name,
      version,
      description,
      longDescription,
      manifest,
      packageUrl,
      packageSize,
      category,
      tags,
      media,
      support,
      pricing,
      opensource
    } = req.body

    // Validate required fields
    if (!pluginId || !name || !version || !description || !manifest || !packageUrl || !category) {
      throw createError('Missing required fields', 400)
    }

    // Check if plugin ID already exists
    const existingPlugin = await Plugin.findOne({ pluginId })
    if (existingPlugin) {
      throw createError('Plugin ID already exists', 409)
    }

    // Validate manifest
    const requiredManifestFields = ['id', 'name', 'version', 'description', 'author', 'license', 'main', 'permissions', 'minVersion']
    for (const field of requiredManifestFields) {
      if (!manifest[field]) {
        throw createError(`Manifest missing required field: ${field}`, 400)
      }
    }

    // Generate package hash (in production, download and verify)
    const packageHash = crypto.createHash('sha256').update(packageUrl).digest('hex')

    // Create plugin
    const plugin = await Plugin.create({
      pluginId,
      name,
      version,
      description,
      longDescription,
      author: {
        name: manifest.author,
        email: req.user.email || 'no-email@example.com',
        userId: req.user.userId
      },
      manifest,
      package: {
        url: packageUrl,
        size: packageSize || 0,
        hash: packageHash,
        downloadCount: 0
      },
      category,
      tags: tags || [],
      status: 'pending_review',
      media: media || { screenshots: [] },
      support: support || {},
      pricing: pricing || { model: 'free' },
      opensource: opensource || false,
      verified: false,
      featured: false
    })

    res.status(201).json({
      success: true,
      message: 'Plugin submitted successfully and pending review',
      data: plugin
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update plugin (author or admin)
 * PUT /api/v1/plugins/:id
 */
export const updatePlugin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const { id } = req.params

    let plugin = await Plugin.findById(id)

    if (!plugin) {
      plugin = await Plugin.findOne({ pluginId: id })
    }

    if (!plugin) {
      throw createError('Plugin not found', 404)
    }

    // Check permissions: author or admin
    const isAuthor = plugin.author.userId === req.user.userId
    const isAdmin = req.user.role === 'admin'

    if (!isAuthor && !isAdmin) {
      throw createError('Not authorized to update this plugin', 403)
    }

    const {
      name,
      version,
      description,
      longDescription,
      manifest,
      packageUrl,
      packageSize,
      category,
      tags,
      media,
      support,
      pricing
    } = req.body

    // Update allowed fields
    const updateFields: any = {}

    if (name) updateFields.name = name
    if (version) updateFields.version = version
    if (description) updateFields.description = description
    if (longDescription !== undefined) updateFields.longDescription = longDescription
    if (manifest) updateFields.manifest = manifest
    if (category) updateFields.category = category
    if (tags) updateFields.tags = tags
    if (media) updateFields.media = media
    if (support) updateFields.support = support
    if (pricing) updateFields.pricing = pricing

    if (packageUrl) {
      updateFields['package.url'] = packageUrl
      updateFields['package.hash'] = crypto.createHash('sha256').update(packageUrl).digest('hex')
    }

    if (packageSize) {
      updateFields['package.size'] = packageSize
    }

    // If content changes, reset to pending review (unless admin)
    if ((manifest || packageUrl) && !isAdmin) {
      updateFields.status = 'pending_review'
      updateFields['reviewStatus.securityChecked'] = false
      updateFields['reviewStatus.codeReviewed'] = false
    }

    updateFields['stats.lastUpdated'] = new Date()

    const updatedPlugin = await Plugin.findByIdAndUpdate(
      plugin._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    )

    res.status(200).json({
      success: true,
      message: 'Plugin updated successfully',
      data: updatedPlugin
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Delete plugin (author or admin)
 * DELETE /api/v1/plugins/:id
 */
export const deletePlugin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const { id } = req.params

    let plugin = await Plugin.findById(id)

    if (!plugin) {
      plugin = await Plugin.findOne({ pluginId: id })
    }

    if (!plugin) {
      throw createError('Plugin not found', 404)
    }

    // Check permissions
    const isAuthor = plugin.author.userId === req.user.userId
    const isAdmin = req.user.role === 'admin'

    if (!isAuthor && !isAdmin) {
      throw createError('Not authorized to delete this plugin', 403)
    }

    await Plugin.findByIdAndDelete(plugin._id)

    res.status(200).json({
      success: true,
      message: 'Plugin deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Install plugin (track installation)
 * POST /api/v1/plugins/:id/install
 */
export const installPlugin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    let plugin = await Plugin.findById(id)

    if (!plugin) {
      plugin = await Plugin.findOne({ pluginId: id })
    }

    if (!plugin) {
      throw createError('Plugin not found', 404)
    }

    if (plugin.status !== 'approved') {
      throw createError('Plugin is not approved for installation', 403)
    }

    // Increment install counters
    await plugin.incrementDownloads()

    res.status(200).json({
      success: true,
      message: 'Plugin installation tracked',
      data: {
        downloadUrl: plugin.package.url,
        hash: plugin.package.hash,
        manifest: plugin.manifest
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Rate plugin
 * POST /api/v1/plugins/:id/rate
 */
export const ratePlugin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const { id } = req.params
    const { rating } = req.body

    if (!rating || rating < 1 || rating > 5) {
      throw createError('Rating must be between 1 and 5', 400)
    }

    let plugin = await Plugin.findById(id)

    if (!plugin) {
      plugin = await Plugin.findOne({ pluginId: id })
    }

    if (!plugin) {
      throw createError('Plugin not found', 404)
    }

    await plugin.updateRating(rating)

    res.status(200).json({
      success: true,
      message: 'Plugin rated successfully',
      data: {
        averageRating: plugin.rating.average,
        totalRatings: plugin.rating.count
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Review plugin (admin only)
 * POST /api/v1/plugins/:id/review
 */
export const reviewPlugin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw createError('Admin access required', 403)
    }

    const { id } = req.params
    const { status, comments, securityChecked, codeReviewed } = req.body

    if (!status || !['approved', 'rejected'].includes(status)) {
      throw createError('Invalid review status', 400)
    }

    let plugin = await Plugin.findById(id)

    if (!plugin) {
      plugin = await Plugin.findOne({ pluginId: id })
    }

    if (!plugin) {
      throw createError('Plugin not found', 404)
    }

    plugin.status = status
    plugin.reviewStatus = {
      reviewer: req.user.userId,
      reviewedAt: new Date(),
      comments: comments || '',
      securityChecked: securityChecked || false,
      codeReviewed: codeReviewed || false
    }

    if (status === 'approved') {
      plugin.publishedAt = new Date()
    }

    await plugin.save()

    res.status(200).json({
      success: true,
      message: `Plugin ${status} successfully`,
      data: plugin
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Feature plugin (admin only)
 * POST /api/v1/plugins/:id/feature
 */
export const featurePlugin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw createError('Admin access required', 403)
    }

    const { id } = req.params
    const { featured } = req.body

    let plugin = await Plugin.findById(id)

    if (!plugin) {
      plugin = await Plugin.findOne({ pluginId: id })
    }

    if (!plugin) {
      throw createError('Plugin not found', 404)
    }

    plugin.featured = featured !== false
    await plugin.save()

    res.status(200).json({
      success: true,
      message: `Plugin ${plugin.featured ? 'featured' : 'unfeatured'} successfully`,
      data: plugin
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Verify plugin developer (admin only)
 * POST /api/v1/plugins/:id/verify
 */
export const verifyPlugin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw createError('Admin access required', 403)
    }

    const { id } = req.params
    const { verified } = req.body

    let plugin = await Plugin.findById(id)

    if (!plugin) {
      plugin = await Plugin.findOne({ pluginId: id })
    }

    if (!plugin) {
      throw createError('Plugin not found', 404)
    }

    plugin.verified = verified !== false
    await plugin.save()

    res.status(200).json({
      success: true,
      message: `Plugin ${plugin.verified ? 'verified' : 'unverified'} successfully`,
      data: plugin
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get plugin statistics
 * GET /api/v1/plugins/stats
 */
export const getPluginStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await Plugin.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalInstalls: { $sum: '$stats.installs' },
          avgRating: { $avg: '$rating.average' }
        }
      }
    ])

    const totalPlugins = await Plugin.countDocuments({ status: 'approved' })
    const featuredPlugins = await Plugin.countDocuments({ status: 'approved', featured: true })
    const pendingReview = await Plugin.countDocuments({ status: 'pending_review' })

    const topRated = await Plugin.find({ status: 'approved' })
      .sort({ 'rating.average': -1 })
      .limit(10)
      .select('pluginId name rating.average stats.installs')

    const mostInstalled = await Plugin.find({ status: 'approved' })
      .sort({ 'stats.installs': -1 })
      .limit(10)
      .select('pluginId name stats.installs rating.average')

    res.status(200).json({
      success: true,
      data: {
        totalPlugins,
        featuredPlugins,
        pendingReview,
        byCategory: stats,
        topRated,
        mostInstalled
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get user's plugins (author)
 * GET /api/v1/plugins/my
 */
export const getMyPlugins = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401)
    }

    const plugins = await Plugin.find({ 'author.userId': req.user.userId })
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: plugins.length,
      data: plugins
    })
  } catch (error) {
    next(error)
  }
}
