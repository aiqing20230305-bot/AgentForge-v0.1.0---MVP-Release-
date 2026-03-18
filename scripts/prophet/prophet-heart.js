#!/usr/bin/env node
/**
 * 🔮 Prophet Heart - 先知心脏机制
 *
 * 持续监控项目，自动发现和执行优化
 *
 * 机制：
 * - 每 5 分钟心跳一次
 * - 扫描项目变化
 * - 自动执行安全优化
 * - 生成进化报告
 */

const { readdir, readFile, writeFile, stat, mkdir } = require('fs/promises')
const { join } = require('path')
const { exec } = require('child_process')
const { promisify } = require('util')

const execAsync = promisify(exec)

class ProphetHeart {
  constructor(projectPath) {
    this.projectPath = projectPath
    this.heartbeatInterval = 5 * 60 * 1000 // 5分钟
    this.lastCheck = null
    this.evolutionLog = []
    this.isRunning = false
  }

  /**
   * 启动心脏
   */
  async start() {
    console.log('🔮 Prophet Heart: 启动中...\n')
    console.log(`项目：${this.projectPath}`)
    console.log(`心跳间隔：${this.heartbeatInterval / 1000} 秒`)
    console.log('')

    this.isRunning = true

    // 立即执行第一次心跳
    await this.heartbeat()

    // 定期心跳
    setInterval(() => {
      this.heartbeat().catch(console.error)
    }, this.heartbeatInterval)

    console.log('💗 Heart is beating...')
    console.log('   按 Ctrl+C 停止\n')
  }

  /**
   * 停止心脏
   */
  stop() {
    this.isRunning = false
    console.log('\n💔 Prophet Heart 已停止')
  }

  /**
   * 心跳 - 每次心跳执行的操作
   */
  async heartbeat() {
    const timestamp = new Date().toISOString()
    console.log(`\n💓 [${timestamp}] Heartbeat...`)

    try {
      // 1. 检测项目变化
      const changes = await this.detectChanges()

      if (changes.hasChanges) {
        console.log('   🔍 检测到项目变化')
        console.log(`      新文件：${changes.newFiles}`)
        console.log(`      修改文件：${changes.modifiedFiles}`)
      }

      // 2. 扫描优化机会
      const opportunities = await this.scanOpportunities()

      if (opportunities.length > 0) {
        console.log(`   💡 发现 ${opportunities.length} 个优化机会`)

        // 3. 执行自动优化
        for (const opp of opportunities) {
          if (opp.autofix && opp.safe) {
            await this.executeOptimization(opp)
          }
        }
      }

      // 4. 更新学习
      await this.updateLearning()

      // 5. 生成报告
      if (this.evolutionLog.length > 0) {
        await this.generateReport()
      }

      console.log('   ✓ 心跳完成')

      this.lastCheck = new Date()
    } catch (error) {
      console.error('   ✗ 心跳失败:', error.message)
    }
  }

  /**
   * 检测项目变化
   */
  async detectChanges() {
    const changes = {
      hasChanges: false,
      newFiles: 0,
      modifiedFiles: 0,
      deletedFiles: 0
    }

    try {
      // 使用 git 检测变化
      const { stdout } = await execAsync('git status --porcelain', {
        cwd: this.projectPath
      })

      if (stdout.trim()) {
        const lines = stdout.trim().split('\n')

        for (const line of lines) {
          const status = line.substring(0, 2)

          if (status.includes('?')) {
            changes.newFiles++
          } else if (status.includes('M')) {
            changes.modifiedFiles++
          } else if (status.includes('D')) {
            changes.deletedFiles++
          }
        }

        changes.hasChanges = changes.newFiles + changes.modifiedFiles + changes.deletedFiles > 0
      }
    } catch (error) {
      // git 不可用或其他错误
    }

    return changes
  }

  /**
   * 扫描优化机会
   */
  async scanOpportunities() {
    const opportunities = []

    // 1. 检查未使用的依赖
    const unusedDeps = await this.findUnusedDependencies()
    if (unusedDeps.length > 0) {
      opportunities.push({
        type: 'dependency-cleanup',
        description: `发现 ${unusedDeps.length} 个未使用的依赖`,
        impact: 'medium',
        autofix: false, // 需要人工确认
        safe: false,
        action: () => this.reportUnusedDependencies(unusedDeps)
      })
    }

    // 2. 检查 console.log
    const consoleLogs = await this.findConsoleLogs()
    if (consoleLogs.length > 0) {
      opportunities.push({
        type: 'console-cleanup',
        description: `发现 ${consoleLogs.length} 个 console.log`,
        impact: 'low',
        autofix: false,
        safe: false,
        action: () => this.reportConsoleLogs(consoleLogs)
      })
    }

    // 3. 检查 TODO/FIXME
    const todos = await this.findTodos()
    if (todos.length > 10) {
      opportunities.push({
        type: 'todo-tracking',
        description: `发现 ${todos.length} 个 TODO/FIXME`,
        impact: 'medium',
        autofix: true, // 可以自动创建 issues
        safe: true,
        action: () => this.trackTodos(todos)
      })
    }

    // 4. 检查大文件
    const largeFiles = await this.findLargeFiles()
    if (largeFiles.length > 0) {
      opportunities.push({
        type: 'large-files',
        description: `发现 ${largeFiles.length} 个大文件（>500行）`,
        impact: 'medium',
        autofix: false,
        safe: false,
        action: () => this.reportLargeFiles(largeFiles)
      })
    }

    // 5. 检查安全问题
    const securityIssues = await this.scanSecurity()
    if (securityIssues.length > 0) {
      opportunities.push({
        type: 'security',
        description: `发现 ${securityIssues.length} 个安全问题`,
        impact: 'critical',
        autofix: false,
        safe: false,
        action: () => this.reportSecurity(securityIssues)
      })
    }

    return opportunities
  }

  /**
   * 执行优化
   */
  async executeOptimization(opportunity) {
    console.log(`   ⚡ 执行优化: ${opportunity.description}`)

    try {
      await opportunity.action()

      this.evolutionLog.push({
        timestamp: new Date(),
        type: opportunity.type,
        description: opportunity.description,
        status: 'success'
      })

      console.log('      ✓ 优化成功')
    } catch (error) {
      console.error('      ✗ 优化失败:', error.message)

      this.evolutionLog.push({
        timestamp: new Date(),
        type: opportunity.type,
        description: opportunity.description,
        status: 'failed',
        error: error.message
      })
    }
  }

  /**
   * 查找未使用的依赖
   */
  async findUnusedDependencies() {
    // 简化实现：后续可以使用 depcheck
    return []
  }

  /**
   * 查找 console.log
   */
  async findConsoleLogs() {
    const results = []

    async function scanDir(dir) {
      try {
        const entries = await readdir(dir, { withFileTypes: true })

        for (const entry of entries) {
          const fullPath = join(dir, entry.name)

          if (entry.isDirectory()) {
            if (!['node_modules', '.next', '.git', 'dist'].includes(entry.name)) {
              await scanDir(fullPath)
            }
          } else if (entry.isFile()) {
            const ext = entry.name.split('.').pop()
            if (ext === 'ts' || ext === 'tsx' || ext === 'js' || ext === 'jsx') {
              try {
                const content = await readFile(fullPath, 'utf-8')
                const lines = content.split('\n')

                lines.forEach((line, index) => {
                  if (line.includes('console.log')) {
                    results.push({
                      file: fullPath,
                      line: index + 1,
                      content: line.trim()
                    })
                  }
                })
              } catch {}
            }
          }
        }
      } catch {}
    }

    await scanDir(this.projectPath)
    return results
  }

  /**
   * 查找 TODO/FIXME
   */
  async findTodos() {
    const results = []

    async function scanDir(dir) {
      try {
        const entries = await readdir(dir, { withFileTypes: true })

        for (const entry of entries) {
          const fullPath = join(dir, entry.name)

          if (entry.isDirectory()) {
            if (!['node_modules', '.next', '.git', 'dist'].includes(entry.name)) {
              await scanDir(fullPath)
            }
          } else if (entry.isFile()) {
            const ext = entry.name.split('.').pop()
            if (ext === 'ts' || ext === 'tsx' || ext === 'js' || ext === 'jsx') {
              try {
                const content = await readFile(fullPath, 'utf-8')
                const lines = content.split('\n')

                lines.forEach((line, index) => {
                  if (line.match(/TODO|FIXME/i)) {
                    results.push({
                      file: fullPath,
                      line: index + 1,
                      content: line.trim(),
                      type: line.includes('FIXME') ? 'FIXME' : 'TODO'
                    })
                  }
                })
              } catch {}
            }
          }
        }
      } catch {}
    }

    await scanDir(this.projectPath)
    return results
  }

  /**
   * 查找大文件
   */
  async findLargeFiles() {
    const results = []

    async function scanDir(dir) {
      try {
        const entries = await readdir(dir, { withFileTypes: true })

        for (const entry of entries) {
          const fullPath = join(dir, entry.name)

          if (entry.isDirectory()) {
            if (!['node_modules', '.next', '.git', 'dist'].includes(entry.name)) {
              await scanDir(fullPath)
            }
          } else if (entry.isFile()) {
            const ext = entry.name.split('.').pop()
            if (ext === 'ts' || ext === 'tsx' || ext === 'js' || ext === 'jsx') {
              try {
                const content = await readFile(fullPath, 'utf-8')
                const lines = content.split('\n').length

                if (lines > 500) {
                  results.push({
                    file: fullPath,
                    lines
                  })
                }
              } catch {}
            }
          }
        }
      } catch {}
    }

    await scanDir(this.projectPath)
    return results.sort((a, b) => b.lines - a.lines)
  }

  /**
   * 安全扫描
   */
  async scanSecurity() {
    const issues = []

    async function scanDir(dir) {
      try {
        const entries = await readdir(dir, { withFileTypes: true })

        for (const entry of entries) {
          const fullPath = join(dir, entry.name)

          if (entry.isDirectory()) {
            if (!['node_modules', '.next', '.git', 'dist'].includes(entry.name)) {
              await scanDir(fullPath)
            }
          } else if (entry.isFile()) {
            const ext = entry.name.split('.').pop()
            if (ext === 'ts' || ext === 'tsx' || ext === 'js' || ext === 'jsx') {
              try {
                const content = await readFile(fullPath, 'utf-8')

                // 检查硬编码密钥
                if (content.match(/sk-[a-zA-Z0-9]{20,}/) || content.match(/API_KEY\s*=\s*["'][^"']+["']/)) {
                  issues.push({
                    file: fullPath,
                    type: 'hardcoded-secret',
                    severity: 'critical',
                    message: '可能包含硬编码的 API 密钥'
                  })
                }

                // 检查 eval()
                if (content.includes('eval(')) {
                  issues.push({
                    file: fullPath,
                    type: 'dangerous-function',
                    severity: 'high',
                    message: '使用了 eval() 函数'
                  })
                }
              } catch {}
            }
          }
        }
      } catch {}
    }

    await scanDir(this.projectPath)
    return issues
  }

  /**
   * 跟踪 TODOs
   */
  async trackTodos(todos) {
    const reportPath = join(this.projectPath, '.prophet', 'todo-tracking.json')

    const report = {
      timestamp: new Date().toISOString(),
      total: todos.length,
      byType: {
        TODO: todos.filter(t => t.type === 'TODO').length,
        FIXME: todos.filter(t => t.type === 'FIXME').length
      },
      items: todos
    }

    await writeFile(reportPath, JSON.stringify(report, null, 2))
    console.log(`      → TODO 跟踪报告: .prophet/todo-tracking.json`)
  }

  /**
   * 报告未使用的依赖
   */
  async reportUnusedDependencies(deps) {
    console.log(`      → 未使用的依赖: ${deps.length} 个`)
  }

  /**
   * 报告 console.log
   */
  async reportConsoleLogs(logs) {
    console.log(`      → console.log: ${logs.length} 个`)
  }

  /**
   * 报告大文件
   */
  async reportLargeFiles(files) {
    console.log(`      → 大文件: ${files.length} 个`)
    files.forEach(f => {
      console.log(`         ${f.file}: ${f.lines} 行`)
    })
  }

  /**
   * 报告安全问题
   */
  async reportSecurity(issues) {
    console.log(`      ⚠️  安全问题: ${issues.length} 个`)

    const critical = issues.filter(i => i.severity === 'critical')
    if (critical.length > 0) {
      console.log(`         🔴 Critical: ${critical.length}`)
      critical.forEach(i => {
        console.log(`            ${i.file}: ${i.message}`)
      })
    }
  }

  /**
   * 更新学习
   */
  async updateLearning() {
    // 记录心跳到记忆系统
    const learningPath = join(
      process.env.HOME,
      '.claude/projects/prophet-memory/videoplay/heartbeats'
    )

    try {
      await mkdir(learningPath, { recursive: true })

      const heartbeatLog = join(learningPath, `${Date.now()}.json`)
      await writeFile(heartbeatLog, JSON.stringify({
        timestamp: new Date().toISOString(),
        evolutionLog: this.evolutionLog
      }, null, 2))
    } catch (error) {
      // 忽略写入错误
    }
  }

  /**
   * 生成报告
   */
  async generateReport() {
    const reportPath = join(this.projectPath, '.prophet', 'evolution-log.json')

    try {
      let existingLog = []
      try {
        const content = await readFile(reportPath, 'utf-8')
        existingLog = JSON.parse(content)
      } catch {}

      const newLog = [...existingLog, ...this.evolutionLog]

      await writeFile(reportPath, JSON.stringify(newLog, null, 2))

      // 清空当前日志
      this.evolutionLog = []
    } catch (error) {
      console.error('   ✗ 生成报告失败:', error.message)
    }
  }
}

// CLI 入口
const projectPath = process.argv[2] || process.cwd()
const heart = new ProphetHeart(projectPath)

// 启动心脏
heart.start().catch(console.error)

// 优雅关闭
process.on('SIGINT', () => {
  heart.stop()
  process.exit(0)
})

process.on('SIGTERM', () => {
  heart.stop()
  process.exit(0)
})
