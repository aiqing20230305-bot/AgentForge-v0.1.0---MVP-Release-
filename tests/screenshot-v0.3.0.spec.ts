/**
 * v0.3.0 新功能截图生成
 *
 * 生成排行榜、邀请码系统、移动端适配的产品截图
 */

import { test, expect } from '@playwright/test'

// 配置
const SCREENSHOT_DIR = 'docs/screenshots'
const VIEWPORT_DESKTOP = { width: 1920, height: 1080 }
const VIEWPORT_MOBILE = { width: 375, height: 812 } // iPhone X

test.describe('v0.3.0 Product Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    // 等待应用加载
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 30000
    })

    // 等待主应用渲染
    await page.waitForSelector('[data-testid="main-app"]', { timeout: 10000 })
    await page.waitForTimeout(2000) // 等待动画完成
  })

  test('Screenshot 1: Leaderboard - Level Ranking', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP)

    // 点击排行榜标签
    const leaderboardTab = page.locator('[data-testid="nav-tab-leaderboard"]')
    await leaderboardTab.waitFor({ state: 'visible' })
    await leaderboardTab.click()

    // 等待排行榜数据加载
    await page.waitForTimeout(1000)

    // 确保在等级排行榜标签
    const levelTab = page.locator('text=等级排行榜').first()
    if (await levelTab.isVisible()) {
      await levelTab.click()
      await page.waitForTimeout(500)
    }

    // 截图
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/screenshot-leaderboard-level.png`,
      fullPage: false
    })

    console.log('✅ Screenshot 1: Leaderboard Level Ranking')
  })

  test('Screenshot 2: Leaderboard - PVP Ranking', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP)

    // 点击排行榜标签
    const leaderboardTab = page.locator('[data-testid="nav-tab-leaderboard"]')
    await leaderboardTab.click()
    await page.waitForTimeout(1000)

    // 切换到PVP排行榜
    const pvpTab = page.locator('text=PVP评分').first()
    if (await pvpTab.isVisible()) {
      await pvpTab.click()
      await page.waitForTimeout(500)
    }

    // 截图
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/screenshot-leaderboard-pvp.png`,
      fullPage: false
    })

    console.log('✅ Screenshot 2: Leaderboard PVP Ranking')
  })

  test('Screenshot 3: Invite System - My Codes', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP)

    // 点击邀请标签
    const inviteTab = page.locator('[data-testid="nav-tab-invite"]')
    await inviteTab.waitFor({ state: 'visible' })
    await inviteTab.click()
    await page.waitForTimeout(1000)

    // 确保在"我的邀请码"标签
    const myCodesTab = page.locator('text=我的邀请码').first()
    if (await myCodesTab.isVisible()) {
      await myCodesTab.click()
      await page.waitForTimeout(500)
    }

    // 截图
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/screenshot-invite-mycodes.png`,
      fullPage: false
    })

    console.log('✅ Screenshot 3: Invite System - My Codes')
  })

  test('Screenshot 4: Invite System - Use Code', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP)

    // 点击邀请标签
    const inviteTab = page.locator('[data-testid="nav-tab-invite"]')
    await inviteTab.click()
    await page.waitForTimeout(1000)

    // 切换到"使用邀请码"标签
    const useCodeTab = page.locator('text=使用邀请码').first()
    if (await useCodeTab.isVisible()) {
      await useCodeTab.click()
      await page.waitForTimeout(500)
    }

    // 截图
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/screenshot-invite-usecode.png`,
      fullPage: false
    })

    console.log('✅ Screenshot 4: Invite System - Use Code')
  })

  test('Screenshot 5: Invite Leaderboard', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP)

    // 点击邀请标签
    const inviteTab = page.locator('[data-testid="nav-tab-invite"]')
    await inviteTab.click()
    await page.waitForTimeout(1000)

    // 切换到"邀请排行榜"标签
    const rankingTab = page.locator('text=邀请排行榜').first()
    if (await rankingTab.isVisible()) {
      await rankingTab.click()
      await page.waitForTimeout(500)
    }

    // 截图
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/screenshot-invite-ranking.png`,
      fullPage: false
    })

    console.log('✅ Screenshot 5: Invite Leaderboard')
  })

  test('Screenshot 6: Mobile View - Main Interface', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_MOBILE)

    // 主界面（默认就是任务标签）
    await page.waitForTimeout(1000)

    // 截图
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/screenshot-mobile-main.png`,
      fullPage: false
    })

    console.log('✅ Screenshot 6: Mobile Main Interface')
  })

  test('Screenshot 7: Mobile View - Leaderboard', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_MOBILE)

    // 点击排行榜标签
    const leaderboardTab = page.locator('[data-testid="nav-tab-leaderboard"]')
    await leaderboardTab.click()
    await page.waitForTimeout(1000)

    // 截图
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/screenshot-mobile-leaderboard.png`,
      fullPage: false
    })

    console.log('✅ Screenshot 7: Mobile Leaderboard')
  })

  test('Screenshot 8: Overall Dashboard', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_DESKTOP)

    // 主界面全景截图
    await page.waitForTimeout(1500)

    // 截图
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/screenshot-dashboard-overview.png`,
      fullPage: false
    })

    console.log('✅ Screenshot 8: Overall Dashboard')
  })
})
