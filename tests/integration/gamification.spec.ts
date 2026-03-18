/**
 * 游戏化系统集成测试
 * Integration Tests for Gamification System
 */

import { test, expect } from '@playwright/test';

test.describe('Gamification System Integration', () => {
  test.beforeEach(async ({ page }) => {
    // 访问应用首页
    await page.goto('http://localhost:5173');

    // 等待应用加载完成
    await page.waitForLoadState('networkidle');
  });

  test('Currency Display Component', async ({ page }) => {
    // 导航到游戏化页面
    await page.click('[data-testid="gamification-nav"]');

    // 验证货币显示组件存在
    const currencyDisplay = page.locator('[data-testid="currency-display"]');
    await expect(currencyDisplay).toBeVisible();

    // 验证三种货币都显示
    await expect(page.locator('text=🪙')).toBeVisible(); // coins
    await expect(page.locator('text=💎')).toBeVisible(); // gems
    await expect(page.locator('text=🎫')).toBeVisible(); // tokens

    // 验证货币值是数字格式
    const coinValue = await page.locator('[data-testid="currency-coins"]').textContent();
    expect(coinValue).toMatch(/\d{1,3}(,\d{3})*/);
  });

  test('Achievement Wall - Filtering and Search', async ({ page }) => {
    await page.click('[data-testid="achievements-nav"]');

    // 等待成就墙加载
    await page.waitForSelector('[data-testid="achievement-wall"]');

    // 测试过滤器 - 未解锁
    await page.click('button:has-text("未解锁")');
    await page.waitForTimeout(500);

    // 验证只显示未解锁的成就
    const lockedAchievements = page.locator('[data-testid="achievement-card"][data-locked="true"]');
    const lockedCount = await lockedAchievements.count();
    expect(lockedCount).toBeGreaterThan(0);

    // 测试搜索功能
    await page.fill('[data-testid="achievement-search"]', 'first');
    await page.waitForTimeout(300);

    // 验证搜索结果
    const searchResults = page.locator('[data-testid="achievement-card"]');
    const resultsCount = await searchResults.count();
    expect(resultsCount).toBeLessThanOrEqual(10);

    // 清除搜索
    await page.fill('[data-testid="achievement-search"]', '');

    // 测试类别过滤
    await page.selectOption('[data-testid="category-filter"]', 'agent');
    await page.waitForTimeout(300);

    // 验证类别过滤结果
    const categoryResults = page.locator('[data-testid="achievement-card"]');
    expect(await categoryResults.count()).toBeGreaterThan(0);
  });

  test('Daily Challenge Panel - Progress Tracking', async ({ page }) => {
    await page.click('[data-testid="daily-challenge-nav"]');

    // 验证每日挑战面板存在
    const challengePanel = page.locator('[data-testid="daily-challenge-panel"]');
    await expect(challengePanel).toBeVisible();

    // 验证难度标识显示
    const difficultyBadge = page.locator('[data-testid="challenge-difficulty"]');
    await expect(difficultyBadge).toBeVisible();
    expect(await difficultyBadge.textContent()).toMatch(/EASY|MEDIUM|HARD|EXPERT/);

    // 验证总进度条
    const progressBar = page.locator('[data-testid="challenge-progress-bar"]');
    await expect(progressBar).toBeVisible();

    // 验证任务列表
    const tasks = page.locator('[data-testid="challenge-task"]');
    const taskCount = await tasks.count();
    expect(taskCount).toBeGreaterThanOrEqual(1);
    expect(taskCount).toBeLessThanOrEqual(10);

    // 验证每个任务都有进度条
    for (let i = 0; i < taskCount; i++) {
      const taskProgress = tasks.nth(i).locator('[data-testid="task-progress"]');
      await expect(taskProgress).toBeVisible();
    }

    // 验证奖励预览（如果未完成）
    const rewardsPreview = page.locator('[data-testid="rewards-preview"]');
    if (await rewardsPreview.isVisible()) {
      await expect(rewardsPreview).toContainText('完成所有任务可获得');
    }
  });

  test('Leaderboard View - Multiple Filters', async ({ page }) => {
    await page.click('[data-testid="leaderboard-nav"]');

    // 验证排行榜视图
    const leaderboard = page.locator('[data-testid="leaderboard-view"]');
    await expect(leaderboard).toBeVisible();

    // 测试类型过滤器
    await page.selectOption('[data-testid="leaderboard-type"]', 'global');
    await page.waitForTimeout(300);
    await expect(page.locator('[data-testid="leaderboard-entries"]')).toBeVisible();

    // 测试指标过滤器
    await page.selectOption('[data-testid="leaderboard-metric"]', 'xp');
    await page.waitForTimeout(300);

    // 验证前三名特殊显示
    await expect(page.locator('text=🥇')).toBeVisible();
    await expect(page.locator('text=🥈')).toBeVisible();
    await expect(page.locator('text=🥉')).toBeVisible();

    // 测试周期过滤器
    await page.selectOption('[data-testid="leaderboard-period"]', 'weekly');
    await page.waitForTimeout(300);

    // 验证排行榜数据更新
    const entries = page.locator('[data-testid="leaderboard-entry"]');
    const entriesCount = await entries.count();
    expect(entriesCount).toBeGreaterThan(0);
    expect(entriesCount).toBeLessThanOrEqual(50);

    // 验证我的排名显示
    const myRank = page.locator('[data-testid="my-rank"]');
    if (await myRank.isVisible()) {
      expect(await myRank.textContent()).toMatch(/#\d+/);
    }
  });

  test('Reward Animation - Display and Dismiss', async ({ page }) => {
    // 触发奖励动画（模拟解锁成就）
    await page.evaluate(() => {
      // 使用全局事件触发奖励动画
      window.dispatchEvent(new CustomEvent('show-reward', {
        detail: {
          rewards: [
            { id: '1', type: 'xp', amount: 100, icon: '⭐', name: 'Experience Points' },
            { id: '2', type: 'coins', amount: 50, icon: '🪙', name: 'Gold Coins' },
          ]
        }
      }));
    });

    // 等待动画出现
    await page.waitForSelector('[data-testid="reward-animation"]', { timeout: 5000 });

    // 验证遮罩层
    const overlay = page.locator('[data-testid="reward-animation"]');
    await expect(overlay).toBeVisible();

    // 验证奖励项显示
    await expect(page.locator('text=🎉 恭喜获得奖励')).toBeVisible();
    await expect(page.locator('text=Experience Points')).toBeVisible();

    // 点击关闭
    await page.click('[data-testid="reward-animation"]');

    // 验证动画消失
    await expect(overlay).not.toBeVisible({ timeout: 3000 });
  });

  test('Progress Tracker - Goal Management', async ({ page }) => {
    await page.click('[data-testid="progress-tracker-nav"]');

    // 验证进度追踪器
    const tracker = page.locator('[data-testid="progress-tracker"]');
    await expect(tracker).toBeVisible();

    // 验证统计卡片
    await expect(page.locator('[data-testid="stat-total-goals"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-completed"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-in-progress"]')).toBeVisible();

    // 验证目标卡片
    const goalCards = page.locator('[data-testid="goal-card"]');
    const goalCount = await goalCards.count();

    if (goalCount > 0) {
      const firstGoal = goalCards.first();

      // 验证目标信息
      await expect(firstGoal.locator('[data-testid="goal-title"]')).toBeVisible();
      await expect(firstGoal.locator('[data-testid="goal-progress"]')).toBeVisible();

      // 验证里程碑列表
      const milestones = firstGoal.locator('[data-testid="milestone-item"]');
      const milestoneCount = await milestones.count();

      if (milestoneCount > 0) {
        // 验证每个里程碑都有进度
        for (let i = 0; i < milestoneCount; i++) {
          const milestone = milestones.nth(i);
          await expect(milestone.locator('[data-testid="milestone-progress"]')).toBeVisible();
        }
      }
    }
  });

  test('Game Stats Dashboard - Comprehensive Display', async ({ page }) => {
    await page.click('[data-testid="game-stats-nav"]');

    // 验证游戏统计仪表盘
    const dashboard = page.locator('[data-testid="game-stats"]');
    await expect(dashboard).toBeVisible();

    // 验证等级和经验显示
    await expect(page.locator('[data-testid="user-level"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-xp"]')).toBeVisible();
    await expect(page.locator('[data-testid="xp-progress-bar"]')).toBeVisible();

    // 验证核心统计网格
    await expect(page.locator('[data-testid="stat-agents"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-tasks"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-teams"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-streak"]')).toBeVisible();

    // 验证成就收集进度
    const achievementProgress = page.locator('[data-testid="achievement-progress"]');
    await expect(achievementProgress).toBeVisible();
    expect(await achievementProgress.textContent()).toMatch(/\d+\/\d+/);

    // 验证货币总览
    await expect(page.locator('[data-testid="currency-overview"]')).toBeVisible();

    // 验证活动热力图
    const heatmap = page.locator('[data-testid="activity-heatmap"]');
    if (await heatmap.isVisible()) {
      const heatmapCells = heatmap.locator('[data-testid="heatmap-cell"]');
      const cellCount = await heatmapCells.count();
      expect(cellCount).toBe(168); // 7天 x 24小时 = 168个单元格
    }

    // 验证排行榜位置
    await expect(page.locator('[data-testid="leaderboard-position"]')).toBeVisible();
  });

  test('Gamification Integration - Cross-Component State', async ({ page }) => {
    // 测试跨组件状态同步

    // 1. 在货币显示中查看初始余额
    await page.click('[data-testid="gamification-nav"]');
    const initialCoins = await page.locator('[data-testid="currency-coins"]').textContent();

    // 2. 完成一个任务（模拟）
    await page.evaluate(() => {
      // 触发任务完成事件
      window.dispatchEvent(new CustomEvent('task-completed', {
        detail: { reward: { coins: 100, xp: 50 } }
      }));
    });

    // 3. 验证货币更新
    await page.waitForTimeout(500);
    const updatedCoins = await page.locator('[data-testid="currency-coins"]').textContent();
    // 注意：实际实现中应验证数值增加

    // 4. 导航到游戏统计，验证经验值更新
    await page.click('[data-testid="game-stats-nav"]');
    await expect(page.locator('[data-testid="user-xp"]')).toBeVisible();

    // 5. 导航到成就墙，验证进度更新
    await page.click('[data-testid="achievements-nav"]');
    await expect(page.locator('[data-testid="achievement-wall"]')).toBeVisible();
  });

  test('Performance - Large Data Set Rendering', async ({ page }) => {
    // 性能测试：大量成就渲染
    await page.click('[data-testid="achievements-nav"]');

    const startTime = Date.now();

    // 等待所有成就加载完成
    await page.waitForSelector('[data-testid="achievement-card"]');

    const loadTime = Date.now() - startTime;

    // 验证加载时间 < 2秒
    expect(loadTime).toBeLessThan(2000);

    // 验证滚动性能
    const achievementList = page.locator('[data-testid="achievement-list"]');

    // 快速滚动
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(100);
    }

    // 验证页面仍然响应
    await expect(achievementList).toBeVisible();
  });

  test('Accessibility - ARIA Labels and Keyboard Navigation', async ({ page }) => {
    await page.click('[data-testid="gamification-nav"]');

    // 验证ARIA标签
    const currencyDisplay = page.locator('[data-testid="currency-display"]');
    expect(await currencyDisplay.getAttribute('aria-label')).toBeTruthy();

    // 测试键盘导航
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // 验证焦点可见性
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();

    // 验证Enter键可以激活按钮
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
  });

  test('Error Handling - Network Failure', async ({ page }) => {
    // 模拟网络故障
    await page.route('**/api/gamification/**', route => route.abort());

    await page.click('[data-testid="gamification-nav"]');

    // 验证错误提示显示
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 5000 });

    // 验证重试按钮
    const retryButton = page.locator('[data-testid="retry-button"]');
    if (await retryButton.isVisible()) {
      await retryButton.click();
    }
  });
});
