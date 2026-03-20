/**
 * OAuth Routes
 * v2.5.0 Phase 1.2 - OAuth Social Login
 *
 * OAuth认证路由
 */

import { Router, Request, Response } from 'express';
import { oauthService } from '../services/oauthService';
import { accountLinkingService } from '../services/accountLinkingService';
import { OAuthError } from '../config/oauthConfig';

const router = Router();

/**
 * GitHub OAuth授权入口
 * GET /api/auth/oauth/github
 */
router.get('/github', (req: Request, res: Response) => {
  try {
    const redirectUrl = req.query.redirect as string | undefined;
    const { url } = oauthService.getAuthorizationUrl('github', redirectUrl);

    res.redirect(url);
  } catch (error: any) {
    console.error('[OAuth] GitHub authorization error:', error);

    if (error instanceof OAuthError) {
      return res.status(400).json({
        success: false,
        error: error.type,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to initiate GitHub OAuth',
    });
  }
});

/**
 * GitHub OAuth回调
 * GET /api/auth/oauth/github/callback
 */
router.get('/github/callback', async (req: Request, res: Response) => {
  const { code, state, error } = req.query;

  // 处理用户拒绝授权
  if (error) {
    return res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?error=access_denied`
    );
  }

  if (!code || !state) {
    return res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?error=invalid_request`
    );
  }

  try {
    // 处理OAuth回调
    const oauthUser = await oauthService.handleCallback(
      'github',
      code as string,
      state as string
    );

    // 登录或注册用户
    const { user, isNewUser } = await accountLinkingService.loginOrRegisterWithOAuth(
      oauthUser
    );

    // 生成JWT token（实际应用中应使用真实的JWT生成）
    const token = generateMockToken(user.id);

    // 重定向到前端
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(
      `${frontendUrl}/auth/callback?token=${token}&isNewUser=${isNewUser}`
    );
  } catch (error: any) {
    console.error('[OAuth] GitHub callback error:', error);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const errorType = error instanceof OAuthError ? error.type : 'unknown_error';
    res.redirect(`${frontendUrl}/auth/callback?error=${errorType}`);
  }
});

/**
 * Google OAuth授权入口
 * GET /api/auth/oauth/google
 */
router.get('/google', (req: Request, res: Response) => {
  try {
    const redirectUrl = req.query.redirect as string | undefined;
    const { url } = oauthService.getAuthorizationUrl('google', redirectUrl);

    res.redirect(url);
  } catch (error: any) {
    console.error('[OAuth] Google authorization error:', error);

    if (error instanceof OAuthError) {
      return res.status(400).json({
        success: false,
        error: error.type,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to initiate Google OAuth',
    });
  }
});

/**
 * Google OAuth回调
 * GET /api/auth/oauth/google/callback
 */
router.get('/google/callback', async (req: Request, res: Response) => {
  const { code, state, error } = req.query;

  // 处理用户拒绝授权
  if (error) {
    return res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?error=access_denied`
    );
  }

  if (!code || !state) {
    return res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?error=invalid_request`
    );
  }

  try {
    // 处理OAuth回调
    const oauthUser = await oauthService.handleCallback(
      'google',
      code as string,
      state as string
    );

    // 登录或注册用户
    const { user, isNewUser } = await accountLinkingService.loginOrRegisterWithOAuth(
      oauthUser
    );

    // 生成JWT token（实际应用中应使用真实的JWT生成）
    const token = generateMockToken(user.id);

    // 重定向到前端
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(
      `${frontendUrl}/auth/callback?token=${token}&isNewUser=${isNewUser}`
    );
  } catch (error: any) {
    console.error('[OAuth] Google callback error:', error);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const errorType = error instanceof OAuthError ? error.type : 'unknown_error';
    res.redirect(`${frontendUrl}/auth/callback?error=${errorType}`);
  }
});

/**
 * 绑定OAuth账号（需要认证）
 * POST /api/auth/oauth/link/:provider
 */
router.post('/link/:provider', authenticateUser, async (req: Request, res: Response) => {
  const { provider } = req.params;
  const { code, state } = req.body;
  const userId = (req as any).user.id;

  if (provider !== 'github' && provider !== 'google') {
    return res.status(400).json({
      success: false,
      error: 'Invalid provider',
    });
  }

  if (!code || !state) {
    return res.status(400).json({
      success: false,
      error: 'Missing code or state',
    });
  }

  try {
    // 处理OAuth回调
    const oauthUser = await oauthService.handleCallback(provider, code, state);

    // 绑定到当前用户
    const oauthAccount = await accountLinkingService.linkOAuthAccount(
      userId,
      oauthUser
    );

    res.json({
      success: true,
      message: `${provider} account linked successfully`,
      data: {
        provider: oauthAccount.provider,
        email: oauthAccount.email,
        name: oauthAccount.name,
      },
    });
  } catch (error: any) {
    console.error(`[OAuth] Link ${provider} error:`, error);

    if (error instanceof OAuthError) {
      return res.status(400).json({
        success: false,
        error: error.type,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: `Failed to link ${provider} account`,
    });
  }
});

/**
 * 解除OAuth账号绑定（需要认证）
 * DELETE /api/auth/oauth/unlink/:provider
 */
router.delete('/unlink/:provider', authenticateUser, async (req: Request, res: Response) => {
  const { provider } = req.params;
  const userId = (req as any).user.id;

  if (provider !== 'github' && provider !== 'google') {
    return res.status(400).json({
      success: false,
      error: 'Invalid provider',
    });
  }

  try {
    const success = await accountLinkingService.unlinkOAuthAccount(userId, provider);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'OAuth account not found',
      });
    }

    res.json({
      success: true,
      message: `${provider} account unlinked successfully`,
    });
  } catch (error: any) {
    console.error(`[OAuth] Unlink ${provider} error:`, error);

    if (error instanceof OAuthError) {
      return res.status(400).json({
        success: false,
        error: error.type,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: `Failed to unlink ${provider} account`,
    });
  }
});

/**
 * 获取已绑定的OAuth账号列表（需要认证）
 * GET /api/auth/oauth/linked
 */
router.get('/linked', authenticateUser, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const accounts = await accountLinkingService.getLinkedOAuthAccounts(userId);

    res.json({
      success: true,
      data: accounts,
    });
  } catch (error: any) {
    console.error('[OAuth] Get linked accounts error:', error);

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to get linked accounts',
    });
  }
});

// ==========================================
// 辅助函数
// ==========================================

/**
 * 用户认证中间件（示例）
 */
function authenticateUser(req: Request, res: Response, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  // 实际应用中应验证JWT token
  // 这里使用模拟验证
  try {
    const userId = verifyMockToken(token);
    (req as any).user = { id: userId };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid token',
    });
  }
}

/**
 * 生成模拟token（实际应用中应使用JWT）
 */
function generateMockToken(userId: string): string {
  return Buffer.from(JSON.stringify({ userId, exp: Date.now() + 24 * 60 * 60 * 1000 })).toString('base64');
}

/**
 * 验证模拟token（实际应用中应使用JWT）
 */
function verifyMockToken(token: string): string {
  try {
    const data = JSON.parse(Buffer.from(token, 'base64').toString());
    if (data.exp < Date.now()) {
      throw new Error('Token expired');
    }
    return data.userId;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export default router;
