/**
 * Rate Limit Management Routes
 * v2.5.0 Phase 3.2 - API Rate Limiting
 *
 * 速率限制管理API路由
 */

import { Router, Request, Response } from 'express';
import { rateLimitService } from '../services/rateLimitService';
import { RateLimitConfig } from '../config/rateLimitConfig';

const router = Router();

/**
 * GET /api/rate-limit/summary
 * 获取速率限制摘要
 */
router.get('/summary', (req: Request, res: Response) => {
  try {
    const summary = rateLimitService.getSummary();

    res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to get summary',
      message: error.message,
    });
  }
});

/**
 * GET /api/rate-limit/config
 * 获取完整配置
 */
router.get('/config', (req: Request, res: Response) => {
  try {
    const config = rateLimitService.getConfig();

    res.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to get config',
      message: error.message,
    });
  }
});

/**
 * PUT /api/rate-limit/config
 * 更新配置
 */
router.put('/config', (req: Request, res: Response) => {
  try {
    const updates: Partial<RateLimitConfig> = req.body;

    rateLimitService.updateConfig(updates);

    res.json({
      success: true,
      message: 'Configuration updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to update config',
      message: error.message,
    });
  }
});

/**
 * GET /api/rate-limit/whitelist
 * 获取白名单
 */
router.get('/whitelist', (req: Request, res: Response) => {
  try {
    const whitelist = rateLimitService.getWhitelist();

    res.json({
      success: true,
      data: whitelist,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to get whitelist',
      message: error.message,
    });
  }
});

/**
 * POST /api/rate-limit/whitelist
 * 添加IP到白名单
 */
router.post('/whitelist', (req: Request, res: Response) => {
  try {
    const { ip } = req.body;

    if (!ip) {
      return res.status(400).json({
        success: false,
        error: 'IP address is required',
      });
    }

    rateLimitService.addToWhitelist(ip);

    res.json({
      success: true,
      message: `IP ${ip} added to whitelist`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to add to whitelist',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/rate-limit/whitelist/:ip
 * 从白名单移除IP
 */
router.delete('/whitelist/:ip', (req: Request, res: Response) => {
  try {
    const { ip } = req.params;

    rateLimitService.removeFromWhitelist(ip);

    res.json({
      success: true,
      message: `IP ${ip} removed from whitelist`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to remove from whitelist',
      message: error.message,
    });
  }
});

/**
 * GET /api/rate-limit/blacklist
 * 获取黑名单
 */
router.get('/blacklist', (req: Request, res: Response) => {
  try {
    const blacklist = rateLimitService.getBlacklist();

    res.json({
      success: true,
      data: blacklist,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to get blacklist',
      message: error.message,
    });
  }
});

/**
 * POST /api/rate-limit/blacklist
 * 添加IP到黑名单
 */
router.post('/blacklist', (req: Request, res: Response) => {
  try {
    const { ip } = req.body;

    if (!ip) {
      return res.status(400).json({
        success: false,
        error: 'IP address is required',
      });
    }

    rateLimitService.addToBlacklist(ip);

    res.json({
      success: true,
      message: `IP ${ip} added to blacklist`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to add to blacklist',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/rate-limit/blacklist/:ip
 * 从黑名单移除IP
 */
router.delete('/blacklist/:ip', (req: Request, res: Response) => {
  try {
    const { ip } = req.params;

    rateLimitService.removeFromBlacklist(ip);

    res.json({
      success: true,
      message: `IP ${ip} removed from blacklist`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to remove from blacklist',
      message: error.message,
    });
  }
});

/**
 * GET /api/rate-limit/status/:identifier
 * 获取特定标识符的速率限制状态
 */
router.get('/status/:identifier', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;

    const status = await rateLimitService.getStatus(identifier);

    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'No rate limit data found for this identifier',
      });
    }

    res.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to get status',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/rate-limit/clear/:identifier
 * 清除特定标识符的速率限制
 */
router.delete('/clear/:identifier', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;

    const success = await rateLimitService.clearLimit(identifier);

    if (!success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to clear rate limit',
      });
    }

    res.json({
      success: true,
      message: `Rate limit cleared for ${identifier}`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear rate limit',
      message: error.message,
    });
  }
});

/**
 * GET /api/rate-limit/activity
 * 获取活动日志
 */
router.get('/activity', (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

    const activities = rateLimitService.getActivityLog(limit);

    res.json({
      success: true,
      data: activities,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to get activity log',
      message: error.message,
    });
  }
});

/**
 * GET /api/rate-limit/statistics
 * 获取统计信息
 */
router.get('/statistics', (req: Request, res: Response) => {
  try {
    const statistics = rateLimitService.getStatistics();

    res.json({
      success: true,
      data: statistics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
      message: error.message,
    });
  }
});

/**
 * POST /api/rate-limit/enable
 * 启用速率限制
 */
router.post('/enable', (req: Request, res: Response) => {
  try {
    rateLimitService.enable();

    res.json({
      success: true,
      message: 'Rate limiting enabled',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to enable rate limiting',
      message: error.message,
    });
  }
});

/**
 * POST /api/rate-limit/disable
 * 禁用速率限制
 */
router.post('/disable', (req: Request, res: Response) => {
  try {
    rateLimitService.disable();

    res.json({
      success: true,
      message: 'Rate limiting disabled',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to disable rate limiting',
      message: error.message,
    });
  }
});

/**
 * GET /api/rate-limit/export
 * 导出配置
 */
router.get('/export', (req: Request, res: Response) => {
  try {
    const configJson = rateLimitService.exportConfig();

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=rate-limit-config.json'
    );
    res.send(configJson);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to export config',
      message: error.message,
    });
  }
});

/**
 * POST /api/rate-limit/import
 * 导入配置
 */
router.post('/import', (req: Request, res: Response) => {
  try {
    const configJson = JSON.stringify(req.body);

    rateLimitService.importConfig(configJson);

    res.json({
      success: true,
      message: 'Configuration imported successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: 'Failed to import config',
      message: error.message,
    });
  }
});

/**
 * POST /api/rate-limit/reset
 * 重置为默认配置
 */
router.post('/reset', (req: Request, res: Response) => {
  try {
    rateLimitService.resetToDefaults();

    res.json({
      success: true,
      message: 'Configuration reset to defaults',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to reset config',
      message: error.message,
    });
  }
});

export default router;
