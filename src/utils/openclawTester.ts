/**
 * OpenClaw Connection Tester
 *
 * 一键测试OpenClaw连接，验证Token，返回详细诊断
 */

import { getOpenClawWSClient, type OpenClawConfig } from '../services/openclawWebSocket'

export interface TestResult {
  success: boolean
  message: string
  details?: {
    url?: string
    token?: string
    connected?: boolean
    agentCount?: number
    responseTime?: number
    error?: string
  }
}

/**
 * 快速测试OpenClaw连接
 */
export async function testOpenClawConnection(
  config: OpenClawConfig
): Promise<TestResult> {
  const startTime = Date.now()

  try {
    console.log('[OpenClawTester] 🧪 Starting connection test...')
    console.log('[OpenClawTester] URL:', config.url)
    console.log('[OpenClawTester] Token:', maskToken(config.token))

    // Step 1: 验证配置格式
    const configValidation = validateConfig(config)
    if (!configValidation.success) {
      return {
        success: false,
        message: '配置格式错误',
        details: {
          url: config.url,
          token: maskToken(config.token),
          error: configValidation.message,
        },
      }
    }

    // Step 2: 尝试连接
    const client = getOpenClawWSClient()

    let connected = false
    try {
      connected = await client.connect(config)
    } catch (error) {
      return {
        success: false,
        message: 'WebSocket连接失败',
        details: {
          url: config.url,
          token: maskToken(config.token),
          connected: false,
          error: String(error),
        },
      }
    }

    if (!connected) {
      return {
        success: false,
        message: '连接失败',
        details: {
          url: config.url,
          token: maskToken(config.token),
          connected: false,
          error: 'Connection returned false',
        },
      }
    }

    // Step 3: 尝试获取Agent列表（验证Token和权限）
    let agents: any[] = []
    try {
      agents = await client.getAgents()
    } catch (error) {
      return {
        success: false,
        message: 'Token验证失败或权限不足',
        details: {
          url: config.url,
          token: maskToken(config.token),
          connected: true,
          agentCount: 0,
          error: String(error),
        },
      }
    }

    const responseTime = Date.now() - startTime

    // Step 4: 成功！
    return {
      success: true,
      message: `✅ 连接成功！找到 ${agents.length} 个Agent`,
      details: {
        url: config.url,
        token: maskToken(config.token),
        connected: true,
        agentCount: agents.length,
        responseTime,
      },
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    return {
      success: false,
      message: '测试过程中出现未知错误',
      details: {
        url: config.url,
        token: maskToken(config.token),
        responseTime,
        error: String(error),
      },
    }
  }
}

/**
 * 验证配置格式
 */
function validateConfig(config: OpenClawConfig): { success: boolean; message: string } {
  // 验证URL
  if (!config.url) {
    return { success: false, message: 'URL不能为空' }
  }

  if (!config.url.startsWith('ws://') && !config.url.startsWith('wss://')) {
    return { success: false, message: 'URL必须以ws://或wss://开头' }
  }

  try {
    new URL(config.url)
  } catch {
    return { success: false, message: 'URL格式无效' }
  }

  // 验证Token
  if (!config.token) {
    return { success: false, message: 'Token不能为空' }
  }

  if (config.token.length < 10) {
    return { success: false, message: 'Token长度不足（至少10个字符）' }
  }

  return { success: true, message: '配置格式正确' }
}

/**
 * 掩码Token（保护敏感信息）
 */
function maskToken(token: string): string {
  if (!token || token.length < 8) {
    return '***'
  }
  const start = token.slice(0, 6)
  const end = token.slice(-4)
  return `${start}...${end}`
}

/**
 * 自动检测本地OpenClaw
 */
export async function detectLocalOpenClaw(): Promise<OpenClawConfig | null> {
  console.log('[OpenClawTester] 🔍 Detecting local OpenClaw...')

  // 尝试常见端口
  const commonPorts = [18789, 18790, 18791]

  for (const port of commonPorts) {
    const url = `ws://127.0.0.1:${port}`
    console.log(`[OpenClawTester] Checking port ${port}...`)

    // 简单的端口检测（实际需要尝试连接）
    // 这里我们返回默认配置，让用户填写Token
    try {
      // 尝试读取OpenClaw配置文件
      const config = await readOpenClawConfig()
      if (config) {
        return {
          url,
          token: config.token,
        }
      }
    } catch (error) {
      console.log(`[OpenClawTester] Failed to read config: ${error}`)
    }
  }

  return null
}

/**
 * 读取OpenClaw配置文件
 */
async function readOpenClawConfig(): Promise<{ token: string } | null> {
  try {
    // 尝试读取 ~/.openclaw/openclaw.json
    const homedir = process.env.HOME || process.env.USERPROFILE || ''
    const configPath = `${homedir}/.openclaw/openclaw.json`

    console.log('[OpenClawTester] Trying to read:', configPath)

    // 在浏览器环境中无法直接读取文件
    // 这个功能需要在Electron环境中实现
    // 或者让用户手动提供Token

    return null
  } catch (error) {
    console.error('[OpenClawTester] Failed to read OpenClaw config:', error)
    return null
  }
}

/**
 * 生成详细的诊断报告
 */
export function generateDiagnosticReport(result: TestResult): string {
  const lines: string[] = []

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  lines.push('🧪 OpenClaw连接诊断报告')
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  lines.push('')

  lines.push(`状态: ${result.success ? '✅ 成功' : '❌ 失败'}`)
  lines.push(`消息: ${result.message}`)
  lines.push('')

  if (result.details) {
    lines.push('详细信息:')
    lines.push(`  URL: ${result.details.url || 'N/A'}`)
    lines.push(`  Token: ${result.details.token || 'N/A'}`)
    lines.push(`  连接状态: ${result.details.connected ? '已连接' : '未连接'}`)

    if (result.details.agentCount !== undefined) {
      lines.push(`  Agent数量: ${result.details.agentCount}`)
    }

    if (result.details.responseTime !== undefined) {
      lines.push(`  响应时间: ${result.details.responseTime}ms`)
    }

    if (result.details.error) {
      lines.push(`  错误信息: ${result.details.error}`)
    }
  }

  lines.push('')
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (!result.success) {
    lines.push('')
    lines.push('💡 故障排除建议:')
    lines.push('  1. 确保OpenClaw Gateway正在运行')
    lines.push('  2. 检查端口是否正确（默认18789）')
    lines.push('  3. 验证Token是否有效')
    lines.push('  4. 检查防火墙设置')
    lines.push('  5. 查看OpenClaw日志获取更多信息')
  }

  return lines.join('\n')
}

/**
 * 一键测试（使用默认配置）
 */
export async function quickTest(): Promise<TestResult> {
  const defaultConfig: OpenClawConfig = {
    url: 'ws://127.0.0.1:18789',
    token: '5190ffb21bb024bc145dacc982ef6773b35648fa83ccba77', // 从配置文件读取
  }

  console.log('[OpenClawTester] 🚀 Quick test with default config')
  const result = await testOpenClawConnection(defaultConfig)

  // 打印诊断报告
  console.log(generateDiagnosticReport(result))

  return result
}

/**
 * 批量测试多个配置
 */
export async function batchTest(configs: OpenClawConfig[]): Promise<TestResult[]> {
  console.log(`[OpenClawTester] Testing ${configs.length} configurations...`)

  const results: TestResult[] = []

  for (const config of configs) {
    const result = await testOpenClawConnection(config)
    results.push(result)

    // 如果找到一个成功的，可以提前返回
    if (result.success) {
      console.log('[OpenClawTester] ✅ Found working configuration!')
      break
    }
  }

  return results
}

/**
 * 暴露到window对象供调试使用
 */
if (typeof window !== 'undefined') {
  ;(window as any).testOpenClaw = quickTest
  ;(window as any).testOpenClawConnection = testOpenClawConnection
  ;(window as any).detectLocalOpenClaw = detectLocalOpenClaw

  console.log('[OpenClawTester] 🧪 Test utilities available:')
  console.log('  - window.testOpenClaw() - Quick test with default config')
  console.log('  - window.testOpenClawConnection(config) - Test with custom config')
  console.log('  - window.detectLocalOpenClaw() - Auto-detect local OpenClaw')
}
