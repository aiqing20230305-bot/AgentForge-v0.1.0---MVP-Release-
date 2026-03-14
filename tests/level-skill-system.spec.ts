import { test, expect } from '@playwright/test'

test.describe('等级系统测试', () => {
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

  test('TC-008: 查看技能树', async ({ page }) => {
    // 打开技能树面板
    await page.click('text=技能树')

    // 验证技能树布局
    await expect(page.locator('text=效率分支')).toBeVisible()
    await expect(page.locator('text=战斗分支')).toBeVisible()
    await expect(page.locator('text=学习分支')).toBeVisible()
    await expect(page.locator('text=精准分支')).toBeVisible()
    await expect(page.locator('text=终极分支')).toBeVisible()

    // 点击一个技能
    await page.locator('.skill-node').first().click()

    // 验证右侧显示技能详情
    await expect(page.locator('[role="complementary"]')).toBeVisible()
    await expect(page.locator('text=技能详情')).toBeVisible()
  })

  test('TC-009: 解锁技能', async ({ page }) => {
    // 打开技能树
    await page.click('text=技能树')

    // 获取当前技能点数量
    const skillPointsText = await page.locator('text=/技能点:?\\s*\\d+/').textContent()
    const currentPoints = parseInt(skillPointsText?.match(/\d+/)?.[0] || '0')

    if (currentPoints > 0) {
      // 找到一个未解锁但可解锁的技能
      const unlockableSkill = page.locator('.skill-node:not(.unlocked):not(.locked)').first()

      if (await unlockableSkill.count() > 0) {
        await unlockableSkill.click()

        // 点击"解锁技能"按钮
        await page.click('button:has-text("解锁技能")')

        // 验证技能点减少
        const newSkillPointsText = await page.locator('text=/技能点:?\\s*\\d+/').textContent()
        const newPoints = parseInt(newSkillPointsText?.match(/\d+/)?.[0] || '0')
        expect(newPoints).toBe(currentPoints - 1)

        // 验证技能变为彩色（已解锁）
        await expect(unlockableSkill).toHaveClass(/unlocked/)
      }
    }
  })

  test('TC-010: 升级动画', async ({ page }) => {
    // 注意：此测试需要触发升级条件，可能需要模拟或预设数据
    // 这里我们测试升级动画模态框的基本功能

    // 如果有触发升级的方式（例如完成大量任务获得经验）
    // 等待升级动画出现
    const levelUpModal = page.locator('text=LEVEL UP!')

    // 设置较短的超时，因为可能没有升级
    const isVisible = await levelUpModal.isVisible({ timeout: 3000 }).catch(() => false)

    if (isVisible) {
      // 验证升级动画元素
      await expect(page.locator('text=/等级\\s*\\d+/')).toBeVisible()
      await expect(page.locator('text=/\\+\\d+\\s*技能点/')).toBeVisible()

      // 验证粒子特效（检查是否有动画元素）
      const particles = page.locator('[class*="particle"]')
      await expect(particles.first()).toBeVisible()

      // 等待自动关闭或手动关闭
      await page.waitForTimeout(5000)
      await expect(levelUpModal).not.toBeVisible()
    }
  })

  test('TC-011: 成就系统', async ({ page }) => {
    // 打开成就面板
    await page.click('text=成就')

    // 验证成就显示
    await expect(page.locator('[class*="achievement-card"]')).toHaveCount(31, { timeout: 5000 })

    // 切换类别筛选
    const categories = ['全部', '任务', '等级', '技能', 'PvP', '能耗', '特殊']

    for (const category of categories) {
      await page.click(`button:has-text("${category}")`)
      await page.waitForTimeout(300)

      // 验证筛选后有成就显示（或者显示"暂无成就"）
      const achievements = page.locator('[class*="achievement-card"]')
      const emptyMessage = page.locator('text=暂无成就')

      const hasAchievements = await achievements.count() > 0
      const hasEmptyMessage = await emptyMessage.isVisible()

      expect(hasAchievements || hasEmptyMessage).toBe(true)
    }

    // 点击一个成就查看详情
    await page.locator('[class*="achievement-card"]').first().click()

    // 验证详情弹窗显示
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })
})
