/**
 * Rate Limit Configuration
 * v2.5.0 Phase 3.2 - API Rate Limiting
 *
 * 速率限制配置
 */

export interface RateLimitRule {
  windowMs: number;      // 时间窗口（毫秒）
  max: number;           // 最大请求数
  message?: string;      // 超限提示信息
  skipSuccessfulRequests?: boolean;  // 跳过成功请求
  skipFailedRequests?: boolean;      // 跳过失败请求
}

export interface RateLimitConfig {
  // 全局默认限制
  global: RateLimitRule;

  // 按IP限制（匿名用户）
  byIP: RateLimitRule;

  // 按用户限制（认证用户）
  byUser: RateLimitRule;

  // 按API端点限制
  byEndpoint: {
    [endpoint: string]: RateLimitRule;
  };

  // 白名单IP（不受限制）
  whitelist: string[];

  // 黑名单IP（完全拒绝）
  blacklist: string[];

  // 是否启用
  enabled: boolean;

  // 存储类型
  store: 'memory' | 'redis';

  // Redis配置（可选）
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
}

/**
 * 默认速率限制配置
 */
export const defaultRateLimitConfig: RateLimitConfig = {
  // 全局限制：每15分钟100个请求
  global: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.',
  },

  // IP限制：每小时50个请求（匿名用户）
  byIP: {
    windowMs: 60 * 60 * 1000,
    max: 50,
    message: 'Too many requests from this IP, please try again later.',
  },

  // 用户限制：每小时200个请求（认证用户）
  byUser: {
    windowMs: 60 * 60 * 1000,
    max: 200,
    message: 'Too many requests from this user, please try again later.',
  },

  // API端点特定限制
  byEndpoint: {
    // 认证相关：更严格
    '/api/auth/login': {
      windowMs: 15 * 60 * 1000,  // 15分钟
      max: 5,                     // 5次尝试
      message: 'Too many login attempts, please try again later.',
    },
    '/api/auth/register': {
      windowMs: 60 * 60 * 1000,  // 1小时
      max: 3,                     // 3次注册
      message: 'Too many registration attempts, please try again later.',
    },
    '/api/auth/forgot-password': {
      windowMs: 60 * 60 * 1000,  // 1小时
      max: 3,                     // 3次请求
      message: 'Too many password reset requests, please try again later.',
    },

    // Analytics：中等限制
    '/api/analytics/*': {
      windowMs: 60 * 1000,       // 1分钟
      max: 30,                    // 30个请求
      message: 'Too many analytics requests, please slow down.',
    },

    // Agent操作：宽松限制
    '/api/agents': {
      windowMs: 60 * 1000,       // 1分钟
      max: 60,                    // 60个请求
      message: 'Too many agent requests, please slow down.',
    },

    // Task操作：宽松限制
    '/api/tasks': {
      windowMs: 60 * 1000,       // 1分钟
      max: 60,                    // 60个请求
      message: 'Too many task requests, please slow down.',
    },

    // Webhook：严格限制
    '/api/webhooks/*': {
      windowMs: 60 * 1000,       // 1分钟
      max: 10,                    // 10个请求
      message: 'Too many webhook requests, please slow down.',
    },

    // 文件上传：非常严格
    '/api/upload': {
      windowMs: 60 * 60 * 1000,  // 1小时
      max: 10,                    // 10次上传
      message: 'Too many upload requests, please try again later.',
    },
  },

  // 白名单（开发环境/内部IP）
  whitelist: [
    '127.0.0.1',
    '::1',
    'localhost',
  ],

  // 黑名单（恶意IP）
  blacklist: [],

  // 默认启用
  enabled: true,

  // 默认使用内存存储
  store: 'memory',
};

/**
 * 生产环境配置
 */
export const productionRateLimitConfig: Partial<RateLimitConfig> = {
  // 生产环境更严格
  global: {
    windowMs: 15 * 60 * 1000,
    max: 50,  // 减半
    message: 'Too many requests, please try again later.',
  },

  byIP: {
    windowMs: 60 * 60 * 1000,
    max: 30,  // 减少
    message: 'Too many requests from this IP, please try again later.',
  },

  // 移除localhost白名单
  whitelist: [],

  // 使用Redis存储（分布式支持）
  store: 'redis',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
  },
};

/**
 * 获取当前配置
 */
export function getRateLimitConfig(): RateLimitConfig {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    return defaultRateLimitConfig;
  }

  // 生产环境：合并默认配置和生产配置
  return {
    ...defaultRateLimitConfig,
    ...productionRateLimitConfig,
  };
}

/**
 * 更新配置（运行时）
 */
let currentConfig = getRateLimitConfig();

export function updateRateLimitConfig(
  updates: Partial<RateLimitConfig>
): void {
  currentConfig = {
    ...currentConfig,
    ...updates,
  };
  console.log('[RateLimitConfig] Configuration updated');
}

export function getCurrentConfig(): RateLimitConfig {
  return currentConfig;
}

export default getRateLimitConfig;
