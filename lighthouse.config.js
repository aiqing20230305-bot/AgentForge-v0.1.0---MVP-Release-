/**
 * Lighthouse CI 配置
 * 用于自动化性能测试
 */
module.exports = {
  ci: {
    collect: {
      // 测试的URL
      url: [
        'http://localhost:5173/',
        'http://localhost:5173/agents',
        'http://localhost:5173/tasks'
      ],
      // 每个URL测试3次，取中位数
      numberOfRuns: 3,
      settings: {
        // 模拟移动设备
        emulatedFormFactor: 'mobile',
        // 节流网络（Fast 3G）
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4
        }
      }
    },
    assert: {
      // 断言阈值
      assertions: {
        // 性能分数 > 90
        'categories:performance': ['error', { minScore: 0.9 }],
        // 可访问性 > 90
        'categories:accessibility': ['error', { minScore: 0.9 }],
        // 最佳实践 > 90
        'categories:best-practices': ['error', { minScore: 0.9 }],
        // SEO > 90
        'categories:seo': ['error', { minScore: 0.9 }],
        // PWA可选
        'categories:pwa': ['warn', { minScore: 0.8 }],

        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }], // < 1.8s
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // < 2.5s
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // < 0.1
        'total-blocking-time': ['warn', { maxNumericValue: 300 }], // < 300ms
        'speed-index': ['warn', { maxNumericValue: 3000 }], // < 3s

        // 资源优化
        'uses-text-compression': 'error',
        'uses-optimized-images': 'warn',
        'modern-image-formats': 'warn',
        'offscreen-images': 'warn',
        'render-blocking-resources': 'warn',
        'unused-javascript': 'warn',
        'unused-css-rules': 'warn',

        // 最佳实践
        'uses-http2': 'error',
        'uses-long-cache-ttl': 'warn',
        'efficient-animated-content': 'warn',
        'no-document-write': 'error',
        'no-vulnerable-libraries': 'error'
      }
    },
    upload: {
      // 上传到Lighthouse CI服务器（可选）
      target: 'temporary-public-storage'
    }
  }
}
