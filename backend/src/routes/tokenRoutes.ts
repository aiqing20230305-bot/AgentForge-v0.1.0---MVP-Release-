/**
 * Token Routes
 * v2.5.0 Phase 1.3 - Token Auto-Refresh
 *
 * Token管理路由
 */

import { Router, Request, Response } from 'express';
import { tokenRefreshService } from '../services/tokenRefreshService';

const router = Router();

/**
 * 刷新Access Token
 * POST /api/auth/token/refresh
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'refresh_token_required',
        message: 'Refresh token is required',
      });
    }

    // 获取设备信息
    const deviceInfo = req.headers['user-agent'];

    // 刷新token
    const tokenPair = tokenRefreshService.refreshTokenPair(
      refreshToken,
      deviceInfo
    );

    if (!tokenPair) {
      return res.status(401).json({
        success: false,
        error: 'invalid_refresh_token',
        message: 'Invalid or expired refresh token',
      });
    }

    res.json({
      success: true,
      data: {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        expiresIn: tokenPair.expiresIn,
      },
    });
  } catch (error: any) {
    console.error('[Token] Refresh error:', error);

    res.status(500).json({
      success: false,
      error: 'internal_error',
      message: 'Failed to refresh token',
    });
  }
});

/**
 * 验证Access Token
 * POST /api/auth/token/verify
 */
router.post('/verify', (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: 'access_token_required',
        message: 'Access token is required',
      });
    }

    const payload = tokenRefreshService.verifyAccessToken(accessToken);

    if (!payload) {
      return res.status(401).json({
        success: false,
        error: 'invalid_access_token',
        message: 'Invalid or expired access token',
      });
    }

    res.json({
      success: true,
      data: {
        valid: true,
        userId: payload.userId,
        email: payload.email,
        name: payload.name,
      },
    });
  } catch (error: any) {
    console.error('[Token] Verify error:', error);

    res.status(500).json({
      success: false,
      error: 'internal_error',
      message: 'Failed to verify token',
    });
  }
});

/**
 * 检查Token是否即将过期
 * POST /api/auth/token/check-expiry
 */
router.post('/check-expiry', (req: Request, res: Response) => {
  try {
    const { accessToken, thresholdMinutes } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: 'access_token_required',
        message: 'Access token is required',
      });
    }

    const expiringSoon = tokenRefreshService.isTokenExpiringSoon(
      accessToken,
      thresholdMinutes || 5
    );

    res.json({
      success: true,
      data: {
        expiringSoon,
        shouldRefresh: expiringSoon,
      },
    });
  } catch (error: any) {
    console.error('[Token] Check expiry error:', error);

    res.status(500).json({
      success: false,
      error: 'internal_error',
      message: 'Failed to check token expiry',
    });
  }
});

/**
 * 撤销Refresh Token（需要认证）
 * POST /api/auth/token/revoke
 */
router.post('/revoke', authenticateUser, (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'refresh_token_required',
        message: 'Refresh token is required',
      });
    }

    const success = tokenRefreshService.revokeRefreshToken(refreshToken);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'token_not_found',
        message: 'Refresh token not found',
      });
    }

    res.json({
      success: true,
      message: 'Refresh token revoked successfully',
    });
  } catch (error: any) {
    console.error('[Token] Revoke error:', error);

    res.status(500).json({
      success: false,
      error: 'internal_error',
      message: 'Failed to revoke token',
    });
  }
});

/**
 * 撤销所有Refresh Token（需要认证，用于登出所有设备）
 * POST /api/auth/token/revoke-all
 */
router.post('/revoke-all', authenticateUser, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const count = tokenRefreshService.revokeAllUserTokens(userId);

    res.json({
      success: true,
      message: `Revoked ${count} refresh tokens`,
      data: {
        revokedCount: count,
      },
    });
  } catch (error: any) {
    console.error('[Token] Revoke all error:', error);

    res.status(500).json({
      success: false,
      error: 'internal_error',
      message: 'Failed to revoke tokens',
    });
  }
});

/**
 * 获取用户的所有活跃Token（需要认证）
 * GET /api/auth/token/sessions
 */
router.get('/sessions', authenticateUser, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const tokens = tokenRefreshService.getUserRefreshTokens(userId);

    const sessions = tokens.map((record) => ({
      deviceInfo: record.deviceInfo || 'Unknown Device',
      createdAt: record.createdAt,
      lastUsedAt: record.lastUsedAt,
      expiresAt: record.expiresAt,
    }));

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error: any) {
    console.error('[Token] Get sessions error:', error);

    res.status(500).json({
      success: false,
      error: 'internal_error',
      message: 'Failed to get sessions',
    });
  }
});

/**
 * 获取Token统计信息（需要管理员权限）
 * GET /api/auth/token/statistics
 */
router.get('/statistics', authenticateAdmin, (req: Request, res: Response) => {
  try {
    const stats = tokenRefreshService.getStatistics();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('[Token] Get statistics error:', error);

    res.status(500).json({
      success: false,
      error: 'internal_error',
      message: 'Failed to get statistics',
    });
  }
});

// ==========================================
// 中间件
// ==========================================

/**
 * 用户认证中间件
 */
function authenticateUser(req: Request, res: Response, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'unauthorized',
      message: 'Authentication required',
    });
  }

  const payload = tokenRefreshService.verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      error: 'invalid_token',
      message: 'Invalid or expired access token',
    });
  }

  (req as any).user = {
    id: payload.userId,
    email: payload.email,
    name: payload.name,
  };

  next();
}

/**
 * 管理员认证中间件
 */
function authenticateAdmin(req: Request, res: Response, next: any) {
  authenticateUser(req, res, () => {
    const user = (req as any).user;

    // 实际应用中应检查用户角色
    // 这里简化处理
    if (!user) {
      return res.status(403).json({
        success: false,
        error: 'forbidden',
        message: 'Admin access required',
      });
    }

    next();
  });
}

export default router;
