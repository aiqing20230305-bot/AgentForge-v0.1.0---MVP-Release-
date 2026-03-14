import { test, expect } from '@playwright/test'

test.describe('PvP战斗测试', () => {
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

  test('TC-012: 战斗准备', async ({ page }) => {
    // 点击"PvP对战"
    await page.click('text=PvP对战')

    // 在对手列表中选择一个
    await page.locator('[class*="opponent-card"]').first().click()

    // 验证显示玩家和对手属性
    await expect(page.locator('text=/HP:?\\s*\\d+/')).toHaveCount(2) // 玩家和对手各一个
    await expect(page.locator('text=/攻击:?\\s*\\d+/')).toBeVisible()
    await expect(page.locator('text=/防御:?\\s*\\d+/')).toBeVisible()

    // 验证 VS 动画显示
    await expect(page.locator('text=VS')).toBeVisible()

    // 验证胜率百分比计算
    await expect(page.locator('text=/胜率:?\\s*\\d+%/')).toBeVisible()

    // 点击"开始战斗"
    await page.click('button:has-text("开始战斗")')

    // 验证进入战斗场景
    await expect(page.locator('[class*="battle-arena"]')).toBeVisible({ timeout: 5000 })
  })

  test('TC-013: 战斗场景', async ({ page }) => {
    // 进入战斗（假设已经准备好）
    await page.click('text=PvP对战')
    await page.locator('[class*="opponent-card"]').first().click()
    await page.click('button:has-text("开始战斗")')

    // 验证回合指示器显示
    await expect(page.locator('text=/回合\\s*\\d+/')).toBeVisible({ timeout: 5000 })

    // 验证 HP 条存在
    const hpBars = page.locator('[class*="hp-bar"], [role="progressbar"]')
    await expect(hpBars).toHaveCount(2, { timeout: 3000 }) // 玩家和对手

    // 如果是玩家回合，测试技能按钮
    const skillButtons = page.locator('button[class*="skill"]')
    const skillCount = await skillButtons.count()

    if (skillCount > 0) {
      // 点击第一个技能
      await skillButtons.first().click()

      // 验证战斗日志更新
      await expect(page.locator('[class*="battle-log"]')).toBeVisible()
    }

    // 点击"结束回合"（如果有）
    const endTurnButton = page.locator('button:has-text("结束回合")')
    if (await endTurnButton.isVisible()) {
      await endTurnButton.click()
    }
  })

  test('TC-014: 战斗日志', async ({ page }) => {
    // 进入战斗
    await page.click('text=PvP对战')
    await page.locator('[class*="opponent-card"]').first().click()
    await page.click('button:has-text("开始战斗")')

    // 等待战斗日志面板出现
    const battleLog = page.locator('[class*="battle-log"]')
    await expect(battleLog).toBeVisible({ timeout: 5000 })

    // 验证日志实时更新（等待至少有几条日志）
    await page.waitForTimeout(2000)
    const logEntries = battleLog.locator('[class*="log-entry"], div:has-text("攻击"), div:has-text("技能")')
    const entryCount = await logEntries.count()
    expect(entryCount).toBeGreaterThan(0)

    // 验证颜色编码（检查是否有不同颜色的文本）
    const coloredLogs = battleLog.locator('[class*="text-orange"], [class*="text-purple"], [class*="text-blue"]')
    await expect(coloredLogs.first()).toBeVisible()

    // 验证图标匹配动作（检查是否有图标）
    const icons = battleLog.locator('svg')
    await expect(icons.first()).toBeVisible()
  })

  test('TC-015: 战斗结果', async ({ page }) => {
    // 进入战斗
    await page.click('text=PvP对战')
    await page.locator('[class*="opponent-card"]').first().click()
    await page.click('button:has-text("开始战斗")')

    // 等待战斗结束（最多 60 秒）
    const resultModal = page.locator('text=/VICTORY|DEFEAT/')
    await expect(resultModal).toBeVisible({ timeout: 60000 })

    // 验证结果界面元素
    const isVictory = await page.locator('text=VICTORY').isVisible()

    if (isVictory) {
      // 验证奖励显示
      await expect(page.locator('text=战斗奖励')).toBeVisible()
      await expect(page.locator('text=/\\+\\d+/')).toBeVisible() // 经验值、金币等

      // 验证排位分变化
      await expect(page.locator('text=/排位分/')).toBeVisible()
    } else {
      // 验证失败鼓励消息
      await expect(page.locator('text=/不要气馁|再接再厉/')).toBeVisible()
    }

    // 验证粒子特效（检查动画元素）
    const particles = page.locator('[class*="particle"], [class*="absolute"]')
    await expect(particles.first()).toBeVisible()

    // 验证"再战一场"按钮
    await expect(page.locator('button:has-text("再战一场")')).toBeVisible()

    // 点击返回按钮
    await page.click('button:has-text("返回")')
    await expect(resultModal).not.toBeVisible()
  })

  test('TC-016: 完整战斗流程', async ({ page }) => {
    // 完整流程：准备 → 战斗 → 结果
    await page.click('text=PvP对战')
    await page.locator('[class*="opponent-card"]').first().click()

    // 记录胜率预测
    const winRateText = await page.locator('text=/胜率:?\\s*\\d+%/').textContent()
    console.log('预测胜率:', winRateText)

    await page.click('button:has-text("开始战斗")')

    // 战斗过程（等待结束）
    await page.waitForTimeout(5000)

    // 验证最终结果
    const result = page.locator('text=/VICTORY|DEFEAT/')
    await expect(result).toBeVisible({ timeout: 60000 })

    const finalResult = await result.textContent()
    console.log('战斗结果:', finalResult)
  })
})
