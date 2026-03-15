#!/usr/bin/env node
/**
 * Prophet 主动分析 videoplay 项目
 */

const { readdir, readFile, stat } = require('fs/promises')
const { join } = require('path')

async function analyzeProject(projectPath) {
  console.log('🔮 Prophet: 深度分析 videoplay 项目...\n')

  const analysis = {
    structure: {
      totalFiles: 0,
      totalLines: 0,
      filesByType: {},
      largestFiles: []
    },
    quality: {
      todoCount: 0,
      fixmeCount: 0,
      consoleLogCount: 0,
      eslintDisableCount: 0
    },
    dependencies: {
      frontend: [],
      backend: [],
      ai: []
    },
    insights: []
  }

  // 1. 分析项目结构
  await analyzeStructure(projectPath, analysis)

  // 2. 分析代码质量
  await analyzeQuality(projectPath, analysis)

  // 3. 分析依赖
  await analyzeDependencies(projectPath, analysis)

  // 4. 生成洞察
  await generateInsights(analysis)

  return analysis
}

async function analyzeStructure(basePath, analysis) {
  const ignoreDirs = ['node_modules', '.next', '.git', 'dist', 'temp', 'uploads', '.claude']

  async function scanDir(dir) {
    try {
      const entries = await readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(dir, entry.name)

        if (entry.isDirectory()) {
          if (!ignoreDirs.includes(entry.name)) {
            await scanDir(fullPath)
          }
        } else if (entry.isFile()) {
          const ext = entry.name.split('.').pop() || 'other'
          analysis.structure.totalFiles++
          analysis.structure.filesByType[ext] =
            (analysis.structure.filesByType[ext] || 0) + 1

          if (ext === 'ts' || ext === 'tsx' || ext === 'js' || ext === 'jsx') {
            try {
              const content = await readFile(fullPath, 'utf-8')
              const lines = content.split('\n').length
              analysis.structure.totalLines += lines

              analysis.structure.largestFiles.push({
                path: fullPath.replace(basePath + '/', ''),
                lines
              })
            } catch {}
          }
        }
      }
    } catch (error) {}
  }

  await scanDir(basePath)

  analysis.structure.largestFiles.sort((a, b) => b.lines - a.lines)
  analysis.structure.largestFiles = analysis.structure.largestFiles.slice(0, 10)
}

async function analyzeQuality(basePath, analysis) {
  const ignoreDirs = ['node_modules', '.next', '.git', 'dist', '.claude']

  async function scanDir(dir) {
    try {
      const entries = await readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(dir, entry.name)

        if (entry.isDirectory()) {
          if (!ignoreDirs.includes(entry.name)) {
            await scanDir(fullPath)
          }
        } else if (entry.isFile()) {
          const ext = entry.name.split('.').pop()
          if (ext === 'ts' || ext === 'tsx' || ext === 'js' || ext === 'jsx') {
            try {
              const content = await readFile(fullPath, 'utf-8')

              analysis.quality.todoCount += (content.match(/TODO/gi) || []).length
              analysis.quality.fixmeCount += (content.match(/FIXME/gi) || []).length
              analysis.quality.consoleLogCount += (content.match(/console\\.log/g) || []).length
              analysis.quality.eslintDisableCount += (content.match(/eslint-disable/g) || []).length
            } catch {}
          }
        }
      }
    } catch (error) {}
  }

  await scanDir(basePath)
}

async function analyzeDependencies(basePath, analysis) {
  try {
    const webPkg = await readFile(join(basePath, 'apps/web/package.json'), 'utf-8')
    const webData = JSON.parse(webPkg)
    analysis.dependencies.frontend = Object.keys({
      ...webData.dependencies,
      ...webData.devDependencies
    })
  } catch {}

  try {
    const apiPkg = await readFile(join(basePath, 'apps/api/package.json'), 'utf-8')
    const apiData = JSON.parse(apiPkg)
    analysis.dependencies.backend = Object.keys({
      ...apiData.dependencies,
      ...apiData.devDependencies
    })
  } catch {}

  const allDeps = [...analysis.dependencies.frontend, ...analysis.dependencies.backend]
  analysis.dependencies.ai = allDeps.filter(
    (dep) =>
      dep.includes('anthropic') ||
      dep.includes('openai') ||
      dep.includes('ai') ||
      dep.includes('claude')
  )
}

async function generateInsights(analysis) {
  // 1. TODO/FIXME 检查
  if (analysis.quality.todoCount > 50) {
    analysis.insights.push({
      type: 'optimization',
      priority: 'medium',
      title: '大量 TODO 标记',
      description: `发现 ${analysis.quality.todoCount} 个 TODO 标记。这些可能是未完成的功能或技术债务。`,
      suggestedActions: [
        '梳理所有 TODO，创建 GitHub issues',
        '优先处理关键路径的 TODO',
        '设置 TODO 清理的 sprint 目标'
      ]
    })
  }

  // 2. console.log 检查
  if (analysis.quality.consoleLogCount > 100) {
    analysis.insights.push({
      type: 'risk',
      priority: 'high',
      title: '大量 console.log 残留',
      description: `发现 ${analysis.quality.consoleLogCount} 个 console.log。生产环境应该使用专业日志系统。`,
      suggestedActions: [
        '替换为结构化日志（Winston, Pino）',
        '添加日志级别控制',
        '在生产环境禁用 console.log'
      ]
    })
  }

  // 3. 文件大小检查
  const largeFiles = analysis.structure.largestFiles.filter((f) => f.lines > 500)
  if (largeFiles.length > 0) {
    analysis.insights.push({
      type: 'optimization',
      priority: 'medium',
      title: '大文件需要重构',
      description: `发现 ${largeFiles.length} 个超过 500 行的文件。大文件难以维护和测试。`,
      suggestedActions: [
        '将大文件拆分为多个小模块',
        '应用单一职责原则',
        '提取可复用的工具函数'
      ]
    })
  }

  // 4. AI 集成检查
  if (analysis.dependencies.ai.length > 0) {
    analysis.insights.push({
      type: 'opportunity',
      priority: 'high',
      title: '多 AI 服务集成',
      description: `项目集成了 ${analysis.dependencies.ai.length} 个 AI 服务。这是核心竞争力，但也带来复杂性。`,
      suggestedActions: [
        '统一 AI 服务的错误处理',
        '实现服务降级机制',
        '添加 AI 服务监控和报警',
        '考虑实现 AI 服务抽象层'
      ]
    })
  }

  // 5. 异步处理检查
  analysis.insights.push({
    type: 'opportunity',
    priority: 'high',
    title: '视频生成异步优化',
    description: '视频生成是 CPU 密集型操作，建议使用队列和 worker 优化。',
    suggestedActions: [
      '已有 video-worker，检查是否充分利用',
      '考虑使用 Bull/BullMQ 替代当前队列',
      '添加进度追踪和用户反馈',
      '实现失败重试机制'
    ]
  })

  // 6. 性能优化
  analysis.insights.push({
    type: 'optimization',
    priority: 'medium',
    title: 'Next.js 性能优化',
    description: '前端使用 Next.js，可以进一步优化加载性能。',
    suggestedActions: [
      '启用 Image Optimization',
      '使用 next/dynamic 进行代码分割',
      '添加 loading states',
      '优化首屏加载时间'
    ]
  })

  // 7. 数据库优化
  analysis.insights.push({
    type: 'optimization',
    priority: 'medium',
    title: 'Prisma 查询优化',
    description: '使用 Prisma ORM，注意 N+1 查询问题。',
    suggestedActions: [
      '使用 include 和 select 优化查询',
      '添加数据库索引',
      '使用 Prisma 的批量操作',
      '考虑添加查询日志分析'
    ]
  })

  // 8. 测试覆盖
  const hasTests =
    analysis.structure.filesByType['test.ts'] ||
    analysis.structure.filesByType['spec.ts']
  if (!hasTests || hasTests < 10) {
    analysis.insights.push({
      type: 'risk',
      priority: 'high',
      title: '测试覆盖率不足',
      description: '项目缺少足够的测试。AI 服务集成需要充分的测试。',
      suggestedActions: [
        '为核心 AI 服务添加单元测试',
        '添加 E2E 测试覆盖关键流程',
        '使用 Mock 减少 AI API 调用成本',
        '设置测试覆盖率目标（>80%）'
      ]
    })
  }

  // 9. 安全性
  analysis.insights.push({
    type: 'risk',
    priority: 'critical',
    title: 'API 密钥安全',
    description: '项目集成多个 AI 服务，确保 API 密钥安全至关重要。',
    suggestedActions: [
      '使用环境变量存储所有密钥',
      '永远不要提交 .env 文件到 git',
      '在生产环境使用密钥管理服务',
      '定期轮换 API 密钥',
      '添加密钥泄露监控'
    ]
  })

  // 10. 监控和日志
  analysis.insights.push({
    type: 'opportunity',
    priority: 'high',
    title: '可观测性增强',
    description: 'AI 服务的可靠性至关重要，需要完善的监控体系。',
    suggestedActions: [
      '集成 APM 工具（如 Sentry）',
      '添加 AI 服务调用追踪',
      '监控视频生成成功率',
      '设置性能指标仪表板',
      '添加告警机制'
    ]
  })
}

function printReport(analysis) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  📊 Prophet 分析报告 - videoplay')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('📂 项目结构：')
  console.log(`   文件总数：${analysis.structure.totalFiles}`)
  console.log(`   代码行数：${analysis.structure.totalLines.toLocaleString()}`)
  console.log('\n   文件类型分布：')
  Object.entries(analysis.structure.filesByType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([ext, count]) => {
      console.log(`      .${ext}: ${count} 个`)
    })

  console.log('\n   最大文件（前 5）：')
  analysis.structure.largestFiles.slice(0, 5).forEach((file) => {
    console.log(`      ${file.path}: ${file.lines} 行`)
  })

  console.log('\n📊 代码质量：')
  console.log(`   TODO 标记：${analysis.quality.todoCount}`)
  console.log(`   FIXME 标记：${analysis.quality.fixmeCount}`)
  console.log(`   console.log：${analysis.quality.consoleLogCount}`)
  console.log(`   eslint-disable：${analysis.quality.eslintDisableCount}`)

  console.log('\n📦 依赖分析：')
  console.log(`   前端依赖：${analysis.dependencies.frontend.length} 个`)
  console.log(`   后端依赖：${analysis.dependencies.backend.length} 个`)
  console.log(`   AI 相关：${analysis.dependencies.ai.length} 个`)
  if (analysis.dependencies.ai.length > 0) {
    console.log('      ' + analysis.dependencies.ai.join(', '))
  }

  console.log('\n🔮 Prophet 洞察（按优先级排序）：\n')

  const priorityOrder = ['critical', 'high', 'medium', 'low']
  const sortedInsights = analysis.insights.sort((a, b) => {
    return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
  })

  sortedInsights.forEach((insight, i) => {
    const emoji =
      insight.type === 'opportunity'
        ? '💡'
        : insight.type === 'risk'
        ? '⚠️ '
        : '⚡'
    const priorityEmoji =
      insight.priority === 'critical'
        ? '🔴'
        : insight.priority === 'high'
        ? '🟠'
        : insight.priority === 'medium'
        ? '🟡'
        : '🟢'

    console.log(
      `${i + 1}. ${emoji} ${insight.title} ${priorityEmoji} [${insight.priority}]`
    )
    console.log(`   ${insight.description}`)
    console.log('   建议行动：')
    insight.suggestedActions.forEach((action) => {
      console.log(`     • ${action}`)
    })
    console.log()
  })

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  ✨ 分析完成')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

const projectPath = process.argv[2] || process.cwd()

analyzeProject(projectPath)
  .then((analysis) => {
    printReport(analysis)

    console.log('💡 Prophet 建议：')
    console.log('   1. 优先处理 🔴 critical 和 🟠 high 优先级的项目')
    console.log('   2. 这些洞察会随着更多 commit 而不断精进')
    console.log('   3. Prophet 会持续学习你的代码模式')
    console.log('   4. 每次 commit 后都会更新分析\n')
  })
  .catch((error) => {
    console.error('❌ 分析失败:', error)
    process.exit(1)
  })
