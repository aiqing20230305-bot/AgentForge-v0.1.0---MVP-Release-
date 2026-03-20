/**
 * Webhook Authentication Middleware
 * v2.5.0 - Security Enhancement
 *
 * 验证来自第三方服务的Webhook请求签名
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Jira Webhook验证中间件
 * 验证请求签名，确保请求来自Jira服务器
 */
export const verifyJiraWebhook = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const secret = process.env.JIRA_WEBHOOK_SECRET;

  if (!secret) {
    console.error('JIRA_WEBHOOK_SECRET not configured');
    return res.status(500).json({
      success: false,
      error: 'Webhook secret not configured'
    });
  }

  // 获取签名（支持多种header格式）
  const signature =
    req.headers['x-hub-signature'] ||
    req.headers['x-jira-signature'] ||
    req.headers['x-hub-signature-256'];

  if (!signature || typeof signature !== 'string') {
    console.warn('Webhook request missing signature');
    return res.status(401).json({
      success: false,
      error: 'Missing signature'
    });
  }

  try {
    // 获取原始请求体
    const payload = JSON.stringify(req.body);

    // 移除签名前缀
    const providedSignature = signature.startsWith('sha256=')
      ? signature.substring(7)
      : signature;

    // 生成期望的签名
    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(payload).digest('hex');

    // 时间安全比较
    const isValid = crypto.timingSafeEqual(
      Buffer.from(providedSignature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      console.warn('Invalid webhook signature');
      return res.status(401).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    // 签名验证通过，继续处理
    next();
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return res.status(401).json({
      success: false,
      error: 'Signature verification failed'
    });
  }
};

/**
 * GitHub Webhook验证中间件
 * 验证请求签名，确保请求来自GitHub
 */
export const verifyGitHubWebhook = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret) {
    console.error('GITHUB_WEBHOOK_SECRET not configured');
    return res.status(500).json({
      success: false,
      error: 'Webhook secret not configured'
    });
  }

  const signature = req.headers['x-hub-signature-256'];

  if (!signature || typeof signature !== 'string') {
    return res.status(401).json({
      success: false,
      error: 'Missing signature'
    });
  }

  try {
    const payload = JSON.stringify(req.body);
    const providedSignature = signature.substring(7); // 移除 "sha256="

    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(payload).digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(providedSignature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      console.warn('Invalid GitHub webhook signature');
      return res.status(401).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    next();
  } catch (error) {
    console.error('GitHub webhook verification failed:', error);
    return res.status(401).json({
      success: false,
      error: 'Signature verification failed'
    });
  }
};

/**
 * 通用Webhook验证工厂函数
 * 创建自定义的Webhook验证中间件
 *
 * @param secretEnvVar - 环境变量名称
 * @param signatureHeader - 签名header名称
 * @param algorithm - 签名算法（默认sha256）
 */
export const createWebhookVerifier = (
  secretEnvVar: string,
  signatureHeader: string,
  algorithm: string = 'sha256'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const secret = process.env[secretEnvVar];

    if (!secret) {
      return res.status(500).json({
        success: false,
        error: `${secretEnvVar} not configured`
      });
    }

    const signature = req.headers[signatureHeader.toLowerCase()];

    if (!signature || typeof signature !== 'string') {
      return res.status(401).json({
        success: false,
        error: 'Missing signature'
      });
    }

    try {
      const payload = JSON.stringify(req.body);
      const providedSignature = signature.includes('=')
        ? signature.split('=')[1]
        : signature;

      const hmac = crypto.createHmac(algorithm, secret);
      const expectedSignature = hmac.update(payload).digest('hex');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(providedSignature),
        Buffer.from(expectedSignature)
      );

      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid signature'
        });
      }

      next();
    } catch (error) {
      console.error('Webhook verification failed:', error);
      return res.status(401).json({
        success: false,
        error: 'Signature verification failed'
      });
    }
  };
};

export default {
  verifyJiraWebhook,
  verifyGitHubWebhook,
  createWebhookVerifier
};
