/**
 * Rate Limiting Middleware
 * v2.5.0 Phase 3.2 - API Rate Limiting
 *
 * Express速率限制中间件
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit, { Options } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { getCurrentConfig, RateLimitRule } from '../config/rateLimitConfig';

/**
 * 创建Redis客户端
 */
let redisClient: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
  if (redisClient) return redisClient;

  const config = getCurrentConfig();

  if (config.store !== 'redis' || !config.redis) {
    return null;
  }

  redisClient = createClient({
    socket: {
      host: config.redis.host,
      port: config.redis.port,
    },
    password: config.redis.password,
    database: config.redis.db || 0,
  });

  redisClient.on('error', (err) => {
    console.error('[RateLimiter] Redis client error:', err);
  });

  await redisClient.connect();

  console.log('[RateLimiter] Redis client connected');

  return redisClient;
}

/**
 * 获取客户端标识（IP或用户ID）
 */
function getClientIdentifier(req: Request): string {
  // 优先使用用户ID（如果已认证）
  if ((req as any).user?.id) {
    return `user:${(req as any).user.id}`;
  }

  // 否则使用IP地址
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? (forwarded as string).split(',')[0].trim()
    : req.socket.remoteAddress || 'unknown';

  return `ip:${ip}`;
}

/**
 * 检查IP是否在白名单
 */
function isWhitelisted(req: Request): boolean {
  const config = getCurrentConfig();
  const ip = req.socket.remoteAddress || '';

  return config.whitelist.some((whitelistedIP) => {
    if (whitelistedIP === ip) return true;
    if (whitelistedIP === 'localhost' && (ip === '127.0.0.1' || ip === '::1')) {
      return true;
    }
    return false;
  });
}

/**
 * 检查IP是否在黑名单
 */
function isBlacklisted(req: Request): boolean {
  const config = getCurrentConfig();
  const ip = req.socket.remoteAddress || '';

  return config.blacklist.includes(ip);
}

/**
 * 创建速率限制器
 */
export async function createRateLimiter(
  rule: RateLimitRule,
  keyGenerator?: (req: Request) => string
): Promise<ReturnType<typeof rateLimit>> {
  const config = getCurrentConfig();

  const options: Partial<Options> = {
    windowMs: rule.windowMs,
    max: rule.max,
    message: rule.message || 'Too many requests, please try again later.',
    standardHeaders: true,  // 返回 RateLimit-* headers
    legacyHeaders: false,   // 禁用 X-RateLimit-* headers

    // 跳过白名单
    skip: (req) => {
      if (isWhitelisted(req)) {
        return true;
      }
      return false;
    },

    // 自定义key生成器
    keyGenerator: keyGenerator || getClientIdentifier,

    // 自定义响应处理
    handler: (req, res) => {
      const identifier = getClientIdentifier(req);
      console.warn(
        `[RateLimiter] Rate limit exceeded for ${identifier} on ${req.path}`
      );

      res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        message: rule.message || 'Too many requests, please try again later.',
        retryAfter: Math.ceil(rule.windowMs / 1000),
      });
    },

    // 跳过成功/失败请求（根据配置）
    skipSuccessfulRequests: rule.skipSuccessfulRequests,
    skipFailedRequests: rule.skipFailedRequests,
  };

  // 使用Redis存储（如果配置）
  if (config.store === 'redis') {
    const client = await getRedisClient();
    if (client) {
      options.store = new RedisStore({
        // @ts-expect-error - RedisStore types
        client,
        prefix: 'rl:',
      });
    }
  }

  return rateLimit(options);
}

/**
 * 黑名单检查中间件
 */
export function blacklistCheck(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (isBlacklisted(req)) {
    const ip = req.socket.remoteAddress;
    console.warn(`[RateLimiter] Blocked request from blacklisted IP: ${ip}`);

    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Your IP has been blocked.',
    });
    return;
  }

  next();
}

/**
 * 全局速率限制
 */
export async function globalRateLimiter() {
  const config = getCurrentConfig();

  if (!config.enabled) {
    return (req: Request, res: Response, next: NextFunction) => next();
  }

  return await createRateLimiter(config.global);
}

/**
 * IP速率限制
 */
export async function ipRateLimiter() {
  const config = getCurrentConfig();

  if (!config.enabled) {
    return (req: Request, res: Response, next: NextFunction) => next();
  }

  return await createRateLimiter(config.byIP, (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded
      ? (forwarded as string).split(',')[0].trim()
      : req.socket.remoteAddress || 'unknown';
    return `ip:${ip}`;
  });
}

/**
 * 用户速率限制
 */
export async function userRateLimiter() {
  const config = getCurrentConfig();

  if (!config.enabled) {
    return (req: Request, res: Response, next: NextFunction) => next();
  }

  return await createRateLimiter(config.byUser, (req) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      // 未认证用户，回退到IP限制
      const ip = req.socket.remoteAddress || 'unknown';
      return `ip:${ip}`;
    }
    return `user:${userId}`;
  });
}

/**
 * 端点特定速率限制
 */
export async function endpointRateLimiter(endpoint: string) {
  const config = getCurrentConfig();

  if (!config.enabled) {
    return (req: Request, res: Response, next: NextFunction) => next();
  }

  // 查找匹配的端点配置
  let rule = config.byEndpoint[endpoint];

  // 支持通配符匹配
  if (!rule) {
    for (const [pattern, endpointRule] of Object.entries(config.byEndpoint)) {
      if (pattern.includes('*')) {
        const regex = new RegExp(
          '^' + pattern.replace(/\*/g, '.*').replace(/\//g, '\\/') + '$'
        );
        if (regex.test(endpoint)) {
          rule = endpointRule;
          break;
        }
      }
    }
  }

  // 如果没有特定规则，使用全局规则
  if (!rule) {
    rule = config.global;
  }

  return await createRateLimiter(rule, (req) => {
    const identifier = getClientIdentifier(req);
    return `${identifier}:${endpoint}`;
  });
}

/**
 * 创建自定义速率限制器
 */
export async function customRateLimiter(
  windowMs: number,
  max: number,
  message?: string
) {
  const config = getCurrentConfig();

  if (!config.enabled) {
    return (req: Request, res: Response, next: NextFunction) => next();
  }

  return await createRateLimiter({
    windowMs,
    max,
    message,
  });
}

/**
 * 获取速率限制统计
 */
export async function getRateLimitStats(
  identifier: string
): Promise<{
  remaining: number;
  limit: number;
  reset: Date;
} | null> {
  const config = getCurrentConfig();

  if (config.store === 'redis' && redisClient) {
    try {
      const key = `rl:${identifier}`;
      const value = await redisClient.get(key);

      if (value) {
        const data = JSON.parse(value);
        return {
          remaining: data.remaining,
          limit: data.limit,
          reset: new Date(data.reset),
        };
      }
    } catch (error) {
      console.error('[RateLimiter] Failed to get stats:', error);
    }
  }

  return null;
}

/**
 * 清除速率限制（用于测试或管理）
 */
export async function clearRateLimit(identifier: string): Promise<boolean> {
  const config = getCurrentConfig();

  if (config.store === 'redis' && redisClient) {
    try {
      const key = `rl:${identifier}`;
      await redisClient.del(key);
      console.log(`[RateLimiter] Cleared rate limit for ${identifier}`);
      return true;
    } catch (error) {
      console.error('[RateLimiter] Failed to clear rate limit:', error);
      return false;
    }
  }

  return false;
}

/**
 * 关闭Redis连接
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('[RateLimiter] Redis connection closed');
  }
}

export default {
  blacklistCheck,
  globalRateLimiter,
  ipRateLimiter,
  userRateLimiter,
  endpointRateLimiter,
  customRateLimiter,
  getRateLimitStats,
  clearRateLimit,
  closeRedisConnection,
};
