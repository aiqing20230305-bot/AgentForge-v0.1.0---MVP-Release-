import { test, expect } from '@playwright/test'

test.describe('能耗管理测试', () => {
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

  test('TC-005: 查看能耗仪表盘', async ({ page }) => {
    // 导航到能耗仪表盘
    await page.click('text=能耗仪表盘')

    // 验证能耗监控中心标题
    await expect(page.locator('text=能耗监控中心')).toBeVisible()

    // 验证3个时间段标签
    await expect(page.locator('text=今日')).toBeVisible()
    await expect(page.locator('text=本周')).toBeVisible()
    await expect(page.locator('text=本月')).toBeVisible()

    // 验证颜色根据百分比变化（检查是否有不同颜色的环）
    const greenRing = page.locator('circle[stroke*="green"], circle[stroke*="#22C55E"]')
    const yellowRing = page.locator('circle[stroke*="yellow"], circle[stroke*="#FCD34D"]')
    const orangeRing = page.locator('circle[stroke*="orange"], circle[stroke*="#F97316"]')

    // 至少有一个颜色的环存在
    const hasColoredRing = await greenRing.count() > 0 || await yellowRing.count() > 0 || await orangeRing.count() > 0
    expect(hasColoredRing).toBe(true)
  })

  test('TC-006: 查看能耗图表', async ({ page }) => {
    // 导航到能耗图表
    await page.click('text=能耗图表')

    // 测试4种图表类型切换
    const chartTypes = ['趋势', '分类', '分布', '热力']

    for (const type of chartTypes) {
      await page.click(`button:has-text("${type}")`)

      // 验证图表正确渲染（Recharts 会生成 SVG）
      await expect(page.locator('svg.recharts-surface')).toBeVisible({ timeout: 3000 })

      // 等待图表渲染完成
      await page.waitForTimeout(500)
    }
  })

  test('TC-007: 设置预算', async ({ page }) => {
    // 打开预算设置
    await page.click('text=预算设置')

    // 修改日预算
    const dailyInput = page.locator('input[type="number"][aria-label*="日预算"]')
    await dailyInput.clear()
    await dailyInput.fill('100000')

    // 修改周预算
    const weeklyInput = page.locator('input[type="number"][aria-label*="周预算"]')
    await weeklyInput.clear()
    await weeklyInput.fill('500000')

    // 修改月预算
    const monthlyInput = page.locator('input[type="number"][aria-label*="月预算"]')
    await monthlyInput.clear()
    await monthlyInput.fill('2000000')

    // 调整告警阈值滑块
    const slider = page.locator('input[type="range"]')
    await slider.fill('80')

    // 切换自动暂停开关
    await page.click('input[type="checkbox"][aria-label*="自动暂停"]')

    // 点击"保存设置"
    await page.click('button:has-text("保存设置")')

    // 验证显示"已保存"
    await expect(page.locator('text=/✓|已保存|保存成功/')).toBeVisible({ timeout: 3000 })
  })
})
