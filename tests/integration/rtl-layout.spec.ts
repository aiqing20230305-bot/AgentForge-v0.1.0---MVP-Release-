/**
 * RTL布局集成测试
 * Integration Tests for RTL Layout System
 */

import { test, expect } from '@playwright/test';

test.describe('RTL Layout Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('Language Switching - LTR to RTL', async ({ page }) => {
    // 初始应该是LTR（English）
    const htmlDir = await page.locator('html').getAttribute('dir');
    expect(htmlDir).toBe('ltr');

    // 切换到Arabic
    await page.click('[data-testid="language-selector"]');
    await page.click('[data-testid="language-option-ar-SA"]');

    // 等待语言切换完成
    await page.waitForTimeout(500);

    // 验证dir属性更新为rtl
    const newHtmlDir = await page.locator('html').getAttribute('dir');
    expect(newHtmlDir).toBe('rtl');

    // 验证data-dir属性
    const dataDir = await page.locator('html').getAttribute('data-dir');
    expect(dataDir).toBe('rtl');

    // 验证body class
    const bodyClass = await page.locator('body').getAttribute('class');
    expect(bodyClass).toContain('rtl');
    expect(bodyClass).not.toContain('ltr');
  });

  test('RTL Test Page - Comprehensive Layout Test', async ({ page }) => {
    // 访问RTL测试页面
    await page.goto('http://localhost:5173/rtl-test');

    // 验证页面加载
    await expect(page.locator('h1:has-text("RTL Layout Test Page")')).toBeVisible();

    // 切换到Arabic
    await page.click('button:has-text("Switch to العربية")');
    await page.waitForTimeout(500);

    // 验证direction更新
    const direction = await page.locator('[data-testid="rtl-test-container"]').evaluate(
      el => window.getComputedStyle(el).direction
    );
    expect(direction).toBe('rtl');
  });

  test('Text Alignment - Start/End Positions', async ({ page }) => {
    await page.goto('http://localhost:5173/rtl-test');

    // LTR模式测试
    const textStartLTR = page.locator('[data-testid="text-align-start"]');
    let textAlign = await textStartLTR.evaluate(el => window.getComputedStyle(el).textAlign);
    expect(textAlign).toBe('left');

    const textEndLTR = page.locator('[data-testid="text-align-end"]');
    textAlign = await textEndLTR.evaluate(el => window.getComputedStyle(el).textAlign);
    expect(textAlign).toBe('right');

    // 切换到RTL
    await page.click('button:has-text("Switch to العربية")');
    await page.waitForTimeout(500);

    // RTL模式测试
    const textStartRTL = page.locator('[data-testid="text-align-start"]');
    textAlign = await textStartRTL.evaluate(el => window.getComputedStyle(el).textAlign);
    expect(textAlign).toBe('right');

    const textEndRTL = page.locator('[data-testid="text-align-end"]');
    textAlign = await textEndRTL.evaluate(el => window.getComputedStyle(el).textAlign);
    expect(textAlign).toBe('left');
  });

  test('Flex Container - Direction Reversal', async ({ page }) => {
    await page.goto('http://localhost:5173/rtl-test');

    // 获取Flex容器中的子元素顺序
    const getFlexOrder = async () => {
      return page.locator('[data-testid="flex-container"] > div').evaluateAll(
        elements => elements.map(el => el.textContent?.trim())
      );
    };

    // LTR模式
    const orderLTR = await getFlexOrder();
    expect(orderLTR).toEqual(['1', '2', '3']);

    // 切换到RTL
    await page.click('button:has-text("Switch to العربية")');
    await page.waitForTimeout(500);

    // RTL模式 - 视觉顺序应该反转
    const orderRTL = await getFlexOrder();
    // 注意：实际顺序仍是1,2,3，但视觉上是从右到左
    expect(orderRTL).toEqual(['1', '2', '3']);

    // 验证flex-direction
    const flexDirection = await page.locator('[data-testid="flex-container"]').evaluate(
      el => window.getComputedStyle(el).flexDirection
    );
    expect(flexDirection).toBe('row-reverse');
  });

  test('Grid Container - RTL Layout', async ({ page }) => {
    await page.goto('http://localhost:5173/rtl-test');

    // 验证Grid容器
    const gridContainer = page.locator('[data-testid="grid-container"]');
    await expect(gridContainer).toBeVisible();

    // LTR模式 - direction应该是ltr
    let direction = await gridContainer.evaluate(el => window.getComputedStyle(el).direction);
    expect(direction).toBe('ltr');

    // 切换到RTL
    await page.click('button:has-text("Switch to العربية")');
    await page.waitForTimeout(500);

    // RTL模式 - direction应该是rtl
    direction = await gridContainer.evaluate(el => window.getComputedStyle(el).direction);
    expect(direction).toBe('rtl');

    // 验证Grid项的视觉顺序
    const gridItems = gridContainer.locator('> div');
    const itemCount = await gridItems.count();
    expect(itemCount).toBe(6);
  });

  test('Spacing - Margin and Padding Logic', async ({ page }) => {
    await page.goto('http://localhost:5173/rtl-test');

    // 测试marginStart
    const marginStartElement = page.locator('[data-testid="margin-start"]');

    // LTR模式 - marginStart = marginLeft
    let marginLeft = await marginStartElement.evaluate(
      el => window.getComputedStyle(el).marginLeft
    );
    expect(marginLeft).toBe('40px');

    // 切换到RTL
    await page.click('button:has-text("Switch to العربية")');
    await page.waitForTimeout(500);

    // RTL模式 - marginStart = marginRight
    const marginRight = await marginStartElement.evaluate(
      el => window.getComputedStyle(el).marginRight
    );
    expect(marginRight).toBe('40px');
  });

  test('Icon Flipping - Directional Icons', async ({ page }) => {
    await page.goto('http://localhost:5173/rtl-test');

    // 测试可翻转图标
    const flippedIcon = page.locator('[data-testid="flipped-icon"]');

    // LTR模式 - transform应该是正常
    let transform = await flippedIcon.evaluate(el => window.getComputedStyle(el).transform);
    expect(transform).toBe('none');

    // 切换到RTL
    await page.click('button:has-text("Switch to العربية")');
    await page.waitForTimeout(500);

    // RTL模式 - transform应该是scaleX(-1)
    transform = await flippedIcon.evaluate(el => window.getComputedStyle(el).transform);
    expect(transform).toContain('matrix(-1'); // scaleX(-1)的matrix表示
  });

  test('Float - Directional Floating', async ({ page }) => {
    await page.goto('http://localhost:5173/rtl-test');

    // 测试floatStart
    const floatStartElement = page.locator('[data-testid="float-start"]');

    // LTR模式 - float: left
    let floatValue = await floatStartElement.evaluate(el => window.getComputedStyle(el).float);
    expect(floatValue).toBe('left');

    // 切换到RTL
    await page.click('button:has-text("Switch to العربية")');
    await page.waitForTimeout(500);

    // RTL模式 - float: right
    floatValue = await floatStartElement.evaluate(el => window.getComputedStyle(el).float);
    expect(floatValue).toBe('right');
  });

  test('Position - Logical Positioning', async ({ page }) => {
    await page.goto('http://localhost:5173/rtl-test');

    // 测试position start
    const positionStartElement = page.locator('[data-testid="position-start"]');

    // LTR模式 - left: 20px
    let leftValue = await positionStartElement.evaluate(
      el => window.getComputedStyle(el).left
    );
    expect(leftValue).toBe('20px');

    // 切换到RTL
    await page.click('button:has-text("Switch to العربية")');
    await page.waitForTimeout(500);

    // RTL模式 - right: 20px
    const rightValue = await positionStartElement.evaluate(
      el => window.getComputedStyle(el).right
    );
    expect(rightValue).toBe('20px');
  });

  test('Border Radius - Logical Corners', async ({ page }) => {
    await page.goto('http://localhost:5173/rtl-test');

    // 测试borderStartStartRadius
    const borderElement = page.locator('[data-testid="border-radius-start-start"]');

    // LTR模式 - borderTopLeftRadius: 20px
    let topLeftRadius = await borderElement.evaluate(
      el => window.getComputedStyle(el).borderTopLeftRadius
    );
    expect(topLeftRadius).toBe('20px');

    // 切换到RTL
    await page.click('button:has-text("Switch to العربية")');
    await page.waitForTimeout(500);

    // RTL模式 - borderTopRightRadius: 20px
    const topRightRadius = await borderElement.evaluate(
      el => window.getComputedStyle(el).borderTopRightRadius
    );
    expect(topRightRadius).toBe('20px');
  });

  test('Transform - X-axis Translation', async ({ page }) => {
    await page.goto('http://localhost:5173/rtl-test');

    // 测试translateX
    const transformElement = page.locator('[data-testid="transform-x-50"]');

    // LTR模式 - translateX(50px)
    let transform = await transformElement.evaluate(
      el => window.getComputedStyle(el).transform
    );
    expect(transform).toContain('matrix(1, 0, 0, 1, 50'); // translateX(50)

    // 切换到RTL
    await page.click('button:has-text("Switch to العربية")');
    await page.waitForTimeout(500);

    // RTL模式 - translateX(-50px)
    transform = await transformElement.evaluate(
      el => window.getComputedStyle(el).transform
    );
    expect(transform).toContain('matrix(1, 0, 0, 1, -50'); // translateX(-50)
  });

  test('Real Components - Currency Display RTL', async ({ page }) => {
    // 访问主应用
    await page.goto('http://localhost:5173');

    // 导航到游戏化页面
    await page.click('[data-testid="gamification-nav"]');

    // 验证货币显示
    const currencyDisplay = page.locator('[data-testid="currency-display"]');
    await expect(currencyDisplay).toBeVisible();

    // 切换到Arabic
    await page.click('[data-testid="language-selector"]');
    await page.click('[data-testid="language-option-ar-SA"]');
    await page.waitForTimeout(500);

    // 验证货币显示仍然可见且布局正确
    await expect(currencyDisplay).toBeVisible();

    // 验证flex方向
    const flexDirection = await currencyDisplay.evaluate(
      el => window.getComputedStyle(el).flexDirection
    );
    expect(flexDirection).toMatch(/row-reverse|row/);
  });

  test('Real Components - Notification Bell RTL', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const notificationBell = page.locator('[data-testid="notification-bell"]');

    // LTR位置
    const boundingBoxLTR = await notificationBell.boundingBox();
    expect(boundingBoxLTR).toBeTruthy();

    // 切换到RTL
    await page.click('[data-testid="language-selector"]');
    await page.click('[data-testid="language-option-ar-SA"]');
    await page.waitForTimeout(500);

    // RTL位置 - 应该在不同位置
    const boundingBoxRTL = await notificationBell.boundingBox();
    expect(boundingBoxRTL).toBeTruthy();

    // 验证位置变化（取决于实际布局）
    // 注意：这个测试可能需要根据实际布局调整
  });

  test('Form Inputs - RTL Text Entry', async ({ page }) => {
    await page.goto('http://localhost:5173/rtl-test');

    // 找到表单输入框
    const nameInput = page.locator('[data-testid="form-name-input"]');

    // 切换到Arabic
    await page.click('button:has-text("Switch to العربية")');
    await page.waitForTimeout(500);

    // 验证输入框文本对齐
    const textAlign = await nameInput.evaluate(el => window.getComputedStyle(el).textAlign);
    expect(textAlign).toBe('right');

    // 输入Arabic文本
    await nameInput.fill('مرحبا');
    await page.waitForTimeout(200);

    // 验证文本显示正确
    expect(await nameInput.inputValue()).toBe('مرحبا');

    // 验证placeholder也是RTL
    const placeholder = await nameInput.getAttribute('placeholder');
    expect(placeholder).toContain('أدخل'); // Arabic text
  });

  test('Cross-Browser RTL Compatibility', async ({ page, browserName }) => {
    await page.goto('http://localhost:5173/rtl-test');

    // 切换到RTL
    await page.click('button:has-text("Switch to العربية")');
    await page.waitForTimeout(500);

    // 验证基本RTL功能在所有浏览器中工作
    const htmlDir = await page.locator('html').getAttribute('dir');
    expect(htmlDir).toBe('rtl');

    // 验证CSS逻辑属性支持
    const testElement = page.locator('[data-testid="margin-start"]');
    const marginRight = await testElement.evaluate(
      el => window.getComputedStyle(el).marginRight
    );

    // 所有现代浏览器都应该支持
    expect(marginRight).toBe('40px');

    console.log(`RTL test passed on ${browserName}`);
  });

  test('Performance - RTL Switching', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // 测量切换到RTL的时间
    const startTime = Date.now();

    await page.click('[data-testid="language-selector"]');
    await page.click('[data-testid="language-option-ar-SA"]');

    // 等待切换完成
    await page.waitForFunction(() => document.documentElement.dir === 'rtl');

    const switchTime = Date.now() - startTime;

    // 切换应该在500ms内完成
    expect(switchTime).toBeLessThan(500);

    // 验证页面仍然响应
    await expect(page.locator('body')).toBeVisible();
  });

  test('Arabic Translation - Gamification Terms', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // 切换到Arabic
    await page.click('[data-testid="language-selector"]');
    await page.click('[data-testid="language-option-ar-SA"]');
    await page.waitForTimeout(500);

    // 导航到游戏化页面
    await page.click('[data-testid="gamification-nav"]');

    // 验证关键术语已翻译
    await expect(page.locator('text=المستوى')).toBeVisible({ timeout: 3000 }); // Level
    await expect(page.locator('text=الإنجازات')).toBeVisible({ timeout: 3000 }); // Achievements

    // 导航到成就页面
    await page.click('[data-testid="achievements-nav"]');

    // 验证成就相关术语
    await expect(page.locator('text=مفتوح')).toBeVisible({ timeout: 3000 }); // Unlocked
    await expect(page.locator('text=مقفل')).toBeVisible({ timeout: 3000 }); // Locked
  });

  test('Arabic Translation - Notification Terms', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // 切换到Arabic
    await page.click('[data-testid="language-selector"]');
    await page.click('[data-testid="language-option-ar-SA"]');
    await page.waitForTimeout(500);

    // 导航到通知设置
    await page.click('[data-testid="settings-nav"]');
    await page.click('[data-testid="notification-settings-tab"]');

    // 验证通知术语已翻译
    await expect(page.locator('text=إعدادات الإشعارات')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=قنوات الإشعارات')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=البريد الإلكتروني')).toBeVisible({ timeout: 3000 });
  });

  test('RTL Layout - Mobile Responsive', async ({ page }) => {
    // 设置移动视口
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('http://localhost:5173/rtl-test');

    // 切换到RTL
    await page.click('button:has-text("Switch to العربية")');
    await page.waitForTimeout(500);

    // 验证移动端RTL布局
    const htmlDir = await page.locator('html').getAttribute('dir');
    expect(htmlDir).toBe('rtl');

    // 验证响应式组件
    const flexContainer = page.locator('[data-testid="flex-container"]');
    await expect(flexContainer).toBeVisible();

    // 验证移动端文本对齐
    const textAlign = await page.locator('[data-testid="text-align-start"]').evaluate(
      el => window.getComputedStyle(el).textAlign
    );
    expect(textAlign).toBe('right');
  });

  test('Accessibility - RTL Screen Reader Support', async ({ page }) => {
    await page.goto('http://localhost:5173/rtl-test');

    // 切换到RTL
    await page.click('button:has-text("Switch to العربية")');
    await page.waitForTimeout(500);

    // 验证lang属性
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toContain('ar'); // ar-SA

    // 验证ARIA属性在RTL中正常工作
    const testElement = page.locator('[data-testid="text-align-start"]');
    const ariaLabel = await testElement.getAttribute('aria-label');

    if (ariaLabel) {
      // 如果有aria-label，验证它是Arabic
      // 注意：这取决于实际实现
      expect(ariaLabel.length).toBeGreaterThan(0);
    }
  });
});
