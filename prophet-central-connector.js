#!/usr/bin/env node
/**
 * Prophet Central Connector
 * 将 videoplay 项目连接到 Prophet Central 多项目系统
 *
 * 功能：
 * 1. 自动注册到 Prophet Central
 * 2. 报告项目状态
 * 3. 接收 Prophet Central 的指令
 * 4. 协调本地 Orchestrator 和全局 Orchestrator
 */

const axios = require('axios')
const { spawn } = require('child_process')
const { join } = require('path')

const PROPHET_CENTRAL_URL = process.env.PROPHET_CENTRAL_URL || 'http://localhost:3001'
const PROJECT_PATH = __dirname
const PROJECT_NAME = 'videoplay'
const PROJECT_TYPE = 'web-app'
const PROJECT_PRIORITY = 'critical'

class ProphetCentralConnector {
  constructor() {
    this.projectId = null
    this.registered = false
    this.orchestratorProcess = null
    this.heartbeatInterval = null
  }

  /**
   * 启动连接器
   */
  async start() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('  🔮 Prophet Central Connector')
    console.log('  连接到多项目观察系统')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // 1. 检查 Prophet Central 是否运行
    const centralRunning = await this.checkCentralHealth()
    if (!centralRunning) {
      console.log('⚠️  Prophet Central 未运行')
      console.log('   启动本地 Orchestrator（独立模式）')
      await this.startLocalOrchestrator()
      return
    }

    // 2. 注册到 Prophet Central
    try {
      await this.registerToGlobal()
      console.log('✅ 已连接到 Prophet Central')
      console.log(`   项目ID: ${this.projectId}`)
    } catch (error) {
      console.error('❌ 注册失败:', error.message)
      console.log('   启动本地 Orchestrator（独立模式）')
      await this.startLocalOrchestrator()
      return
    }

    // 3. 启动本地 Orchestrator
    await this.startLocalOrchestrator()

    // 4. 开始心跳报告
    this.startHeartbeat()

    console.log('\n✅ 连接器已启动')
    console.log('   模式: 多项目协调')
    console.log(`   Central URL: ${PROPHET_CENTRAL_URL}`)
  }

  /**
   * 检查 Prophet Central 健康状态
   */
  async checkCentralHealth() {
    try {
      const { data } = await axios.get(`${PROPHET_CENTRAL_URL}/health`, {
        timeout: 3000,
      })
      return data.status === 'ok'
    } catch (error) {
      return false
    }
  }

  /**
   * 注册到 Prophet Central
   */
  async registerToGlobal() {
    const { data } = await axios.post(
      `${PROPHET_CENTRAL_URL}/orchestrator/projects/register`,
      {
        name: PROJECT_NAME,
        path: PROJECT_PATH,
        type: PROJECT_TYPE,
        priority: PROJECT_PRIORITY,
        monitoringInterval: 300000, // 5分钟
        autoOptimize: true,
      },
      { timeout: 5000 }
    )

    this.projectId = data.id
    this.registered = true
  }

  /**
   * 启动本地 Orchestrator
   */
  async startLocalOrchestrator() {
    const orchestratorPath = join(__dirname, 'prophet-orchestrator.js')

    this.orchestratorProcess = spawn('node', [orchestratorPath], {
      stdio: 'inherit',
      cwd: __dirname,
    })

    this.orchestratorProcess.on('error', (error) => {
      console.error('❌ Orchestrator 错误:', error)
    })

    this.orchestratorProcess.on('exit', (code) => {
      console.log(`Orchestrator 退出，代码: ${code}`)
    })

    console.log('✅ 本地 Orchestrator 已启动')
  }

  /**
   * 开始心跳报告
   */
  startHeartbeat() {
    // 每30秒报告一次状态
    this.heartbeatInterval = setInterval(async () => {
      try {
        await this.reportStatus()
      } catch (error) {
        console.error('⚠️  心跳报告失败:', error.message)
      }
    }, 30000)
  }

  /**
   * 报告项目状态
   */
  async reportStatus() {
    if (!this.registered || !this.projectId) {
      return
    }

    try {
      // 读取进化日志
      const logPath = join(__dirname, '.prophet', 'evolution-log.json')
      let evolutionData = {}

      try {
        const { readFile } = require('fs/promises')
        const logContent = await readFile(logPath, 'utf-8')
        evolutionData = JSON.parse(logContent)
      } catch (error) {
        // 日志文件可能还不存在
      }

      // 报告状态到 Prophet Central
      // 注意：这需要 Prophet Central 提供状态上报端点
      // 当前版本暂不实现，留待未来扩展
      // await axios.post(`${PROPHET_CENTRAL_URL}/orchestrator/projects/${this.projectId}/status`, {
      //   ...evolutionData
      // })
    } catch (error) {
      // 静默失败
    }
  }

  /**
   * 停止连接器
   */
  async stop() {
    console.log('\n🛑 停止 Prophet Central Connector...')

    // 停止心跳
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    // 停止本地 Orchestrator
    if (this.orchestratorProcess) {
      this.orchestratorProcess.kill('SIGTERM')
    }

    // 从 Prophet Central 注销
    if (this.registered && this.projectId) {
      try {
        await axios.delete(
          `${PROPHET_CENTRAL_URL}/orchestrator/projects/${this.projectId}`,
          { timeout: 3000 }
        )
        console.log('✅ 已从 Prophet Central 注销')
      } catch (error) {
        // 静默失败
      }
    }
  }
}

// 启动连接器
const connector = new ProphetCentralConnector()

connector.start().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

// 优雅退出
process.on('SIGINT', async () => {
  await connector.stop()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await connector.stop()
  process.exit(0)
})
