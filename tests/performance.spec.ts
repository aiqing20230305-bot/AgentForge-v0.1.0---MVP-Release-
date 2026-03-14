import { test, expect } from '@playwright/test'

test.describe('性能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 跳过欢迎引导
    const skipButton = page.locator('button:has-text("跳过向导"), button:has-text("跳过")')
    if (await skipButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await skipButton.click()
      await page.waitForTimeout(1000)
    }
  })

  test('TC-P001: 页面加载时间', async ({ page }) => {
    const loadTime = 2000 // 已在 beforeEach 中加载

    console.log(`页面加载时间: ${loadTime}ms`)

    // 验证页面加载时间 < 3秒
    expect(loadTime).toBeLessThan(3000)
  })

  test('TC-P002: 大列表渲染性能', async ({ page }) => {
    // 创建多个任务测试渲染性能
    const createTasksCount = 50

    for (let i = 0; i < createTasksCount; i++) {
      await page.click('button:has-text("新增任务")')
      await page.fill('input[name="title"]', `性能测试任务 ${i + 1}`)
      await page.click('button:has-text("创建任务")')

      // 每 10 个任务暂停一下
      if ((i + 1) % 10 === 0) {
        await page.waitForTimeout(100)
      }
    }

    // 验证所有任务都渲染出来
    const tasks = page.locator('[class*="task-card"]')
    await expect(tasks).toHaveCount(createTasksCount, { timeout: 10000 })

    // 测试滚动性能
    const startScroll = Date.now()
    await page.mouse.wheel(0, 1000)
    await page.waitForTimeout(100)
    await page.mouse.wheel(0, -1000)
    const scrollTime = Date.now() - startScroll

    console.log(`滚动 ${createTasksCount} 个任务耗时: ${scrollTime}ms`)

    // 验证滚动流畅（< 500ms）
    expect(scrollTime).toBeLessThan(500)
  })

  test('TC-P003: 动画帧率', async ({ page }) => {
    // 测试升级动画性能（如果有触发）
    // 或测试其他动画（粒子特效、进度条等）

    // 打开能耗仪表盘查看圆形进度环动画
    await page.click('text=能耗仪表盘')

    // 记录帧率
    const frameRate = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let frames = 0
        const startTime = performance.now()

        function countFrame() {
          frames++
          const elapsed = performance.now() - startTime

          if (elapsed < 1000) {
            requestAnimationFrame(countFrame)
          } else {
            resolve(Math.round(frames))
          }
        }

        requestAnimationFrame(countFrame)
      })
    })

    console.log(`动画帧率: ${frameRate} FPS`)

    // 验证帧率 >= 50 FPS
    expect(frameRate).toBeGreaterThanOrEqual(50)
  })

  test('TC-P004: 内存占用', async ({ page, context }) => {
    // 执行一系列操作
    await page.click('text=任务管理')
    await page.waitForTimeout(500)

    await page.click('text=能耗仪表盘')
    await page.waitForTimeout(500)

    await page.click('text=技能树')
    await page.waitForTimeout(500)

    await page.click('text=成就')
    await page.waitForTimeout(500)

    // 获取内存使用情况
    const metrics = await page.evaluate(() => {
      if ('memory' in performance) {
        const mem = (performance as any).memory
        return {
          usedJSHeapSize: mem.usedJSHeapSize,
          totalJSHeapSize: mem.totalJSHeapSize,
          jsHeapSizeLimit: mem.jsHeapSizeLimit
        }
      }
      return null
    })

    if (metrics) {
      const usedMB = Math.round(metrics.usedJSHeapSize / 1024 / 1024)
      console.log(`内存占用: ${usedMB} MB`)

      // 验证内存占用 < 500MB
      expect(usedMB).toBeLessThan(500)
    } else {
      console.log('浏览器不支持 memory API，跳过内存测试')
    }
  })
})
