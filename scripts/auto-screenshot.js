/**
 * Automated Screenshot Generator
 * 自动化产品截图生成 - 使用Playwright
 *
 * 安装依赖: npm install -D playwright
 * 运行: node scripts/auto-screenshot.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  baseUrl: 'http://localhost:5173',
  screenshotDir: 'docs/screenshots',
  version: require('../package.json').version,
  viewport: { width: 1920, height: 1080 },
  timeout: 5000,
  deviceScaleFactor: 2 // Retina显示
};

// 截图定义
const SCREENSHOTS = [
  {
    name: 'task-search',
    title: '任务搜索系统',
    priority: '⭐⭐⭐',
    steps: async (page) => {
      // 点击任务标签
      await page.click('[data-tab="tasks"]');
      await page.waitForTimeout(500);

      // 点击搜索框显示历史
      await page.click('input[placeholder*="搜索"]');
      await page.waitForTimeout(300);

      // 输入搜索词
      await page.fill('input[placeholder*="搜索"]', '安全');
      await page.waitForTimeout(800); // 等待防抖

      // 确保搜索结果可见
      await page.waitForSelector('.task-card', { timeout: 2000 }).catch(() => {});
    }
  },
  {
    name: 'copy-config',
    title: 'OpenClaw配置复制',
    priority: '⭐⭐',
    steps: async (page) => {
      // 打开设置
      await page.click('[data-tab="settings"]');
      await page.waitForTimeout(500);

      // 查找并点击OpenClaw配置按钮
      const configButton = await page.$('button:has-text("OpenClaw")').catch(() => null);
      if (configButton) {
        await configButton.click();
        await page.waitForTimeout(800);
      } else {
        console.warn('  ⚠️  未找到OpenClaw配置按钮');
      }
    }
  },
  {
    name: 'log-copy',
    title: '任务日志复制',
    priority: '⭐',
    steps: async (page) => {
      // 点击任务标签
      await page.click('[data-tab="tasks"]');
      await page.waitForTimeout(500);

      // 选择第一个已完成的任务
      const taskCard = await page.$('.task-card:has-text("已完成")');
      if (taskCard) {
        await taskCard.click();
        await page.waitForTimeout(500);

        // 点击详情按钮
        const detailButton = await page.$('button:has-text("详情")');
        if (detailButton) {
          await detailButton.click();
          await page.waitForTimeout(800);

          // 滚动到日志区域
          await page.evaluate(() => {
            const logSection = document.querySelector('.execution-log');
            if (logSection) {
              logSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          });
          await page.waitForTimeout(500);
        }
      }
    }
  },
  {
    name: 'showcase-search',
    title: 'ComponentShowcase - 搜索',
    priority: '⭐⭐⭐',
    steps: async (page) => {
      // 点击组件标签
      await page.click('[data-tab="showcase"]');
      await page.waitForTimeout(500);

      // 确保搜索标签激活
      await page.click('button:has-text("搜索组件")');
      await page.waitForTimeout(800);

      // 滚动显示演示内容
      await page.evaluate(() => {
        window.scrollTo({ top: 200, behavior: 'smooth' });
      });
      await page.waitForTimeout(300);
    }
  },
  {
    name: 'showcase-copy',
    title: 'ComponentShowcase - 复制',
    priority: '⭐⭐',
    steps: async (page) => {
      // 点击组件标签
      await page.click('[data-tab="showcase"]');
      await page.waitForTimeout(500);

      // 点击复制组件标签
      await page.click('button:has-text("复制组件")');
      await page.waitForTimeout(800);

      // 滚动显示多个演示
      await page.evaluate(() => {
        window.scrollTo({ top: 300, behavior: 'smooth' });
      });
      await page.waitForTimeout(300);
    }
  },
  {
    name: 'showcase-loading',
    title: 'ComponentShowcase - 加载',
    priority: '⭐',
    steps: async (page) => {
      // 点击组件标签
      await page.click('[data-tab="showcase"]');
      await page.waitForTimeout(500);

      // 点击加载状态标签
      await page.click('button:has-text("加载状态")');
      await page.waitForTimeout(800);

      // 点击"显示Toast"按钮
      const toastButton = await page.$('button:has-text("显示")');
      if (toastButton) {
        await toastButton.click();
        await page.waitForTimeout(1000);
      }
    }
  }
];

/**
 * 主函数
 */
async function main() {
  console.log('📸 AgentForge 自动截图生成器');
  console.log('================================');
  console.log(`版本: v${CONFIG.version}`);
  console.log(`目标URL: ${CONFIG.baseUrl}`);
  console.log('');

  // 创建输出目录
  const outputDir = path.join(CONFIG.screenshotDir, `v${CONFIG.version}`);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`✅ 创建目录: ${outputDir}`);
  }

  // 启动浏览器
  console.log('🌐 启动浏览器...');
  const browser = await chromium.launch({
    headless: false, // 显示浏览器窗口
    slowMo: 100 // 慢速模式，便于观察
  });

  const context = await browser.newContext({
    viewport: CONFIG.viewport,
    deviceScaleFactor: CONFIG.deviceScaleFactor
  });

  const page = await context.newPage();

  try {
    // 访问应用
    console.log('📱 加载应用...');
    await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // 等待初始化

    console.log('');
    console.log('开始截图...');
    console.log('');

    // 逐个截图
    for (let i = 0; i < SCREENSHOTS.length; i++) {
      const screenshot = SCREENSHOTS[i];
      const filename = `v${CONFIG.version}-${screenshot.name}.png`;
      const filepath = path.join(outputDir, filename);

      console.log(`${i + 1}/${SCREENSHOTS.length} ${screenshot.priority} ${screenshot.title}`);

      try {
        // 执行步骤
        await screenshot.steps(page);

        // 截图
        await page.screenshot({
          path: filepath,
          fullPage: false,
          type: 'png'
        });

        const stats = fs.statSync(filepath);
        const sizeKB = (stats.size / 1024).toFixed(1);
        console.log(`  ✅ 保存: ${filename} (${sizeKB} KB)`);

      } catch (error) {
        console.error(`  ❌ 失败: ${error.message}`);
      }

      console.log('');

      // 重置页面（回到主页）
      await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
    }

    console.log('🎉 所有截图完成！');
    console.log('');
    console.log(`📁 输出目录: ${outputDir}`);
    console.log('');

    // 统计
    const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.png'));
    console.log(`📊 统计: ${files.length} 张截图`);
    files.forEach(file => {
      const filepath = path.join(outputDir, file);
      const stats = fs.statSync(filepath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`   - ${file} (${sizeKB} KB)`);
    });

  } catch (error) {
    console.error('❌ 错误:', error);
    throw error;
  } finally {
    await browser.close();
    console.log('');
    console.log('✅ 浏览器已关闭');
  }
}

/**
 * 检查依赖
 */
async function checkDependencies() {
  try {
    require('playwright');
  } catch (error) {
    console.error('❌ Playwright 未安装');
    console.log('');
    console.log('请运行: npm install -D playwright');
    console.log('或: npx playwright install chromium');
    console.log('');
    process.exit(1);
  }
}

/**
 * 检查应用是否运行
 */
async function checkAppRunning() {
  const http = require('http');
  const url = new URL(CONFIG.baseUrl);

  return new Promise((resolve) => {
    const req = http.get({
      hostname: url.hostname,
      port: url.port,
      path: '/',
      timeout: 2000
    }, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

// 主流程
(async () => {
  await checkDependencies();

  const isRunning = await checkAppRunning();
  if (!isRunning) {
    console.error(`❌ 应用未运行: ${CONFIG.baseUrl}`);
    console.log('');
    console.log('请先启动应用:');
    console.log('  npm run dev');
    console.log('');
    console.log('然后在另一个终端运行截图脚本:');
    console.log('  node scripts/auto-screenshot.js');
    console.log('');
    process.exit(1);
  }

  await main();
})();
