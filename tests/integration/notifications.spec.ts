/**
 * 通知系统集成测试
 * Integration Tests for Notification System
 */

import { test, expect } from '@playwright/test';

test.describe('Notification System Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('Notification Bell - Display and Badge', async ({ page }) => {
    // 验证通知铃铛存在
    const notificationBell = page.locator('[data-testid="notification-bell"]');
    await expect(notificationBell).toBeVisible();

    // 验证未读数量徽章
    const badge = page.locator('[data-testid="notification-badge"]');
    if (await badge.isVisible()) {
      const badgeText = await badge.textContent();
      expect(badgeText).toMatch(/\d+/);
    }

    // 点击铃铛打开通知中心
    await notificationBell.click();

    // 验证通知中心打开
    await expect(page.locator('[data-testid="notification-center"]')).toBeVisible();
  });

  test('Notification Center - List and Actions', async ({ page }) => {
    // 打开通知中心
    await page.click('[data-testid="notification-bell"]');

    const notificationCenter = page.locator('[data-testid="notification-center"]');
    await expect(notificationCenter).toBeVisible();

    // 验证通知列表
    const notifications = page.locator('[data-testid="notification-item"]');
    const notificationCount = await notifications.count();

    if (notificationCount > 0) {
      const firstNotification = notifications.first();

      // 验证通知内容
      await expect(firstNotification.locator('[data-testid="notification-title"]')).toBeVisible();
      await expect(firstNotification.locator('[data-testid="notification-message"]')).toBeVisible();
      await expect(firstNotification.locator('[data-testid="notification-time"]')).toBeVisible();

      // 测试标记已读
      const markReadButton = firstNotification.locator('[data-testid="mark-read-button"]');
      if (await markReadButton.isVisible()) {
        await markReadButton.click();
        await page.waitForTimeout(300);

        // 验证未读标识消失
        await expect(firstNotification.locator('[data-testid="unread-indicator"]')).not.toBeVisible();
      }

      // 测试删除通知
      const deleteButton = firstNotification.locator('[data-testid="delete-button"]');
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        await page.waitForTimeout(300);

        // 验证通知被删除
        const remainingCount = await notifications.count();
        expect(remainingCount).toBe(notificationCount - 1);
      }
    }

    // 测试全部标记已读
    const markAllReadButton = page.locator('[data-testid="mark-all-read"]');
    if (await markAllReadButton.isVisible()) {
      await markAllReadButton.click();
      await page.waitForTimeout(500);

      // 验证所有未读标识消失
      const unreadIndicators = page.locator('[data-testid="unread-indicator"]');
      expect(await unreadIndicators.count()).toBe(0);
    }
  });

  test('Notification Settings - Preferences Management', async ({ page }) => {
    // 导航到设置页面
    await page.click('[data-testid="settings-nav"]');
    await page.click('[data-testid="notification-settings-tab"]');

    // 验证设置页面加载
    await expect(page.locator('[data-testid="notification-settings"]')).toBeVisible();

    // 测试渠道设置标签
    await page.click('button:has-text("通知渠道")');
    await page.waitForTimeout(200);

    // 测试Email通知开关
    const emailToggle = page.locator('[data-testid="email-toggle"]');
    const initialState = await emailToggle.isChecked();
    await emailToggle.click();
    await page.waitForTimeout(300);
    expect(await emailToggle.isChecked()).toBe(!initialState);

    // 测试发送频率选择
    await page.selectOption('[data-testid="email-frequency"]', 'daily');
    await page.waitForTimeout(200);
    expect(await page.locator('[data-testid="email-frequency"]').inputValue()).toBe('daily');

    // 测试Push通知设置
    await page.click('[data-testid="push-toggle"]');
    const soundCheckbox = page.locator('[data-testid="push-sound"]');
    await soundCheckbox.click();
    await page.waitForTimeout(200);

    // 测试In-App通知设置
    await page.click('[data-testid="inapp-toggle"]');
    const toastCheckbox = page.locator('[data-testid="inapp-toast"]');
    await toastCheckbox.click();
    await page.waitForTimeout(200);

    // 测试保存设置
    const saveButton = page.locator('[data-testid="save-settings"]');
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // 验证成功提示
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 3000 });
  });

  test('Notification Settings - Type Matrix', async ({ page }) => {
    await page.click('[data-testid="settings-nav"]');
    await page.click('[data-testid="notification-settings-tab"]');

    // 切换到类型设置标签
    await page.click('button:has-text("通知类型")');
    await page.waitForTimeout(200);

    // 验证类型矩阵表格
    await expect(page.locator('[data-testid="type-matrix-table"]')).toBeVisible();

    // 测试类型复选框
    const systemEmailCheckbox = page.locator('[data-testid="type-system-email"]');
    const initialState = await systemEmailCheckbox.isChecked();
    await systemEmailCheckbox.click();
    await page.waitForTimeout(200);
    expect(await systemEmailCheckbox.isChecked()).toBe(!initialState);

    // 测试多个类型
    await page.click('[data-testid="type-agent-push"]');
    await page.click('[data-testid="type-task-inapp"]');
    await page.waitForTimeout(300);

    // 保存设置
    await page.click('[data-testid="save-settings"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 3000 });
  });

  test('Notification Settings - Do Not Disturb', async ({ page }) => {
    await page.click('[data-testid="settings-nav"]');
    await page.click('[data-testid="notification-settings-tab"]');

    // 切换到勿扰模式标签
    await page.click('button:has-text("勿扰模式")');
    await page.waitForTimeout(200);

    // 启用勿扰模式
    const dndToggle = page.locator('[data-testid="dnd-toggle"]');
    if (!(await dndToggle.isChecked())) {
      await dndToggle.click();
      await page.waitForTimeout(300);
    }

    // 验证时间选择器出现
    await expect(page.locator('[data-testid="dnd-start-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="dnd-end-time"]')).toBeVisible();

    // 设置时间
    await page.fill('[data-testid="dnd-start-time"]', '22:00');
    await page.fill('[data-testid="dnd-end-time"]', '08:00');

    // 测试允许紧急通知
    const allowUrgentCheckbox = page.locator('[data-testid="dnd-allow-urgent"]');
    await allowUrgentCheckbox.click();
    await page.waitForTimeout(200);

    // 保存设置
    await page.click('[data-testid="save-settings"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 3000 });
  });

  test('Notification Filter - Advanced Filtering', async ({ page }) => {
    await page.click('[data-testid="notification-bell"]');

    // 打开过滤器
    const filterButton = page.locator('[data-testid="filter-button"]');
    await filterButton.click();

    // 验证过滤器面板
    await expect(page.locator('[data-testid="notification-filter"]')).toBeVisible();

    // 测试搜索
    await page.fill('[data-testid="filter-search"]', 'agent');
    await page.waitForTimeout(500);

    // 验证搜索结果
    const searchResults = page.locator('[data-testid="notification-item"]');
    const resultsCount = await searchResults.count();

    if (resultsCount > 0) {
      // 验证结果包含搜索词
      const firstResult = await searchResults.first().textContent();
      expect(firstResult?.toLowerCase()).toContain('agent');
    }

    // 清除搜索
    await page.fill('[data-testid="filter-search"]', '');

    // 测试读取状态过滤
    await page.click('button:has-text("未读")');
    await page.waitForTimeout(300);

    // 测试类型过滤
    await page.click('[data-testid="filter-type-agent"]');
    await page.click('[data-testid="filter-type-task"]');
    await page.waitForTimeout(300);

    // 测试优先级过滤
    await page.click('[data-testid="filter-priority-urgent"]');
    await page.click('[data-testid="filter-priority-high"]');
    await page.waitForTimeout(300);

    // 测试日期范围过滤
    await page.fill('[data-testid="filter-date-start"]', '2026-03-01');
    await page.fill('[data-testid="filter-date-end"]', '2026-03-18');
    await page.waitForTimeout(300);

    // 验证活跃过滤条件计数
    const activeFilterCount = page.locator('[data-testid="active-filter-count"]');
    expect(await activeFilterCount.textContent()).toMatch(/\d+/);

    // 测试重置过滤器
    await page.click('[data-testid="reset-filters"]');
    await page.waitForTimeout(300);
    expect(await activeFilterCount.textContent()).toContain('0');
  });

  test('Notification Batch Operations - Selection and Actions', async ({ page }) => {
    await page.click('[data-testid="notification-bell"]');

    const notifications = page.locator('[data-testid="notification-item"]');
    const notificationCount = await notifications.count();

    if (notificationCount > 0) {
      // 选择第一个通知
      await notifications.first().locator('[data-testid="notification-checkbox"]').click();
      await page.waitForTimeout(200);

      // 验证批量操作栏出现
      await expect(page.locator('[data-testid="batch-operations"]')).toBeVisible();

      // 选择第二个通知
      if (notificationCount > 1) {
        await notifications.nth(1).locator('[data-testid="notification-checkbox"]').click();
        await page.waitForTimeout(200);

        // 验证选择计数
        const selectedCount = page.locator('[data-testid="selected-count"]');
        expect(await selectedCount.textContent()).toContain('2');
      }

      // 测试全选
      const selectAllCheckbox = page.locator('[data-testid="select-all"]');
      await selectAllCheckbox.click();
      await page.waitForTimeout(300);

      // 验证所有通知被选中
      expect(await page.locator('[data-testid="selected-count"]').textContent())
        .toContain(String(notificationCount));

      // 测试批量标记已读
      const markReadButton = page.locator('[data-testid="batch-mark-read"]');
      await markReadButton.click();
      await page.waitForTimeout(500);

      // 验证操作成功
      const unreadIndicators = page.locator('[data-testid="unread-indicator"]');
      expect(await unreadIndicators.count()).toBe(0);

      // 重新选择通知进行其他操作
      await notifications.first().locator('[data-testid="notification-checkbox"]').click();

      // 测试批量导出
      const exportButton = page.locator('[data-testid="batch-export"]');
      await exportButton.click();

      // 验证下载开始
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/notifications.*\.json/);

      // 测试批量删除（带确认）
      await notifications.first().locator('[data-testid="notification-checkbox"]').click();
      const deleteButton = page.locator('[data-testid="batch-delete"]');
      await deleteButton.click();

      // 验证确认对话框
      await expect(page.locator('[data-testid="confirm-delete-dialog"]')).toBeVisible();

      // 取消删除
      await page.click('[data-testid="cancel-delete"]');
      await expect(page.locator('[data-testid="confirm-delete-dialog"]')).not.toBeVisible();

      // 再次尝试删除并确认
      await deleteButton.click();
      await page.click('[data-testid="confirm-delete"]');
      await page.waitForTimeout(500);

      // 验证通知被删除
      const remainingCount = await notifications.count();
      expect(remainingCount).toBeLessThan(notificationCount);
    }
  });

  test('Real-time Notification - WebSocket Integration', async ({ page }) => {
    // 订阅WebSocket消息
    await page.evaluate(() => {
      // 模拟接收实时通知
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('notification-received', {
          detail: {
            id: 'test-notification-' + Date.now(),
            type: 'agent',
            priority: 'high',
            title: 'Test Agent Notification',
            message: 'This is a test notification from WebSocket',
            createdAt: new Date().toISOString(),
            read: false,
          }
        }));
      }, 1000);
    });

    // 等待通知到达
    await page.waitForTimeout(1500);

    // 验证通知徽章更新
    const badge = page.locator('[data-testid="notification-badge"]');
    await expect(badge).toBeVisible();

    // 打开通知中心
    await page.click('[data-testid="notification-bell"]');

    // 验证新通知出现在列表顶部
    const firstNotification = page.locator('[data-testid="notification-item"]').first();
    await expect(firstNotification.locator('text=Test Agent Notification')).toBeVisible();

    // 验证未读标识
    await expect(firstNotification.locator('[data-testid="unread-indicator"]')).toBeVisible();
  });

  test('Notification Preferences - Quick Actions', async ({ page }) => {
    await page.click('[data-testid="settings-nav"]');
    await page.click('[data-testid="notification-settings-tab"]');

    // 验证快速操作区域
    await expect(page.locator('[data-testid="quick-actions"]')).toBeVisible();

    // 测试"全部静音"快速操作
    await page.click('[data-testid="quick-action-mute-all"]');
    await page.waitForTimeout(500);

    // 验证Email和Push都被禁用
    expect(await page.locator('[data-testid="email-toggle"]').isChecked()).toBe(false);
    expect(await page.locator('[data-testid="push-toggle"]').isChecked()).toBe(false);

    // 测试"重要通知"快速操作
    await page.click('[data-testid="quick-action-important"]');
    await page.waitForTimeout(500);

    // 验证优先级过滤器设置
    // (实际实现中应验证只启用了urgent和high优先级)

    // 测试"仅邮件"快速操作
    await page.click('[data-testid="quick-action-email-only"]');
    await page.waitForTimeout(500);

    // 验证Push被禁用，Email启用
    expect(await page.locator('[data-testid="push-toggle"]').isChecked()).toBe(false);
    expect(await page.locator('[data-testid="email-toggle"]').isChecked()).toBe(true);
  });

  test('Notification Performance - Large List Rendering', async ({ page }) => {
    // 模拟大量通知
    await page.evaluate(() => {
      const notifications = Array.from({ length: 100 }, (_, i) => ({
        id: `notification-${i}`,
        type: 'system',
        priority: 'medium',
        title: `Notification ${i}`,
        message: `Message content for notification ${i}`,
        createdAt: new Date(Date.now() - i * 60000).toISOString(),
        read: i % 3 === 0,
      }));

      window.dispatchEvent(new CustomEvent('load-notifications', {
        detail: { notifications }
      }));
    });

    await page.click('[data-testid="notification-bell"]');

    const startTime = Date.now();

    // 等待通知列表加载
    await page.waitForSelector('[data-testid="notification-item"]');

    const loadTime = Date.now() - startTime;

    // 验证加载时间 < 1秒
    expect(loadTime).toBeLessThan(1000);

    // 测试滚动性能
    const notificationList = page.locator('[data-testid="notification-list"]');

    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(50);
    }

    // 验证列表仍然响应
    await expect(notificationList).toBeVisible();

    // 验证虚拟化列表（如果实现）
    const visibleItems = page.locator('[data-testid="notification-item"]:visible');
    const visibleCount = await visibleItems.count();

    // 虚拟化列表应该只渲染可见项
    expect(visibleCount).toBeLessThan(100);
    expect(visibleCount).toBeGreaterThan(0);
  });

  test('Accessibility - Notification Components', async ({ page }) => {
    await page.click('[data-testid="notification-bell"]');

    // 验证ARIA属性
    const notificationCenter = page.locator('[data-testid="notification-center"]');
    expect(await notificationCenter.getAttribute('role')).toBeTruthy();

    // 测试键盘导航
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    // 验证焦点在第一个通知上
    const firstNotification = page.locator('[data-testid="notification-item"]').first();
    const isFocused = await firstNotification.evaluate(
      el => el === document.activeElement || el.contains(document.activeElement)
    );
    expect(isFocused).toBe(true);

    // 测试方向键导航
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);

    // 测试Enter键激活
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    // 测试Escape键关闭
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    await expect(notificationCenter).not.toBeVisible();
  });
});
