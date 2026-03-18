/**
 * SSO和报表系统集成测试
 * Integration Tests for SSO and Reports System
 */

import { test, expect } from '@playwright/test';

test.describe('SSO Authentication Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('OAuth2 Flow - Google Provider', async ({ page }) => {
    // 导航到登录页面
    await page.goto('http://localhost:5173/login');

    // 点击Google登录按钮
    const googleButton = page.locator('[data-testid="login-google"]');
    await expect(googleButton).toBeVisible();

    // 监听新标签页打开（OAuth授权页面）
    const popupPromise = page.waitForEvent('popup');

    await googleButton.click();

    const popup = await popupPromise;

    // 验证重定向到Google OAuth授权页面
    await popup.waitForLoadState();
    expect(popup.url()).toContain('accounts.google.com/o/oauth2');

    // 验证必需的查询参数
    const url = new URL(popup.url());
    expect(url.searchParams.get('client_id')).toBeTruthy();
    expect(url.searchParams.get('redirect_uri')).toBeTruthy();
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('scope')).toContain('email');
    expect(url.searchParams.get('state')).toBeTruthy();

    await popup.close();
  });

  test('OAuth2 Flow - GitHub Provider', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    // 点击GitHub登录按钮
    const githubButton = page.locator('[data-testid="login-github"]');
    await expect(githubButton).toBeVisible();

    const popupPromise = page.waitForEvent('popup');
    await githubButton.click();

    const popup = await popupPromise;

    // 验证重定向到GitHub OAuth授权页面
    await popup.waitForLoadState();
    expect(popup.url()).toContain('github.com/login/oauth/authorize');

    // 验证必需的查询参数
    const url = new URL(popup.url());
    expect(url.searchParams.get('client_id')).toBeTruthy();
    expect(url.searchParams.get('redirect_uri')).toBeTruthy();
    expect(url.searchParams.get('scope')).toContain('user');
    expect(url.searchParams.get('state')).toBeTruthy();

    await popup.close();
  });

  test('OAuth2 Callback - Success Flow', async ({ page, context }) => {
    // 模拟OAuth回调
    const mockAuthCode = 'mock_auth_code_12345';
    const mockState = 'mock_state_67890';

    // 访问回调URL
    await page.goto(
      `http://localhost:5173/auth/callback?code=${mockAuthCode}&state=${mockState}&provider=google`
    );

    // 等待处理完成
    await page.waitForTimeout(2000);

    // 验证重定向到主页或dashboard
    expect(page.url()).toMatch(/\/(dashboard|home)?$/);

    // 验证用户已登录
    const userMenu = page.locator('[data-testid="user-menu"]');
    await expect(userMenu).toBeVisible({ timeout: 5000 });
  });

  test('OAuth2 Callback - Error Handling', async ({ page }) => {
    // 模拟OAuth错误回调
    await page.goto(
      'http://localhost:5173/auth/callback?error=access_denied&error_description=User%20denied%20access'
    );

    // 验证错误消息显示
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 3000 });
    expect(await page.locator('[data-testid="error-message"]').textContent()).toContain('denied');

    // 验证提供返回登录选项
    const backToLoginButton = page.locator('[data-testid="back-to-login"]');
    await expect(backToLoginButton).toBeVisible();
  });

  test('Token Refresh - Automatic Renewal', async ({ page, context }) => {
    // 设置即将过期的token
    await context.addCookies([
      {
        name: 'access_token',
        value: 'expired_token_12345',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
      {
        name: 'refresh_token',
        value: 'valid_refresh_token_67890',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    // 访问需要认证的页面
    await page.goto('http://localhost:5173/dashboard');

    // 拦截刷新token请求
    await page.route('**/api/auth/refresh', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'new_access_token_12345',
          token_type: 'Bearer',
          expires_in: 3600,
        }),
      });
    });

    // 验证页面加载成功（token已刷新）
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible({ timeout: 5000 });
  });

  test('Logout - Token Revocation', async ({ page }) => {
    // 模拟已登录状态
    await page.goto('http://localhost:5173/dashboard');

    // 点击登出按钮
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // 等待登出处理
    await page.waitForTimeout(1000);

    // 验证重定向到登录页面
    expect(page.url()).toContain('/login');

    // 验证用户菜单不再显示
    await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
  });
});

test.describe('Reports System Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // 假设已登录
    // 可以通过设置cookie或其他方式模拟登录状态
  });

  test('Report Builder - Template Selection', async ({ page }) => {
    // 导航到报表页面
    await page.click('[data-testid="reports-nav"]');

    // 验证报表构建器
    await expect(page.locator('[data-testid="report-builder"]')).toBeVisible();

    // 验证10个预定义模板显示
    const templates = page.locator('[data-testid="report-template"]');
    const templateCount = await templates.count();
    expect(templateCount).toBe(10);

    // 测试模板选择
    await templates.first().click();
    await page.waitForTimeout(300);

    // 验证模板详情显示
    await expect(page.locator('[data-testid="template-details"]')).toBeVisible();
  });

  test('Report Viewer - Agent Performance Report', async ({ page }) => {
    await page.goto('http://localhost:5173/reports');

    // 选择Agent Performance Report模板
    await page.click('[data-testid="template-agent-performance"]');

    // 点击生成报表
    await page.click('[data-testid="generate-report"]');

    // 等待报表生成
    await page.waitForSelector('[data-testid="report-viewer"]', { timeout: 5000 });

    // 验证报表查看器显示
    const reportViewer = page.locator('[data-testid="report-viewer"]');
    await expect(reportViewer).toBeVisible();

    // 验证报表头部信息
    await expect(page.locator('[data-testid="report-title"]')).toContainText('Agent Performance');
    await expect(page.locator('[data-testid="report-icon"]')).toContainText('🤖');

    // 验证图表显示（Bar Chart）
    await expect(page.locator('[data-testid="chart-container"]')).toBeVisible();

    // 验证数据记录数
    const recordCount = await page.locator('[data-testid="record-count"]').textContent();
    expect(recordCount).toMatch(/\d+ records/);
  });

  test('Report Viewer - Chart Types', async ({ page }) => {
    await page.goto('http://localhost:5173/reports');

    // 测试Line Chart
    await page.click('[data-testid="template-system-performance"]');
    await page.click('[data-testid="generate-report"]');
    await page.waitForSelector('[data-testid="report-viewer"]');
    await expect(page.locator('.recharts-line')).toBeVisible({ timeout: 3000 });

    // 返回并测试Pie Chart
    await page.click('[data-testid="back-to-templates"]');
    await page.click('[data-testid="template-task-completion"]');
    await page.click('[data-testid="generate-report"]');
    await page.waitForSelector('[data-testid="report-viewer"]');
    await expect(page.locator('.recharts-pie')).toBeVisible({ timeout: 3000 });

    // 测试Area Chart
    await page.click('[data-testid="back-to-templates"]');
    await page.click('[data-testid="template-user-activity"]');
    await page.click('[data-testid="generate-report"]');
    await page.waitForSelector('[data-testid="report-viewer"]');
    await expect(page.locator('.recharts-area')).toBeVisible({ timeout: 3000 });
  });

  test('Report Viewer - View Mode Toggle', async ({ page }) => {
    await page.goto('http://localhost:5173/reports');

    await page.click('[data-testid="template-agent-performance"]');
    await page.click('[data-testid="generate-report"]');
    await page.waitForSelector('[data-testid="report-viewer"]');

    // 默认应该是图表视图
    await expect(page.locator('[data-testid="chart-view"]')).toBeVisible();

    // 切换到表格视图
    await page.click('[data-testid="view-toggle-table"]');
    await page.waitForTimeout(300);

    // 验证表格显示
    await expect(page.locator('[data-testid="table-view"]')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('thead')).toBeVisible();
    await expect(page.locator('tbody tr')).toBeVisible();

    // 切换回图表视图
    await page.click('[data-testid="view-toggle-chart"]');
    await page.waitForTimeout(300);
    await expect(page.locator('[data-testid="chart-view"]')).toBeVisible();
  });

  test('Report Export - CSV Format', async ({ page }) => {
    await page.goto('http://localhost:5173/reports');

    await page.click('[data-testid="template-agent-performance"]');
    await page.click('[data-testid="generate-report"]');
    await page.waitForSelector('[data-testid="report-viewer"]');

    // 点击导出按钮
    await page.click('[data-testid="export-button"]');

    // 选择CSV格式
    await page.click('[data-testid="export-csv"]');

    // 等待下载开始
    const downloadPromise = page.waitForEvent('download');
    const download = await downloadPromise;

    // 验证下载文件名
    expect(download.suggestedFilename()).toMatch(/\.csv$/);

    // 验证文件内容（可选）
    const path = await download.path();
    expect(path).toBeTruthy();
  });

  test('Report Export - Multiple Formats', async ({ page }) => {
    await page.goto('http://localhost:5173/reports');

    await page.click('[data-testid="template-task-completion"]');
    await page.click('[data-testid="generate-report"]');
    await page.waitForSelector('[data-testid="report-viewer"]');

    // 测试JSON导出
    await page.click('[data-testid="export-button"]');
    await page.click('[data-testid="export-json"]');
    let downloadPromise = page.waitForEvent('download');
    let download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.json$/);

    // 测试PDF导出
    await page.click('[data-testid="export-button"]');
    await page.click('[data-testid="export-pdf"]');
    downloadPromise = page.waitForEvent('download');
    download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);

    // 测试Excel导出
    await page.click('[data-testid="export-button"]');
    await page.click('[data-testid="export-excel"]');
    downloadPromise = page.waitForEvent('download');
    download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
  });

  test('Report Refresh - Data Update', async ({ page }) => {
    await page.goto('http://localhost:5173/reports');

    await page.click('[data-testid="template-system-performance"]');
    await page.click('[data-testid="generate-report"]');
    await page.waitForSelector('[data-testid="report-viewer"]');

    // 获取初始生成时间
    const initialTime = await page.locator('[data-testid="generated-at"]').textContent();

    // 等待1秒
    await page.waitForTimeout(1000);

    // 点击刷新按钮
    await page.click('[data-testid="refresh-report"]');

    // 等待刷新完成
    await page.waitForTimeout(1000);

    // 验证生成时间更新
    const updatedTime = await page.locator('[data-testid="generated-at"]').textContent();
    expect(updatedTime).not.toBe(initialTime);
  });

  test('Report Template - Custom Filters', async ({ page }) => {
    await page.goto('http://localhost:5173/reports');

    await page.click('[data-testid="template-agent-performance"]');

    // 应用自定义过滤器
    await page.selectOption('[data-testid="filter-status"]', 'active');
    await page.selectOption('[data-testid="filter-date-range"]', '30days');

    await page.click('[data-testid="generate-report"]');
    await page.waitForSelector('[data-testid="report-viewer"]');

    // 验证过滤器已应用
    const appliedFilters = page.locator('[data-testid="applied-filters"]');
    await expect(appliedFilters).toContainText('active');
    await expect(appliedFilters).toContainText('30days');
  });

  test('Report Aggregations - Display', async ({ page }) => {
    await page.goto('http://localhost:5173/reports');

    await page.click('[data-testid="template-revenue-analysis"]');
    await page.click('[data-testid="generate-report"]');
    await page.waitForSelector('[data-testid="report-viewer"]');

    // 验证聚合统计显示
    const aggregationsSection = page.locator('[data-testid="aggregations-section"]');
    await expect(aggregationsSection).toBeVisible();

    // 验证聚合卡片
    await expect(page.locator('[data-testid="aggregation-total_revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="aggregation-avg_transaction"]')).toBeVisible();
    await expect(page.locator('[data-testid="aggregation-transaction_count"]')).toBeVisible();

    // 验证聚合值格式
    const totalRevenue = await page.locator('[data-testid="aggregation-total_revenue"]').textContent();
    expect(totalRevenue).toMatch(/[\d,]+/); // 数字格式
  });

  test('Report Categories - Navigation', async ({ page }) => {
    await page.goto('http://localhost:5173/reports');

    // 验证类别标签
    await expect(page.locator('[data-testid="category-agent"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-task"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-team"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-performance"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-analytics"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-gamification"]')).toBeVisible();

    // 点击类别过滤
    await page.click('[data-testid="category-gamification"]');
    await page.waitForTimeout(300);

    // 验证只显示游戏化类别的报表
    const visibleTemplates = page.locator('[data-testid="report-template"]:visible');
    const count = await visibleTemplates.count();

    for (let i = 0; i < count; i++) {
      const category = await visibleTemplates.nth(i).getAttribute('data-category');
      expect(category).toBe('gamification');
    }
  });

  test('Report Search - Template Filtering', async ({ page }) => {
    await page.goto('http://localhost:5173/reports');

    // 输入搜索词
    await page.fill('[data-testid="template-search"]', 'agent');
    await page.waitForTimeout(500);

    // 验证搜索结果
    const searchResults = page.locator('[data-testid="report-template"]:visible');
    const count = await searchResults.count();
    expect(count).toBeGreaterThan(0);

    // 验证结果包含搜索词
    for (let i = 0; i < count; i++) {
      const title = await searchResults.nth(i).locator('[data-testid="template-title"]').textContent();
      expect(title?.toLowerCase()).toContain('agent');
    }

    // 清除搜索
    await page.fill('[data-testid="template-search"]', '');
    await page.waitForTimeout(300);

    // 验证显示所有模板
    const allTemplates = page.locator('[data-testid="report-template"]:visible');
    expect(await allTemplates.count()).toBe(10);
  });

  test('Report Performance - Large Dataset', async ({ page }) => {
    await page.goto('http://localhost:5173/reports');

    // 选择可能返回大数据集的报表
    await page.click('[data-testid="template-error-logs"]');

    const startTime = Date.now();

    await page.click('[data-testid="generate-report"]');
    await page.waitForSelector('[data-testid="report-viewer"]', { timeout: 10000 });

    const loadTime = Date.now() - startTime;

    // 验证加载时间 < 5秒
    expect(loadTime).toBeLessThan(5000);

    // 验证表格渲染（Error Logs使用表格视图）
    await expect(page.locator('table')).toBeVisible();

    // 验证记录数限制
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeLessThanOrEqual(100); // 根据query limit
  });

  test('Report Error Handling - No Data', async ({ page }) => {
    await page.goto('http://localhost:5173/reports');

    // 模拟空数据响应
    await page.route('**/api/reports/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          totalRecords: 0,
          generatedAt: new Date().toISOString(),
          query: {},
        }),
      });
    });

    await page.click('[data-testid="template-agent-performance"]');
    await page.click('[data-testid="generate-report"]');

    // 验证空状态显示
    await expect(page.locator('[data-testid="no-data-message"]')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=No data available')).toBeVisible();
  });

  test('Report Error Handling - Network Failure', async ({ page }) => {
    await page.goto('http://localhost:5173/reports');

    // 模拟网络错误
    await page.route('**/api/reports/**', route => route.abort());

    await page.click('[data-testid="template-task-completion"]');
    await page.click('[data-testid="generate-report"]');

    // 验证错误消息显示
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 3000 });

    // 验证重试按钮
    const retryButton = page.locator('[data-testid="retry-button"]');
    await expect(retryButton).toBeVisible();
  });

  test('Report Accessibility - Keyboard Navigation', async ({ page }) => {
    await page.goto('http://localhost:5173/reports');

    // 使用Tab键导航
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    // 验证焦点可见
    let focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    expect(focusedElement).toBeTruthy();

    // 使用Enter键选择模板
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(50);
    }

    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // 验证模板被选中
    await expect(page.locator('[data-testid="template-details"]')).toBeVisible();
  });
});
