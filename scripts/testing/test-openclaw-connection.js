#!/usr/bin/env node
/**
 * OpenClaw连接测试脚本
 * 验证WebSocket连接、认证、获取Agent列表
 */

const WebSocket = require('ws')

// 测试配置
const config = {
  url: 'ws://127.0.0.1:18789',
  token: '5190ffb21bb024bc145dacc982ef6773b35648fa83ccba77'
}

console.log('🧪 OpenClaw连接测试开始...\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

// 测试结果收集
const results = {
  connection: false,
  auth: false,
  getAgents: false,
  agentCount: 0,
  errors: []
}

// 创建WebSocket连接
console.log('📡 正在连接到:', config.url)
const ws = new WebSocket(config.url)

// 连接超时
const connectionTimeout = setTimeout(() => {
  console.error('❌ 连接超时（10秒）')
  results.errors.push('Connection timeout')
  ws.close()
  printReport()
  process.exit(1)
}, 10000)

// 连接成功
ws.on('open', () => {
  clearTimeout(connectionTimeout)
  results.connection = true
  console.log('✅ WebSocket连接成功\n')

  // 发送认证消息
  console.log('🔐 发送认证消息...')
  const authMessage = JSON.stringify({
    type: 'auth',
    token: config.token
  })
  ws.send(authMessage)
  console.log('   Token:', maskToken(config.token))
})

// 接收消息
ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString())
    console.log('\n📨 收到消息:', message.type)

    // 认证响应
    if (message.type === 'auth_response' || message.type === 'authenticated') {
      if (message.success !== false) {
        results.auth = true
        console.log('✅ 认证成功\n')

        // 请求Agent列表
        console.log('📋 请求Agent列表...')
        const getAgentsMessage = JSON.stringify({
          type: 'get_agents'
        })
        ws.send(getAgentsMessage)
      } else {
        results.errors.push('Auth failed: ' + (message.error || 'Unknown error'))
        console.error('❌ 认证失败:', message.error)
        ws.close()
        printReport()
        process.exit(1)
      }
    }

    // Agent列表响应
    if (message.type === 'agents_response' || message.type === 'agents') {
      results.getAgents = true
      const agents = message.agents || []
      results.agentCount = agents.length

      console.log(`✅ 获取Agent列表成功 (${agents.length}个)\n`)

      if (agents.length > 0) {
        console.log('Agent详情:')
        agents.forEach((agent, index) => {
          console.log(`  ${index + 1}. ${agent.name || agent.id}`)
          console.log(`     - ID: ${agent.id}`)
          console.log(`     - 状态: ${agent.status || 'unknown'}`)
          console.log(`     - 模型: ${agent.model || 'N/A'}`)
          console.log(`     - 工作区: ${agent.workspace || 'N/A'}`)
        })
      } else {
        console.log('   ⚠️  没有找到Agent')
      }

      // 测试完成
      ws.close()
      printReport()
      process.exit(0)
    }

    // Pong响应（心跳）
    if (message.type === 'pong') {
      console.log('💓 心跳响应正常')
    }

  } catch (error) {
    console.error('❌ 解析消息失败:', error.message)
    results.errors.push('Parse error: ' + error.message)
  }
})

// 连接关闭
ws.on('close', (code, reason) => {
  console.log(`\n🔌 连接已关闭 (代码: ${code}, 原因: ${reason || 'N/A'})`)
})

// 连接错误
ws.on('error', (error) => {
  console.error('\n❌ WebSocket错误:', error.message)
  results.errors.push('WS error: ' + error.message)
  printReport()
  process.exit(1)
})

// 辅助函数：掩码Token
function maskToken(token) {
  if (!token || token.length < 8) return '***'
  return `${token.slice(0, 6)}...${token.slice(-4)}`
}

// 打印测试报告
function printReport() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 测试报告\n')

  console.log('测试项目:')
  console.log(`  ${results.connection ? '✅' : '❌'} WebSocket连接`)
  console.log(`  ${results.auth ? '✅' : '❌'} Token认证`)
  console.log(`  ${results.getAgents ? '✅' : '❌'} 获取Agent列表`)

  if (results.agentCount > 0) {
    console.log(`\nAgent数量: ${results.agentCount}`)
  }

  if (results.errors.length > 0) {
    console.log('\n错误列表:')
    results.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`)
    })
  }

  const allPassed = results.connection && results.auth && results.getAgents
  console.log('\n总体结果:', allPassed ? '✅ 通过' : '❌ 失败')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n\n⚠️  测试被中断')
  ws.close()
  printReport()
  process.exit(0)
})
