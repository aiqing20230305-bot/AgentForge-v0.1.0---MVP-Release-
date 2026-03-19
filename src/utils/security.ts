/**
 * 安全配置
 * Phase 7: 安全增强
 */

/**
 * Content Security Policy (CSP)
 * 在index.html中添加meta标签或通过HTTP头设置
 */
export const CSP_POLICY = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://www.googletagmanager.com', 'https://www.google-analytics.com'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'connect-src': ["'self'", 'https://www.google-analytics.com', 'http://localhost:18789'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
}

/**
 * 生成CSP字符串
 */
export function generateCSP(): string {
  return Object.entries(CSP_POLICY)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')
}

/**
 * 安全Headers（通过vercel.json或服务器配置）
 */
export const SECURITY_HEADERS = {
  // CSP
  'Content-Security-Policy': generateCSP(),

  // XSS保护
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',

  // HTTPS强制
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Referrer策略
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // 权限策略
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}

/**
 * 输入清理
 */
export function sanitizeInput(input: string): string {
  // 移除HTML标签
  const withoutTags = input.replace(/<[^>]*>/g, '')

  // 转义特殊字符
  const escaped = withoutTags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')

  return escaped
}

/**
 * 验证URL安全性
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)

    // 只允许http和https协议
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false
    }

    // 黑名单域名（可选）
    const blockedDomains = ['malicious-site.com']
    if (blockedDomains.some(domain => parsed.hostname.includes(domain))) {
      return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * 生成随机nonce（用于CSP）
 */
export function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
}

/**
 * 检测XSS攻击
 */
export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["'].*?["']/gi,
    /<iframe[^>]*>/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi
  ]

  return xssPatterns.some(pattern => pattern.test(input))
}

/**
 * 安全的localStorage使用
 */
export const secureStorage = {
  set(key: string, value: any, encrypt = false): void {
    try {
      const stringValue = JSON.stringify(value)
      const finalValue = encrypt ? btoa(stringValue) : stringValue
      localStorage.setItem(key, finalValue)
    } catch (error) {
      console.error('[Security] Storage set failed:', error)
    }
  },

  get<T>(key: string, decrypt = false): T | null {
    try {
      const value = localStorage.getItem(key)
      if (!value) return null

      const stringValue = decrypt ? atob(value) : value
      return JSON.parse(stringValue) as T
    } catch (error) {
      console.error('[Security] Storage get failed:', error)
      return null
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key)
  },

  clear(): void {
    localStorage.clear()
  }
}

/**
 * Rate Limiting（客户端）
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()

  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1分钟
  ) {}

  canMakeRequest(key: string): boolean {
    const now = Date.now()
    const timestamps = this.requests.get(key) || []

    // 移除过期的时间戳
    const validTimestamps = timestamps.filter(ts => now - ts < this.windowMs)

    if (validTimestamps.length >= this.maxRequests) {
      return false
    }

    // 添加新请求
    validTimestamps.push(now)
    this.requests.set(key, validTimestamps)

    return true
  }

  reset(key: string): void {
    this.requests.delete(key)
  }
}

/**
 * 初始化安全功能
 */
export function initSecurity() {
  console.log('[Security] Initializing security features...')

  // 禁用右键（可选）
  // document.addEventListener('contextmenu', (e) => e.preventDefault())

  // 禁用开发者工具（可选，不推荐）
  // document.addEventListener('keydown', (e) => {
  //   if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
  //     e.preventDefault()
  //   }
  // })

  // 全局错误捕获
  window.addEventListener('error', (event) => {
    console.error('[Security] Global error:', event.error)
    // 可以发送到错误追踪服务
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Security] Unhandled rejection:', event.reason)
  })

  // 检测控制台打开（可选）
  const devtools = /./
  devtools.toString = function() {
    console.log('[Security] DevTools detected')
    return 'devtools'
  }

  console.log(devtools)

  console.log('[Security] Security features initialized')
}

export default {
  CSP_POLICY,
  SECURITY_HEADERS,
  sanitizeInput,
  isSafeUrl,
  generateNonce,
  detectXSS,
  secureStorage,
  RateLimiter,
  initSecurity
}
