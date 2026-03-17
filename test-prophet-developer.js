#!/usr/bin/env node

/**
 * Prophet Developer 功能测试
 */

const ProphetDeveloper = require('./prophet-developer.js');
const path = require('path');

async function test() {
  console.log('🧪 Testing Prophet Developer Code Analysis...\n');

  // 创建实例
  const developer = new ProphetDeveloper({
    environment: 'test',
    debug: true,
    logLevel: 'info'
  });

  try {
    // 初始化
    await developer.initialize();
    console.log('✅ Developer initialized\n');

    // 扫描当前项目
    const projectPath = path.resolve(__dirname);
    console.log(`📂 Scanning project: ${projectPath}\n`);

    const optimizations = await developer.scanForOptimizations(projectPath);

    console.log(`\n📊 Scan Results:`);
    console.log(`Total optimizations found: ${optimizations.length}\n`);

    // 按类型分组统计
    const byType = {};
    optimizations.forEach(opt => {
      byType[opt.type] = (byType[opt.type] || 0) + 1;
    });

    console.log('Breakdown by type:');
    for (const [type, count] of Object.entries(byType)) {
      console.log(`  - ${type}: ${count}`);
    }

    // 显示前5个高优先级问题
    const highPriority = optimizations
      .filter(opt => opt.severity === 'high')
      .slice(0, 5);

    if (highPriority.length > 0) {
      console.log('\n⚠️  High Priority Issues:');
      highPriority.forEach((opt, idx) => {
        console.log(`\n${idx + 1}. ${opt.type} in ${opt.file}:${opt.line || 'N/A'}`);
        console.log(`   ${opt.suggestion}`);
        if (opt.complexity) {
          console.log(`   Complexity: ${opt.complexity}`);
        }
      });
    }

    // 显示一些中等优先级问题
    const mediumPriority = optimizations
      .filter(opt => opt.severity === 'medium')
      .slice(0, 3);

    if (mediumPriority.length > 0) {
      console.log('\n⚡ Medium Priority Issues:');
      mediumPriority.forEach((opt, idx) => {
        console.log(`\n${idx + 1}. ${opt.type} in ${opt.file}:${opt.line || 'N/A'}`);
        console.log(`   ${opt.suggestion}`);
      });
    }

    console.log('\n✅ Test completed successfully!');

    // 清理
    await developer.cleanup();

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行测试
test().catch(console.error);
