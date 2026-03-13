#!/usr/bin/env node

/**
 * 修复 Agent 连接问题
 * 清理旧的 localStorage 数据，重新初始化
 */

console.log('🔧 修复 World of Claudecraft Agent 连接...\n')

const steps = [
  '1. 清理浏览器 localStorage',
  '2. 重新初始化数据源',
  '3. 测试 OpenClaw 连接',
  '4. 验证 Agent 数据加载'
]

console.log('修复步骤:')
steps.forEach(step => console.log(`  ${step}`))

console.log('\n请在浏览器开发者工具中运行以下命令:\n')

console.log('━'.repeat(60))
console.log(`
// 1. 清理所有旧数据
localStorage.clear()

// 2. 重新加载页面
location.reload()

// 3. 测试连接（刷新后运行）
fetch('http://localhost:18790/api/agents')
  .then(r => r.json())
  .then(data => {
    console.log('✅ OpenClaw 连接成功!')
    console.log('Agent 数量:', data.agents.length)
    data.agents.forEach(a => console.log('  -', a.name))
  })
  .catch(e => console.error('❌ 连接失败:', e))
`)
console.log('━'.repeat(60))

console.log('\n或者访问: http://localhost:5174/ 并按 F12 打开开发者工具\n')
console.log('💡 提示: 清理后刷新页面，系统会自动连接本地 OpenClaw\n')
