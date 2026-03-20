/**
 * Express App Configuration Example
 * v2.5.0 Phase 3.2 - API Rate Limiting
 *
 * 展示如何集成速率限制中间件
 */

import express, { Application } from 'express';
import {
  blacklistCheck,
  globalRateLimiter,
  ipRateLimiter,
  endpointRateLimiter,
} from './middleware/rateLimiter';
import rateLimitRoutes from './routes/rateLimitRoutes';

/**
 * 初始化应用并应用速率限制
 */
export async function initializeApp(): Promise<Application> {
  const app = express();

  // 基础中间件
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ==========================================
  // 应用速率限制中间件
  // ==========================================

  // 1. 黑名单检查（最优先）
  app.use(blacklistCheck);

  // 2. 全局速率限制
  app.use(await globalRateLimiter());

  // 3. IP速率限制（对所有请求）
  app.use(await ipRateLimiter());

  // ==========================================
  // 特定端点的速率限制
  // ==========================================

  // 认证端点：严格限制
  app.use('/api/auth/login', await endpointRateLimiter('/api/auth/login'));
  app.use('/api/auth/register', await endpointRateLimiter('/api/auth/register'));
  app.use(
    '/api/auth/forgot-password',
    await endpointRateLimiter('/api/auth/forgot-password')
  );

  // Analytics端点：中等限制
  app.use('/api/analytics', await endpointRateLimiter('/api/analytics/*'));

  // Webhook端点：严格限制
  app.use('/api/webhooks', await endpointRateLimiter('/api/webhooks/*'));

  // 文件上传：非常严格
  app.use('/api/upload', await endpointRateLimiter('/api/upload'));

  // ==========================================
  // 速率限制管理API
  // ==========================================
  app.use('/api/rate-limit', rateLimitRoutes);

  // ==========================================
  // 业务路由
  // ==========================================
  // app.use('/api/agents', agentRoutes);
  // app.use('/api/tasks', taskRoutes);
  // ... 其他路由

  // ==========================================
  // 错误处理
  // ==========================================
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Error:', err);

    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal Server Error',
    });
  });

  return app;
}

/**
 * 使用示例
 */
async function main() {
  const app = await initializeApp();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Rate limiting enabled`);
  });
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}

export default initializeApp;
