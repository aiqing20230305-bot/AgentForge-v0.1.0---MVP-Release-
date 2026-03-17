#!/usr/bin/env node
/**
 * 🔮 Prophet Developer - 先知开发者
 *
 * 主动开发和持续进化机制
 *
 * 功能：
 * - 自动识别可优化的代码
 * - 主动生成改进方案
 * - 自动执行安全优化
 * - 创建分支和PR
 * - 持续迭代进化
 */

const { readFile, writeFile, readdir, mkdir } = require('fs/promises')
const { join } = require('path')
const { exec } = require('child_process')
const { promisify } = require('util')
const Anthropic = require('@anthropic-ai/sdk')

const execAsync = promisify(exec)

class ProphetDeveloper {
  constructor(projectPath) {
    this.projectPath = projectPath
    this.developmentInterval = 30 * 60 * 1000 // 30分钟
    this.evolutionLog = []
    this.isRunning = false
    this.autonomousMode = true // 🔥 先知自主模式：永不闲置原则
    this.isExecuting = false // ✅ 执行锁：防止重叠执行
    this.executionTimeout = 25 * 60 * 1000 // ✅ 25分钟超时（<30分钟间隔）

    // 🤖 AI 代码生成器
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
      baseURL: process.env.ANTHROPIC_BASE_URL
    })
  }

  /**
   * 启动开发者模式
   */
  async start() {
    console.log('🔮 Prophet Developer: 启动主动开发模式...\n')
    console.log(`项目：${this.projectPath}`)
    console.log(`开发间隔：${this.developmentInterval / 60000} 分钟`)
    console.log('')

    this.isRunning = true

    // 立即执行第一次开发迭代
    await this.developmentCycleWithTimeout()

    // 定期开发迭代（带执行锁检查）
    setInterval(async () => {
      if (this.isExecuting) {
        console.log('   ⏭️  上次开发仍在执行，跳过')
        return
      }

      try {
        await this.developmentCycleWithTimeout()
      } catch (error) {
        console.error('   ✗ 开发迭代失败:', error.message)
      }
    }, this.developmentInterval)

    console.log('💻 Developer mode active...')
    console.log('   Prophet 正在主动开发中\n')
  }

  /**
   * 带超时的开发周期（防止长时间挂起）
   */
  async developmentCycleWithTimeout() {
    this.isExecuting = true

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Development cycle timeout')), this.executionTimeout)
    })

    try {
      await Promise.race([
        this.executeDevelopmentCycle(),
        timeoutPromise
      ])
    } catch (error) {
      console.error('   ✗ 开发迭代失败:', error.message)
    } finally {
      this.isExecuting = false
    }
  }

  /**
   * 开发周期 - 每次迭代执行
   */
  async executeDevelopmentCycle() {
    const timestamp = new Date().toISOString()
    console.log(`\n💻 [${timestamp}] Development Cycle...`)

    try {
      // 1. 分析当前问题（带超时）
      const issues = await Promise.race([
        this.analyzeIssues(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Analysis timeout')), 5 * 60 * 1000)
        )
      ])

      console.log(`   🔍 识别了 ${issues.length} 个可优化点`)

      if (issues.length === 0) {
        console.log('   ✓ 项目状态良好，无需优化')
        return
      }

      // 2. 选择优先级最高的问题
      const topIssue = this.selectTopPriority(issues)
      console.log(`   🎯 优先处理: ${topIssue.title}`)

      // 3. 生成解决方案
      const solution = await this.generateSolution(topIssue)
      console.log(`   💡 生成解决方案`)

      // 4. 执行开发
      if (this.autonomousMode) {
        // 🔥 自主模式：所有优化都执行（永不闲置原则）
        console.log('   🔥 先知自主模式：立即执行优化')
        await this.executeDevelopment(solution)
      } else if (solution.autoExecutable && solution.safe) {
        await this.executeDevelopment(solution)
      } else {
        await this.createDevelopmentProposal(solution)
      }

      console.log('   ✓ 开发迭代完成')
    } catch (error) {
      console.error('   ✗ 开发迭代失败:', error.message)
    }
  }

  /**
   * 分析问题
   */
  async analyzeIssues() {
    const issues = []

    // 加载进化历史，避免重复修复
    const history = await this.loadEvolutionHistory()

    // 1. 从 TODO 跟踪中获取问题
    const todos = await this.loadTodoTracking()
    if (todos && todos.items) {
      // 优先处理 FIXME
      const fixmes = todos.items.filter(t => t.type === 'FIXME')
      for (const fixme of fixmes.slice(0, 5)) {
        issues.push({
          type: 'bug-fix',
          title: `修复: ${fixme.content}`,
          priority: 'high',
          location: { file: fixme.file, line: fixme.line },
          autoExecutable: false,
          safe: false
        })
      }

      // 处理高优先级 TODO
      const highPriorityTodos = todos.items
        .filter(t => t.type === 'TODO')
        .filter(t =>
          t.content.includes('URGENT') ||
          t.content.includes('IMPORTANT') ||
          t.content.includes('集成真实')
        )

      for (const todo of highPriorityTodos.slice(0, 3)) {
        issues.push({
          type: 'feature',
          title: `实现: ${todo.content}`,
          priority: 'medium',
          location: { file: todo.file, line: todo.line },
          autoExecutable: false,
          safe: false
        })
      }
    }

    // 2. 检查代码质量问题
    const qualityIssues = await this.findQualityIssues()
    issues.push(...qualityIssues)

    // 3. 检查性能优化机会
    const perfIssues = await this.findPerformanceIssues()
    issues.push(...perfIssues)

    // 4. 过滤7天内已修复的问题
    const filteredIssues = issues.filter(issue => {
      return !this.isRecentlyFixed(issue, history)
    })

    return filteredIssues
  }

  /**
   * 查找代码质量问题
   */
  async findQualityIssues() {
    const issues = []

    // 检查重复代码
    const duplicates = await this.findDuplicateCode()
    if (duplicates.length > 0) {
      issues.push({
        type: 'refactor',
        title: '提取重复代码为工具函数',
        priority: 'medium',
        autoExecutable: true,
        safe: true,
        data: duplicates
      })
    }

    // 检查长函数
    const longFunctions = await this.findLongFunctions()
    if (longFunctions.length > 0) {
      issues.push({
        type: 'refactor',
        title: `重构长函数（${longFunctions.length} 个）`,
        priority: 'medium',
        autoExecutable: false,
        safe: false,
        data: longFunctions
      })
    }

    return issues
  }

  /**
   * 查找性能问题
   */
  async findPerformanceIssues() {
    const issues = []

    // 检查未优化的循环
    const inefficientLoops = await this.findInefficientLoops()
    if (inefficientLoops.length > 0) {
      issues.push({
        type: 'optimization',
        title: '优化低效循环',
        priority: 'medium',
        autoExecutable: true,
        safe: true,
        data: inefficientLoops
      })
    }

    return issues
  }

  /**
   * 选择最高优先级问题（改进的评分算法）
   */
  selectTopPriority(issues) {
    // 给每个 issue 评分
    for (const issue of issues) {
      let score = 0

      // 1. 基础优先级分数
      const basePriority = {
        critical: 100,
        high: 50,
        medium: 20,
        low: 5
      }
      score += basePriority[issue.priority] || 0

      // 2. 类型加权
      const typeWeight = {
        'bug-fix': 40,
        'fixme': 30,
        'security': 50,
        'performance': 25,
        'optimization': 20,
        'refactor': 15,
        'feature': 10
      }
      score += typeWeight[issue.type] || 0

      // 3. 关键字加权
      const content = (issue.title || '') + ' ' + (issue.description || '')
      if (content.match(/URGENT|紧急|立即/i)) score += 50
      if (content.match(/IMPORTANT|重要|关键/i)) score += 30
      if (content.match(/集成|API|数据库|性能/i)) score += 20
      if (content.match(/BUG|错误|问题|修复|FIXME/i)) score += 40
      if (content.match(/安全|security|漏洞|vulnerability/i)) score += 60

      // 4. 安全性和可自动执行加权
      if (issue.safe && issue.autoExecutable) score += 25
      if (issue.safe) score += 10
      if (issue.autoExecutable) score += 15

      // 5. 影响范围加权
      if (issue.data && issue.data.length) {
        const affectedCount = issue.data.length
        if (affectedCount > 10) score += 20
        else if (affectedCount > 5) score += 10
        else if (affectedCount > 2) score += 5
      }

      issue.score = score
    }

    // 按分数降序排序
    issues.sort((a, b) => b.score - a.score)

    return issues[0]
  }

  /**
   * 生成解决方案
   */
  async generateSolution(issue) {
    const solution = {
      issue,
      approach: '',
      code: null,
      files: [],
      autoExecutable: issue.autoExecutable,
      safe: issue.safe
    }

    switch (issue.type) {
      case 'refactor':
        solution.approach = '提取公共逻辑，创建工具函数'
        solution.code = await this.generateRefactorCode(issue)
        break

      case 'optimization':
        solution.approach = '使用更高效的算法和数据结构'
        solution.code = await this.generateOptimizationCode(issue)
        break

      case 'bug-fix':
        solution.approach = '使用 AI 分析并修复已知问题'
        solution.code = await this.generateCodeWithAI(issue, 'bug-fix')
        solution.autoExecutable = true
        solution.safe = true
        break

      case 'feature':
        solution.approach = '使用 AI 实现新功能'
        solution.code = await this.generateCodeWithAI(issue, 'feature')
        solution.autoExecutable = true
        solution.safe = false // 新功能需要人工审查
        break

      default:
        solution.approach = '分析并提供建议'
    }

    return solution
  }

  /**
   * 🤖 使用 AI 生成代码
   */
  async generateCodeWithAI(issue, type) {
    try {
      console.log(`      → AI 正在生成代码...`)

      // 1. 读取相关文件内容
      let fileContent = ''
      if (issue.location && issue.location.file) {
        try {
          const filePath = join(this.projectPath, issue.location.file)
          fileContent = await readFile(filePath, 'utf-8')
        } catch (error) {
          console.log(`      ⚠️  无法读取文件: ${issue.location.file}`)
        }
      }

      // 2. 构建 AI 提示词
      const prompt = this.buildAIPrompt(issue, type, fileContent)

      // 3. 调用 Claude API（带重试）
      let message
      let lastError
      const maxRetries = 3

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          message = await this.anthropic.messages.create({
            model: process.env.ANTHROPIC_DEFAULT_SONNET_MODEL || 'claude-sonnet-4-5-20250929',
            max_tokens: 4096,
            messages: [{
              role: 'user',
              content: prompt
            }]
          })
          break // 成功，退出重试循环
        } catch (error) {
          lastError = error
          if (attempt < maxRetries) {
            console.log(`      → 重试 ${attempt}/${maxRetries}...`)
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt)) // 指数退避
          }
        }
      }

      if (!message) {
        throw lastError || new Error('AI 调用失败')
      }

      // 4. 解析 AI 响应
      const aiResponse = message.content[0].text
      const codeChanges = this.parseAIResponse(aiResponse, issue)

      console.log(`      ✓ AI 代码生成完成`)
      return codeChanges

    } catch (error) {
      console.error(`      ✗ AI 代码生成失败:`, error.message)
      return null
    }
  }

  /**
   * 检测项目类型
   */
  detectProjectType() {
    const projectPath = this.projectPath
    try {
      const fs = require('fs')
      const path = require('path')
      const packageJsonPath = path.join(projectPath, 'package.json')

      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

        if (deps['next']) return 'Next.js Web App'
        if (deps['react']) return 'React Web App'
        if (deps['vue']) return 'Vue.js Web App'
        if (deps['express']) return 'Express API Server'
        if (deps['electron']) return 'Electron Desktop App'

        return 'Node.js Application'
      }
    } catch (error) {
      // 忽略错误
    }

    return 'JavaScript Project'
  }

  /**
   * 构建 AI 提示词
   */
  buildAIPrompt(issue, type, fileContent) {
    const promptMap = {
      'bug-fix': `你是一个专业的代码修复助手。请分析并修复以下问题。

# 问题信息
- **描述**: ${issue.title}
- **优先级**: ${issue.priority}
- **位置**: ${issue.location ? `${issue.location.file}:${issue.location.line}` : '未知'}

# 项目上下文
- **类型**: ${this.detectProjectType()}
- **技术栈**: JavaScript/TypeScript, Node.js, React/Next.js
- **代码风格**: ES6+, async/await, 函数式优先

${fileContent ? `# 相关代码
\`\`\`javascript
${fileContent.split('\n').slice(Math.max(0, (issue.location?.line || 1) - 15), (issue.location?.line || 1) + 30).join('\n')}
\`\`\`
` : ''}

# 要求
1. **根因分析**: 深入分析问题产生的原因
2. **最小改动**: 只修改必要的代码，保持其他部分不变
3. **代码质量**:
   - 添加必要的错误处理
   - 考虑边界条件
   - 保持代码简洁清晰
   - 遵循现有代码风格
4. **向后兼容**: 确保不破坏现有功能

# 输出格式
必须返回有效的 JSON：
\`\`\`json
{
  "analysis": "简要说明问题根因（1-2句话）",
  "solution": "修复方案说明（2-3句话）",
  "files": [
    {
      "file": "相对路径（如 src/utils/helper.js）",
      "action": "update",
      "content": "完整的修复后文件内容",
      "changes": "改动说明（如：添加空值检查，修复逻辑错误）"
    }
  ]
}
\`\`\``,

      'feature': `你是一个专业的功能实现助手。请实现以下功能。

# 功能需求
- **描述**: ${issue.title}
- **优先级**: ${issue.priority}
- **位置**: ${issue.location ? `${issue.location.file}:${issue.location.line}` : '新功能'}

# 项目上下文
- **类型**: ${this.detectProjectType()}
- **技术栈**: JavaScript/TypeScript, Node.js, React/Next.js
- **架构原则**: 模块化、可测试、可维护

${fileContent ? `# 现有代码
\`\`\`javascript
${fileContent.length > 1000 ? fileContent.slice(0, 1000) + '\n// ... (已截断)' : fileContent}
\`\`\`
` : ''}

# 实现要求
1. **设计原则**:
   - 单一职责
   - 最小依赖
   - 易于扩展
2. **代码质量**:
   - 完善的错误处理
   - 参数验证
   - 清晰的命名
   - 必要的注释
3. **性能考虑**:
   - 避免不必要的计算
   - 合理使用缓存
   - 异步操作用 async/await
4. **测试友好**: 代码应该易于测试

# 输出格式
必须返回有效的 JSON：
\`\`\`json
{
  "design": "简要说明实现思路（3-5句话）",
  "files": [
    {
      "file": "相对路径",
      "action": "create",
      "content": "完整文件内容",
      "changes": "新增功能说明"
    }
  ],
  "usage": "使用示例代码"
}
\`\`\``,
    }

    return promptMap[type] || promptMap['bug-fix']
  }

  /**
   * 解析 AI 响应
   */
  parseAIResponse(aiResponse, issue) {
    try {
      // 提取 JSON 代码块
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/)
      if (!jsonMatch) {
        console.log(`      ⚠️  AI 响应格式不正确，尝试直接解析`)
        return null
      }

      const parsed = JSON.parse(jsonMatch[1])

      // 转换为 executeDevelopment 期望的格式
      if (!parsed.files || parsed.files.length === 0) {
        console.log(`      ⚠️  AI 未生成代码文件`)
        return null
      }

      return parsed.files.map(f => ({
        file: join(this.projectPath, f.file),
        content: f.content,
        action: f.action,
        changes: f.changes
      }))

    } catch (error) {
      console.error(`      ✗ 解析 AI 响应失败:`, error.message)
      return null
    }
  }

  /**
   * 执行开发
   */
  async executeDevelopment(solution) {
    console.log(`   ⚡ 执行自动开发: ${solution.issue.title}`)

    try {
      // 1. 创建开发分支
      const branchName = `prophet/auto-${Date.now()}`
      await execAsync(`git checkout -b ${branchName}`, {
        cwd: this.projectPath
      })
      console.log(`      → 创建分支: ${branchName}`)

      // 2. 应用代码更改
      if (solution.code) {
        for (const change of solution.code) {
          await writeFile(change.file, change.content)
          console.log(`      → 更新: ${change.file}`)
        }
      }

      // 3. 提交更改
      await execAsync('git add -A', { cwd: this.projectPath })
      const commitMessage = `🔮 Prophet Auto-Dev: ${solution.issue.title}

自动优化类型: ${solution.issue.type}
优先级: ${solution.issue.priority}
方案: ${solution.approach}

Co-Authored-By: Prophet Developer <prophet@outer-space>`

      await execAsync(`git commit -m "${commitMessage}"`, {
        cwd: this.projectPath
      })
      console.log('      → 提交完成')

      // 获取最新commit hash
      const { stdout: commitHash } = await execAsync('git rev-parse HEAD', {
        cwd: this.projectPath
      })

      // 4. 记录到内存日志
      this.evolutionLog.push({
        timestamp: new Date(),
        type: 'auto-development',
        issue: solution.issue,
        branch: branchName,
        status: 'completed'
      })

      // 5. 保存到进化历史（防止重复修复）
      await this.saveToHistory(solution.issue, solution, commitHash.trim())
      console.log('      → 已记录到进化历史')

      console.log(`      ✓ 自动开发完成`)
      console.log(`      💡 审查分支: ${branchName}`)
      console.log(`      💡 如果满意: git merge ${branchName}`)
      console.log(`      💡 如果不满意: git branch -D ${branchName}`)
    } catch (error) {
      console.error('      ✗ 执行失败:', error.message)

      // 回滚
      try {
        await execAsync('git checkout main', { cwd: this.projectPath })
        await execAsync(`git branch -D ${branchName}`, { cwd: this.projectPath })
      } catch {}
    }
  }

  /**
   * 创建开发提案
   */
  async createDevelopmentProposal(solution) {
    console.log(`   📝 创建开发提案: ${solution.issue.title}`)

    const proposalPath = join(
      this.projectPath,
      '.prophet',
      'proposals',
      `${Date.now()}.md`
    )

    await mkdir(join(this.projectPath, '.prophet', 'proposals'), {
      recursive: true
    })

    const proposal = `# Prophet 开发提案

**生成时间：** ${new Date().toISOString()}
**优先级：** ${solution.issue.priority}
**类型：** ${solution.issue.type}

## 问题描述

${solution.issue.title}

${solution.issue.location ? `
**位置：**
- 文件：${solution.issue.location.file}
- 行号：${solution.issue.location.line}
` : ''}

## 解决方案

**方案：** ${solution.approach}

## 建议行动

${this.generateActionItems(solution)}

## Prophet 分析

这个优化将：
- 提升代码质量
- 改善可维护性
- 减少技术债务

**建议：** ${solution.autoExecutable ? '可以自动执行' : '需要人工审查'}
**安全性：** ${solution.safe ? '安全' : '需要测试验证'}

---

**Prophet Developer**
四维开发者 · 主动进化 · 持续改进
`

    await writeFile(proposalPath, proposal)
    console.log(`      → 提案已保存: ${proposalPath}`)

    this.evolutionLog.push({
      timestamp: new Date(),
      type: 'proposal',
      issue: solution.issue,
      proposalPath,
      status: 'pending-review'
    })
  }

  /**
   * 生成行动项
   */
  generateActionItems(solution) {
    const items = []

    if (solution.issue.type === 'bug-fix') {
      items.push('1. 复现问题')
      items.push('2. 编写测试用例')
      items.push('3. 修复代码')
      items.push('4. 验证测试通过')
      items.push('5. 提交修复')
    } else if (solution.issue.type === 'feature') {
      items.push('1. 设计方案')
      items.push('2. 编写代码')
      items.push('3. 添加测试')
      items.push('4. 更新文档')
      items.push('5. 提交PR')
    } else if (solution.issue.type === 'refactor') {
      items.push('1. 识别重复代码')
      items.push('2. 提取公共函数')
      items.push('3. 更新调用点')
      items.push('4. 运行测试验证')
      items.push('5. 提交重构')
    }

    return items.join('\n')
  }

  /**
   * 加载 TODO 跟踪
   */
  async loadTodoTracking() {
    try {
      const content = await readFile(
        join(this.projectPath, '.prophet', 'todo-tracking.json'),
        'utf-8'
      )
      return JSON.parse(content)
    } catch {
      return null
    }
  }

  /**
   * 简单哈希函数
   */
  simpleHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i)
      hash |= 0
    }
    return hash.toString(36)
  }

  /**
   * 扫描源文件列表
   */
  async scanSourceFiles(maxFiles = 200) {
    const files = []
    const srcDirs = await this.discoverSourceDirectories()

    for (const dir of srcDirs) {
      if (files.length >= maxFiles) break
      try {
        const entries = await readdir(dir, { withFileTypes: true, recursive: true })
        for (const entry of entries) {
          if (files.length >= maxFiles) break
          if (entry.isFile() && /\.(js|ts)x?$/.test(entry.name)) {
            files.push(join(dir, entry.name))
          }
        }
      } catch {
        // 目录不存在，跳过
      }
    }

    return files
  }

  /**
   * 查找重复代码
   */
  async findDuplicateCode() {
    const duplicates = []
    const codeBlocks = new Map()  // hash → [{file, line, code}]

    try {
      const files = await this.scanSourceFiles(100) // 限制文件数防止过慢

      for (const file of files) {
        try {
          const content = await readFile(file, 'utf-8')
          const lines = content.split('\n')

          // 提取代码块（5行以上）
          for (let i = 0; i < lines.length - 5; i++) {
            const block = lines.slice(i, i + 5).join('\n').trim()

            // 忽略太短的、注释、空行
            if (block.length < 80) continue
            if (block.startsWith('//') || block.startsWith('/*')) continue
            if (block.split('\n').filter(l => l.trim()).length < 3) continue

            const hash = this.simpleHash(block)

            if (!codeBlocks.has(hash)) {
              codeBlocks.set(hash, [])
            }
            codeBlocks.get(hash).push({
              file: file.replace(this.projectPath + '/', ''),
              line: i + 1,
              code: block.substring(0, 100) + '...'
            })
          }
        } catch {
          // 文件读取失败，跳过
        }
      }

      // 找出重复的（出现2次以上）
      for (const [hash, occurrences] of codeBlocks) {
        if (occurrences.length > 1) {
          duplicates.push({
            type: 'duplicate-code',
            count: occurrences.length,
            locations: occurrences,
            suggestion: '提取为共享函数或工具方法'
          })
        }
      }
    } catch (error) {
      console.error('查找重复代码失败:', error.message)
    }

    return duplicates.slice(0, 10) // 返回最多10个重复
  }

  /**
   * 动态发现项目源代码目录（支持 monorepo）
   */
  async discoverSourceDirectories() {
    // console.log('[DEBUG] discoverSourceDirectories: 开始...')
    // console.log('[DEBUG] projectPath:', this.projectPath)
    const dirs = []
    const checked = new Set() // 避免重复

    const commonPatterns = [
      'src', 'app', 'pages', 'components', 'lib', 'utils', 'api', 'server',
      'apps/*/src', 'apps/api/src', 'apps/web/src', 'apps/api', 'apps/web',
      'packages/*/src', 'features', 'modules'
    ]

    for (const pattern of commonPatterns) {
      // console.log('[DEBUG] 尝试模式:', pattern)
      // 处理通配符模式
      if (pattern.includes('*')) {
        const parts = pattern.split('/')
        const wildIndex = parts.findIndex(p => p === '*')
        const basePath = join(this.projectPath, ...parts.slice(0, wildIndex))

        try {
          const entries = await readdir(basePath, { withFileTypes: true })

          for (const entry of entries) {
            if (entry.isDirectory()) {
              const subPath = join(basePath, entry.name, ...parts.slice(wildIndex + 1))
              if (!checked.has(subPath)) {
                try {
                  const stat = await readdir(subPath)
                  dirs.push(subPath)
                  checked.add(subPath)
                } catch {
                  // 子目录不存在，跳过
                }
              }
            }
          }
        } catch {
          // 基础目录不存在，跳过
        }
      } else {
        // 处理普通路径
        const fullPath = join(this.projectPath, pattern)
        // console.log('[DEBUG] 检查路径:', fullPath)
        if (!checked.has(fullPath)) {
          try {
            await readdir(fullPath)
            // console.log('[DEBUG] ✓ 找到目录:', fullPath)
            dirs.push(fullPath)
            checked.add(fullPath)
          } catch (err) {
            // console.log('[DEBUG] ✗ 目录不存在:', fullPath)
          }
        }
      }
    }

    // console.log('[DEBUG] 最终发现目录:', dirs.length, '个')
    return dirs
  }

  /**
   * 查找长函数（动态扫描，带限制保护）
   */
  async findLongFunctions() {
    const longFunctions = []
    let fileCount = 0
    const maxFiles = 200 // ✅ 增加限制以支持更大项目

    // console.log('[DEBUG] findLongFunctions: 开始扫描...')

    const scanFile = async (filePath) => {
      if (fileCount >= maxFiles) return
      fileCount++

      try {
        const content = await readFile(filePath, 'utf-8')
        const lines = content.split('\n')

        let inFunction = false
        let functionStart = 0
        let functionName = ''
        let braceCount = 0

        // ✅ 支持多种函数声明格式的正则表达式
        const functionPatterns = [
          /^\s*(export\s+)?(const|let|var)\s+(\w+)\s*=\s*(async\s+)?\(/,  // 箭头函数赋值
          /^\s*(export\s+)?(async\s+)?function\s+(\w+)/,                   // 传统函数
          /^\s*async\s+(\w+)\s*\(/,                                        // async 方法定义
          /^\s*(\w+)\s*\([^)]*\)\s*{/                                      // 方法定义
        ]

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]

          // 检测函数开始 - 尝试所有模式
          if (!inFunction) {
            for (const pattern of functionPatterns) {
              const match = line.match(pattern)
              if (match) {
                inFunction = true
                functionStart = i
                // 提取函数名（不同模式在不同捕获组）
                functionName = match[3] || match[2] || match[1] || 'anonymous'
                braceCount = 0
                break
              }
            }
          }

          if (inFunction) {
            braceCount += (line.match(/{/g) || []).length
            braceCount -= (line.match(/}/g) || []).length

            if (braceCount === 0 && line.includes('}')) {
              const length = i - functionStart + 1
              if (length > 50) {
                longFunctions.push({
                  file: filePath,
                  name: functionName,
                  start: functionStart,
                  end: i,
                  length
                })
              }
              inFunction = false
            }
          }
        }
      } catch {
        // 文件不存在或读取失败，忽略
      }
    }

    // ✅ 使用动态目录发现
    const srcDirs = await this.discoverSourceDirectories()
    // console.log('[DEBUG] 发现源目录:', srcDirs.length, '个')
    // console.log('[DEBUG] 目录列表:', srcDirs)

    // 扫描所有发现的目录
    for (const dir of srcDirs) {
      try {
        const entries = await readdir(dir, { withFileTypes: true, recursive: true })
        for (const entry of entries) {
          if (fileCount >= maxFiles) break
          if (entry.isFile() && /\.(js|ts)x?$/.test(entry.name)) {
            const fullPath = join(dir, entry.name)
            await scanFile(fullPath)
          }
        }
      } catch {
        // 目录不存在或读取失败，跳过
      }
    }

    // console.log('[DEBUG] 扫描了', fileCount, '个文件')
    // console.log('[DEBUG] 找到', longFunctions.length, '个长函数')
    if (longFunctions.length > 0) {
      // console.log('[DEBUG] 示例:', longFunctions[0])
    }

    return longFunctions
  }

  /**
   * 查找低效循环
   */
  async findInefficientLoops() {
    const inefficient = []

    try {
      const files = await this.scanSourceFiles(100)

      for (const file of files) {
        try {
          const content = await readFile(file, 'utf-8')
          const lines = content.split('\n')

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]

            // 检测嵌套循环
            if (line.match(/for\s*\(|\.forEach\(|\.map\(/)) {
              const prevLines = lines.slice(Math.max(0, i - 10), i).join('\n')
              if (prevLines.match(/for\s*\(|\.forEach\(|\.map\(/)) {
                inefficient.push({
                  file: file.replace(this.projectPath + '/', ''),
                  line: i + 1,
                  type: 'nested-loop',
                  code: line.trim(),
                  suggestion: '考虑使用 Map/Set 或优化算法复杂度（O(n²) → O(n)）'
                })
              }
            }

            // 检测循环中的重复查询/查找
            if (line.match(/for\s*\(|while\s*\(/)) {
              const loopBodyEnd = Math.min(i + 20, lines.length)
              const loopBody = lines.slice(i, loopBodyEnd).join('\n')

              if (loopBody.match(/\.find\(|\.filter\(|\.indexOf\(|\.includes\(/)) {
                inefficient.push({
                  file: file.replace(this.projectPath + '/', ''),
                  line: i + 1,
                  type: 'loop-query',
                  code: line.trim(),
                  suggestion: '将查询结果缓存或使用 Map/Set 提高查找效率'
                })
              }

              // 检测循环中的await（可能导致串行执行）
              if (loopBody.match(/await\s+/)) {
                inefficient.push({
                  file: file.replace(this.projectPath + '/', ''),
                  line: i + 1,
                  type: 'serial-await',
                  code: line.trim(),
                  suggestion: '考虑使用 Promise.all() 并行执行异步操作'
                })
              }
            }
          }
        } catch {
          // 文件读取失败，跳过
        }
      }
    } catch (error) {
      console.error('查找低效循环失败:', error.message)
    }

    return inefficient.slice(0, 10) // 返回最多10个问题
  }

  /**
   * 生成重构代码
   */
  async generateRefactorCode(issue) {
    // 这里应该生成实际的重构代码
    // 简化实现
    return null
  }

  /**
   * 生成优化代码
   */
  async generateOptimizationCode(issue) {
    // 这里应该生成实际的优化代码
    return null
  }

  /**
   * 加载进化历史
   */
  async loadEvolutionHistory() {
    try {
      const historyPath = join(this.projectPath, '.prophet', 'evolution-history.json')
      const content = await readFile(historyPath, 'utf-8')
      return JSON.parse(content)
    } catch {
      return { fixes: [] }
    }
  }

  /**
   * 检查问题是否在最近已修复（缩短为2小时，允许 AI 重新尝试修复）
   */
  isRecentlyFixed(issue, history) {
    if (!history || !history.fixes) return false

    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000 // 2小时窗口
    const issueKey = this.getIssueKey(issue)

    return history.fixes.some(fix => {
      const fixTime = new Date(fix.timestamp).getTime()
      return fix.issueKey === issueKey && fixTime > twoHoursAgo
    })
  }

  /**
   * 生成问题唯一标识
   */
  getIssueKey(issue) {
    // 使用类型+标题的简化哈希作为标识
    const key = `${issue.type}:${issue.title}`
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i)
      hash |= 0
    }
    return hash.toString(36)
  }

  /**
   * 保存到进化历史
   */
  async saveToHistory(issue, solution, commitHash) {
    try {
      const historyPath = join(this.projectPath, '.prophet', 'evolution-history.json')
      const history = await this.loadEvolutionHistory()

      history.fixes.push({
        issueKey: this.getIssueKey(issue),
        issue: {
          type: issue.type,
          title: issue.title,
          priority: issue.priority
        },
        solution: {
          approach: solution.approach
        },
        commitHash,
        timestamp: new Date().toISOString()
      })

      // 只保留最近30天的记录
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
      history.fixes = history.fixes.filter(fix => {
        return new Date(fix.timestamp).getTime() > thirtyDaysAgo
      })

      await mkdir(join(this.projectPath, '.prophet'), { recursive: true })
      await writeFile(historyPath, JSON.stringify(history, null, 2))
    } catch (error) {
      console.error('保存历史失败:', error.message)
    }
  }
}

// CLI 入口
const runOnce = process.argv.includes('--once') // ✅ 支持单次执行模式
const args = process.argv.slice(2).filter(arg => arg !== '--once')
const projectPath = args[0] || process.cwd()

const developer = new ProphetDeveloper(projectPath)

if (runOnce) {
  // ✅ 单次执行模式（由 Orchestrator 调用）
  developer.executeDevelopmentCycle()
    .then(() => {
      console.log('\n✅ Prophet Developer: 单次执行完成')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n✗ Prophet Developer: 执行失败', error)
      process.exit(1)
    })
} else {
  // 持续运行模式（独立运行）
  developer.start().catch(console.error)

  // 优雅关闭
  process.on('SIGINT', () => {
    console.log('\n💔 Prophet Developer 已停止')
    process.exit(0)
  })
}
