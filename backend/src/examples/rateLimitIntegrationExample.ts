/**
 * Rate Limit Integration Example
 * v2.5.0 Phase 3.2 - API Rate Limiting
 *
 * 完整的集成示例，展示如何在真实应用中使用速率限制
 */

import express, { Application, Request, Response } from 'express';
import {
  blacklistCheck,
  globalRateLimiter,
  ipRateLimiter,
  userRateLimiter,
  endpointRateLimiter,
  customRateLimiter,
} from '../middleware/rateLimiter';
import rateLimitRoutes from '../routes/rateLimitRoutes';
import { rateLimitService } from '../services/rateLimitService';
import { updateRateLimitConfig } from '../config/rateLimitConfig';

/**
 * 场景1: 标准Web应用
 * - 使用全局限制保护所有端点
 * - 特别保护认证端点
 * - 管理API需要认证
 */
export async function createStandardWebApp(): Promise<Application> {
  const app = express();

  // 基础中间件
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 第1层：黑名单检查
  app.use(blacklistCheck);

  // 第2层：全局速率限制（100次/15分钟）
  app.use(await globalRateLimiter());

  // 第3层：IP速率限制（50次/小时）
  app.use(await ipRateLimiter());

  // ==========================================
  // 业务端点
  // ==========================================

  // 公开API - 使用默认限制
  app.get('/api/public/info', (req: Request, res: Response) => {
    res.json({ message: 'Public information' });
  });

  // 认证端点 - 严格限制
  app.post(
    '/api/auth/login',
    await endpointRateLimiter('/api/auth/login'),
    (req: Request, res: Response) => {
      // 登录逻辑
      res.json({ success: true, token: 'mock-token' });
    }
  );

  app.post(
    '/api/auth/register',
    await endpointRateLimiter('/api/auth/register'),
    (req: Request, res: Response) => {
      // 注册逻辑
      res.json({ success: true, message: 'User registered' });
    }
  );

  // 敏感操作 - 用户限制
  app.post(
    '/api/user/change-password',
    await userRateLimiter(),
    (req: Request, res: Response) => {
      // 修改密码逻辑
      res.json({ success: true });
    }
  );

  // 资源密集型端点 - 自定义限制
  app.post(
    '/api/reports/generate',
    await customRateLimiter(60 * 60 * 1000, 5, 'Report generation limited to 5 per hour'),
    (req: Request, res: Response) => {
      // 生成报告逻辑
      res.json({ success: true, reportId: '12345' });
    }
  );

  // 速率限制管理API（仅管理员）
  app.use('/api/rate-limit', authenticateAdmin, rateLimitRoutes);

  // 错误处理
  app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal Server Error',
    });
  });

  return app;
}

/**
 * 场景2: 公开API服务
 * - 按API Key限制
 * - 不同层级的限制（免费/付费）
 * - 详细的使用统计
 */
export async function createPublicAPIService(): Promise<Application> {
  const app = express();

  app.use(express.json());

  // 黑名单检查
  app.use(blacklistCheck);

  // 全局保护
  app.use(await globalRateLimiter());

  // API Key中间件
  app.use((req: Request, res: Response, next) => {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API Key required',
      });
    }

    // 验证API Key并附加用户信息
    const user = validateAPIKey(apiKey);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API Key',
      });
    }

    (req as any).user = user;
    next();
  });

  // 免费用户限制：每小时10次
  app.use(async (req: Request, res: Response, next) => {
    const user = (req as any).user;

    if (user.tier === 'free') {
      const limiter = await customRateLimiter(
        60 * 60 * 1000,
        10,
        'Free tier limited to 10 requests per hour'
      );
      return limiter(req, res, next);
    }

    next();
  });

  // 付费用户限制：每小时1000次
  app.use(async (req: Request, res: Response, next) => {
    const user = (req as any).user;

    if (user.tier === 'paid') {
      const limiter = await customRateLimiter(
        60 * 60 * 1000,
        1000,
        'Paid tier limited to 1000 requests per hour'
      );
      return limiter(req, res, next);
    }

    next();
  });

  // API端点
  app.get('/api/v1/data', (req: Request, res: Response) => {
    const user = (req as any).user;
    res.json({
      success: true,
      data: 'Your data',
      tier: user.tier,
    });
  });

  app.post('/api/v1/process', (req: Request, res: Response) => {
    res.json({
      success: true,
      result: 'Processed',
    });
  });

  // 使用统计端点
  app.get('/api/v1/usage', async (req: Request, res: Response) => {
    const user = (req as any).user;
    const identifier = `user:${user.id}`;

    const status = await rateLimitService.getStatus(identifier);

    res.json({
      success: true,
      usage: {
        remaining: status?.remaining || 0,
        limit: status?.limit || 0,
        reset: status?.reset,
      },
    });
  });

  return app;
}

/**
 * 场景3: 微服务架构
 * - 内部服务白名单
 * - 外部API严格限制
 * - Redis分布式存储
 */
export async function createMicroserviceApp(): Promise<Application> {
  const app = express();

  // 配置Redis存储（分布式部署）
  updateRateLimitConfig({
    store: 'redis',
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: 0,
    },
  });

  // 内部服务白名单
  const internalServices = [
    '10.0.1.10', // Service A
    '10.0.1.11', // Service B
    '10.0.1.12', // Service C
  ];

  internalServices.forEach((ip) => {
    rateLimitService.addToWhitelist(ip);
  });

  app.use(express.json());

  // 黑名单检查
  app.use(blacklistCheck);

  // 外部流量：严格限制
  app.use(
    async (req: Request, res: Response, next) => {
      const ip = req.socket.remoteAddress || '';

      // 内部服务直接通过
      if (internalServices.includes(ip)) {
        return next();
      }

      // 外部流量应用限制
      const limiter = await ipRateLimiter();
      limiter(req, res, next);
    }
  );

  // 服务间通信端点（无限制）
  app.post('/internal/sync', (req: Request, res: Response) => {
    res.json({ success: true });
  });

  // 外部API端点（有限制）
  app.get('/api/external/data', (req: Request, res: Response) => {
    res.json({ data: 'External data' });
  });

  return app;
}

/**
 * 场景4: 实时监控和自动封禁
 * - 监控异常流量
 * - 自动封禁可疑IP
 * - 告警通知
 */
export async function createMonitoredApp(): Promise<Application> {
  const app = express();

  app.use(express.json());

  // 请求监控中间件
  app.use((req: Request, res: Response, next) => {
    const ip = req.socket.remoteAddress || '';
    const endpoint = req.path;

    // 记录请求
    rateLimitService.logActivity({
      identifier: `ip:${ip}`,
      type: 'ip',
      endpoint,
      remaining: 0,
      limit: 0,
      reset: new Date(),
      timestamp: new Date(),
    });

    next();
  });

  // 黑名单检查
  app.use(blacklistCheck);

  // 速率限制
  app.use(await globalRateLimiter());

  // 响应监控中间件
  app.use((req: Request, res: Response, next) => {
    res.on('finish', () => {
      const ip = req.socket.remoteAddress || '';

      // 检测429响应（超过限制）
      if (res.statusCode === 429) {
        handleRateLimitExceeded(ip, req.path);
      }
    });

    next();
  });

  // 业务端点
  app.get('/api/data', (req: Request, res: Response) => {
    res.json({ data: 'Data' });
  });

  return app;
}

// ==========================================
// 辅助函数
// ==========================================

/**
 * 管理员认证中间件（示例）
 */
function authenticateAdmin(req: Request, res: Response, next: any) {
  const adminToken = req.headers['x-admin-token'];

  if (adminToken !== 'admin-secret-token') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
  }

  next();
}

/**
 * 验证API Key（示例）
 */
function validateAPIKey(apiKey: string): { id: string; tier: 'free' | 'paid' } | null {
  // 实际应用中应从数据库查询
  const mockKeys: Record<string, { id: string; tier: 'free' | 'paid' }> = {
    'free-key-123': { id: 'user1', tier: 'free' },
    'paid-key-456': { id: 'user2', tier: 'paid' },
  };

  return mockKeys[apiKey] || null;
}

/**
 * 处理速率限制超限
 */
function handleRateLimitExceeded(ip: string, endpoint: string) {
  console.warn(`[RateLimit] IP ${ip} exceeded limit on ${endpoint}`);

  // 获取该IP的历史记录
  const stats = rateLimitService.getStatistics();
  const ipActivity = stats.topIdentifiers.find((item) => item.identifier === `ip:${ip}`);

  // 如果1小时内超过10次429，自动封禁
  if (ipActivity && ipActivity.count > 10) {
    console.error(`[Security] Auto-blocking suspicious IP: ${ip}`);
    rateLimitService.addToBlacklist(ip);

    // 发送告警（实际应用中使用真实的告警服务）
    sendAlert({
      type: 'auto_block',
      ip,
      reason: 'Excessive rate limit violations',
      count: ipActivity.count,
    });
  }
}

/**
 * 发送告警（示例）
 */
function sendAlert(alert: any) {
  console.log('[Alert]', JSON.stringify(alert, null, 2));
  // 实际应用中：发送邮件、Slack通知、PagerDuty等
}

// ==========================================
// 使用示例
// ==========================================

async function main() {
  const scenario = process.env.SCENARIO || 'standard';

  let app: Application;

  switch (scenario) {
    case 'api':
      console.log('🚀 Starting Public API Service...');
      app = await createPublicAPIService();
      break;

    case 'microservice':
      console.log('🚀 Starting Microservice...');
      app = await createMicroserviceApp();
      break;

    case 'monitored':
      console.log('🚀 Starting Monitored App...');
      app = await createMonitoredApp();
      break;

    default:
      console.log('🚀 Starting Standard Web App...');
      app = await createStandardWebApp();
  }

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Rate limiting enabled`);
    console.log(`📊 Scenario: ${scenario}`);

    // 打印配置摘要
    const summary = rateLimitService.getSummary();
    console.log('\n📋 Rate Limit Configuration:');
    console.log(`   - Store: ${summary.store}`);
    console.log(`   - Global: ${summary.globalLimit.max} requests / ${summary.globalLimit.windowMs / 1000}s`);
    console.log(`   - IP: ${summary.ipLimit.max} requests / ${summary.ipLimit.windowMs / 1000}s`);
    console.log(`   - Whitelist: ${summary.whitelistCount} IPs`);
    console.log(`   - Blacklist: ${summary.blacklistCount} IPs\n`);
  });
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}

export default {
  createStandardWebApp,
  createPublicAPIService,
  createMicroserviceApp,
  createMonitoredApp,
};
