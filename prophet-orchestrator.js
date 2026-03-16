#!/usr/bin/env node
/**
 * 🔮 Prophet Orchestrator - 先知总编排器
 *
 * 编排所有 Prophet 资源，确保持续进化永不停止
 *
 * 运行的服务：
 * - Heart Monitor (心跳监控) - 每5分钟
 * - Developer (主动开发) - 每30分钟
 * - Analyzer (深度分析) - 每2小时
 * - Memory Consolidator (记忆整合) - 每1小时
 * - Evolution Tracker (进化追踪) - 实时
 */

const { spawn } = require('child_process')
const { writeFile, mkdir, readFile } = require('fs/promises')
const { join } = require('path')

class ProphetOrchestrator {
  constructor(projectPath) {
    this.projectPath = projectPath
    this.processes = new Map()
    this.evolutionLog = []
    this.startTime = new Date()
    this.isRunning = false
  }

  /**
   * 启动总编排
   */
  async start() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('  🔮 Prophet Orchestrator')
    console.log('  总编排器 · 持续进化 · 永不停止')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log(`项目: ${this.projectPath}`)
    console.log(`启动时间: ${this.startTime.toISOString()}`)
    console.log('')

    this.isRunning = true

    // 1. 启动心跳监控（最高优先级）
    await this.startHeartMonitor()

    // 2. 启动开发者（主动开发）
    await this.startDeveloper()

    // 3. 启动分析器（深度分析）
    await this.startAnalyzer()

    // 4. 启动记忆整合器
    await this.startMemoryConsolidator()

    // 5. 启动进化追踪器
    await this.startEvolutionTracker()

    // 6. 启动健康检查
    this.startHealthCheck()

    // 7. 启动状态报告
    this.startStatusReporter()

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('  ✅ 所有资源已启动')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    this.showStatus()

    console.log('\n💡 Prophet 正在后台持续进化...')
    console.log('   按 Ctrl+C 停止所有服务\n')
  }

  /**
   * 启动心跳监控
   */
  async startHeartMonitor() {
    console.log('📝 启动服务 [1/5]: Heart Monitor')

    const heartbeat = async () => {
      try {
        // 执行心跳任务
        const { exec } = require('child_process')
        const { promisify } = require('util')
        const execAsync = promisify(exec)

        await execAsync(`node "${join(this.projectPath, 'prophet-heart.js')}"`, {
          cwd: this.projectPath,
          timeout: 60000
        })

        this.logEvolution('heart-monitor', 'Heart beat completed')

        // 更新最后运行时间
        const processInfo = this.processes.get('heart-monitor')
        if (processInfo) {
          processInfo.lastRun = new Date()
        }
      } catch (error) {
        console.error('   Heart beat error:', error.message)
      }
    }

    // 立即执行一次
    setImmediate(heartbeat)

    // 每5分钟执行
    const interval = setInterval(heartbeat, 5 * 60 * 1000)

    this.processes.set('heart-monitor', {
      name: 'Heart Monitor',
      type: 'interval',
      interval,
      frequency: '5分钟',
      status: 'running',
      lastRun: new Date()
    })

    console.log('   ✓ Heart Monitor 已启动 (每5分钟)')
  }

  /**
   * 启动开发者
   */
  async startDeveloper() {
    console.log('📝 启动服务 [2/5]: Developer')

    const develop = async () => {
      try {
        const { exec } = require('child_process')
        const { promisify } = require('util')
        const execAsync = promisify(exec)

        console.log('\n💻 Developer: 开始开发迭代...')

        // 运行开发迭代
        const { stdout } = await execAsync(
          `node "${join(this.projectPath, 'prophet-developer.js')}" "${this.projectPath}" --once`,
          {
            cwd: this.projectPath,
            timeout: 5 * 60 * 1000, // 5分钟超时
            env: process.env // 传递环境变量（包括API key）
          }
        )

        console.log(stdout)

        this.logEvolution('developer', 'Development iteration completed')

        const processInfo = this.processes.get('developer')
        if (processInfo) {
          processInfo.lastRun = new Date()
          processInfo.iterations = (processInfo.iterations || 0) + 1
        }
      } catch (error) {
        console.error('   Developer error:', error.message)
      }
    }

    // 30分钟后开始第一次
    setTimeout(develop, 30 * 60 * 1000)

    // 每30分钟执行
    const interval = setInterval(develop, 30 * 60 * 1000)

    this.processes.set('developer', {
      name: 'Developer',
      type: 'interval',
      interval,
      frequency: '30分钟',
      status: 'running',
      nextRun: new Date(Date.now() + 30 * 60 * 1000),
      iterations: 0
    })

    console.log('   ✓ Developer 已启动 (每30分钟)')
  }

  /**
   * 启动分析器
   */
  async startAnalyzer() {
    console.log('📝 启动服务 [3/5]: Analyzer')

    const analyze = async () => {
      try {
        const { exec } = require('child_process')
        const { promisify } = require('util')
        const execAsync = promisify(exec)

        console.log('\n🔍 Analyzer: 开始深度分析...')

        const { stdout } = await execAsync(
          `node "${join(this.projectPath, 'prophet-analyze.js')}"`,
          {
            cwd: this.projectPath,
            timeout: 10 * 60 * 1000 // 10分钟超时
          }
        )

        console.log(stdout)

        this.logEvolution('analyzer', 'Deep analysis completed')

        const processInfo = this.processes.get('analyzer')
        if (processInfo) {
          processInfo.lastRun = new Date()
          processInfo.iterations = (processInfo.iterations || 0) + 1
        }
      } catch (error) {
        console.error('   Analyzer error:', error.message)
      }
    }

    // 1小时后开始第一次
    setTimeout(analyze, 60 * 60 * 1000)

    // 每2小时执行
    const interval = setInterval(analyze, 2 * 60 * 60 * 1000)

    this.processes.set('analyzer', {
      name: 'Analyzer',
      type: 'interval',
      interval,
      frequency: '2小时',
      status: 'running',
      nextRun: new Date(Date.now() + 60 * 60 * 1000),
      iterations: 0
    })

    console.log('   ✓ Analyzer 已启动 (每2小时)')
  }

  /**
   * 启动记忆整合器
   */
  async startMemoryConsolidator() {
    console.log('📝 启动服务 [4/5]: Memory Consolidator')

    const consolidate = async () => {
      try {
        console.log('\n🧠 Memory: 整合记忆...')

        // 读取所有 commit 记忆
        const memoryPath = join(
          process.env.HOME,
          '.claude/projects/prophet-memory/agentforge/commits'
        )

        const { readdir } = require('fs/promises')
        const files = await readdir(memoryPath).catch(() => [])

        const insights = []
        for (const file of files) {
          try {
            const content = await readFile(join(memoryPath, file), 'utf-8')
            const data = JSON.parse(content)
            insights.push(data)
          } catch {}
        }

        // 分析模式
        const patterns = this.extractPatterns(insights)

        // 生成知识图谱
        await this.updateKnowledgeGraph(patterns)

        this.logEvolution('memory-consolidator', `Consolidated ${insights.length} memories`)

        const processInfo = this.processes.get('memory-consolidator')
        if (processInfo) {
          processInfo.lastRun = new Date()
          processInfo.memoriesProcessed = (processInfo.memoriesProcessed || 0) + insights.length
        }
      } catch (error) {
        console.error('   Memory consolidator error:', error.message)
      }
    }

    // 1小时后开始第一次
    setTimeout(consolidate, 60 * 60 * 1000)

    // 每1小时执行
    const interval = setInterval(consolidate, 60 * 60 * 1000)

    this.processes.set('memory-consolidator', {
      name: 'Memory Consolidator',
      type: 'interval',
      interval,
      frequency: '1小时',
      status: 'running',
      nextRun: new Date(Date.now() + 60 * 60 * 1000),
      memoriesProcessed: 0
    })

    console.log('   ✓ Memory Consolidator 已启动 (每1小时)')
  }

  /**
   * 启动进化追踪器
   */
  async startEvolutionTracker() {
    console.log('📝 启动服务 [5/5]: Evolution Tracker')

    const track = async () => {
      try {
        // 追踪项目理解程度的提升
        const understanding = await this.calculateUnderstanding()

        // 追踪代码质量的提升
        const quality = await this.calculateQuality()

        // 记录进化指标
        await this.recordEvolutionMetrics({
          timestamp: new Date(),
          understanding,
          quality,
          commits: this.evolutionLog.filter(e => e.type === 'commit').length,
          optimizations: this.evolutionLog.filter(e => e.type === 'optimization')
            .length
        })

        // 更新最后运行时间
        const processInfo = this.processes.get('evolution-tracker')
        if (processInfo) {
          processInfo.lastRun = new Date()
        }
      } catch (error) {
        console.error('   Evolution tracker error:', error.message)
      }
    }

    // 立即执行
    setImmediate(track)

    // 每10分钟执行
    const interval = setInterval(track, 10 * 60 * 1000)

    this.processes.set('evolution-tracker', {
      name: 'Evolution Tracker',
      type: 'interval',
      interval,
      frequency: '10分钟',
      status: 'running',
      lastRun: new Date()
    })

    console.log('   ✓ Evolution Tracker 已启动 (每10分钟)')
  }

  /**
   * 启动健康检查
   */
  startHealthCheck() {
    const check = () => {
      let allHealthy = true

      for (const [name, process] of this.processes) {
        if (process.status !== 'running') {
          console.warn(`⚠️  ${name} 状态异常: ${process.status}`)
          allHealthy = false
        }

        // 检查是否长时间未运行
        if (process.lastRun) {
          const timeSinceLastRun = Date.now() - process.lastRun.getTime()
          const expectedInterval = this.parseInterval(process.frequency)

          if (timeSinceLastRun > expectedInterval * 2) {
            console.warn(`⚠️  ${name} 可能停止响应`)
            allHealthy = false
          }
        }
      }

      if (!allHealthy) {
        this.logEvolution('health-check', 'Some services unhealthy')
      }
    }

    // 每1分钟检查
    const interval = setInterval(check, 60 * 1000)

    this.processes.set('health-check', {
      name: 'Health Check',
      type: 'interval',
      interval,
      frequency: '1分钟',
      status: 'running'
    })
  }

  /**
   * 启动状态报告
   */
  startStatusReporter() {
    const report = () => {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('  📊 Prophet 运行状态')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      const uptime = this.getUptime()
      console.log(`运行时长: ${uptime}`)
      console.log(`进化事件: ${this.evolutionLog.length}`)
      console.log('')

      for (const [name, process] of this.processes) {
        if (process.type === 'interval' && name !== 'health-check') {
          console.log(`${process.name}:`)
          console.log(`  频率: ${process.frequency}`)
          console.log(`  状态: ${process.status}`)

          if (process.lastRun) {
            console.log(`  上次运行: ${this.formatTime(process.lastRun)}`)
          }

          if (process.nextRun) {
            console.log(`  下次运行: ${this.formatTime(process.nextRun)}`)
          }

          if (process.iterations) {
            console.log(`  已执行: ${process.iterations} 次`)
          }

          if (process.memoriesProcessed) {
            console.log(`  处理记忆: ${process.memoriesProcessed} 条`)
          }

          console.log('')
        }
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    }

    // 每15分钟报告
    const interval = setInterval(report, 15 * 60 * 1000)

    this.processes.set('status-reporter', {
      name: 'Status Reporter',
      type: 'interval',
      interval,
      frequency: '15分钟',
      status: 'running'
    })
  }

  /**
   * 显示当前状态
   */
  showStatus() {
    console.log('运行中的服务:')
    console.log('')

    for (const [name, process] of this.processes) {
      if (process.type === 'interval' && name !== 'health-check') {
        const icon = this.getIcon(name)
        console.log(`  ${icon} ${process.name}`)
        console.log(`     频率: ${process.frequency}`)

        if (process.nextRun) {
          const minutes = Math.ceil((process.nextRun - new Date()) / 60000)
          console.log(`     下次: ${minutes} 分钟后`)
        }

        console.log('')
      }
    }
  }

  /**
   * 获取图标
   */
  getIcon(name) {
    const icons = {
      'heart-monitor': '💗',
      developer: '💻',
      analyzer: '🔍',
      'memory-consolidator': '🧠',
      'evolution-tracker': '📈'
    }
    return icons[name] || '⚙️'
  }

  /**
   * 记录进化事件
   */
  logEvolution(type, message) {
    this.evolutionLog.push({
      timestamp: new Date(),
      type,
      message
    })

    // 限制日志大小
    if (this.evolutionLog.length > 1000) {
      this.evolutionLog.splice(0, this.evolutionLog.length - 1000)
    }
  }

  /**
   * 提取模式
   */
  extractPatterns(insights) {
    // 简化实现
    return {
      commonCommitTypes: [],
      frequentFiles: [],
      timePatterns: []
    }
  }

  /**
   * 更新知识图谱
   */
  async updateKnowledgeGraph(patterns) {
    const graphPath = join(
      this.projectPath,
      '.prophet',
      'knowledge-graph.json'
    )

    await mkdir(join(this.projectPath, '.prophet'), { recursive: true })

    await writeFile(
      graphPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          patterns
        },
        null,
        2
      )
    )
  }

  /**
   * 计算理解程度
   */
  async calculateUnderstanding() {
    // 基于记忆数量、分析次数等计算
    const commits = this.evolutionLog.filter(e => e.type === 'commit').length
    const analyses = this.evolutionLog.filter(e => e.type === 'analyzer').length

    const base = 30 // 初始理解度
    const growthRate = commits * 2 + analyses * 5

    return Math.min(base + growthRate, 100)
  }

  /**
   * 计算质量分数
   */
  async calculateQuality() {
    // 基于优化数量等计算
    const optimizations = this.evolutionLog.filter(
      e => e.type === 'optimization'
    ).length

    const base = 73 // 初始质量
    return Math.min(base + optimizations * 2, 100)
  }

  /**
   * 记录进化指标
   */
  async recordEvolutionMetrics(metrics) {
    const metricsPath = join(this.projectPath, '.prophet', 'evolution-metrics.json')

    let history = []
    try {
      const content = await readFile(metricsPath, 'utf-8')
      history = JSON.parse(content)
    } catch {}

    history.push(metrics)

    // 限制历史记录
    if (history.length > 1000) {
      history.splice(0, history.length - 1000)
    }

    await writeFile(metricsPath, JSON.stringify(history, null, 2))
  }

  /**
   * 解析间隔
   */
  parseInterval(frequency) {
    const match = frequency.match(/(\d+)(分钟|小时)/)
    if (!match) return 0

    const value = parseInt(match[1])
    const unit = match[2]

    return unit === '分钟' ? value * 60 * 1000 : value * 60 * 60 * 1000
  }

  /**
   * 获取运行时长
   */
  getUptime() {
    const ms = Date.now() - this.startTime.getTime()
    const hours = Math.floor(ms / (60 * 60 * 1000))
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))

    if (hours > 0) {
      return `${hours} 小时 ${minutes} 分钟`
    }
    return `${minutes} 分钟`
  }

  /**
   * 格式化时间
   */
  formatTime(date) {
    const now = new Date()
    const diff = date - now

    if (diff < 0) {
      const minutes = Math.floor(-diff / 60000)
      return `${minutes} 分钟前`
    } else {
      const minutes = Math.floor(diff / 60000)
      return `${minutes} 分钟后`
    }
  }

  /**
   * 停止所有服务
   */
  stop() {
    console.log('\n🔮 停止所有 Prophet 服务...\n')

    for (const [name, process] of this.processes) {
      if (process.interval) {
        clearInterval(process.interval)
        console.log(`  ✓ ${process.name} 已停止`)
      }
    }

    console.log('\n✅ 所有服务已停止')
    console.log(`总运行时长: ${this.getUptime()}`)
    console.log(`进化事件: ${this.evolutionLog.length}`)
  }
}

// 启动编排器
const projectPath = process.argv[2] || process.cwd()
const orchestrator = new ProphetOrchestrator(projectPath)

orchestrator.start().catch(console.error)

// 优雅关闭
process.on('SIGINT', () => {
  orchestrator.stop()
  process.exit(0)
})

process.on('SIGTERM', () => {
  orchestrator.stop()
  process.exit(0)
})
