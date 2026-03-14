import { test, expect } from '@playwright/test'

test.describe('任务管理测试', () => {
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

  test('TC-001: 创建新任务', async ({ page }) => {
    // 点击"新增任务"按钮
    await page.click('button:has-text("新增任务")')

    // 填写任务信息
    await page.fill('input[name="title"]', '测试任务1')
    await page.fill('textarea[name="description"]', '这是一个测试任务')

    // 选择优先级：高
    await page.selectOption('select[name="priority"]', 'high')

    // 点击"创建任务"
    await page.click('button:has-text("创建任务")')

    // 验证任务出现在列表中
    await expect(page.locator('text=测试任务1')).toBeVisible()
    await expect(page.locator('text=待处理')).toBeVisible()
    await expect(page.locator('text=高')).toBeVisible()
  })

  test('TC-002: 自动执行任务', async ({ page }) => {
    // 确保自动执行开关已开启
    const autoSwitch = page.locator('input[type="checkbox"][aria-label*="自动执行"]')
    if (!await autoSwitch.isChecked()) {
      await autoSwitch.click()
    }

    // 点击待处理任务的"执行"按钮
    await page.locator('button:has-text("执行")').first().click()

    // 观察状态变为"进行中"
    await expect(page.locator('text=进行中')).toBeVisible({ timeout: 5000 })

    // 等待进度条变化
    const progressBar = page.locator('[role="progressbar"]').first()
    await expect(progressBar).toBeVisible()

    // 等待完成（最多 30 秒）
    await expect(page.locator('text=已完成')).toBeVisible({ timeout: 30000 })
  })

  test('TC-003: 查看任务详情', async ({ page }) => {
    // 点击任务卡片的"详情"按钮
    await page.locator('button:has-text("详情")').first().click()

    // 验证抽屉从右侧滑入
    const drawer = page.locator('[role="dialog"]')
    await expect(drawer).toBeVisible()

    // 切换到 Timeline 标签
    await page.click('button:has-text("Timeline")')
    await expect(page.locator('text=时间轴')).toBeVisible()

    // 切换到 Logs 标签
    await page.click('button:has-text("Logs")')
    await expect(page.locator('[style*="font-mono"]')).toBeVisible()

    // 关闭抽屉
    await page.click('button[aria-label="关闭"]')
    await expect(drawer).not.toBeVisible()
  })

  test('TC-004: 导出任务', async ({ page }) => {
    // 打开任务详情
    await page.locator('button:has-text("详情")').first().click()

    // 点击"导出 Markdown"
    const [mdDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("导出 Markdown")')
    ])
    expect(mdDownload.suggestedFilename()).toMatch(/\.md$/)

    // 点击"导出 JSON"
    const [jsonDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("导出 JSON")')
    ])
    expect(jsonDownload.suggestedFilename()).toMatch(/\.json$/)
  })
})
