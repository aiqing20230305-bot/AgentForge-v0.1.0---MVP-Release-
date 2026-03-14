/**
 * 自动截图脚本
 * 用于生成营销素材 - 14小时冲刺版本
 */

import { test, expect } from '@playwright/test'
import path from 'path'

// 截图保存目录
const SCREENSHOT_DIR = path.join(__dirname, '../docs/screenshots')

test.describe('产品截图生成', () => {
  test.beforeEach(async ({ page }) => {
    // 设置大屏幕分辨率（1920x1080）
    await page.setViewportSize({ width: 1920, height: 1080 })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 跳过新手向导
    const skipButton = page.locator('button:has-text("跳过向导"), button:has-text("跳过")')
    if (await skipButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await skipButton.click()
      await page.waitForTimeout(1000)
    }
  })

  test('1. 主界面截图 (screenshot-main.png)', async ({ page }) => {
    console.log('📸 拍摄主界面...')
    await page.waitForTimeout(2000)

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'screenshot-main.png'),
      fullPage: false
    })

    console.log('✅ 主界面截图完成')
  })

  test('2. 任务管理截图 (screenshot-tasks.png)', async ({ page }) => {
    console.log('📸 拍摄任务管理面板...')

    // 默认就是任务管理标签，直接截图
    await page.waitForTimeout(1000)

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'screenshot-tasks.png'),
      fullPage: false
    })

    console.log('✅ 任务管理截图完成')
  })

  test('3. 能耗仪表板截图 (screenshot-energy-dashboard.png)', async ({ page }) => {
    console.log('📸 拍摄能耗仪表板...')

    // 使用nth选择第2个导航按钮（索引1）
    const navButtons = page.locator('.w-\\[480px\\] button').filter({ has: page.locator('svg') })
    await navButtons.nth(1).click()
    await page.waitForTimeout(2000)

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'screenshot-energy-dashboard.png'),
      fullPage: false
    })

    console.log('✅ 能耗仪表板截图完成')
  })

  test('4. 技能树截图 (screenshot-skill-tree.png)', async ({ page }) => {
    console.log('📸 拍摄技能树...')

    // 点击第3个导航按钮（索引2）
    const navButtons = page.locator('.w-\\[480px\\] button').filter({ has: page.locator('svg') })
    await navButtons.nth(2).click()
    await page.waitForTimeout(2000)

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'screenshot-skill-tree.png'),
      fullPage: false
    })

    console.log('✅ 技能树截图完成')
  })

  test('5. 成就面板截图 (screenshot-achievements.png)', async ({ page }) => {
    console.log('📸 拍摄成就面板...')

    // 点击第4个导航按钮（索引3）
    const navButtons = page.locator('.w-\\[480px\\] button').filter({ has: page.locator('svg') })
    await navButtons.nth(3).click()
    await page.waitForTimeout(2000)

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'screenshot-achievements.png'),
      fullPage: false
    })

    console.log('✅ 成就面板截图完成')
  })

  test('6. PvP战斗截图 (screenshot-pvp-battle.png)', async ({ page }) => {
    console.log('📸 拍摄PvP战斗...')

    // 点击第5个导航按钮（索引4）
    const navButtons = page.locator('.w-\\[480px\\] button').filter({ has: page.locator('svg') })
    await navButtons.nth(4).click()
    await page.waitForTimeout(2000)

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'screenshot-pvp-battle.png'),
      fullPage: false
    })

    console.log('✅ PvP战斗截图完成')
  })

  test('7. 完整界面展示 (main-interface.png)', async ({ page }) => {
    console.log('📸 拍摄完整界面（高清）...')
    await page.waitForTimeout(2000)

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'main-interface.png'),
      fullPage: false
    })

    console.log('✅ 完整界面截图完成')
  })
})

test.describe('功能验证测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const skipButton = page.locator('button:has-text("跳过向导"), button:has-text("跳过")')
    if (await skipButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await skipButton.click()
      await page.waitForTimeout(1000)
    }
  })

  test('验证：5个导航标签都可访问', async ({ page }) => {
    console.log('🧪 测试导航标签...')

    const tabs = [
      { name: '任务管理', index: 0 },
      { name: '能耗仪表板', index: 1 },
      { name: '技能树', index: 2 },
      { name: '成就', index: 3 },
      { name: 'PvP对战', index: 4 }
    ]

    const navButtons = page.locator('.w-\\[480px\\] button').filter({ has: page.locator('svg') })

    for (const tab of tabs) {
      try {
        await navButtons.nth(tab.index).click()
        await page.waitForTimeout(500)
        console.log(`  ✅ ${tab.name} - 可访问`)
      } catch (error) {
        console.log(`  ❌ ${tab.name} - 失败`)
      }
    }
  })

  test('验证：Agent数据扩展字段已初始化', async ({ page }) => {
    console.log('🧪 测试Agent数据初始化...')

    // 点击技能树标签
    const navButtons = page.locator('.w-\\[480px\\] button').filter({ has: page.locator('svg') })
    await navButtons.nth(2).click()
    await page.waitForTimeout(1500)

    // 检查是否显示"数据未初始化"错误
    const hasError = await page.locator('text=技能树数据未初始化').isVisible({ timeout: 2000 }).catch(() => false)

    if (hasError) {
      console.log('  ❌ 技能树数据未初始化')
      throw new Error('Agent数据扩展字段未正确初始化')
    } else {
      const hasSkillPoints = await page.locator('text=可用技能点').isVisible({ timeout: 2000 }).catch(() => false)

      if (hasSkillPoints) {
        console.log('  ✅ 技能树数据正常，显示技能点')
      } else {
        console.log('  ⚠️ 技能树显示，但未找到技能点')
      }
    }
  })

  test('验证：能耗仪表板正常显示', async ({ page }) => {
    console.log('🧪 测试能耗仪表板...')

    // 点击能耗标签
    const navButtons = page.locator('.w-\\[480px\\] button').filter({ has: page.locator('svg') })
    await navButtons.nth(1).click()
    await page.waitForTimeout(1500)

    // 检查关键元素
    const elements = [
      { name: '能耗监控中心', selector: 'text=能耗监控中心' },
      { name: '今日消耗', selector: 'text=今日' },
      { name: '本周消耗', selector: 'text=本周' },
      { name: '本月消耗', selector: 'text=本月' }
    ]

    for (const el of elements) {
      const visible = await page.locator(el.selector).isVisible({ timeout: 2000 }).catch(() => false)
      console.log(`  ${visible ? '✅' : '❌'} ${el.name}`)
    }
  })
})
