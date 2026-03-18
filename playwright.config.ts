/**
 * Playwright配置文件 - v2.3.0 Phase 3
 * Configuration for Playwright end-to-end tests
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/integration',

  /* 测试超时配置 */
  timeout: 30000,
  expect: {
    timeout: 5000,
  },

  /* 并行运行测试 */
  fullyParallel: true,

  /* 失败时不重试 */
  forbidOnly: !!process.env.CI,

  /* CI环境中失败时重试 */
  retries: process.env.CI ? 2 : 0,

  /* 并行worker数量 */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter配置 */
  reporter: [
    ['html', { outputFolder: 'test-results/html', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],

  /* 共享设置 */
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    navigationTimeout: 30000,
    actionTimeout: 10000,
  },

  /* 配置多个项目用于跨浏览器测试 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* 移动端测试 */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* RTL专项测试 */
    {
      name: 'chromium-rtl',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'ar-SA',
      },
    },

    /* 暗黑模式测试 */
    {
      name: 'chromium-dark',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
      },
    },
  ],

  /* 在运行测试前启动开发服务器 */
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});
